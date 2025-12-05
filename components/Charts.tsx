import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ChartDataPoint, ChannelPerformance } from '../types';

interface TrendChartProps {
  data: ChartDataPoint[];
  isDarkMode?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, isDarkMode = false }) => {
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0'; // slate-700 : slate-200
  const textColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400 : slate-500
  const tooltipBg = isDarkMode ? '#1e293b' : '#fff'; // slate-800 : white
  const tooltipBorder = isDarkMode ? '#475569' : '#e2e8f0'; // slate-600 : slate-200
  const tooltipText = isDarkMode ? '#f1f5f9' : '#1e293b'; // slate-100 : slate-800

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: textColor, fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            yAxisId="left" 
            tick={{ fill: textColor, fontSize: 12 }} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fill: textColor, fontSize: 12 }} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              borderRadius: '8px', 
              border: `1px solid ${tooltipBorder}`,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              color: tooltipText
            }}
            itemStyle={{ color: tooltipText }}
            labelStyle={{ color: textColor }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="cost" 
            name="비용 (Cost)" 
            stroke="#6366f1" 
            fillOpacity={1} 
            fill="url(#colorCost)" 
            strokeWidth={2}
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="conversions" 
            name="전환수 (Conversions)" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorConv)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ChannelChartProps {
  data: ChannelPerformance[];
  isDarkMode?: boolean;
}

export const ChannelChart: React.FC<ChannelChartProps> = ({ data, isDarkMode = false }) => {
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const textColor = isDarkMode ? '#94a3b8' : '#475569';
  const tooltipBg = isDarkMode ? '#1e293b' : '#fff';
  const tooltipBorder = isDarkMode ? '#475569' : '#e2e8f0';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#1e293b';

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }} 
            tickLine={false} 
            axisLine={false}
            width={100}
          />
          <Tooltip 
            cursor={{ fill: isDarkMode ? '#334155' : '#f1f5f9' }}
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              borderRadius: '8px', 
              border: `1px solid ${tooltipBorder}`,
              color: tooltipText
            }}
            itemStyle={{ color: tooltipText }}
            labelStyle={{ color: textColor }}
          />
          <Legend />
          <Bar dataKey="spend" name="비용" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
          <Bar dataKey="conversions" name="전환" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};