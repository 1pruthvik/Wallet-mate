import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getTransactions } from "../api/transactions";
import type { Transaction } from "../api/transactions";
import { calculateFinancialHealth } from "../utils/financialHealth";
import BankStatementModal from "../components/BankStatementModal";

const FinancialHealth: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [showStatementModal, setShowStatementModal] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getTransactions();
                setTransactions(data);
            } catch (err: any) {
                console.error("Failed to load financial health transactions:", err);
                setError("Unable to load financial health data. Please make sure the backend is running.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const report = useMemo(() => {
        return calculateFinancialHealth(transactions);
    }, [transactions]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "#16845b"; // emerald
        if (score >= 65) return "#2563eb"; // blue
        if (score >= 45) return "#d97706"; // amber
        return "#dc2626"; // coral
    };

    const getScoreGradient = (score: number) => {
        const primaryColor = getScoreColor(score);
        const deg = Math.round((score / 100) * 360);
        return `conic-gradient(${primaryColor} 0deg ${deg}deg, #e2ece7 ${deg}deg 360deg)`;
    };

    if (loading) {
        return (
            <div className="financial-health-page">
                <div className="page-header">
                    <div>
                        <h1>Financial Health</h1>
                        <p>Analyzing your financial vitals and stability metrics...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="financial-health-page">
            {/* PAGE HEADER */}
            <div className="page-header">
                <div>
                    <h1>Financial Health Intelligence</h1>
                    <p>Comprehensive diagnostics of your cashflow discipline, savings stamina, and risk buffer.</p>
                </div>
                <div className="page-header-actions">
                    <button
                        type="button"
                        className="import-statement-button"
                        onClick={() => setShowStatementModal(true)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <path d="M12 18v-6" />
                            <path d="m9 15 3-3 3 3" />
                        </svg>
                        Import Statement
                    </button>
                    <Link to="/transactions" className="add-transaction-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                        View Transactions →
                    </Link>
                </div>
            </div>

            {/* ALERTS */}
            {successMessage && <div className="form-success-banner" style={{ marginBottom: "20px" }}>{successMessage}</div>}
            {error && <div className="form-error" style={{ marginBottom: "20px" }}>{error}</div>}

            {/* HERO SCORE CARD */}
            <div className="health-hero-card">
                <div className="health-hero-main">
                    <div className="health-hero-text">
                        <div className="health-badge-row">
                            <span className="health-status-badge" style={{ backgroundColor: `${getScoreColor(report.score)}18`, color: getScoreColor(report.score) }}>
                                {report.grade} Standing
                            </span>
                            <span className="health-period-tag">Updated Real-Time</span>
                        </div>
                        <h2>{report.grade} Financial Health</h2>
                        <p className="health-verdict">{report.verdict}</p>
                        <div className="health-kpi-row">
                            <div className="health-kpi-item">
                                <span className="kpi-label">Savings Rate</span>
                                <span className="kpi-val income-val">{report.savingsRate}%</span>
                            </div>
                            <div className="health-kpi-item">
                                <span className="kpi-label">Monthly Surplus</span>
                                <span className="kpi-val income-val">+₹{report.monthlySavings.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="health-kpi-item">
                                <span className="kpi-label">Monthly Burn</span>
                                <span className="kpi-val expense-val">₹{report.monthlyExpenses.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="health-gauge-container">
                        <div className="health-gauge-dial" style={{ background: getScoreGradient(report.score) }}>
                            <div className="health-gauge-inner">
                                <span className="health-gauge-number" style={{ color: getScoreColor(report.score) }}>
                                    {report.score}
                                </span>
                                <span className="health-gauge-scale">/ 100</span>
                            </div>
                        </div>
                        <span className="health-gauge-caption">Overall Health Score</span>
                    </div>
                </div>
            </div>

            {/* 4 PILLARS DIAGNOSTICS GRID */}
            <div className="health-section-heading">
                <h2>Health Pillars Diagnostics</h2>
                <p>Granular breakdown across the 4 foundational pillars of personal finance</p>
            </div>

            <div className="health-pillars-grid">
                {report.pillars.map((pillar) => (
                    <div key={pillar.id} className="pillar-card">
                        <div className="pillar-header">
                            <span className="pillar-title">{pillar.title}</span>
                            <span className="pillar-score-tag">
                                {pillar.score} / {pillar.maxScore} pts
                            </span>
                        </div>
                        <div className="pillar-progress-track">
                            <div
                                className="pillar-progress-fill"
                                style={{
                                    width: `${pillar.percentage}%`,
                                    backgroundColor: pillar.percentage >= 70 ? "var(--primary)" : pillar.percentage >= 50 ? "#2563eb" : "#d97706",
                                }}
                            />
                        </div>
                        <div className="pillar-footer">
                            <span className="pillar-desc">{pillar.description}</span>
                            <span className="pillar-pct">{pillar.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* TWO COLUMN SECTION: ACTIONABLE CHECKS & RECOMMENDATIONS */}
            <div className="health-details-grid">
                {/* CHECKLIST & SIGNALS */}
                <div className="health-checklist-card">
                    <div className="card-inner-header">
                        <h3>Vitals & Signal Checks</h3>
                        <span>{report.insights.length} active findings</span>
                    </div>

                    <div className="checklist-items">
                        {report.insights.map((item, idx) => (
                            <div key={idx} className={`checklist-item item-${item.type}`}>
                                <div className="checklist-icon-bubble">
                                    {item.type === "positive" ? "✓" : item.type === "warning" ? "⚠" : "ℹ"}
                                </div>
                                <div className="checklist-content">
                                    <h4>{item.title}</h4>
                                    <p>{item.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SMART RECOMMENDATIONS */}
                <div className="health-recommendations-card">
                    <div className="card-inner-header">
                        <h3>Smart Action Plan</h3>
                        <span>Optimized for you</span>
                    </div>

                    <div className="recommendations-list">
                        {report.recommendations.map((rec) => (
                            <div key={rec.id} className="rec-item">
                                <div className="rec-top-row">
                                    <span className="rec-category-badge">{rec.category}</span>
                                    <span className="rec-impact-badge">{rec.impact}</span>
                                </div>
                                <h4>{rec.title}</h4>
                                <p>{rec.action}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* STATEMENT MODAL */}
            <BankStatementModal
                isOpen={showStatementModal}
                onClose={() => setShowStatementModal(false)}
                onImportSuccess={(imported) => {
                    setTransactions((prev) => [...imported, ...prev]);
                    setSuccessMessage(`Successfully imported ${imported.length} transactions. Financial health recalculated!`);
                    setTimeout(() => setSuccessMessage(""), 6000);
                }}
            />
        </div>
    );
};

export default FinancialHealth;