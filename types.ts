export interface KPIMetric {
  label: string;
  value: string;
  change?: string; // e.g., "+12%"
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export interface ChartDataPoint {
  date: string;
  cost: number;
  conversions: number;
  clicks: number;
  impressions: number;
}

export interface ChannelPerformance {
  name: string;
  spend: number;
  roas: number;
  conversions: number;
}

export interface DashboardData {
  kpis: {
    spend: KPIMetric;
    roas: KPIMetric;
    cpa: KPIMetric;
    ctr: KPIMetric;
    conversions: KPIMetric;
    clicks: KPIMetric;
  };
  dailyTrend: ChartDataPoint[];
  channelPerformance: ChannelPerformance[];
  aiSummary: string;
  recommendations: string[];
}

export interface SavedReport {
  id: string;
  title: string;
  date: string; // ISO string
  data: DashboardData;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}