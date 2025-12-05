import { DashboardData } from '../types';

export const getMockDashboardData = (): DashboardData => {
  // Generate date strings for the last 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  });

  // Randomize helper
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const dailyTrend = dates.map(date => {
    const cost = rand(300000, 600000);
    // Conversions roughly correlated with cost but random
    const conversions = Math.floor(cost / rand(15000, 25000));
    return {
      date,
      cost,
      conversions,
      clicks: Math.floor(cost / rand(1000, 3000)),
      impressions: Math.floor(cost / rand(50, 150))
    };
  });

  return {
    kpis: {
      spend: { label: '총 비용', value: `₩${rand(250, 450).toLocaleString()},000`, change: `+${rand(5, 20)}%`, trend: 'up' },
      roas: { label: 'ROAS', value: `${rand(280, 420)}%`, change: `+${rand(2, 10)}%`, trend: 'up' },
      cpa: { label: 'CPA', value: `₩${rand(14, 18).toLocaleString()},000`, change: `-${rand(1, 8)}%`, trend: 'down' },
      ctr: { label: 'CTR', value: `${(rand(20, 35) / 10).toFixed(1)}%`, change: `+0.${rand(1, 5)}%`, trend: 'up' },
      conversions: { label: '총 전환', value: `${rand(250, 400)}`, change: `+${rand(10, 25)}%`, trend: 'up' },
      clicks: { label: '클릭 수', value: `${rand(3500, 5000).toLocaleString()}`, change: `+${rand(5, 15)}%`, trend: 'up' },
    },
    dailyTrend,
    channelPerformance: [
      { name: 'Instagram', spend: rand(1500000, 2000000), roas: rand(350, 450), conversions: rand(120, 180) },
      { name: 'Google Search', spend: rand(1200000, 1800000), roas: rand(300, 380), conversions: rand(100, 150) },
      { name: 'YouTube', spend: rand(800000, 1200000), roas: rand(150, 220), conversions: rand(40, 80) },
      { name: 'Meta (FB)', spend: rand(600000, 900000), roas: rand(320, 480), conversions: rand(50, 90) },
    ],
    aiSummary: "Instagram 채널의 ROAS가 타 채널 대비 30% 높으며, 주말 기간 CTR 상승이 전체 성과를 견인하고 있습니다. 예산 효율화를 위해 저성과 채널의 비중 조정이 필요합니다.",
    recommendations: [
      "성과가 우수한 Instagram 및 Meta 채널의 일일 예산을 20% 증액하여 매출 규모를 확대하세요.",
      "YouTube 광고 소재를 숏폼(Shorts) 위주로 변경하여 클릭률(CTR)을 1.5% 이상으로 개선해보세요.",
      "Google Search 광고의 '전환당 비용(CPA)'이 안정적이므로, 롱테일 키워드를 추가 발굴하여 확장을 시도하세요."
    ]
  };
};