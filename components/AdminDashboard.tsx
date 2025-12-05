import React, { useEffect, useState, useCallback } from 'react';
import { SavedReport, DashboardData } from '../types';
import { getReports, deleteReport } from '../services/storageService';
import { isCloudEnabled } from '../services/supabase';
import DatabaseConfig from './DatabaseConfig';
import { Trash2, ExternalLink, Calendar, FileBarChart, Search, Inbox, TrendingUp, DollarSign, Target, Award, RefreshCw, Settings, Database, Cloud, HardDrive } from 'lucide-react';

interface AdminDashboardProps {
  onLoadReport: (data: DashboardData) => void;
  isDarkMode: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLoadReport, isDarkMode }) => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCloud, setIsCloud] = useState(false);
  const [showDbConfig, setShowDbConfig] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setIsRefreshing(true);
    setLoadingError(null);
    try {
      // Check storage mode
      setIsCloud(isCloudEnabled());
      
      const data = await getReports();
      setReports(data);
    } catch (error: any) {
      console.error("Failed to load reports:", error);
      setLoadingError(error.message || "데이터를 불러오지 못했습니다.");
      setReports([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('정말 이 리포트를 삭제하시겠습니까?')) {
      try {
        await deleteReport(id);
        await loadReports();
      } catch (error) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleRefresh = () => {
    loadReports();
  };

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileBarChart className="text-indigo-600 dark:text-indigo-400" />
            저장된 리포트 관리
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isCloud ? '클라우드 DB에 연결됨' : '로컬 브라우저 저장소 사용 중'}
            </p>
            <span className={`inline-block w-2 h-2 rounded-full ${isCloud ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="리포트 제목 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-colors shadow-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              title="목록 새로고침"
            >
              <RefreshCw size={20} className={`${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowDbConfig(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm font-medium
                ${isCloud 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'}`}
            >
              <Database size={16} />
              {isCloud ? 'DB 설정' : 'DB 연결'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isRefreshing && reports.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <p className="text-slate-400 text-sm">데이터 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isRefreshing && loadingError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
           <p className="text-red-600 dark:text-red-400 font-medium mb-2">오류가 발생했습니다.</p>
           <p className="text-sm text-red-500 dark:text-red-300 mb-4">{loadingError}</p>
           <button 
             onClick={handleRefresh}
             className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-50 transition-colors"
           >
             다시 시도
           </button>
        </div>
      )}

      {/* Empty State */}
      {!isRefreshing && !loadingError && reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 transition-colors">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4">
            {isCloud ? (
               <Cloud className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
            ) : (
               <HardDrive className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {isCloud ? '클라우드에 저장된 리포트가 없습니다.' : '로컬에 저장된 리포트가 없습니다.'}
          </h3>
          <p className="text-slate-500 dark:text-slate-500 mt-2 text-center max-w-md px-4">
            대시보드 화면에서 데이터를 분석하고<br/>상단의 '리포트 저장' 버튼을 눌러보세요.
          </p>
          <button 
            onClick={handleRefresh}
            className="mt-6 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-2"
          >
            <RefreshCw size={14} />
            목록 새로고침
          </button>
        </div>
      ) : (
        /* Report Grid */
        !isRefreshing && !loadingError && (
          <div className="grid grid-cols-1 gap-6">
            {filteredReports.length === 0 && searchTerm && (
              <div className="text-center py-12 text-slate-500">
                검색 결과가 없습니다.
              </div>
            )}
            
            {filteredReports.map((report) => (
              <div 
                key={report.id}
                onClick={() => onLoadReport(report.data)}
                className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Left Accent Border */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 group-hover:bg-indigo-600 transition-colors"></div>

                <div className="p-6 pl-8">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {report.title}
                        </h3>
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                          <Calendar size={10} />
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                        {report.data?.aiSummary || "요약 정보가 없습니다."}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadReport(report.data);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                      >
                        <ExternalLink size={14} />
                        열기
                      </button>
                      <button 
                        onClick={(e) => handleDelete(report.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Mini Stats Preview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 group-hover:bg-indigo-50/50 dark:group-hover:bg-slate-800 transition-colors">
                      <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">총 비용</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{report.data?.kpis?.spend?.value || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 group-hover:bg-emerald-50/50 dark:group-hover:bg-slate-800 transition-colors">
                      <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ROAS</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{report.data?.kpis?.roas?.value || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 group-hover:bg-rose-50/50 dark:group-hover:bg-slate-800 transition-colors">
                      <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                        <Target size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">CPA</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{report.data?.kpis?.cpa?.value || '-'}</p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 group-hover:bg-blue-50/50 dark:group-hover:bg-slate-800 transition-colors">
                      <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <Award size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">전환수</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{report.data?.kpis?.conversions?.value || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Database Configuration Modal */}
      <DatabaseConfig 
        isOpen={showDbConfig} 
        onClose={() => setShowDbConfig(false)} 
        onConfigChanged={loadReports}
      />
    </div>
  );
};

export default AdminDashboard;