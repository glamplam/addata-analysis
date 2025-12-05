import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'adinsight_supabase_config';

interface SupabaseConfig {
  url: string;
  key: string;
  source: 'local' | 'env';
}

let supabaseInstance: SupabaseClient | null = null;

// Helper to check for Environment Variables safely
const getEnvConfig = () => {
  try {
    // Check if process exists to avoid ReferenceError in browser environments
    if (typeof process !== 'undefined' && process.env) {
      const url = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const key = process.env.REACT_APP_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;
      
      if (url && key) {
        return { url, key, source: 'env' as const };
      }
    }
  } catch (e) {
    // Silently fail if process access fails
    console.debug("Environment variables not accessible:", e);
  }
  return null;
};

export const getSupabaseConfig = (): SupabaseConfig | null => {
  // 1. Priority: Environment Variables
  const envConfig = getEnvConfig();
  if (envConfig) return envConfig;

  // 2. Fallback: Local Storage (Manual Input)
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return { ...parsed, source: 'local' };
  } catch (e) {
    console.error("Failed to read Supabase config from localStorage", e);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (!url || !key) return;
  const config = { url, key };
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    // Re-initialize instance
    supabaseInstance = createClient(url, key);
  } catch (e) {
    console.error("Failed to save Supabase config", e);
    alert("설정을 저장하는 중 오류가 발생했습니다. 브라우저 저장소 권한을 확인해주세요.");
  }
};

export const clearSupabaseConfig = () => {
  try {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
    supabaseInstance = null;
  } catch (e) {
    console.error("Failed to clear Supabase config", e);
  }
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const config = getSupabaseConfig();
  if (config) {
    try {
      supabaseInstance = createClient(config.url, config.key);
      return supabaseInstance;
    } catch (error) {
      console.error("Failed to initialize Supabase client", error);
      return null;
    }
  }
  return null;
};

export const isCloudEnabled = (): boolean => {
  return !!getSupabaseConfig();
};