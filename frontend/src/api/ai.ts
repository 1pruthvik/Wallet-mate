import axios from "axios";

const AI_API_BASE = import.meta.env.VITE_AI_API_URL || "http://localhost:8001";

const aiClient = axios.create({
    baseURL: AI_API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

export interface MarketStatusResponse {
    provider: string;
    connection: string;
    market_status: string;
    last_update: string;
    data_quality: string;
}

export interface MarketQuote {
    symbol: string;
    last_price: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    change: number;
    change_pct: number;
    timestamp: string;
    data_quality: string;
}

export interface LivePredictResponse {
    symbol: string;
    prediction: {
        symbol: string;
        horizon_days: number;
        predicted_return: number;
        expected_return_range: { low: number; high: number };
        risk_score: number;
        confidence: number;
        direction: "positive" | "negative" | "neutral";
        current_price: number;
        expected_price: number;
        model_name: string;
        data_timestamp: string;
    };
    live_quote?: MarketQuote;
    data_quality: string;
    gemini_explanation?: {
        summary: string;
        why_it_matters: string;
        key_factors: string[];
        risks: string[];
        uncertainty: string;
        educational_note: string;
    };
}

export interface AIChatResponse {
    answer: string;
    citations?: { source_id: string; title: string; section?: string }[];
    confidence?: number;
}

/**
 * Fetch market data quality and provider status from FastAPI
 */
export async function getMarketStatus(): Promise<MarketStatusResponse> {
    const res = await aiClient.get<MarketStatusResponse>("/investment/market-status");
    return res.data;
}

/**
 * Fetch real-time normalized stock quote with quality tags
 */
export async function getLiveStockQuote(symbol: string): Promise<MarketQuote> {
    const res = await aiClient.get<MarketQuote>(`/investment/quote/${encodeURIComponent(symbol)}`);
    return res.data;
}

/**
 * Run real-time zero-shot TSFM (Chronos / Ensemble) live inference on target ticker
 */
export async function predictLiveStock(symbol: string, horizonDays: number = 20, modelName: string = "ensemble"): Promise<LivePredictResponse> {
    const res = await aiClient.post<LivePredictResponse>("/investment/live-predict", {
        symbol,
        horizon_days: horizonDays,
        model_name: modelName,
    });
    return res.data;
}

/**
 * Query grounded AI Money Mentor via FastAPI & Gemini RAG
 */
export async function queryAIMentor(message: string, financialContext?: Record<string, unknown>): Promise<AIChatResponse> {
    const res = await aiClient.post<AIChatResponse>("/ai/chat", {
        message,
        financial_context: financialContext,
    });
    return res.data;
}

export default aiClient;
