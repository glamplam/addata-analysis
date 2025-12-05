import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DashboardData } from "../types";

// Safely retrieve API Key without crashing in browser
const getApiKey = () => {
  try {
    // Check global process first (polyfill or node)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Check window.process explicitly for browser polyfills
    if (typeof window !== 'undefined' && (window as any).process && (window as any).process.env) {
      return (window as any).process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("Environment variable access failed", e);
  }
  return '';
};

// Define the expected output schema for strict JSON generation
const dashboardSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    kpis: {
      type: Type.OBJECT,
      properties: {
        spend: {
          type: Type.OBJECT,
          properties: { label: { type: Type.STRING }, value: { type: Type.STRING }, change: { type: Type.STRING }, trend: { type: Type.STRING } },
        },
        roas: {
          type: Type.OBJECT,
          properties: { label: { type: Type.STRING }, value: { type: Type.STRING }, change: { type: Type.STRING }, trend: { type: Type.STRING } },
        },
        cpa: {
          type: Type.OBJECT,
          properties: { label: { type: Type.STRING }, value: { type: Type.STRING }, change: { type: Type.STRING }, trend: { type: Type.STRING } },
        },
        ctr: {
          type: Type.OBJECT,
          properties: { label: { type: Type.STRING }, value: { type: Type.STRING }, change: { type: Type.STRING }, trend: { type: Type.STRING } },
        },
        conversions: {
          type: Type.OBJECT,
          properties: { label: { type: Type.STRING }, value: { type: Type.STRING }, change: { type: Type.STRING }, trend: { type: Type.STRING } },
        },
        clicks: {
          type: Type.OBJECT,
          properties: { label: { type: Type.STRING }, value: { type: Type.STRING }, change: { type: Type.STRING }, trend: { type: Type.STRING } },
        },
      },
    },
    dailyTrend: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          cost: { type: Type.NUMBER },
          conversions: { type: Type.NUMBER },
          clicks: { type: Type.NUMBER },
          impressions: { type: Type.NUMBER },
        },
      },
    },
    channelPerformance: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          spend: { type: Type.NUMBER },
          roas: { type: Type.NUMBER },
          conversions: { type: Type.NUMBER },
        },
      },
    },
    aiSummary: { type: Type.STRING },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["kpis", "dailyTrend", "channelPerformance", "aiSummary", "recommendations"],
};

export const analyzeAdData = async (rawData: string): Promise<DashboardData> => {
  try {
    // Initialize AI client specifically when needed, not at module load time
    // This prevents "API key required" errors from crashing the app on startup
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("API Key가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert Data Analyst and Marketing Specialist.
      I will provide you with raw advertising data pasted from a spreadsheet (CSV or TSV format).
      
      Your task is to:
      1. Parse the data intelligently. Identify columns for Date, Cost/Spend, Impressions, Clicks, Conversions, and Revenue/Value.
      2. If columns are missing, infer reasonable defaults or zeros.
      3. Aggregate the data to calculate overall KPIs: Total Spend, ROAS (Revenue/Spend), CPA (Spend/Conversions), CTR (Clicks/Impressions), Total Conversions, Total Clicks.
      4. Create a daily trend dataset (aggregated by date).
      5. If there is a 'Campaign', 'Source', or 'Platform' column, categorize performance by channel. If not, treat everything as "General".
      6. Provide a concise summary of the performance in KOREAN.
      7. Provide 3 actionable recommendations in KOREAN.

      RAW DATA:
      ${rawData}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dashboardSchema,
        temperature: 0.2, // Low temperature for consistent math/parsing
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as DashboardData;
      return data;
    } else {
      throw new Error("No response text generated");
    }
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // Provide a more user-friendly error message
    if (error.message?.includes('API Key')) {
      throw new Error("API Key 오류: 키가 올바르게 설정되지 않았습니다.");
    }
    throw new Error("데이터를 분석하는 중 오류가 발생했습니다. 데이터 형식을 확인해주세요.");
  }
};