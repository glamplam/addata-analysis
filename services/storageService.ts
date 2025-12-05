import { DashboardData, SavedReport } from '../types';
import { getSupabaseClient, isCloudEnabled } from './supabase';

const LOCAL_STORAGE_KEY = 'adinsight_reports';

// Helper to generate IDs
const generateId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {
    // Fallback if crypto access fails
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// --- Local Storage Implementation (Fallback) ---

const getLocalReports = (): SavedReport[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse reports from localStorage", e);
    return [];
  }
};

const saveLocalReport = (report: SavedReport): SavedReport => {
  try {
    const reports = getLocalReports();
    const updatedReports = [report, ...reports];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedReports));
    console.log("Saved report locally:", report.id);
    return report;
  } catch (e) {
    console.error("Local Storage Save Error:", e);
    throw new Error("브라우저 저장소에 데이터를 쓸 수 없습니다. 저장 공간이 부족하거나 권한이 없을 수 있습니다.");
  }
};

const deleteLocalReport = (id: string): void => {
  try {
    const reports = getLocalReports();
    const filtered = reports.filter(r => r.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Local Storage Delete Error:", e);
    throw new Error("로컬 리포트 삭제 실패");
  }
};

// --- Public Async API ---

export const getReports = async (): Promise<SavedReport[]> => {
  // 1. Try Cloud
  if (isCloudEnabled()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Supabase fetch error:", error);
          throw new Error(error.message);
        }
        if (data) {
          return data as SavedReport[];
        }
      } catch (e) {
        console.error("Cloud fetch failed", e);
        // Do NOT fallback automatically if Cloud is explicitly enabled but fails
        throw new Error("클라우드 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    }
  }

  // 2. Fallback to Local
  return new Promise((resolve) => {
    // Simulate async for consistency
    setTimeout(() => resolve(getLocalReports()), 50);
  });
};

export const saveReport = async (title: string, data: DashboardData): Promise<SavedReport> => {
  if (!data) throw new Error("저장할 데이터가 없습니다.");

  const newReport: SavedReport = {
    id: generateId(),
    title,
    date: new Date().toISOString(),
    data
  };

  // 1. Try Cloud
  if (isCloudEnabled()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('reports')
          .insert([{ 
            id: newReport.id,
            title: newReport.title,
            date: newReport.date,
            data: newReport.data 
          }]);

        if (error) {
          console.error("Supabase save error:", error);
          throw new Error("클라우드 저장 실패: " + error.message);
        }
        return newReport;
      } catch (e: any) {
        console.error("Cloud save exception:", e);
        throw new Error(e.message || "클라우드 저장 중 예기치 않은 오류가 발생했습니다.");
      }
    }
  }

  // 2. Fallback to Local
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const saved = saveLocalReport(newReport);
        resolve(saved);
      } catch (e: any) {
        reject(e);
      }
    }, 50);
  });
};

export const deleteReport = async (id: string): Promise<void> => {
  // 1. Try Cloud
  if (isCloudEnabled()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw new Error("삭제 실패: " + error.message);
        }
        return;
      } catch (e: any) {
        throw new Error(e.message || "클라우드 데이터 삭제 중 오류 발생");
      }
    }
  }

  // 2. Fallback to Local
  return new Promise((resolve, reject) => {
    try {
      deleteLocalReport(id);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};