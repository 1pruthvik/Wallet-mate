import React, { useState, useEffect } from "react";
import { getMarketStatus } from "../api/ai";
import type { MarketStatusResponse } from "../api/ai";

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
        sector: "Energy & Conglomerate",
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
        probabilityUp: 64,
        confidence: "MEDIUM_CONFIDENCE",
        risk: "Low",
    },
    {
        symbol: "ICICIBANK",
        company: "ICICI Bank Limited",
        sector: "Banking & Financials",
        currentPrice: 1195.40,
        change: +14.50,
        changePct: +1.23,
        expectedReturn: +6.4,
        probabilityUp: 74,
        confidence: "HIGH_CONFIDENCE",
        risk: "Medium",
    },
    {
        symbol: "TATAMOTORS",
        company: "Tata Motors Limited",
        sector: "Automotive",
        currentPrice: 985.60,
        change: -4.10,
        changePct: -0.41,
        expectedReturn: +2.1,
        probabilityUp: 54,
        confidence: "LOW_CONFIDENCE",
        risk: "High",
    },
];

const INITIAL_VIRTUAL_CASH = 100000;

const Trading: React.FC = () => {
    const [virtualCash, setVirtualCash] = useState<number>(() => {
        try {
            const saved = localStorage.getItem("finmitra_virtual_cash");
            return saved ? parseFloat(saved) : INITIAL_VIRTUAL_CASH;
        } catch {
            return INITIAL_VIRTUAL_CASH;
        }
    });

    const [positions, setPositions] = useState<PortfolioPosition[]>(() => {
        try {
            const saved = localStorage.getItem("finmitra_portfolio_positions");
            return saved ? JSON.parse(saved) : [
                {
                    symbol: "INFY",
                    company: "Infosys Limited",
                    shares: 10,
                    avgPrice: 1720.00,
                    currentPrice: 1785.25,
                },
            ];
        } catch {
            return [];
        }
    });

    const [tradeLogs, setTradeLogs] = useState<TradeLog[]>(() => {
        try {
            const saved = localStorage.getItem("finmitra_trade_logs");
            return saved ? JSON.parse(saved) : [
                {
                    id: "trade-init",
                    symbol: "INFY",
                    type: "BUY",
                    shares: 10,
                    price: 1720.00,
                    total: 17200.00,
                    timestamp: "Initial Position",
                },
            ];
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

    // Fetch live market service status
    useEffect(() => {
        getMarketStatus()
            .then((data) => setMarketStatus(data))
            .catch(() => setMarketStatus({ provider: "yfinance", connection: "CONNECTED", market_status: "CLOSED", last_update: new Date().toISOString(), data_quality: "SIMULATED" }));
    }, []);

    // Save state changes
    useEffect(() => {
        try {
            localStorage.setItem("finmitra_virtual_cash", virtualCash.toString());
            localStorage.setItem("finmitra_portfolio_positions", JSON.stringify(positions));
            localStorage.setItem("finmitra_trade_logs", JSON.stringify(tradeLogs));
        } catch (e) {
            console.error(e);
        }
    }, [virtualCash, positions, tradeLogs]);

    // Portfolio metrics
    const investedValue = positions.reduce((sum, p) => sum + p.shares * p.avgPrice, 0);
    const currentHoldingsValue = positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
    const totalPortfolioValue = virtualCash + currentHoldingsValue;
    const totalPnl = currentHoldingsValue - investedValue;
    const totalPnlPct = investedValue > 0 ? (totalPnl / investedValue) * 100 : 0;

    const openTradeModal = (stock: StockQuote, type: "BUY" | "SELL" = "BUY") => {
        setSelectedStock(stock);
        setOrderType(type);
        setOrderShares(1);
        setOrderSuccess("");
        setOrderError("");
    };

    const handleExecuteTrade = () => {
        if (!selectedStock || orderShares <= 0) return;

        const totalCost = selectedStock.currentPrice * orderShares;

        if (orderType === "BUY") {
            if (totalCost > virtualCash) {
                setOrderError(`Insufficient virtual balance. Required: ₹${totalCost.toLocaleString("en-IN")}, Available: ₹${virtualCash.toLocaleString("en-IN")}`);
                return;
            }

            setVirtualCash((prev) => prev - totalCost);

            setPositions((prev) => {
                const existing = prev.find((p) => p.symbol === selectedStock.symbol);
                if (existing) {
                    const totalShares = existing.shares + orderShares;
                    const newAvg = (existing.shares * existing.avgPrice + totalCost) / totalShares;
                    return prev.map((p) =>
                        p.symbol === selectedStock.symbol
                            ? { ...p, shares: totalShares, avgPrice: newAvg, currentPrice: selectedStock.currentPrice }
                            : p
                    );
                } else {
                    return [
                        ...prev,
                        {
                            symbol: selectedStock.symbol,
                            company: selectedStock.company,
                            shares: orderShares,
                            avgPrice: selectedStock.currentPrice,
                            currentPrice: selectedStock.currentPrice,
                        },
                    ];
                }
            });

            const newLog: TradeLog = {
                id: `trade-${Date.now()}`,
                symbol: selectedStock.symbol,
                type: "BUY",
                shares: orderShares,
                price: selectedStock.currentPrice,
                total: totalCost,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setTradeLogs((prev) => [newLog, ...prev]);

            setOrderSuccess(`Successfully bought ${orderShares} shares of ${selectedStock.symbol} at ₹${selectedStock.currentPrice.toLocaleString("en-IN")}`);
            setTimeout(() => setSelectedStock(null), 1200);
        } else {
            // SELL
            const existing = positions.find((p) => p.symbol === selectedStock.symbol);
            if (!existing || existing.shares < orderShares) {
                setOrderError(`You only own ${existing ? existing.shares : 0} shares of ${selectedStock.symbol}.`);
                return;
            }

            const totalRevenue = selectedStock.currentPrice * orderShares;
            setVirtualCash((prev) => prev + totalRevenue);

            setPositions((prev) => {
                return prev
                    .map((p) => {
                        if (p.symbol === selectedStock.symbol) {
                            return { ...p, shares: p.shares - orderShares };
                        }
                        return p;
                    })
                    .filter((p) => p.shares > 0);
            });

            const newLog: TradeLog = {
                id: `trade-${Date.now()}`,
                symbol: selectedStock.symbol,
                type: "SELL",
                shares: orderShares,
                price: selectedStock.currentPrice,
                total: totalRevenue,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setTradeLogs((prev) => [newLog, ...prev]);

            setOrderSuccess(`Successfully sold ${orderShares} shares of ${selectedStock.symbol} for ₹${totalRevenue.toLocaleString("en-IN")}`);
            setTimeout(() => setSelectedStock(null), 1200);
        }
    };

    const handleResetPortfolio = () => {
        if (window.confirm("Reset paper trading portfolio back to starting ₹1,00,000 virtual balance?")) {
            setVirtualCash(INITIAL_VIRTUAL_CASH);
            setPositions([]);
            setTradeLogs([]);
            localStorage.removeItem("finmitra_virtual_cash");
            localStorage.removeItem("finmitra_portfolio_positions");
            localStorage.removeItem("finmitra_trade_logs");
        }
    };

    return (
        <div className="trading-page">
            {/* PAGE HEADER */}
            <div className="page-header">
                <div>
                    <h1>Paper Trading & Quant Intelligence</h1>
                    <p>Risk-free simulated market trading with AI quant signals and portfolio management.</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {marketStatus && (
                        <div className="mentor-status-pill" style={{ background: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                            <span className="online-dot" />
                            <span>Market Data: {marketStatus.data_quality} ({marketStatus.market_status})</span>
                        </div>
                    )}
                    <button type="button" className="btn-secondary" onClick={handleResetPortfolio}>
                        ↺ Reset Balance
                    </button>
                </div>
            </div>

            {/* PORTFOLIO HERO STATS */}
            <div className="trading-stats-grid">
                <div className="trading-stat-card">
                    <span className="stat-card-label">Total Portfolio Value</span>
                    <h2 className="stat-card-number">₹{totalPortfolioValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h2>
                    <span className="stat-card-sub">Virtual Capital + Holdings</span>
                </div>

                <div className="trading-stat-card">
                    <span className="stat-card-label">Available Virtual Cash</span>
                    <h2 className="stat-card-number income-val">₹{virtualCash.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h2>
                    <span className="stat-card-sub">Ready to deploy</span>
                </div>

                <div className="trading-stat-card">
                    <span className="stat-card-label">Current Holdings Value</span>
                    <h2 className="stat-card-number">₹{currentHoldingsValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h2>
                    <span className="stat-card-sub">{positions.length} active positions</span>
                </div>

                <div className="trading-stat-card">
                    <span className="stat-card-label">Total Unrealized P&L</span>
                    <h2 className={`stat-card-number ${totalPnl >= 0 ? "income-val" : "expense-val"}`}>
                        {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%)
                    </h2>
                    <span className="stat-card-sub">Since inception</span>
                </div>
            </div>

            {/* TWO-COLUMN LAYOUT: WATCHLIST & HOLDINGS */}
            <div className="trading-layout-grid">
                {/* WATCHLIST & QUANT SIGNALS */}
                <div className="trading-section-card">
                    <div className="card-inner-header">
                        <div>
                            <h3>Stock Watchlist & Quant Signals</h3>
                            <span>Chronos-Bolt & GradientBoost ML models</span>
                        </div>
                    </div>

                    <div className="watchlist-table-container">
                        <table className="trading-table">
                            <thead>
                                <tr>
                                    <th>Stock</th>
                                    <th>Price</th>
                                    <th>Quant Signal</th>
                                    <th>Confidence</th>
                                    <th style={{ textAlign: "right" }}>Trade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {STOCK_UNIVERSE.map((stock) => (
                                    <tr key={stock.symbol}>
                                        <td>
                                            <div className="stock-cell">
                                                <span className="stock-sym">{stock.symbol}</span>
                                                <span className="stock-comp">{stock.company}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="price-cell">
                                                <span className="price-num">₹{stock.currentPrice.toLocaleString("en-IN")}</span>
                                                <span className={`price-chg ${stock.change >= 0 ? "income-val" : "expense-val"}`}>
                                                    {stock.change >= 0 ? "+" : ""}{stock.changePct}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="signal-cell">
                                                <span className="signal-return">{stock.expectedReturn >= 0 ? "+" : ""}{stock.expectedReturn}% Return</span>
                                                <span className="signal-prob">{stock.probabilityUp}% Prob Up</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`confidence-badge badge-${stock.confidence.toLowerCase().split("_")[0]}`}>
                                                {stock.confidence.replace("_CONFIDENCE", "")}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <button
                                                type="button"
                                                className="btn-trade-buy"
                                                onClick={() => openTradeModal(stock, "BUY")}
                                            >
                                                Trade
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ACTIVE HOLDINGS */}
                <div className="trading-section-card">
                    <div className="card-inner-header">
                        <div>
                            <h3>Active Holdings</h3>
                            <span>{positions.length} stocks in simulated portfolio</span>
                        </div>
                    </div>

                    {positions.length === 0 ? (
                        <div className="trading-empty-state">
                            <p>No active positions.</p>
                            <span>Pick a stock from the watchlist on the left to place your first virtual order.</span>
                        </div>
                    ) : (
                        <div className="holdings-table-container">
                            <table className="trading-table">
                                <thead>
                                    <tr>
                                        <th>Stock</th>
                                        <th>Shares</th>
                                        <th>Avg Buy</th>
                                        <th>Value & P&L</th>
                                        <th style={{ textAlign: "right" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {positions.map((pos) => {
                                        const val = pos.shares * pos.currentPrice;
                                        const cost = pos.shares * pos.avgPrice;
                                        const pnl = val - cost;
                                        const pnlPct = (pnl / cost) * 100;
                                        const matchingStock = STOCK_UNIVERSE.find((s) => s.symbol === pos.symbol) || {
                                            symbol: pos.symbol,
                                            company: pos.company,
                                            sector: "Equities",
                                            currentPrice: pos.currentPrice,
                                            change: 0,
                                            changePct: 0,
                                            expectedReturn: 0,
                                            probabilityUp: 50,
                                            confidence: "MEDIUM_CONFIDENCE" as const,
                                            risk: "Medium" as const,
                                        };

                                        return (
                                            <tr key={pos.symbol}>
                                                <td>
                                                    <div className="stock-cell">
                                                        <span className="stock-sym">{pos.symbol}</span>
                                                        <span className="stock-comp">{pos.company}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="shares-num">{pos.shares}</span>
                                                </td>
                                                <td>
                                                    <span className="avg-num">₹{pos.avgPrice.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span>
                                                </td>
                                                <td>
                                                    <div className="pnl-cell">
                                                        <span className="holdings-val">₹{val.toLocaleString("en-IN")}</span>
                                                        <span className={`pnl-val ${pnl >= 0 ? "income-val" : "expense-val"}`}>
                                                            {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    <button
                                                        type="button"
                                                        className="btn-trade-sell"
                                                        onClick={() => openTradeModal(matchingStock, "SELL")}
                                                    >
                                                        Sell
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
            </div>

            {/* TRADE EXECUTION MODAL */}
            {selectedStock && (
                <div className="trade-modal-overlay" onClick={() => setSelectedStock(null)}>
                    <div className="trade-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="trade-modal-header">
                            <div>
                                <h2>Trade {selectedStock.symbol}</h2>
                                <p>{selectedStock.company} • ₹{selectedStock.currentPrice.toLocaleString("en-IN")}</p>
                            </div>
                            <button type="button" className="modal-close-btn" onClick={() => setSelectedStock(null)}>×</button>
                        </div>

                        <div className="trade-modal-body">
                            {/* BUY / SELL SWITCHER */}
                            <div className="order-type-tabs">
                                <button
                                    type="button"
                                    className={`order-tab-btn ${orderType === "BUY" ? "order-tab-buy" : ""}`}
                                    onClick={() => { setOrderType("BUY"); setOrderError(""); }}
                                >
                                    BUY
                                </button>
                                <button
                                    type="button"
                                    className={`order-tab-btn ${orderType === "SELL" ? "order-tab-sell" : ""}`}
                                    onClick={() => { setOrderType("SELL"); setOrderError(""); }}
                                >
                                    SELL
                                </button>
                            </div>

                            {/* QUANT METRIC BOX */}
                            <div className="trade-quant-box">
                                <div className="quant-row">
                                    <span>Expected Horizon Return:</span>
                                    <strong>+{selectedStock.expectedReturn}%</strong>
                                </div>
                                <div className="quant-row">
                                    <span>Model Confidence:</span>
                                    <strong style={{ color: "var(--primary)" }}>{selectedStock.confidence.replace("_CONFIDENCE", "")}</strong>
                                </div>
                                <div className="quant-row">
                                    <span>Available Virtual Balance:</span>
                                    <span>₹{virtualCash.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            {/* SHARES INPUT */}
                            <div className="trade-input-group">
                                <label>Number of Shares</label>
                                <div className="shares-stepper">
                                    <button
                                        type="button"
                                        className="step-btn"
                                        onClick={() => setOrderShares((prev) => Math.max(1, prev - 1))}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10000"
                                        value={orderShares}
                                        onChange={(e) => setOrderShares(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                    <button
                                        type="button"
                                        className="step-btn"
                                        onClick={() => setOrderShares((prev) => prev + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* TOTAL COST CALCULATION */}
                            <div className="trade-cost-summary">
                                <span>Estimated Order Value:</span>
                                <h3>₹{(selectedStock.currentPrice * orderShares).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h3>
                            </div>

                            {orderError && <div className="form-error" style={{ marginTop: "12px" }}>{orderError}</div>}
                            {orderSuccess && <div className="form-success-banner" style={{ marginTop: "12px" }}>{orderSuccess}</div>}
                        </div>

                        <div className="trade-modal-footer">
                            <button type="button" className="btn-outline" onClick={() => setSelectedStock(null)}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={orderType === "BUY" ? "btn-primary" : "btn-danger"}
                                onClick={handleExecuteTrade}
                            >
                                Confirm {orderType} Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trading;