import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { KPIMetric } from '../types';

interface KPICardProps {
  data: KPIMetric;
  icon: React.ReactNode;
  colorClass: string;
}

const KPICard: React.FC<KPICardProps> = ({ data, icon, colorClass }) => {
  const getTrendIcon = () => {
    if (data.trend === 'up') return <ArrowUpRight size={16} className="text-green-500 dark:text-green-400" />;
    if (data.trend === 'down') return <ArrowDownRight size={16} className="text-red-500 dark:text-red-400" />;
    return <Minus size={16} className="text-slate-400 dark:text-slate-500" />;
  };

  const getTrendColor = () => {
    if (data.trend === 'up') return 'text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900/30';
    if (data.trend === 'down') return 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30';
    return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-800';
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `${colorClass} w-5 h-5` })
            : icon}
        </div>
        {data.change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            {data.change}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{data.label}</h3>
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.value}</div>
      </div>
    </div>
  );
};

export default KPICard;