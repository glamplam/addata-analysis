import React, { useState, useRef, useEffect } from 'react';
import { DashboardData } from '../types';
import KPICard from './KPICard';
import { TrendChart, ChannelChart } from './Charts';
import { saveReport } from '../services/storageService';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  MousePointer, 
  Award, 
  Percent, 
  Sparkles,
  Lightbulb,
  Save,
  CheckCircle2,
  X
} from 'lucide-react';

interface DashboardProps {
  data: DashboardData;
  onReset: () => void;
  isDarkMode: boolean;
  isAdmin: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset, isDarkMode, isAdmin }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSaveModal && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [showSaveModal]);

  const onSaveClick = () => {
    setReportTitle(`광고 성과 분석 - ${new Date().toLocaleDateString()}`);
    setShowSaveModal(true);
  };

  const handleConfirmSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reportTitle.trim()) return;

    setIsSaving(true);
    try {
      // 비동기 저장 로직 실행 (await 추가)
      await saveReport(reportTitle, data);
      
      // 저장 완료 후 모달 닫기 및 성공 피드백 표시
      setShowSaveModal(false);
      setIsSaving(false);
      setSavedSuccess(true);
      
      setTimeout(() => setSavedSuccess(false), 3000); // 3초 후 성공 메시지 숨김
    } catch (error: any) {
      console.error("Save failed:", error);
      alert(`리포트 저장 실패: ${error.message || "알 수 없는 오류가 발생했습니다."}`);
      setIsSaving(false);
      // Keep modal open so user can try again
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">캠페인 성과 분석</h1>
          <p className="text-slate-500 dark:text-slate-400">AI가 분석한 실시간 광고 데이터 리포트입니다.</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={onSaveClick}
              disabled={savedSuccess || isSaving}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-300
                ${savedSuccess 
                  ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 cursor-default' 
                  : 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-800 dark:hover:bg-indigo-900/50'
                }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  저장 완료
                </>
              ) : (
                <>
                  <Save size={16} />
                  리포트 저장
                </>
              )}
            </button>
          )}
          <button 
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            새로운 데이터 분석하기
          </button>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-900 dark:to-violet-900 rounded-2xl p-6 text-white shadow-lg transition-colors duration-300">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2 text-white">AI 인사이트 요약</h3>
            <p className="text-indigo-100 dark:text-indigo-200 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {data.aiSummary}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard 
          data={data.kpis.spend} 
          icon={<DollarSign />} 
          colorClass="text-indigo-600 dark:text-indigo-400" 
        />
        <KPICard 
          data={data.kpis.roas} 
          icon={<TrendingUp />} 
          colorClass="text-emerald-600 dark:text-emerald-400" 
        />
        <KPICard 
          data={data.kpis.cpa} 
          icon={<Target />} 
          colorClass="text-rose-600 dark:text-rose-400" 
        />
        <KPICard 
          data={data.kpis.ctr} 
          icon={<MousePointer />} 
          colorClass="text-blue-600 dark:text-blue-400" 
        />
        <KPICard 
          data={data.kpis.conversions} 
          icon={<Award />} 
          colorClass="text-amber-600 dark:text-amber-400" 
        />
        <KPICard 
          data={data.kpis.clicks} 
          icon={<Percent />} 
          colorClass="text-cyan-600 dark:text-cyan-400" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (Takes up 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">일별 비용 및 전환 추세</h3>
          <TrendChart data={data.dailyTrend} isDarkMode={isDarkMode} />
        </div>

        {/* Channel/Platform Chart (Takes up 1 column) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">채널별 성과</h3>
          <ChannelChart data={data.channelPerformance} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">성장 제안 (Recommendations)</h3>
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {index + 1}
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base pt-1">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Save Report Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">리포트 저장</h3>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleConfirmSave} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  리포트 제목
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white outline-none transition-all"
                  placeholder="예: 2024년 5월 성과 보고서"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      저장 중...
                    </>
                  ) : (
                    '저장하기'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;