import React, { useState } from 'react';
import { Upload, FileText, Play, RotateCcw, Sparkles } from 'lucide-react';

interface DataInputProps {
  onAnalyze: (data: string) => void;
  isLoading: boolean;
  onDemo: () => void;
}

const SAMPLE_DATA = `Date,Platform,Campaign,Spend,Impressions,Clicks,Conversions,Revenue
2024-05-01,Instagram,Spring_Sale_A,150000,25000,450,15,650000
2024-05-01,Google,Brand_Search,120000,4000,280,32,1200000
2024-05-02,Instagram,Spring_Sale_A,160000,27000,480,18,720000
2024-05-02,Google,Brand_Search,110000,3800,260,30,1100000
2024-05-03,Instagram,Reels_Video_B,200000,45000,600,25,850000
2024-05-03,YouTube,Awareness_Video,300000,80000,300,5,100000
2024-05-04,Instagram,Spring_Sale_A,140000,24000,420,14,600000
2024-05-04,Google,Brand_Search,130000,4200,310,35,1350000
2024-05-05,Facebook,Retargeting_D,80000,12000,150,12,480000
2024-05-05,Instagram,Spring_Sale_A,155000,26000,460,16,680000
2024-05-06,Google,Competitor_Kw,90000,3500,180,8,250000
2024-05-06,Instagram,Reels_Video_B,210000,46000,620,28,920000`;

const DataInput: React.FC<DataInputProps> = ({ onAnalyze, isLoading, onDemo }) => {
  const [inputText, setInputText] = useState('');

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    onAnalyze(inputText);
  };

  const loadSample = () => {
    setInputText(SAMPLE_DATA);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-4">
          <Upload size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">광고 데이터 업로드</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          엑셀이나 스프레드시트의 데이터를 복사해서 아래에 붙여넣으세요.
          <br />
          <span className="text-xs text-slate-400 dark:text-slate-500">(헤더 포함: 날짜, 비용, 노출, 클릭, 전환 등)</span>
        </p>
      </div>

      <div className="relative mb-6">
        <textarea
          className="w-full h-64 p-4 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
          placeholder={`예시:\nDate, Campaign, Spend, Clicks\n2024-01-01, Brand_Awareness, 50000, 120...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        {inputText === '' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50">
             <FileText className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={loadSample}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex-1 md:flex-none"
            disabled={isLoading}
          >
            <RotateCcw size={16} />
            예제 데이터 채우기
          </button>
          
          <button
            onClick={onDemo}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition-colors flex-1 md:flex-none"
            disabled={isLoading}
          >
            <Sparkles size={16} />
            데모 버전 체험하기
          </button>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={!inputText.trim() || isLoading}
          className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold text-white transition-all transform active:scale-95 shadow-md
            ${!inputText.trim() || isLoading 
              ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-500' 
              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 hover:shadow-lg'}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI 분석 시작
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" />
              대시보드 생성
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DataInput;