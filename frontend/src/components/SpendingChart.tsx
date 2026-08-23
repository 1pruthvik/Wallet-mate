import React, { useEffect, useMemo, useState } from "react";
import { getTransactions } from "../api/transactions";
import type { Transaction } from "../api/transactions";

interface SpendingChartProps {
    transactions?: Transaction[];
}

type TabType = "category" | "monthly" | "merchants";

const CATEGORY_COLORS: Record<string, string> = {
    Food: "#f59e0b",
    Shopping: "#8b5cf6",
    Transport: "#3b82f6",
    Bills: "#ec4899",
    Entertainment: "#10b981",
    Income: "#16845b",
    Other: "#6b7280",
};

const SpendingChart: React.FC<SpendingChartProps> = ({
    transactions: propTransactions,
}) => {
    const isControlled = Boolean(propTransactions);
    const [fetchedTransactions, setFetchedTransactions] = useState<Transaction[]>([]);
    const [fetchLoading, setFetchLoading] = useState<boolean>(!isControlled);
    const [error, setError] = useState<string>("");
    const [activeTab, setActiveTab] = useState<TabType>("category");

    useEffect(() => {
        if (isControlled) return;

        const load = async () => {
            try {
                setFetchLoading(true);
                setError("");
                const data = await getTransactions();
                setFetchedTransactions(data);
            } catch (err) {
                console.error("Failed to load spending data:", err);
                setError("Unable to load spending data.");
            } finally {
                setFetchLoading(false);
            }
        };

        load();
    }, [isControlled]);

    const transactions = propTransactions ?? fetchedTransactions;
    const loading = isControlled ? false : fetchLoading;

    /* =========================================================
       CALCULATIONS
    ========================================================= */

    const expenseTransactions = useMemo(() => {
        return transactions.filter((t) => t.type === "expense");
    }, [transactions]);

    const totalOutflow = useMemo(() => {
        return expenseTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    }, [expenseTransactions]);

    // 1. Category Breakdown
    const categoryBreakdown = useMemo(() => {
        const map: Record<string, { total: number; count: number }> = {};

        expenseTransactions.forEach((t) => {
            const cat = t.category || "Other";
            if (!map[cat]) {
                map[cat] = { total: 0, count: 0 };
            }
            map[cat].total += Number(t.amount || 0);
            map[cat].count += 1;
        });

        return Object.entries(map)
            .map(([category, data]) => ({
                category,
                total: data.total,
                count: data.count,
                percentage: totalOutflow > 0 ? Math.round((data.total / totalOutflow) * 100) : 0,
                color: CATEGORY_COLORS[category] || "#6b7280",
            }))
            .sort((a, b) => b.total - a.total);
    }, [expenseTransactions, totalOutflow]);

    // 2. Monthly Trend
    const monthlySpending = useMemo(() => {
        const monthTotals: Record<string, number> = {};
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        expenseTransactions.forEach((t) => {
            const d = new Date(t.date);
            if (Number.isNaN(d.getTime())) return;
            const m = d.toLocaleString("en-US", { month: "short" });
            monthTotals[m] = (monthTotals[m] || 0) + Number(t.amount || 0);
        });

        return monthOrder
            .filter((m) => monthTotals[m] !== undefined)
            .map((month) => ({
                month,
                spending: monthTotals[month],
            }));
    }, [expenseTransactions]);

    // 3. Top Merchants
    const topMerchants = useMemo(() => {
        const map: Record<string, { total: number; count: number; category: string }> = {};

        expenseTransactions.forEach((t) => {
            const m = t.merchant || "Unknown";
            if (!map[m]) {
                map[m] = { total: 0, count: 0, category: t.category || "Other" };
            }
            map[m].total += Number(t.amount || 0);
            map[m].count += 1;
        });

        return Object.entries(map)
            .map(([merchant, data]) => ({
                merchant,
                category: data.category,
                total: data.total,
                count: data.count,
                average: Math.round(data.total / data.count),
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 6);
    }, [expenseTransactions]);

    const maxMonthly = useMemo(() => {
        if (monthlySpending.length === 0) return 1;
        return Math.max(...monthlySpending.map((m) => m.spending));
    }, [monthlySpending]);

    if (loading) {
        return (
            <div className="spending-chart-card">
                <div className="spending-card-header">
                    <div>
                        <h2>Spending Analytics</h2>
                        <p>Loading your financial outflows...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="spending-chart-card">
                <div className="spending-card-header">
                    <div>
                        <h2>Spending Analytics</h2>
                        <p className="error-text">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (expenseTransactions.length === 0) {
        return (
            <div className="spending-chart-card">
                <div className="spending-card-header">
                    <div>
                        <h2>Spending Analytics</h2>
                        <p>Where your money goes across categories and months</p>
                    </div>
                </div>
                <div className="spending-empty-state">
                    <p>No expense transactions recorded yet.</p>
                    <span>Add expenses or import a bank statement to view visual analytics.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="spending-chart-card">
            {/* HEADER & VIEW TABS */}
            <div className="spending-card-header">
                <div>
                    <h2>Spending Analytics</h2>
                    <p>Total Outflow: <strong>₹{totalOutflow.toLocaleString("en-IN")}</strong> across {expenseTransactions.length} transactions</p>
                </div>

                <div className="spending-tab-switcher">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "category" ? "tab-btn-active" : ""}`}
                        onClick={() => setActiveTab("category")}
                    >
                        Category Breakdown
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "monthly" ? "tab-btn-active" : ""}`}
                        onClick={() => setActiveTab("monthly")}
                    >
                        Monthly Trends
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "merchants" ? "tab-btn-active" : ""}`}
                        onClick={() => setActiveTab("merchants")}
                    >
                        Top Merchants
                    </button>
                </div>
            </div>

            {/* TAB 1: CATEGORY BREAKDOWN */}
            {activeTab === "category" && (
                <div className="category-breakdown-view">
                    <div className="category-list">
                        {categoryBreakdown.map((item) => (
                            <div key={item.category} className="category-item-row">
                                <div className="category-info-col">
                                    <div className="category-badge-group">
                                        <span className="category-color-dot" style={{ backgroundColor: item.color }} />
                                        <span className="category-name-text">{item.category}</span>
                                        <span className="category-count-tag">{item.count} items</span>
                                    </div>
                                    <div className="category-amount-group">
                                        <span className="category-amount-text">₹{item.total.toLocaleString("en-IN")}</span>
                                        <span className="category-pct-text">{item.percentage}%</span>
                                    </div>
                                </div>

                                <div className="category-progress-track">
                                    <div
                                        className="category-progress-fill"
                                        style={{
                                            width: `${item.percentage}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: MONTHLY TRENDS */}
            {activeTab === "monthly" && (
                <div className="monthly-trends-view">
                    <div className="monthly-chart-container">
                        {monthlySpending.map((item) => {
                            const barHeight = maxMonthly > 0 ? Math.max(24, Math.round((item.spending / maxMonthly) * 180)) : 24;
                            const isHighest = item.spending === maxMonthly && monthlySpending.length > 1;

                            return (
                                <div key={item.month} className="monthly-bar-col">
                                    <span className="bar-val-label">₹{item.spending.toLocaleString("en-IN")}</span>
                                    <div
                                        className={`monthly-bar-pill ${isHighest ? "bar-peak" : ""}`}
                                        style={{ height: `${barHeight}px` }}
                                        title={`${item.month}: ₹${item.spending.toLocaleString("en-IN")}`}
                                    />
                                    <span className="bar-month-label">{item.month}</span>
                                    {isHighest && <span className="peak-badge">Peak</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 3: TOP MERCHANTS */}
            {activeTab === "merchants" && (
                <div className="merchants-grid-view">
                    {topMerchants.map((m, idx) => (
                        <div key={m.merchant} className="merchant-spend-card">
                            <div className="merchant-rank-badge">#{idx + 1}</div>
                            <div className="merchant-details-body">
                                <h4>{m.merchant}</h4>
                                <span className="merchant-cat-pill">{m.category}</span>
                            </div>
                            <div className="merchant-stats-col">
                                <span className="merchant-total-val">₹{m.total.toLocaleString("en-IN")}</span>
                                <span className="merchant-avg-desc">{m.count} orders • avg ₹{m.average}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SpendingChart;