import React, { useState, useEffect } from 'react';
import { AnalysisStatus, DashboardData } from './types';
import { analyzeAdData } from './services/geminiService';
import { getMockDashboardData } from './services/mockData';
import DataInput from './components/DataInput';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { BarChart3, AlertCircle, Moon, Sun, Lock, Unlock, LayoutDashboard } from 'lucide-react';

// View states for the application
type AppView = 'analysis' | 'login' | 'admin';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Auth & Navigation States
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>('analysis');

  // Initialize theme based on system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Update HTML class for Tailwind dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAnalyze = async (rawData: string) => {
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMessage(null);
    try {
      const result = await analyzeAdData(rawData);
      setDashboardData(result);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (error: any) {
      setStatus(AnalysisStatus.ERROR);
      setErrorMessage(error.message || "알 수 없는 오류가 발생했습니다.");
    }
  };

  const handleDemo = () => {
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMessage(null);
    setTimeout(() => {
      const mockData = getMockDashboardData();
      setDashboardData(mockData);
      setStatus(AnalysisStatus.COMPLETE);
    }, 1500);
  };

  const handleReset = () => {
    setStatus(AnalysisStatus.IDLE);
    setDashboardData(null);
    setErrorMessage(null);
    // Don't change view, stay in analysis
  };

  // Admin / Auth Handlers
  const handleAdminClick = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setCurrentView('login');
    }
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentView('analysis');
    handleReset();
  };

  const handleLoadReport = (data: DashboardData) => {
    setDashboardData(data);
    setStatus(AnalysisStatus.COMPLETE);
    setCurrentView('analysis');
  };

  const handleLogoClick = () => {
    setCurrentView('analysis');
    // We keep the data if it exists, otherwise it shows the input
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      {/* Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">AdInsight AI</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Admin Toggle */}
            {isAdmin ? (
               <div className="flex items-center gap-2">
                 {currentView === 'analysis' ? (
                   <button
                    onClick={() => setCurrentView('admin')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                   >
                     <LayoutDashboard size={16} />
                     <span className="hidden sm:inline">대시보드</span>
                   </button>
                 ) : (
                   <button
                    onClick={() => setCurrentView('analysis')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                   >
                     <BarChart3 size={16} />
                     <span className="hidden sm:inline">분석 화면</span>
                   </button>
                 )}
                 <button
                   onClick={handleLogout}
                   className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-red-100 dark:border-red-900/50"
                 >
                   <Unlock size={16} />
                   <span className="hidden sm:inline">로그아웃</span>
                 </button>
               </div>
            ) : (
              <button
                onClick={handleAdminClick}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                  ${currentView === 'login' 
                    ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/30' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Lock size={16} />
                <span className="hidden sm:inline">관리자</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: Login */}
        {currentView === 'login' && (
          <AdminLogin onLogin={handleLoginSuccess} onCancel={() => setCurrentView('analysis')} />
        )}

        {/* VIEW: Admin Dashboard */}
        {currentView === 'admin' && isAdmin && (
          <AdminDashboard onLoadReport={handleLoadReport} isDarkMode={isDarkMode} />
        )}

        {/* VIEW: Analysis / Main App */}
        {currentView === 'analysis' && (
          <>
            {status === AnalysisStatus.IDLE && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="text-center mb-10 max-w-2xl">
                  <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                    복잡한 광고 데이터, <span className="text-indigo-600 dark:text-indigo-400">AI로 한 번에 시각화</span>하세요.
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    CSV, Excel에서 복사한 데이터를 붙여넣기만 하면, Gemini AI가 자동으로 분석하여
                    KPI, 추세 그래프, 그리고 개선 제안을 제공합니다.
                  </p>
                </div>
                <DataInput onAnalyze={handleAnalyze} isLoading={false} onDemo={handleDemo} />
              </div>
            )}

            {status === AnalysisStatus.ANALYZING && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
                <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">데이터 분석 중...</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Gemini가 데이터를 구조화하고 인사이트를 도출하고 있습니다.</p>
              </div>
            )}

            {status === AnalysisStatus.ERROR && (
              <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl max-w-md text-center border border-red-100 dark:border-red-900">
                  <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">분석 실패</h3>
                  <p className="text-red-600 dark:text-red-300 mb-6">{errorMessage}</p>
                  <button 
                    onClick={handleReset}
                    className="px-6 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    다시 시도하기
                  </button>
                </div>
              </div>
            )}

            {status === AnalysisStatus.COMPLETE && dashboardData && (
              <Dashboard 
                data={dashboardData} 
                onReset={handleReset} 
                isDarkMode={isDarkMode}
                isAdmin={isAdmin}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
