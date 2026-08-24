import { useState, useEffect, useRef, useCallback } from "react";

export interface LiveStreamQuote {
    symbol: string;
    company?: string;
    exchange?: string;
    price: number;
    last_price: number;
    open?: number;
    high?: number;
    low?: number;
    volume?: number;
    change: number;
    change_percent: number;
    data_source?: string;
    data_quality?: "LIVE" | "RECENT" | "STALE" | "HISTORICAL" | "UNAVAILABLE" | string;
    data_timestamp?: string;
    received_at?: string;
}

export interface LiveStreamRanking {
    symbol: string;
    full_symbol: string;
    current_price: number;
    change_percent: number;
    predicted_price_30d: number;
    expected_return_pct: number;
    probability_up: number;
    confidence: string;
}

export function useMarketWebSocket() {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [liveQuotes, setLiveQuotes] = useState<Record<string, LiveStreamQuote>>({});
    const [liveRankings, setLiveRankings] = useState<LiveStreamRanking[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const subscribe = useCallback((symbols: string[]) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && symbols.length > 0) {
            socketRef.current.send(JSON.stringify({
                action: "subscribe",
                symbols: symbols
            }));
        }
    }, []);

    const unsubscribe = useCallback((symbols: string[]) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && symbols.length > 0) {
            socketRef.current.send(JSON.stringify({
                action: "unsubscribe",
                symbols: symbols
            }));
        }
    }, []);

    const connect = useCallback(() => {
        const host = window.location.hostname === "localhost" ? "127.0.0.1" : window.location.hostname;
        const port = "8000";
        const wsUrl = `ws://${host}:${port}/ws/market`;

        try {
            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    if (!payload) return;

                    if (payload.type === "quote" && payload.symbol) {
                        const priceVal = payload.price ?? payload.last_price ?? 0;
                        const quoteObj: LiveStreamQuote = {
                            symbol: payload.symbol,
                            company: payload.company || payload.symbol,
                            exchange: payload.exchange || "NSE",
                            price: priceVal,
                            last_price: priceVal,
                            change: payload.change ?? 0,
                            change_percent: payload.change_percent ?? 0,
                            data_source: payload.data_source || "PROVIDER",
                            data_quality: payload.data_quality || "LIVE",
                            data_timestamp: payload.timestamp || new Date().toISOString(),
                            received_at: payload.received_at || new Date().toISOString()
                        };

                        const cleanSym = payload.symbol.replace(".NS", "").replace(".BO", "").toUpperCase();
                        setLiveQuotes((prev) => ({
                            ...prev,
                            [cleanSym]: quoteObj,
                            [payload.symbol.toUpperCase()]: quoteObj
                        }));
                        setLastUpdated(payload.timestamp || new Date().toISOString());
                    } else if (payload.quotes && Array.isArray(payload.quotes)) {
                        setLastUpdated(payload.timestamp || new Date().toISOString());
                        const quotesMap: Record<string, LiveStreamQuote> = {};
                        payload.quotes.forEach((q: any) => {
                            const pVal = q.price ?? q.last_price ?? 0;
                            const norm: LiveStreamQuote = {
                                symbol: q.symbol,
                                company: q.company || q.symbol,
                                exchange: q.exchange || "NSE",
                                price: pVal,
                                last_price: pVal,
                                change: q.change ?? 0,
                                change_percent: q.change_percent ?? 0,
                                data_source: q.data_source || "PROVIDER",
                                data_quality: q.data_quality || "LIVE",
                                data_timestamp: q.data_timestamp || new Date().toISOString(),
                                received_at: q.received_at || new Date().toISOString()
                            };
                            const cleanSym = q.symbol.replace(".NS", "").replace(".BO", "").toUpperCase();
                            quotesMap[cleanSym] = norm;
                            quotesMap[q.symbol.toUpperCase()] = norm;
                        });
                        setLiveQuotes((prev) => ({ ...prev, ...quotesMap }));
                    }

                    if (payload.rankings && Array.isArray(payload.rankings)) {
                        setLiveRankings(payload.rankings);
                    }
                } catch (e) {
                    console.warn("Failed to parse WebSocket message:", e);
                }
            };

            ws.onerror = (err) => {
                console.warn("WebSocket error:", err);
                setIsConnected(false);
            };

            ws.onclose = () => {
                setIsConnected(false);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 4000);
            };
        } catch (e) {
            console.warn("Could not establish WebSocket connection:", e);
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connect]);

    return {
        isConnected,
        lastUpdated,
        liveQuotes,
        liveRankings,
        subscribe,
        unsubscribe
    };
}

