import React, { useState, useEffect } from 'react';
import { Database, Save, Trash2, CheckCircle2, AlertCircle, X, Copy, Code, ChevronRight, ChevronDown, ExternalLink, Lock } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../services/supabase';

interface DatabaseConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

const DatabaseConfig: React.FC<DatabaseConfigProps> = ({ isOpen, onClose, onConfigChanged }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isEnvManaged, setIsEnvManaged] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      if (config) {
        setUrl(config.url);
        setKey(config.key); // Usually hidden for Env vars in real UI, but shown here for clarity or masked
        setIsConnected(true);
        setIsEnvManaged(config.source === 'env');
      } else {
        setUrl('');
        setKey('');
        setIsConnected(false);
        setIsEnvManaged(false);
      }
      setShowSql(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (isEnvManaged) return;
    if (!url || !key) {
      alert('URL과 API Key를 모두 입력해주세요.');
      return;
    }
    saveSupabaseConfig(url, key);
    setIsConnected(true);
    onConfigChanged();
    onClose();
  };

  const handleDisconnect = () => {
    if (isEnvManaged) {
      alert('환경 변수로 설정된 연결은 해제할 수 없습니다. Vercel 설정을 확인하세요.');
      return;
    }
    if (window.confirm('정말 연결을 해제하시겠습니까? 로컬 저장소 모드로 전환됩니다.')) {
      clearSupabaseConfig();
      setIsConnected(false);
      setUrl('');
      setKey('');
      onConfigChanged();
      onClose();
    }
  };

  // Extract Project Ref from URL (e.g., https://xyz.supabase.co -> xyz)
  const getDashboardLink = () => {
    try {
      if (!url) return null;
      const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
      if (match && match[1]) {
        return `https://supabase.com/dashboard/project/${match[1]}/editor`;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const sqlCode = `create table reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const dashboardLink = getDashboardLink();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Database size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">데이터베이스 연결</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          {/* Environment Variable Banner */}
          {isEnvManaged && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-lg">
              <Lock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800 dark:text-green-300">배포 환경 설정됨 (Vercel)</p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  환경 변수를 통해 데이터베이스에 안전하게 연결되었습니다. 수정하려면 Vercel 설정을 변경하세요.
                </p>
              </div>
            </div>
          )}

          {/* Guide Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-blue-800 dark:text-blue-300 mb-1">Supabase 연결 안내</p>
                <p className="text-blue-700 dark:text-blue-400 leading-relaxed mb-2">
                  웹에서 데이터를 영구 저장하고 관리하려면 Supabase 프로젝트가 필요합니다.
                </p>
                <button 
                  onClick={() => setShowSql(!showSql)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-300 hover:underline bg-white dark:bg-blue-900/40 px-2 py-1 rounded border border-blue-200 dark:border-blue-800"
                >
                  <Code size={12} />
                  {showSql ? '테이블 생성 SQL 숨기기' : '테이블 생성 SQL 보기'}
                  {showSql ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
              </div>
            </div>

            {/* SQL Code Block */}
            {showSql && (
              <div className="relative animate-fade-in-down">
                <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-700">
                  <pre>{sqlCode}</pre>
                </div>
                <button 
                  onClick={copySql}
                  className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                  title="Copy SQL"
                >
                  {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-1">
                  * Supabase 대시보드의 <strong>SQL Editor</strong>에서 실행하세요.
                </p>
              </div>
            )}
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project URL
                </label>
                {isConnected && dashboardLink && (
                  <a 
                    href={dashboardLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    데이터 확인하기 <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                disabled={isEnvManaged}
                className={`w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white outline-none transition-all text-sm font-mono ${isEnvManaged ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                API Key (public/anon)
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                disabled={isEnvManaged}
                className={`w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white outline-none transition-all text-sm font-mono ${isEnvManaged ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex justify-end gap-3 sticky bottom-0 z-10">
          {!isEnvManaged && isConnected && (
            <button
              onClick={handleDisconnect}
              className="mr-auto flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              연결 해제
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            {isEnvManaged ? '닫기' : '취소'}
          </button>
          {!isEnvManaged && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save size={18} />
              {isConnected ? '설정 업데이트' : '연결하기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseConfig;