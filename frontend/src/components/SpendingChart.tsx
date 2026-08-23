import React, { useMemo, useState } from "react";
import type { Transaction } from "../api/transactions";
import { PieChart, Store, BarChart3 } from "lucide-react";

interface SpendingChartProps {
    transactions?: Transaction[];
}

type TabType = "category" | "monthly" | "merchants";

const CATEGORY_COLORS: Record<string, string> = {
    Food: "#f59e0b",
    Dining: "#f59e0b",
    Shopping: "#8b5cf6",
    Transport: "#06b6d4",
    Fuel: "#06b6d4",
    Bills: "#ec4899",
    Utilities: "#ec4899",
    Entertainment: "#635bff",
    Health: "#10b981",
    Investment: "#14b8a6",
    Other: "#64748b",
};

const SpendingChart: React.FC<SpendingChartProps> = ({
    transactions = [],
}) => {
    const [activeTab, setActiveTab] = useState<TabType>("category");

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
                color: CATEGORY_COLORS[category] || "#635bff",
            }))
            .sort((a, b) => b.total - a.total);
    }, [expenseTransactions, totalOutflow]);

    // 2. Monthly Trend
    const monthlySpending = useMemo(() => {
        const monthTotals: Record<string, number> = {};
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        expenseTransactions.forEach((t) => {
            const d = new Date(t.date || t.transactionDate || 0);
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

    if (expenseTransactions.length === 0) {
        return (
            <div className="wm-card wm-analytics-card">
                <div className="wm-card-header">
                    <div>
                        <h3 className="wm-card-title">Spending Analytics</h3>
                        <p className="wm-card-subtitle">Where your money goes across categories and months</p>
                    </div>
                </div>
                <div className="wm-empty-state-lg">
                    <div className="wm-empty-icon">
                        <PieChart size={32} />
                    </div>
                    <h4>No expense data recorded</h4>
                    <p>When you import bank statements or log expenses, category breakdowns and trends will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="wm-card wm-analytics-card">
            {/* HEADER & VIEW TABS */}
            <div className="wm-card-header wm-analytics-header">
                <div>
                    <h3 className="wm-card-title">Spending Analytics</h3>
                    <p className="wm-card-subtitle">
                        Total Outflow: <strong>₹{totalOutflow.toLocaleString("en-IN")}</strong> across {expenseTransactions.length} items
                    </p>
                </div>

                <div className="wm-tab-pills">
                    <button
                        type="button"
                        className={`wm-tab-pill ${activeTab === "category" ? "active" : ""}`}
                        onClick={() => setActiveTab("category")}
                    >
                        <PieChart size={14} />
                        <span>Categories</span>
                    </button>
                    <button
                        type="button"
                        className={`wm-tab-pill ${activeTab === "monthly" ? "active" : ""}`}
                        onClick={() => setActiveTab("monthly")}
                    >
                        <BarChart3 size={14} />
                        <span>Monthly</span>
                    </button>
                    <button
                        type="button"
                        className={`wm-tab-pill ${activeTab === "merchants" ? "active" : ""}`}
                        onClick={() => setActiveTab("merchants")}
                    >
                        <Store size={14} />
                        <span>Merchants</span>
                    </button>
                </div>
            </div>

            {/* TAB 1: CATEGORY BREAKDOWN */}
            {activeTab === "category" && (
                <div className="wm-category-grid">
                    {categoryBreakdown.map((item) => (
                        <div key={item.category} className="wm-cat-card">
                            <div className="wm-cat-header">
                                <div className="wm-cat-badge">
                                    <span className="wm-cat-dot" style={{ backgroundColor: item.color }} />
                                    <span className="wm-cat-name">{item.category}</span>
                                </div>
                                <span className="wm-cat-pct">{item.percentage}%</span>
                            </div>

                            <div className="wm-cat-bar-track">
                                <div
                                    className="wm-cat-bar-fill"
                                    style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: item.color,
                                    }}
                                />
                            </div>

                            <div className="wm-cat-footer">
                                <span className="wm-cat-amount">₹{item.total.toLocaleString("en-IN")}</span>
                                <span className="wm-cat-count">{item.count} txns</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB 2: MONTHLY TRENDS */}
            {activeTab === "monthly" && (
                <div className="wm-monthly-trend-view">
                    <div className="wm-monthly-bars">
                        {monthlySpending.map((item) => {
                            const barHeight = maxMonthly > 0 ? Math.max(28, Math.round((item.spending / maxMonthly) * 160)) : 28;
                            const isHighest = item.spending === maxMonthly && monthlySpending.length > 1;

                            return (
                                <div key={item.month} className="wm-trend-bar-group">
                                    <span className="wm-trend-val">₹{item.spending.toLocaleString("en-IN")}</span>
                                    <div
                                        className={`wm-trend-bar ${isHighest ? "highest" : ""}`}
                                        style={{ height: `${barHeight}px` }}
                                        title={`${item.month}: ₹${item.spending.toLocaleString("en-IN")}`}
                                    />
                                    <span className="wm-trend-label">{item.month}</span>
                                    {isHighest && <span className="wm-peak-tag">Peak</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 3: TOP MERCHANTS */}
            {activeTab === "merchants" && (
                <div className="wm-merchants-grid">
                    {topMerchants.map((m, idx) => (
                        <div key={m.merchant} className="wm-merchant-card">
                            <div className="wm-merchant-rank">#{idx + 1}</div>
                            <div className="wm-merchant-body">
                                <h4 className="wm-merchant-name">{m.merchant}</h4>
                                <span className="wm-merchant-cat">{m.category}</span>
                            </div>
                            <div className="wm-merchant-stats">
                                <span className="wm-merchant-total">₹{m.total.toLocaleString("en-IN")}</span>
                                <span className="wm-merchant-avg">{m.count} txns • avg ₹{m.average}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SpendingChart;