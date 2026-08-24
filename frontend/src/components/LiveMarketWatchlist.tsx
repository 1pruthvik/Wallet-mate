import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Wifi, WifiOff, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useMarketWebSocket } from "../hooks/useMarketWebSocket";
import type { LiveStreamQuote } from "../hooks/useMarketWebSocket";
import { useAuthStore } from "../store/useAuthStore";

interface InstrumentSearchResult {
    symbol: string;
    company: string;
    exchange: string;
    market: string;
    asset_type: string;
}

const DEFAULT_TOP_20_STOCKS = [
    "RELIANCE.NS",
    "TCS.NS",
    "INFY.NS",
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "TATAMOTORS.NS",
    "BHARTIARTL.NS",
    "SBIN.NS",
    "LTIM.NS",
    "ITC.NS",
    "KOTAKBANK.NS",
    "LT.NS",
    "AXISBANK.NS",
    "HINDUNILVR.NS",
    "BAJFINANCE.NS",
    "MARUTI.NS",
    "SUNPHARMA.NS",
    "TITAN.NS",
    "ADANIENT.NS",
    "WIPRO.NS"
];

const KNOWN_INDIAN_SYMBOLS = new Set([
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
    "TATAMOTORS", "BHARTIARTL", "SBIN", "LTIM", "ITC",
    "KOTAKBANK", "LT", "AXISBANK", "HINDUNILVR", "BAJFINANCE",
    "MARUTI", "SUNPHARMA", "TITAN", "ADANIENT", "WIPRO"
]);

