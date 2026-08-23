import React, { useState, useEffect, useMemo } from "react";
import { getMarketStatus } from "../api/ai";
import type { MarketStatusResponse } from "../api/ai";
import { useAuthStore } from "../store/useAuthStore";
import {
    DollarSign,
    Briefcase,
    Activity,
    CheckCircle,
    AlertCircle,
    X,
    Clock,
    Zap,
} from "lucide-react";

interface StockQuote {
    symbol: string;
    company: string;
    sector: string;
    currentPrice: number;
    change: number;
    changePct: number;
    expectedReturn: number;
    probabilityUp: number;
    confidence: "HIGH_CONFIDENCE" | "MEDIUM_CONFIDENCE" | "LOW_CONFIDENCE";
    risk: "Low" | "Medium" | "High";
}

interface PortfolioPosition {
    symbol: string;
    company: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
}

interface TradeLog {
    id: string;
    symbol: string;
    type: "BUY" | "SELL";
    shares: number;
    price: number;
    total: number;
    timestamp: string;
}

const STOCK_UNIVERSE: StockQuote[] = [
    {
        symbol: "RELIANCE",
        company: "Reliance Industries Ltd",
        sector: "Energy & Retail",
        currentPrice: 2940.50,
        change: +24.80,
        changePct: +0.85,
        expectedReturn: +4.8,
        probabilityUp: 68,
        confidence: "HIGH_CONFIDENCE",
        risk: "Medium",
    },
    {
        symbol: "TCS",
        company: "Tata Consultancy Services",
        sector: "Information Tech",
        currentPrice: 4210.00,
        change: -12.40,
        changePct: -0.29,
        expectedReturn: +3.2,
        probabilityUp: 62,
        confidence: "HIGH_CONFIDENCE",
        risk: "Low",
    },
    {
        symbol: "INFY",
        company: "Infosys Limited",
        sector: "Information Tech",
        currentPrice: 1785.25,
        change: +18.60,
        changePct: +1.05,
        expectedReturn: +5.1,
        probabilityUp: 71,
        confidence: "HIGH_CONFIDENCE",
        risk: "Medium",
    },
    {
        symbol: "HDFCBANK",
        company: "HDFC Bank Limited",
        sector: "Banking & Financials",
        currentPrice: 1640.80,
        change: +8.20,
        changePct: +0.50,
        expectedReturn: +3.9,
        probabilityUp: 65,
        confidence: "HIGH_CONFIDENCE",
        risk: "Low",
    },
    {
        symbol: "ICICIBANK",
        company: "ICICI Bank Limited",
        sector: "Banking & Financials",
        currentPrice: 1180.40,
        change: +14.10,
        changePct: +1.21,
        expectedReturn: +6.0,
        probabilityUp: 74,
        confidence: "HIGH_CONFIDENCE",
        risk: "Low",
    },
    {
        symbol: "TATAMOTORS",
        company: "Tata Motors Limited",
        sector: "Automotive & EV",
        currentPrice: 1045.00,
        change: -8.50,
        changePct: -0.81,
        expectedReturn: +4.2,
        probabilityUp: 59,
        confidence: "MEDIUM_CONFIDENCE",
        risk: "High",
    },
    {
        symbol: "ITC",
        company: "ITC Limited",
        sector: "FMCG & Hotels",
        currentPrice: 495.60,
        change: +2.10,
        changePct: +0.43,
        expectedReturn: +2.5,
        probabilityUp: 58,
        confidence: "HIGH_CONFIDENCE",
        risk: "Low",
    },
];

