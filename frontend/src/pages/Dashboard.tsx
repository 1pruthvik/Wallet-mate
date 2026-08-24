import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import SpendingChart from "../components/SpendingChart";
import RecentTransactions from "../components/RecentTransactions";
import FinancialHealthCard from "../components/FinancialHealthCard";
import BankStatementModal from "../components/BankStatementModal";
import {
    FileUp,
    Wallet,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    Info,
    ShieldCheck,
} from "lucide-react";
import { getTransactions, type Transaction } from "../api/transactions";
import { calculateFinancialHealth } from "../utils/financialHealth";
import { useAuthStore } from "../store/useAuthStore";

function Dashboard() {
    const { user } = useAuthStore();
    const displayName = user?.name ? user.name.split(" ")[0] : "User";

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showStatementModal, setShowStatementModal] = useState(false);
    const [error, setError] = useState("");

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getTransactions();
            setTransactions(data || []);
        } catch (err: any) {
            console.error("Failed to load dashboard transactions:", err);
            setError("Unable to load transaction records. Please check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const rawDate = transaction.date || transaction.transactionDate;
            if (!rawDate) return false;
            const transactionDate = new Date(rawDate);
            if (Number.isNaN(transactionDate.getTime())) return false;
            return (
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear
            );
        });
    }, [transactions, currentMonth, currentYear]);

    const monthlyIncome = useMemo(() => {
        return monthlyTransactions
            .filter((t) => t.type === "income")
            .reduce((total, t) => total + (Number(t.amount) || 0), 0);
    }, [monthlyTransactions]);

    const monthlyExpenses = useMemo(() => {
        return monthlyTransactions
            .filter((t) => t.type === "expense")
            .reduce((total, t) => total + (Number(t.amount) || 0), 0);
    }, [monthlyTransactions]);

    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

    const totalIncome = useMemo(() => {
        return transactions
            .filter((t) => t.type === "income")
            .reduce((total, t) => total + (Number(t.amount) || 0), 0);
    }, [transactions]);

    const totalExpenses = useMemo(() => {
        return transactions
            .filter((t) => t.type === "expense")
            .reduce((total, t) => total + (Number(t.amount) || 0), 0);
    }, [transactions]);

    const totalBalance = totalIncome - totalExpenses;

    const healthReport = useMemo(() => {
        return calculateFinancialHealth(transactions);
    }, [transactions]);

    if (loading) {
        return (
            <div className="wm-page-wrapper">
                <div className="wm-page-header">
                    <div className="wm-skeleton" style={{ width: "240px", height: "32px", marginBottom: "8px" }} />
                    <div className="wm-skeleton" style={{ width: "380px", height: "18px" }} />
                </div>
                <div className="wm-stats-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="wm-skeleton-card" />
                    ))}
                </div>
            </div>
        );
    }

    const isFreshUser = transactions.length === 0;

    return (
        <div className="wm-page-wrapper">
            {/* Header Area */}
            <div className="wm-page-header">
                <div>
                    <h1 className="wm-page-title">
                        {greeting}, {displayName} 👋
                    </h1>
                    <p className="wm-page-subtitle">
                        Here is your real-time financial command center. All metrics are calculated 100% from your data.
                    </p>
                </div>

                <div className="wm-header-actions">
                    <button
                        type="button"
                        onClick={() => setShowStatementModal(true)}
                        className="wm-btn-primary"
                        id="btn-dashboard-upload-statement"
                    >
                        <FileUp size={16} />
                        <span>Import Statement PDF</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="wm-alert wm-alert-error" style={{ marginBottom: "24px" }}>
                    <Info size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Fresh User Guidance Banner */}
            {isFreshUser && !error && (
                <div className="wm-welcome-banner">
                    <div className="wm-welcome-content">
                        <div className="wm-welcome-badge">
                            <ShieldCheck size={15} />
                            <span>Zero Assumed Values Active</span>
                        </div>
                        <h3>Welcome to your clean financial dashboard!</h3>
                        <p>
                            All financial counters start at ₹0. To see your true cashflow, balances, and personalized health scores, import your bank statement PDF.
                        </p>
                    </div>
                    <div className="wm-welcome-action">
                        <button
                            type="button"
                            onClick={() => setShowStatementModal(true)}
                            className="wm-btn-primary"
                        >
                            <FileUp size={16} />
                            <span>Upload Bank Statement</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Financial Summary Stat Cards */}
            <div className="wm-stats-grid">
                <StatCard
                    title="Total Balance"
                    value={`₹${totalBalance.toLocaleString("en-IN")}`}
                    subtitle="Calculated: Total Income - Total Expenses"
                    variant="balance"
                    icon={<Wallet size={18} />}
                    trend={isFreshUser ? { value: "₹0 Baseline", neutral: true } : { value: `${transactions.length} Total Txns`, isPositive: totalBalance >= 0 }}
                />

                <StatCard
                    title="Monthly Income"
                    value={`₹${monthlyIncome.toLocaleString("en-IN")}`}
                    subtitle="Current month incoming credits"
                    variant="income"
                    icon={<TrendingUp size={18} />}
                    trend={monthlyIncome > 0 ? { value: "+ Inflow", isPositive: true } : { value: "₹0 Inflow", neutral: true }}
                />

                <StatCard
                    title="Monthly Expenses"
                    value={`₹${monthlyExpenses.toLocaleString("en-IN")}`}
                    subtitle="Current month outgoing debits"
                    variant="expense"
                    icon={<TrendingDown size={18} />}
                    trend={monthlyExpenses > 0 ? { value: "Active Outflow", isPositive: false } : { value: "₹0 Outflow", neutral: true }}
                />

                <StatCard
                    title="Monthly Savings"
                    value={`₹${monthlySavings.toLocaleString("en-IN")}`}
                    subtitle={monthlyIncome > 0 ? `${savingsRate}% savings rate` : "0% savings rate (Awaiting income)"}
                    variant="savings"
                    icon={<PiggyBank size={18} />}
                    trend={{ value: `${savingsRate}% Rate`, isPositive: savingsRate >= 20, neutral: savingsRate === 0 }}
                />
            </div>

            {/* Health Score & Diagnostics Widget */}
            <FinancialHealthCard
                score={healthReport.score}
                grade={healthReport.grade}
                verdict={healthReport.verdict}
            />

            {/* Inflow vs Outflow Visual Analytics */}
            <SpendingChart transactions={transactions} />

            {/* Recent Activity List */}
            <RecentTransactions
                transactions={transactions}
                onOpenStatementModal={() => setShowStatementModal(true)}
            />

            {/* Statement Import Modal */}
            <BankStatementModal
                isOpen={showStatementModal}
                onClose={() => setShowStatementModal(false)}
                onImportSuccess={(_newTxs) => {
                    loadTransactions();
                }}
            />
        </div>
    );
}

export default Dashboard;