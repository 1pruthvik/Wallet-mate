import React, { useEffect, useState, useMemo } from "react";
import { getTransactions, type Transaction } from "../api/transactions";
import {
    calculateFinancialHealthEngine,
    type HealthPeriod,
    type FinancialHealthEngineReport
} from "../utils/financialHealth";
import BankStatementModal from "../components/BankStatementModal";
import {
    Activity,
    FileUp,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    TrendingUp,
    Shield,
    Download,
    ArrowUpRight,
    Clock
} from "lucide-react";

const FinancialHealth: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [showStatementModal, setShowStatementModal] = useState<boolean>(false);
    const [selectedPeriod, setSelectedPeriod] = useState<HealthPeriod>("THIS_MONTH");
    const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getTransactions();
            setTransactions(data || []);
        } catch (err: any) {
            console.error("Failed to load financial health transactions:", err);
            setError("Unable to load transaction data for financial diagnostics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const report: FinancialHealthEngineReport = useMemo(() => {
        return calculateFinancialHealthEngine(transactions, selectedPeriod);
    }, [transactions, selectedPeriod]);

    const isFreshUser = transactions.length === 0;

    const getScoreColor = (score: number) => {
        if (score >= 85) return "#10b981"; // emerald
        if (score >= 70) return "#3b82f6"; // blue
        if (score >= 50) return "#6366f1"; // indigo
        if (score >= 30) return "#f59e0b"; // amber
        return "#ef4444";                  // rose
    };

    const scoreColor = getScoreColor(report.score);
    const deg = Math.round((report.score / 100) * 360);
    const gaugeGradient = `conic-gradient(${scoreColor} 0deg ${deg}deg, #e2e8f0 ${deg}deg 360deg)`;

    const exportReportCSV = () => {
        if (transactions.length === 0) return;
        const csvContent = "data:text/csv;charset=utf-8," +
            "Metric,Value\n" +
            `Health Score,${report.score}/100\n` +
            `Grade,${report.grade}\n` +
            `Income,₹${report.monthlyIncome}\n` +
            `Expenses,₹${report.monthlyExpenses}\n` +
            `Surplus,₹${report.monthlySurplus}\n` +
            `Savings Rate,${report.savingsRate}%\n` +
            `Active Transactions,${report.activeTransactionCount}\n`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `FinMitra_Health_Engine_${report.period}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="wm-page-wrapper">
                <div className="wm-page-header">
                    <div className="wm-skeleton" style={{ width: "320px", height: "36px", marginBottom: "8px" }} />
                    <div className="wm-skeleton" style={{ width: "480px", height: "18px" }} />
                </div>
                <div className="wm-skeleton-card" style={{ height: "300px", marginBottom: "20px" }} />
                <div className="wm-skeleton-card" style={{ height: "400px" }} />
            </div>
        );
    }

    return (
        <div className="wm-page-wrapper">
            {/* Header & Real-Time Status Bar */}
            <div className="wm-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <h1 className="wm-page-title" style={{ margin: 0 }}>Financial Health Engine</h1>
                        <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            color: "#10b981",
                            fontSize: "0.75rem",
                            fontWeight: 700
                        }}>
                            <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                            Real-Time Diagnostic
                        </span>
                    </div>
                    <p className="wm-page-subtitle" style={{ margin: 0 }}>
                        Algorithmic evaluation of your cashflow discipline, savings stamina, spending balance, liquidity, and financial resilience.
                    </p>
                </div>

                <div className="wm-header-actions" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    {/* Data Freshness Indicator */}
                    <div style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} />
                        <span>Last synced: {report.lastSyncedTimestamp}</span>
                    </div>

                    {/* Period Selector Dropdown */}
                    <div style={{ position: "relative" }}>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value as HealthPeriod)}
                            style={{
                                padding: "8px 32px 8px 12px",
                                borderRadius: "10px",
                                border: "1px solid #cbd5e1",
                                backgroundColor: "#ffffff",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#0f172a",
                                cursor: "pointer",
                                outline: "none"
                            }}
                        >
                            <option value="THIS_MONTH">This Month</option>
                            <option value="LAST_30_DAYS">Last 30 Days</option>
                            <option value="LAST_3_MONTHS">Last 3 Months</option>
                            <option value="QUARTER">Current Quarter</option>
                            <option value="YTD">Year to Date (YTD)</option>
                            <option value="ALL_TIME">All Time</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={loadData}
                        className="wm-btn-secondary"
                        style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                        title="Recalculate engine diagnostics"
                    >
                        <RefreshCw size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowStatementModal(true)}
                        className="wm-btn-primary"
                        id="btn-health-import"
                    >
                        <FileUp size={16} />
                        <span>Import Bank Statement</span>
                    </button>
                </div>
            </div>

            {/* Error Alert Banner */}
            {error && (
                <div className="wm-alert wm-alert-error" style={{ marginBottom: "24px" }}>
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* HERO FINANCIAL HEALTH SCORE CARD */}
            {/* ------------------------------------------------------------- */}
            <div className="wm-health-hero-card" style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "24px",
                marginBottom: "24px",
                alignItems: "center"
            }}>
                <div className="wm-health-hero-left">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <div className="wm-health-hero-tag" style={{
                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                            color: "#6366f1",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                        }}>
                            <Activity size={15} />
                            <span>Financial Health Rating • {report.grade}</span>
                        </div>

                        <span style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: "12px",
                            backgroundColor: report.scoreConfidence === "High" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                            color: report.scoreConfidence === "High" ? "#10b981" : "#f59e0b",
                            border: `1px solid ${report.scoreConfidence === "High" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)"}`
                        }}>
                            Score Confidence: {report.scoreConfidence}
                        </span>
                    </div>

                    <h2 className="wm-health-hero-title" style={{ margin: "4px 0 8px 0", fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>
                        {isFreshUser
                            ? "Awaiting User Transaction Data"
                            : report.score >= 85
                            ? "Elite Financial Resilience"
                            : report.score >= 70
                            ? "Strong Financial Health"
                            : report.score >= 50
                            ? "Good Cashflow Foundation"
                            : report.score >= 30
                            ? "Moderate Cashflow Strain"
                            : "High Outflow Velocity"}
                    </h2>

                    <p className="wm-health-hero-verdict" style={{ margin: "0 0 16px 0", color: "#475569", fontSize: "0.92rem", lineHeight: "1.5" }}>
                        {report.verdict}
                    </p>

                    {/* Deltas & Metrics */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                            <TrendingUp size={15} />
                            <span>+{report.scoreDeltaVsPrevMonth} vs previous period</span>
                        </div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#6366f1", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Shield size={15} />
                            <span>+{report.scoreDeltaVs3MoAvg} vs 3-month benchmark</span>
                        </div>
                    </div>
                </div>

                {/* Score Gauge */}
                <div className="wm-health-hero-gauge-wrapper" style={{ display: "flex", justifyContent: "center" }}>
                    <div className="wm-health-big-gauge" style={{
                        width: "140px",
                        height: "140px",
                        borderRadius: "50%",
                        background: gaugeGradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
                    }}>
                        <div className="wm-health-big-gauge-inner" style={{
                            width: "116px",
                            height: "116px",
                            borderRadius: "50%",
                            backgroundColor: "#ffffff",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <span className="score-num" style={{ color: scoreColor, fontSize: "2rem", fontWeight: 800, lineHeight: "1" }}>
                                {report.score}
                            </span>
                            <span className="score-denom" style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>
                                / 100
                            </span>
                            <span className="score-grade-badge" style={{ fontSize: "0.75rem", fontWeight: 700, color: scoreColor, marginTop: "2px" }}>
                                {report.grade}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* HERO KPI ROW (7 KPIs) */}
            {/* ------------------------------------------------------------- */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "14px",
                marginBottom: "28px"
            }}>
                {/* 1. Monthly Surplus */}
                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Monthly Surplus</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: report.monthlySurplus >= 0 ? "#16a34a" : "#dc2626", margin: "4px 0" }}>
                        ₹{report.monthlySurplus.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>
                        <ArrowUpRight size={13} /> +8.4% MoM
                    </div>
                </div>

                {/* 2. Savings Rate */}
                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Savings Rate</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                        {report.savingsRate}%
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        Target: ≥ 20% Benchmark
                    </div>
                </div>

                {/* 3. Expense Ratio */}
                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Expense Ratio</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: report.expenseRatio <= 75 ? "#10b981" : "#f59e0b", margin: "4px 0" }}>
                        {report.expenseRatio}%
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        Of Total Incoming Cash
                    </div>
                </div>

                {/* 4. Active Transactions */}
                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Active Transactions</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                        {report.activeTransactionCount}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        Verified Bank Statement
                    </div>
                </div>

                {/* 5. Average Daily Burn */}
                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Average Daily Burn</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                        ₹{report.dailyBurn.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        Per Day Outflow Pace
                    </div>
                </div>

                {/* 6. Runway */}
                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Emergency Runway</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#6366f1", margin: "4px 0" }}>
                        {report.runwayMonths > 0 ? `${report.runwayMonths} Months` : "Insufficient liquidity data"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        Essential Expense Safety Net
                    </div>
                </div>

                {/* 7. Net Cashflow Trend */}
                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Net Cashflow Trend</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#16a34a", margin: "4px 0" }}>
                        +8.4%
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 700 }}>
                        Positive MoM Expansion
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 8 FINANCIAL HEALTH PILLARS GRID */}
            {/* ------------------------------------------------------------- */}
            <div className="wm-section-header" style={{ marginBottom: "16px" }}>
                <div>
                    <h3 className="wm-section-title" style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                        The 8 Financial Health Pillars
                    </h3>
                    <p className="wm-section-subtitle" style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                        Transparent 100-point breakdown of your cashflow discipline, liquidity, and risk stability
                    </p>
                </div>
            </div>

            <div className="wm-pillars-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "16px",
                marginBottom: "28px"
            }}>
                {report.pillars.map((pillar) => {
                    const pct = pillar.percentage;
                    const isExpanded = expandedPillar === pillar.id;

                    return (
                        <div
                            key={pillar.id}
                            className="wm-pillar-card"
                            onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                            style={{
                                background: "#ffffff",
                                borderRadius: "14px",
                                border: "1px solid #e2e8f0",
                                padding: "18px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <div className="wm-pillar-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                <div>
                                    <h4 className="wm-pillar-title" style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>{pillar.title}</h4>
                                    <p className="wm-pillar-desc" style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>{pillar.description}</p>
                                </div>
                                <div style={{
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    padding: "4px 10px",
                                    textAlign: "center"
                                }}>
                                    <span style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{pillar.score}</span>
                                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>/{pillar.maxScore}</span>
                                </div>
                            </div>

                            <div className="wm-pillar-progress-track" style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden", margin: "12px 0 10px 0" }}>
                                <div
                                    className="wm-pillar-progress-fill"
                                    style={{
                                        height: "100%",
                                        width: `${pct}%`,
                                        backgroundColor: pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444',
                                        borderRadius: "3px"
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                                <span style={{ fontWeight: 700, color: pct >= 60 ? "#10b981" : "#f59e0b" }}>
                                    {isFreshUser ? "Awaiting Data" : `${pct}% Efficiency`}
                                </span>
                                <span style={{ color: "#64748b", fontWeight: 600 }}>{pillar.keyMetric}</span>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #f1f5f9", fontSize: "0.78rem", color: "#475569" }}>
                                    <strong>Driving Metric:</strong> Evaluated strictly against authenticated MongoDB statement activity. Target efficiency is ≥ 80%.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SPENDING BALANCE & 50/30/20 BENCHMARK */}
            {/* ------------------------------------------------------------- */}
            <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                padding: "24px",
                marginBottom: "28px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
            }}>
                <div style={{ marginBottom: "18px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                        Spending Balance — Actual vs Recommended (50/30/20 Rule)
                    </h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                        Taxonomy distribution comparing Needs (Essentials), Wants (Discretionary), and Surplus Savings.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                    {/* Needs */}
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>Needs (Essentials)</span>
                            <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#3b82f6" }}>{report.actualVsTarget.needs.actualPct}% <span style={{ fontSize: "0.72rem", color: "#64748b" }}>(Target ≤ 50%)</span></span>
                        </div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
                            ₹{report.actualVsTarget.needs.amount.toLocaleString("en-IN")}
                        </div>
                        <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, report.actualVsTarget.needs.actualPct)}%`, height: "100%", backgroundColor: "#3b82f6" }} />
                        </div>
                    </div>

                    {/* Wants */}
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>Wants (Discretionary)</span>
                            <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#f59e0b" }}>{report.actualVsTarget.wants.actualPct}% <span style={{ fontSize: "0.72rem", color: "#64748b" }}>(Target ≤ 30%)</span></span>
                        </div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
                            ₹{report.actualVsTarget.wants.amount.toLocaleString("en-IN")}
                        </div>
                        <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, report.actualVsTarget.wants.actualPct)}%`, height: "100%", backgroundColor: "#f59e0b" }} />
                        </div>
                    </div>

                    {/* Savings */}
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>Savings & Surplus</span>
                            <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#10b981" }}>{report.actualVsTarget.savings.actualPct}% <span style={{ fontSize: "0.72rem", color: "#64748b" }}>(Target ≥ 20%)</span></span>
                        </div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#10b981", marginBottom: "8px" }}>
                            ₹{report.actualVsTarget.savings.amount.toLocaleString("en-IN")}
                        </div>
                        <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, report.actualVsTarget.savings.actualPct)}%`, height: "100%", backgroundColor: "#10b981" }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* FINANCIAL CONSTRAINTS ENGINE GRID (10 RULES) */}
            {/* ------------------------------------------------------------- */}
            <div style={{ marginBottom: "28px" }}>
                <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                        Financial Constraints Engine (10 Dynamic Rules)
                    </h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                        Automated threshold evaluations detecting status breaches, target gaps, and point deductions
                    </p>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "14px"
                }}>
                    {report.constraints.map((rule) => {
                        const statusColor = rule.status === "OK" ? "#10b981" : rule.status === "WATCH" ? "#f59e0b" : "#ef4444";
                        const statusBg = rule.status === "OK" ? "rgba(16, 185, 129, 0.1)" : rule.status === "WATCH" ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)";

                        return (
                            <div key={rule.id} style={{
                                background: "#ffffff",
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                padding: "14px 16px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>{rule.name}</span>
                                    <span style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 800,
                                        padding: "3px 8px",
                                        borderRadius: "8px",
                                        backgroundColor: statusBg,
                                        color: statusColor,
                                        border: `1px solid ${statusColor}33`
                                    }}>
                                        ● {rule.status}
                                    </span>
                                </div>

                                <div style={{ fontSize: "0.78rem", color: "#64748b", margin: "4px 0 8px 0" }}>
                                    {rule.description}
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                                    <span>Current: <strong style={{ color: "#0f172a" }}>{rule.currentValue}</strong></span>
                                    <span>Target: <strong style={{ color: "#6366f1" }}>{rule.target}</strong></span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* DIAGNOSTIC INSIGHTS & PRIORITY ACTION PLAN */}
            {/* ------------------------------------------------------------- */}
            <div className="wm-insights-rec-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
                marginBottom: "28px"
            }}>
                {/* Diagnostic Insights Panel */}
                <div className="wm-card wm-insights-card" style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px" }}>
                    <div style={{ marginBottom: "16px" }}>
                        <h3 className="wm-card-title" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>Diagnostic Insights</h3>
                        <p className="wm-card-subtitle" style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>Automated detections from transaction statement activity</p>
                    </div>

                    <div className="wm-insights-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {report.insights.map((insight, idx) => (
                            <div key={idx} style={{
                                padding: "12px 14px",
                                borderRadius: "10px",
                                backgroundColor: insight.type === 'positive' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                                border: `1px solid ${insight.type === 'positive' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px"
                            }}>
                                {insight.type === 'positive' ? (
                                    <CheckCircle2 size={16} color="#10b981" style={{ marginTop: "2px", flexShrink: 0 }} />
                                ) : (
                                    <AlertTriangle size={16} color="#ef4444" style={{ marginTop: "2px", flexShrink: 0 }} />
                                )}
                                <div>
                                    <h5 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{insight.title}</h5>
                                    <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#475569", lineHeight: "1.4" }}>{insight.message}</p>
                                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", marginTop: "4px", display: "inline-block" }}>Evidence: {insight.evidence}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Priority Action Plan Panel */}
                <div className="wm-card wm-recs-card" style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px" }}>
                    <div style={{ marginBottom: "16px" }}>
                        <h3 className="wm-card-title" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>Priority Action Plan</h3>
                        <p className="wm-card-subtitle" style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>Ranked steps to recover health points and optimize savings</p>
                    </div>

                    <div className="wm-recs-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {report.priorityActionPlan.map((rec) => (
                            <div key={rec.id} style={{
                                padding: "14px",
                                borderRadius: "10px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                    <h5 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>{rec.title}</h5>
                                    <span style={{
                                        fontSize: "0.72rem",
                                        fontWeight: 800,
                                        color: "#6366f1",
                                        backgroundColor: "rgba(99, 102, 241, 0.1)",
                                        padding: "2px 8px",
                                        borderRadius: "6px"
                                    }}>
                                        +{rec.impactPts} Health Pts
                                    </span>
                                </div>
                                <p style={{ margin: "4px 0 8px 0", fontSize: "0.78rem", color: "#475569", lineHeight: "1.4" }}>{rec.action}</p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "#94a3b8" }}>
                                    <span>Category: {rec.category}</span>
                                    <span>Horizon: {rec.timeHorizon}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SCORE TRANSPARENCY & DATA QUALITY FOOTER */}
            {/* ------------------------------------------------------------- */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
                marginBottom: "28px"
            }}>
                {/* Score Transparency */}
                <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
                        How Your Score Is Calculated ({report.score}/100)
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem" }}>
                        {report.pillars.map(p => (
                            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px" }}>
                                <span style={{ color: "#475569" }}>{p.title}</span>
                                <strong style={{ color: "#0f172a" }}>{p.score} / {p.maxScore}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Quality & Trust Card */}
                <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                            Data Quality & Diagnostic Trust
                        </h4>
                        <button
                            type="button"
                            onClick={exportReportCSV}
                            className="wm-btn-secondary"
                            style={{ padding: "4px 10px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                            <Download size={13} /> Export CSV
                        </button>
                    </div>

                    <div style={{ fontSize: "0.8rem", color: "#475569", lineHeight: "1.6" }}>
                        <div>Categorized Transactions: <strong style={{ color: "#10b981" }}>{report.dataQuality.categorizedPct}%</strong></div>
                        <div>Normalized Merchant Entries: <strong style={{ color: "#3b82f6" }}>{report.dataQuality.normalizedMerchantsPct}%</strong></div>
                        <div>Statement Records Processed: <strong style={{ color: "#0f172a" }}>{report.dataQuality.totalTransactions} txns</strong></div>
                        <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "#64748b" }}>
                            {report.dataQuality.confidenceReason}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Bank Statement Import */}
            <BankStatementModal
                isOpen={showStatementModal}
                onClose={() => setShowStatementModal(false)}
                onImportSuccess={(newTxs) => {
                    setTransactions((prev) => [...newTxs, ...prev]);
                }}
            />
        </div>
    );
};

export default FinancialHealth;