const Trading: React.FC = () => {
    const { user } = useAuthStore();
    const userStorageKey = user?.id || "guest";

    const [activeTab, setActiveTab] = useState<"watchlist" | "positions" | "history">("watchlist");
    const [filterSector, setFilterSector] = useState<string>("All");

    // User-scoped simulator cash
    const [cash, setCash] = useState<number>(() => {
        try {
            const saved = localStorage.getItem(`finmitra_portfolio_cash_${userStorageKey}`);
            return saved ? parseFloat(saved) : 100000;
        } catch {
            return 100000;
        }
    });

    // Positions start clean [] for fresh users
    const [positions, setPositions] = useState<PortfolioPosition[]>(() => {
        try {
            const saved = localStorage.getItem(`finmitra_portfolio_positions_${userStorageKey}`);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Trade logs start clean [] for fresh users
    const [tradeLogs, setTradeLogs] = useState<TradeLog[]>(() => {
        try {
            const saved = localStorage.getItem(`finmitra_trade_logs_${userStorageKey}`);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Trade Modal state
    const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
    const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
    const [orderShares, setOrderShares] = useState<number>(1);
    const [orderSuccess, setOrderSuccess] = useState<string>("");
    const [orderError, setOrderError] = useState<string>("");
    const [marketStatus, setMarketStatus] = useState<MarketStatusResponse | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem(`finmitra_portfolio_cash_${userStorageKey}`, cash.toString());
            localStorage.setItem(`finmitra_portfolio_positions_${userStorageKey}`, JSON.stringify(positions));
            localStorage.setItem(`finmitra_trade_logs_${userStorageKey}`, JSON.stringify(tradeLogs));
        } catch {
            // ignore
        }
    }, [cash, positions, tradeLogs, userStorageKey]);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await getMarketStatus();
                setMarketStatus(status);
            } catch (err) {
                console.warn("Market status unavailable:", err);
            }
        };
        fetchStatus();
    }, []);

    // Portfolio metrics
    const portfolioStockValue = useMemo(() => {
        return positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
    }, [positions]);

    const totalPortfolioValue = cash + portfolioStockValue;

    const totalUnrealizedPL = useMemo(() => {
        return positions.reduce((sum, p) => sum + (p.currentPrice - p.avgPrice) * p.shares, 0);
    }, [positions]);

    const totalInvested = useMemo(() => {
        return positions.reduce((sum, p) => sum + p.avgPrice * p.shares, 0);
    }, [positions]);

    const totalPLPct = totalInvested > 0 ? (totalUnrealizedPL / totalInvested) * 100 : 0;

    const sectors = ["All", ...Array.from(new Set(STOCK_UNIVERSE.map((s) => s.sector)))];

    const filteredStocks = STOCK_UNIVERSE.filter((s) => {
        return filterSector === "All" || s.sector === filterSector;
    });

    const openTradeModal = (stock: StockQuote, type: "BUY" | "SELL" = "BUY") => {
        setSelectedStock(stock);
        setOrderType(type);
        setOrderShares(1);
        setOrderSuccess("");
        setOrderError("");
    };

    const handleExecuteOrder = () => {
        if (!selectedStock) return;
        setOrderError("");
        setOrderSuccess("");

        const shares = Math.floor(orderShares);
        if (shares <= 0) {
            setOrderError("Please enter at least 1 share.");
            return;
        }

        const totalCost = shares * selectedStock.currentPrice;

        if (orderType === "BUY") {
            if (totalCost > cash) {
                setOrderError(`Insufficient simulated cash. Required: ₹${totalCost.toLocaleString("en-IN")}, Available: ₹${cash.toLocaleString("en-IN")}`);
                return;
            }

            setCash((prev) => prev - totalCost);

            setPositions((prev) => {
                const existing = prev.find((p) => p.symbol === selectedStock.symbol);
                if (existing) {
                    const newShares = existing.shares + shares;
                    const newAvg = (existing.shares * existing.avgPrice + totalCost) / newShares;
                    return prev.map((p) =>
                        p.symbol === selectedStock.symbol
                            ? { ...p, shares: newShares, avgPrice: newAvg, currentPrice: selectedStock.currentPrice }
                            : p
                    );
                }
                return [
                    ...prev,
                    {
                        symbol: selectedStock.symbol,
                        company: selectedStock.company,
                        shares,
                        avgPrice: selectedStock.currentPrice,
                        currentPrice: selectedStock.currentPrice,
                    },
                ];
            });

            const log: TradeLog = {
                id: `trade-${Date.now()}`,
                symbol: selectedStock.symbol,
                type: "BUY",
                shares,
                price: selectedStock.currentPrice,
                total: totalCost,
                timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            };
            setTradeLogs((prev) => [log, ...prev]);
            setOrderSuccess(`Successfully bought ${shares} shares of ${selectedStock.symbol} for ₹${totalCost.toLocaleString("en-IN")}.`);
        } else {
            // SELL
            const existing = positions.find((p) => p.symbol === selectedStock.symbol);
            if (!existing || existing.shares < shares) {
                setOrderError(`You only hold ${existing?.shares || 0} shares of ${selectedStock.symbol}.`);
                return;
            }

            setCash((prev) => prev + totalCost);

            setPositions((prev) => {
                return prev
                    .map((p) => {
                        if (p.symbol === selectedStock.symbol) {
                            return { ...p, shares: p.shares - shares };
                        }
                        return p;
                    })
                    .filter((p) => p.shares > 0);
            });

            const log: TradeLog = {
                id: `trade-${Date.now()}`,
                symbol: selectedStock.symbol,
                type: "SELL",
                shares,
                price: selectedStock.currentPrice,
                total: totalCost,
                timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            };
            setTradeLogs((prev) => [log, ...prev]);
            setOrderSuccess(`Successfully sold ${shares} shares of ${selectedStock.symbol} for ₹${totalCost.toLocaleString("en-IN")}.`);
        }

        setTimeout(() => {
            setSelectedStock(null);
        }, 1500);
    };

    return (
        <div className="wm-page-wrapper">
            {/* Header */}
            <div className="wm-page-header">
                <div>
                    <h1 className="wm-page-title">Paper Trading Simulator</h1>
                    <p className="wm-page-subtitle">
                        Zero-risk simulated environment with live NSE quotes and predictive quant returns.
                    </p>
                </div>

                <div className="wm-header-actions">
                    <div className="wm-market-pill">
                        <span className="wm-market-dot" />
                        <span>Market: {marketStatus?.market_status || "Open (Simulated)"}</span>
                    </div>
                </div>
            </div>

            {/* Portfolio Overview Cards */}
            <div className="wm-stats-grid">
                <div className="wm-stat-card wm-stat-balance">
                    <div className="wm-stat-header">
                        <span className="wm-stat-title">Net Portfolio Value</span>
                        <div className="wm-stat-icon-wrapper"><DollarSign size={18} /></div>
                    </div>
                    <div className="wm-stat-body">
                        <h3 className="wm-stat-value">₹{Math.round(totalPortfolioValue).toLocaleString("en-IN")}</h3>
                        <div className={`wm-stat-badge ${totalUnrealizedPL >= 0 ? 'positive' : 'negative'}`}>
                            {totalPLPct >= 0 ? '+' : ''}{totalPLPct.toFixed(2)}% P&L
                        </div>
                    </div>
                    <p className="wm-stat-subtitle">Cash + Active stock holdings</p>
                </div>

                <div className="wm-stat-card wm-stat-income">
                    <div className="wm-stat-header">
                        <span className="wm-stat-title">Available Cash</span>
                        <div className="wm-stat-icon-wrapper"><Zap size={18} /></div>
                    </div>
                    <div className="wm-stat-body">
                        <h3 className="wm-stat-value">₹{Math.round(cash).toLocaleString("en-IN")}</h3>
                    </div>
                    <p className="wm-stat-subtitle">Liquid simulation capital</p>
                </div>

                <div className="wm-stat-card wm-stat-savings">
                    <div className="wm-stat-header">
                        <span className="wm-stat-title">Stock Holdings Value</span>
                        <div className="wm-stat-icon-wrapper"><Briefcase size={18} /></div>
                    </div>
                    <div className="wm-stat-body">
                        <h3 className="wm-stat-value">₹{Math.round(portfolioStockValue).toLocaleString("en-IN")}</h3>
                    </div>
                    <p className="wm-stat-subtitle">{positions.length} active positions</p>
                </div>

                <div className="wm-stat-card wm-stat-expense">
                    <div className="wm-stat-header">
                        <span className="wm-stat-title">Unrealized P&L</span>
                        <div className="wm-stat-icon-wrapper"><Activity size={18} /></div>
                    </div>
                    <div className="wm-stat-body">
                        <h3 className={`wm-stat-value ${totalUnrealizedPL >= 0 ? 'income' : 'expense'}`}>
                            {totalUnrealizedPL >= 0 ? '+' : ''}₹{Math.round(totalUnrealizedPL).toLocaleString("en-IN")}
                        </h3>
                    </div>
                    <p className="wm-stat-subtitle">Current open market return</p>
                </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="wm-tab-pills" style={{ marginBottom: "20px" }}>
                <button
                    type="button"
                    className={`wm-tab-pill ${activeTab === 'watchlist' ? 'active' : ''}`}
                    onClick={() => setActiveTab('watchlist')}
                >
                    <span>Quant Watchlist</span>
                </button>
                <button
                    type="button"
                    className={`wm-tab-pill ${activeTab === 'positions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('positions')}
                >
                    <span>Open Positions ({positions.length})</span>
                </button>
                <button
                    type="button"
                    className={`wm-tab-pill ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <span>Trade Ledger ({tradeLogs.length})</span>
                </button>
            </div>

            {/* TAB 1: WATCHLIST */}
            {activeTab === "watchlist" && (
                <div className="wm-card wm-table-card">
                    {/* Sector Filters */}
                    <div className="wm-sector-filter-bar">
                        {sectors.map((sec) => (
                            <button
                                key={sec}
                                type="button"
                                className={`wm-sector-btn ${filterSector === sec ? 'active' : ''}`}
                                onClick={() => setFilterSector(sec)}
                            >
                                {sec}
                            </button>
                        ))}
                    </div>

                    <div className="wm-table-container">
                        <table className="wm-data-table">
                            <thead>
                                <tr>
                                    <th>Symbol / Company</th>
                                    <th>Sector</th>
                                    <th style={{ textAlign: "right" }}>Price (₹)</th>
                                    <th style={{ textAlign: "right" }}>Day Change</th>
                                    <th style={{ textAlign: "right" }}>Quant Return</th>
                                    <th style={{ textAlign: "center" }}>AI Signal</th>
                                    <th style={{ textAlign: "center" }}>Trade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStocks.map((stock) => {
                                    const isUp = stock.change >= 0;
                                    return (
                                        <tr key={stock.symbol}>
                                            <td>
                                                <div className="merchant-name">{stock.symbol}</div>
                                                <div className="merchant-notes">{stock.company}</div>
                                            </td>
                                            <td>
                                                <span className="wm-category-badge">{stock.sector}</span>
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: 600 }}>
                                                ₹{stock.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                <span className={`wm-change-tag ${isUp ? 'up' : 'down'}`}>
                                                    {isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.changePct}%)
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right", color: stock.expectedReturn >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                {stock.expectedReturn >= 0 ? '+' : ''}{stock.expectedReturn}%
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <span className="wm-confidence-pill">
                                                    {stock.probabilityUp}% Win Prob
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => openTradeModal(stock, "BUY")}
                                                        className="wm-btn-primary wm-btn-xs"
                                                    >
                                                        Buy
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openTradeModal(stock, "SELL")}
                                                        className="wm-btn-secondary wm-btn-xs"
                                                    >
                                                        Sell
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: OPEN POSITIONS */}
            {activeTab === "positions" && (
                <div className="wm-card wm-table-card">
                    {positions.length === 0 ? (
                        <div className="wm-empty-state-lg">
                            <div className="wm-empty-icon"><Briefcase size={32} /></div>
                            <h4>No active positions in your portfolio</h4>
                            <p>You have not executed any simulated trades yet. Select a stock from the Quant Watchlist to start paper trading.</p>
                            <button
                                type="button"
                                onClick={() => setActiveTab("watchlist")}
                                className="wm-btn-primary"
                                style={{ marginTop: "16px" }}
                            >
                                Explore Quant Watchlist
                            </button>
                        </div>
                    ) : (
                        <div className="wm-table-container">
                            <table className="wm-data-table">
                                <thead>
                                    <tr>
                                        <th>Symbol</th>
                                        <th style={{ textAlign: "right" }}>Shares</th>
                                        <th style={{ textAlign: "right" }}>Avg Price</th>
                                        <th style={{ textAlign: "right" }}>LTP (Current)</th>
                                        <th style={{ textAlign: "right" }}>Total Value</th>
                                        <th style={{ textAlign: "right" }}>P&L (₹)</th>
                                        <th style={{ textAlign: "center" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {positions.map((p) => {
                                        const val = p.shares * p.currentPrice;
                                        const pl = (p.currentPrice - p.avgPrice) * p.shares;
                                        const plPct = ((p.currentPrice - p.avgPrice) / p.avgPrice) * 100;
                                        const stock = STOCK_UNIVERSE.find((s) => s.symbol === p.symbol) || {
                                            symbol: p.symbol,
                                            company: p.company,
                                            sector: "Equities",
                                            currentPrice: p.currentPrice,
                                            change: 0,
                                            changePct: 0,
                                            expectedReturn: 0,
                                            probabilityUp: 50,
                                            confidence: "HIGH_CONFIDENCE" as const,
                                            risk: "Low" as const,
                                        };

                                        return (
                                            <tr key={p.symbol}>
                                                <td>
                                                    <div className="merchant-name">{p.symbol}</div>
                                                    <div className="merchant-notes">{p.company}</div>
                                                </td>
                                                <td style={{ textAlign: "right", fontWeight: 600 }}>{p.shares}</td>
                                                <td style={{ textAlign: "right" }}>₹{p.avgPrice.toFixed(2)}</td>
                                                <td style={{ textAlign: "right" }}>₹{p.currentPrice.toFixed(2)}</td>
                                                <td style={{ textAlign: "right", fontWeight: 600 }}>₹{Math.round(val).toLocaleString("en-IN")}</td>
                                                <td style={{ textAlign: "right", color: pl >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                    {pl >= 0 ? '+' : ''}₹{Math.round(pl).toLocaleString("en-IN")} ({plPct.toFixed(2)}%)
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => openTradeModal(stock, "SELL")}
                                                        className="wm-btn-secondary wm-btn-xs"
                                                    >
                                                        Exit / Sell
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: TRADE HISTORY */}
            {activeTab === "history" && (
                <div className="wm-card wm-table-card">
                    {tradeLogs.length === 0 ? (
                        <div className="wm-empty-state-lg">
                            <div className="wm-empty-icon"><Clock size={32} /></div>
                            <h4>No trade history</h4>
                            <p>Completed paper orders will appear in your trade ledger.</p>
                        </div>
                    ) : (
                        <div className="wm-table-container">
                            <table className="wm-data-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>Symbol</th>
                                        <th>Action</th>
                                        <th style={{ textAlign: "right" }}>Shares</th>
                                        <th style={{ textAlign: "right" }}>Execution Price</th>
                                        <th style={{ textAlign: "right" }}>Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tradeLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="wm-td-date">{log.timestamp}</td>
                                            <td style={{ fontWeight: 600 }}>{log.symbol}</td>
                                            <td>
                                                <span className={`wm-type-badge ${log.type === 'BUY' ? 'income' : 'expense'}`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right" }}>{log.shares}</td>
                                            <td style={{ textAlign: "right" }}>₹{log.price.toFixed(2)}</td>
                                            <td style={{ textAlign: "right", fontWeight: 600 }}>₹{Math.round(log.total).toLocaleString("en-IN")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Order Execution Modal */}
            {selectedStock && (
                <div className="wm-modal-backdrop" onClick={() => setSelectedStock(null)}>
                    <div className="wm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="wm-modal-header">
                            <div>
                                <h3>{orderType} Order: {selectedStock.symbol}</h3>
                                <p>{selectedStock.company} • LTP ₹{selectedStock.currentPrice}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedStock(null)} className="wm-modal-close-btn">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="wm-modal-form">
                            {orderSuccess && (
                                <div className="wm-alert wm-alert-success">
                                    <CheckCircle size={16} />
                                    <span>{orderSuccess}</span>
                                </div>
                            )}

                            {orderError && (
                                <div className="wm-alert wm-alert-error">
                                    <AlertCircle size={16} />
                                    <span>{orderError}</span>
                                </div>
                            )}

                            <div className="wm-form-group">
                                <label className="wm-label">Number of Shares</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={orderShares}
                                    onChange={(e) => setOrderShares(parseInt(e.target.value, 10) || 1)}
                                    className="wm-input"
                                />
                            </div>

                            <div className="wm-order-summary-box">
                                <div className="row">
                                    <span>Price per Share:</span>
                                    <strong>₹{selectedStock.currentPrice}</strong>
                                </div>
                                <div className="row">
                                    <span>Quantity:</span>
                                    <strong>{orderShares}</strong>
                                </div>
                                <div className="row total">
                                    <span>Estimated Order Total:</span>
                                    <strong>₹{(orderShares * selectedStock.currentPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                                </div>
                                <div className="row">
                                    <span>Available Simulator Cash:</span>
                                    <span>₹{Math.round(cash).toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            <div className="wm-modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setSelectedStock(null)}
                                    className="wm-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExecuteOrder}
                                    className={orderType === "BUY" ? "wm-btn-primary" : "wm-btn-secondary"}
                                    style={orderType === "SELL" ? { backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" } : {}}
                                >
                                    Confirm {orderType} Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trading;