export const LiveMarketWatchlist: React.FC = () => {
    const { user } = useAuthStore();
    const userKey = user?.id || "default_user";

    const { isConnected, liveQuotes, subscribe, unsubscribe } = useMarketWebSocket();

    // User watchlist slots up to 20
    const [watchlist, setWatchlist] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(`finmitra_user_watchlist_v2_${userKey}`);
            return saved ? JSON.parse(saved) : DEFAULT_TOP_20_STOCKS;
        } catch {
            return DEFAULT_TOP_20_STOCKS;
        }
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<InstrumentSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [restQuotes, setRestQuotes] = useState<Record<string, LiveStreamQuote>>({});

    // Sync watchlist to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(`finmitra_user_watchlist_v2_${userKey}`, JSON.stringify(watchlist));
        } catch {
            // Ignore
        }
    }, [watchlist, userKey]);

    // Fetch initial REST quotes for instant display on mount/watchlist update
    useEffect(() => {
        const fetchInitialQuotes = async () => {
            const aiUrl = import.meta.env.VITE_AI_API_URL || "http://127.0.0.1:8000";
            for (const sym of watchlist) {
                try {
                    const res = await fetch(`${aiUrl}/market/quote?query=${encodeURIComponent(sym)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && (data.price || data.current_price)) {
                            const pVal = data.price ?? data.current_price ?? 0;
                            const norm: LiveStreamQuote = {
                                symbol: data.symbol || sym,
                                company: data.company || sym,
                                exchange: data.exchange || "NSE",
                                price: pVal,
                                last_price: pVal,
                                change: data.change ?? 0,
                                change_percent: data.change_percent ?? 0,
                                data_source: data.data_source || "PROVIDER",
                                data_quality: data.data_quality || "LIVE",
                                data_timestamp: data.timestamp || new Date().toISOString()
                            };
                            const clean = sym.replace(".NS", "").replace(".BO", "").toUpperCase();
                            setRestQuotes((prev) => ({
                                ...prev,
                                [clean]: norm,
                                [sym.toUpperCase()]: norm
                            }));
                        }
                    }
                } catch (e) {
                    // Ignore background fetch error
                }
            }
        };
        fetchInitialQuotes();
    }, [watchlist]);

    // Subscribe watchlist symbols on WebSocket
    useEffect(() => {
        if (isConnected && watchlist.length > 0) {
            subscribe(watchlist);
        }
    }, [isConnected, watchlist, subscribe]);

    // Dynamic backend instrument search
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const aiUrl = import.meta.env.VITE_AI_API_URL || "http://127.0.0.1:8000";
            const res = await fetch(`${aiUrl}/market/search?q=${encodeURIComponent(query.trim())}`);
            if (!res.ok) {
                throw new Error("Search request failed.");
            }
            const data = await res.json();
            setSearchResults(data.matches || []);
        } catch (err: any) {
            console.warn("Search failed:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddSymbol = async (symbol: string) => {
        if (watchlist.length >= 20) {
            alert("Maximum 20 live stock slots reached. Remove a stock to add another.");
            return;
        }

        const clean = symbol.trim().toUpperCase();
        if (!watchlist.includes(clean)) {
            const updated = [...watchlist, clean];
            setWatchlist(updated);
            subscribe([clean]);
        }
        setSearchQuery("");
        setSearchResults([]);

        // Instant fetch for newly added symbol
        try {
            const aiUrl = import.meta.env.VITE_AI_API_URL || "http://127.0.0.1:8000";
            const res = await fetch(`${aiUrl}/market/quote?query=${encodeURIComponent(clean)}`);
            if (res.ok) {
                const data = await res.json();
                if (data && (data.price || data.current_price)) {
                    const pVal = data.price ?? data.current_price ?? 0;
                    const norm: LiveStreamQuote = {
                        symbol: data.symbol || clean,
                        company: data.company || clean,
                        exchange: data.exchange || "NSE",
                        price: pVal,
                        last_price: pVal,
                        change: data.change ?? 0,
                        change_percent: data.change_percent ?? 0,
                        data_source: data.data_source || "PROVIDER",
                        data_quality: data.data_quality || "LIVE",
                        data_timestamp: data.timestamp || new Date().toISOString()
                    };
                    setRestQuotes((prev) => ({
                        ...prev,
                        [clean.replace(".NS", "").replace(".BO", "")]: norm,
                        [clean]: norm
                    }));
                }
            }
        } catch (e) {
            // Ignore
        }
    };

    const handleRemoveSymbol = (symbol: string) => {
        const updated = watchlist.filter((s) => s !== symbol);
        setWatchlist(updated);
        unsubscribe([symbol]);
    };

    const getQualityBadge = (quality?: string) => {
        const q = (quality || "LIVE").toUpperCase();
        if (q === "LIVE") {
            return <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#10b981" }}>● LIVE</span>;
        } else if (q === "RECENT") {
            return <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#3b82f6" }}>● RECENT</span>;
        } else if (q === "STALE") {
            return <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#f59e0b" }}>● STALE</span>;
        } else {
            return <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#ef4444" }}>● {q}</span>;
        }
    };

    const isIndianStock = (symbol: string, exchange?: string) => {
        const clean = symbol.replace(".NS", "").replace(".BO", "").toUpperCase();
        if (symbol.endsWith(".NS") || symbol.endsWith(".BO")) return true;
        if (KNOWN_INDIAN_SYMBOLS.has(clean)) return true;
        if (exchange && (exchange === "NSE" || exchange === "NSI" || exchange === "BSE")) return true;
        return false;
    };

    return (
        <div className="wm-card" style={{
            marginBottom: "24px",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
            padding: "24px"
        }}>
            {/* Header Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>Top 20 Live Market Stocks (INR ₹)</span>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "16px",
                            backgroundColor: isConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                            color: isConnected ? "#10b981" : "#ef4444",
                            fontSize: "0.75rem",
                            fontWeight: 600
                        }}>
                            {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
                            <span>{isConnected ? "WEBSOCKET LIVE" : "OFFLINE"}</span>
                        </div>
                    </h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                        Continuous real-time market data feed for top Indian stocks ({watchlist.length}/20 Slots Active)
                    </p>
                </div>

                {/* Dynamic Instrument Search Box */}
                <div style={{ position: "relative", minWidth: "300px" }}>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search any stock (e.g. Reliance, Adani, Apple)..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 14px 10px 38px",
                                fontSize: "0.85rem",
                                borderRadius: "10px",
                                border: "1px solid #cbd5e1",
                                backgroundColor: "#f8fafc",
                                color: "#0f172a",
                                outline: "none"
                            }}
                        />
                        <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "#94a3b8" }} />
                        {isSearching && <RefreshCw size={14} className="wm-spin" style={{ position: "absolute", right: "12px", top: "13px", color: "#3b82f6" }} />}
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div style={{
                            position: "absolute",
                            top: "44px",
                            left: 0,
                            right: 0,
                            zIndex: 100,
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "10px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                            maxHeight: "260px",
                            overflowY: "auto"
                        }}>
                            {searchResults.map((res) => (
                                <div
                                    key={res.symbol}
                                    onClick={() => handleAddSymbol(res.symbol)}
                                    style={{
                                        padding: "10px 14px",
                                        borderBottom: "1px solid #f1f5f9",
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>{res.symbol}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{res.company} ({res.exchange})</div>
                                    </div>
                                    <button type="button" style={{
                                        backgroundColor: "#3b82f6",
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "4px 8px",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px"
                                    }}>
                                        <Plus size={13} /> Add Slot
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Watchlist Cards Grid - 20 Slots Layout */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                gap: "16px"
            }}>
                {watchlist.map((sym) => {
                    const cleanSym = sym.replace(".NS", "").replace(".BO", "").toUpperCase();
                    const quote: LiveStreamQuote | undefined = liveQuotes[cleanSym] || liveQuotes[sym.toUpperCase()] || restQuotes[cleanSym] || restQuotes[sym.toUpperCase()];
                    const isUp = quote ? quote.change >= 0 : true;
                    const inr = isIndianStock(sym, quote?.exchange);
                    const currencySymbol = inr ? "₹" : "$";

                    return (
                        <div
                            key={sym}
                            style={{
                                padding: "16px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                transition: "transform 0.2s ease, boxShadow 0.2s ease",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", letterSpacing: "0.3px" }}>{cleanSym}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                                        {quote?.company || `${cleanSym} Ltd`}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSymbol(sym)}
                                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px" }}
                                    title="Remove stock slot"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div style={{ margin: "12px 0 8px 0" }}>
                                {quote && quote.price > 0 ? (
                                    <>
                                        <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
                                            {currencySymbol}{quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "0.82rem",
                                            fontWeight: 700,
                                            color: isUp ? "#16a34a" : "#dc2626",
                                            marginTop: "4px"
                                        }}>
                                            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            <span>
                                                {isUp ? "+" : ""}{quote.change.toFixed(2)} ({isUp ? "+" : ""}{quote.change_percent.toFixed(2)}%)
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", padding: "8px 0" }}>
                                        Loading real-time tick...
                                    </div>
                                )}
                            </div>

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "0.72rem",
                                color: "#64748b",
                                paddingTop: "8px",
                                borderTop: "1px solid #e2e8f0"
                            }}>
                                <span>Src: {quote?.data_source || "YFINANCE"}</span>
                                {getQualityBadge(quote?.data_quality)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LiveMarketWatchlist;
