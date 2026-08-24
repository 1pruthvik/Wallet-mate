import React, { useEffect, useState, useMemo } from "react";
import { getTransactions, type Transaction } from "../api/transactions";
import { calculateFinancialHealth } from "../utils/financialHealth";
import BankStatementModal from "../components/BankStatementModal";
import {
    Activity,
    FileUp,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
} from "lucide-react";

const FinancialHealth: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [showStatementModal, setShowStatementModal] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getTransactions();
                setTransactions(data || []);
            } catch (err: any) {
                console.error("Failed to load financial health transactions:", err);
                setError("Unable to load transactions to calculate health metrics.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const report = useMemo(() => {
        return calculateFinancialHealth(transactions);
    }, [transactions]);

    const isFreshUser = transactions.length === 0;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "#10b981"; // emerald
        if (score >= 60) return "#635bff"; // primary violet
        if (score >= 40) return "#f59e0b"; // amber
        if (score > 0) return "#ef4444";   // rose
        return "#94a3b8";                  // subtle slate for 0
    };

    const scoreColor = getScoreColor(report.score);
    const deg = Math.round((report.score / 100) * 360);
    const gaugeGradient = `conic-gradient(${scoreColor} 0deg ${deg}deg, #f1f5f9 ${deg}deg 360deg)`;

    if (loading) {
        return (
            <div className="wm-page-wrapper">
                <div className="wm-page-header">
                    <div className="wm-skeleton" style={{ width: "280px", height: "32px", marginBottom: "8px" }} />
                    <div className="wm-skeleton" style={{ width: "420px", height: "18px" }} />
                </div>
                <div className="wm-skeleton-card" style={{ height: "260px" }} />
            </div>
        );
    }

    return (
        <div className="wm-page-wrapper">
            {/* Header */}
            <div className="wm-page-header">
                <div>
                    <h1 className="wm-page-title">Financial Health Engine</h1>
                    <p className="wm-page-subtitle">
                        Algorithmic evaluation of your cashflow discipline, savings stamina, and risk buffer.
                    </p>
                </div>

                <div className="wm-header-actions">
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

            {/* Error Banner */}
            {error && (
                <div className="wm-alert wm-alert-error" style={{ marginBottom: "24px" }}>
                    <span>{error}</span>
                </div>
            )}

            {/* Health Hero Score Card */}
            <div className="wm-health-hero-card">
                <div className="wm-health-hero-left">
                    <div className="wm-health-hero-tag">
                        <Activity size={15} />
                        <span>Real-Time Diagnostic Score • {report.grade}</span>
                    </div>
                    <h2 className="wm-health-hero-title">
                        {isFreshUser
                            ? "Awaiting User Data"
                            : report.score >= 80
                            ? "Optimal Financial Health"
                            : report.score >= 60
                            ? "Stable Cashflow Foundation"
                            : report.score >= 40
                            ? "Moderate Financial Strain"
                            : "High Outflow Velocity"}
                    </h2>
                    <p className="wm-health-hero-verdict">{report.verdict}</p>

                    {/* Vitals Summary Pill Bar */}
                    <div className="wm-vitals-pills">
                        <div className="wm-vital-pill">
                            <span className="vital-label">Monthly Surplus</span>
                            <span className={`vital-val ${report.monthlySavings >= 0 ? 'income' : 'expense'}`}>
                                ₹{report.monthlySavings.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div className="wm-vital-pill">
                            <span className="vital-label">Savings Rate</span>
                            <span className="vital-val">{report.savingsRate}%</span>
                        </div>
                        <div className="wm-vital-pill">
                            <span className="vital-label">Active Txns</span>
                            <span className="vital-val">{transactions.length}</span>
                        </div>
                    </div>
                </div>

                <div className="wm-health-hero-gauge-wrapper">
                    <div className="wm-health-big-gauge" style={{ background: gaugeGradient }}>
                        <div className="wm-health-big-gauge-inner">
                            <span className="score-num" style={{ color: scoreColor }}>{report.score}</span>
                            <span className="score-denom">/ 100</span>
                            <span className="score-grade-badge">{report.grade}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4 Health Pillars Grid */}
            <div className="wm-section-header">
                <div>
                    <h3 className="wm-section-title">The 4 Financial Health Pillars</h3>
                    <p className="wm-section-subtitle">Multi-dimensional breakdown of your spending habits and capital efficiency</p>
                </div>
            </div>

            <div className="wm-pillars-grid">
                {report.pillars.map((pillar) => {
                    const pct = pillar.maxScore > 0 ? Math.round((pillar.score / pillar.maxScore) * 100) : 0;
                    return (
                        <div key={pillar.id} className="wm-pillar-card">
                            <div className="wm-pillar-header">
                                <div>
                                    <h4 className="wm-pillar-title">{pillar.title}</h4>
                                    <p className="wm-pillar-desc">{pillar.description}</p>
                                </div>
                                <div className="wm-pillar-score-box">
                                    <span className="score-got">{pillar.score}</span>
                                    <span className="score-max">/{pillar.maxScore}</span>
                                </div>
                            </div>

                            <div className="wm-pillar-progress-track">
                                <div
                                    className="wm-pillar-progress-fill"
                                    style={{
                                        width: `${pct}%`,
                                        backgroundColor: pct >= 70 ? '#10b981' : pct >= 40 ? '#635bff' : pct > 0 ? '#f59e0b' : '#cbd5e1',
                                    }}
                                />
                            </div>

                            <div className="wm-pillar-footer">
                                <span className={`wm-pillar-status-tag ${pillar.status}`}>
                                    {isFreshUser ? "Awaiting Data" : `${pct}% Efficiency`}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Insights & Recommendations Grid */}
            <div className="wm-insights-rec-grid">
                {/* Insights Panel */}
                <div className="wm-card wm-insights-card">
                    <div className="wm-card-header">
                        <div>
                            <h3 className="wm-card-title">Diagnostic Insights</h3>
                            <p className="wm-card-subtitle">Automated detections based on your transactions</p>
                        </div>
                    </div>

                    <div className="wm-insights-list">
                        {report.insights.map((insight, idx) => (
                            <div key={idx} className={`wm-insight-item ${insight.type}`}>
                                <div className="wm-insight-icon">
                                    {insight.type === 'positive' ? (
                                        <CheckCircle2 size={18} />
                                    ) : insight.type === 'warning' ? (
                                        <AlertTriangle size={18} />
                                    ) : (
                                        <Sparkles size={18} />
                                    )}
                                </div>
                                <div className="wm-insight-content">
                                    <h5 className="wm-insight-title">{insight.title}</h5>
                                    <p className="wm-insight-msg">{insight.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendations Panel */}
                <div className="wm-card wm-recs-card">
                    <div className="wm-card-header">
                        <div>
                            <h3 className="wm-card-title">Priority Action Plan</h3>
                            <p className="wm-card-subtitle">Recommended steps to elevate your financial health</p>
                        </div>
                    </div>

                    <div className="wm-recs-list">
                        {report.recommendations.map((rec) => (
                            <div key={rec.id} className="wm-rec-item">
                                <div className="wm-rec-header">
                                    <h5 className="wm-rec-title">{rec.title}</h5>
                                    <span className="wm-rec-impact-pill">{rec.impact}</span>
                                </div>
                                <p className="wm-rec-action">{rec.action}</p>
                                <div className="wm-rec-footer">
                                    <span className="wm-rec-cat">Category: {rec.category}</span>
                                    <span className="wm-rec-diff">Difficulty: {rec.difficulty}</span>
                                </div>
                            </div>
                        ))}
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