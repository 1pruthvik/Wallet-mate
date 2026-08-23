import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import SpendingChart from "../components/SpendingChart";
import RecentTransactions from "../components/RecentTransactions";
import FinancialHealthCard from "../components/FinancialHealthCard";
import BankStatementModal from "../components/BankStatementModal";
import { FileUp } from "lucide-react";

import {
    getTransactions,
} from "../api/transactions";

import type {
    Transaction,
} from "../api/transactions";

import { calculateFinancialHealth } from "../utils/financialHealth";
import { useAuthStore } from "../store/useAuthStore";

function Dashboard() {
    const { user } = useAuthStore();
    const displayName = user?.name ? user.name.split(" ")[0] : "Nivish";

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    /* =========================
       STATE
    ========================= */

    const [transactions, setTransactions] =
        useState<Transaction[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [showStatementModal, setShowStatementModal] =
        useState(false);

    const [error, setError] =
        useState("");


    /* =========================
       LOAD TRANSACTIONS
    ========================= */

    useEffect(() => {

        const loadTransactions = async () => {

            try {

                setLoading(true);

                setError("");

                const data =
                    await getTransactions();

                setTransactions(data);

            } catch (error) {

                console.error(
                    "Failed to load dashboard transactions:",
                    error
                );

                setError(
                    "Unable to load financial data. Please make sure the backend is running."
                );

            } finally {

                setLoading(false);

            }
        };


        loadTransactions();

    }, []);


    /* =========================
       CURRENT MONTH
    ========================= */

    const currentMonth =
        new Date().getMonth();

    const currentYear =
        new Date().getFullYear();


    /* =========================
       MONTHLY TRANSACTIONS
    ========================= */

    const monthlyTransactions =
        useMemo(() => {

            return transactions.filter(
                (transaction) => {

                    const transactionDate =
                        new Date(
                            transaction.date
                        );

                    if (
                        Number.isNaN(
                            transactionDate.getTime()
                        )
                    ) {
                        return false;
                    }

                    return (
                        transactionDate.getMonth() ===
                        currentMonth &&
                        transactionDate.getFullYear() ===
                        currentYear
                    );
                }
            );

        }, [
            transactions,
            currentMonth,
            currentYear,
        ]);


    /* =========================
       MONTHLY INCOME
    ========================= */

    const monthlyIncome =
        monthlyTransactions
            .filter(
                (transaction) =>
                    transaction.type ===
                    "income"
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );


    /* =========================
       MONTHLY EXPENSES
    ========================= */

    const monthlyExpenses =
        monthlyTransactions
            .filter(
                (transaction) =>
                    transaction.type ===
                    "expense"
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );


    /* =========================
       MONTHLY SAVINGS
    ========================= */

    const monthlySavings =
        monthlyIncome -
        monthlyExpenses;


    /* =========================
       SAVINGS RATE
    ========================= */

    const savingsRate =
        monthlyIncome > 0
            ? Math.round(
                (monthlySavings /
                    monthlyIncome) *
                100
            )
            : 0;


    /* =========================
       TOTAL BALANCE
    ========================= */

    const totalIncome =
        transactions
            .filter(
                (transaction) =>
                    transaction.type ===
                    "income"
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );


    const totalExpenses =
        transactions
            .filter(
                (transaction) =>
                    transaction.type ===
                    "expense"
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );


    const totalBalance =
        totalIncome -
        totalExpenses;


    /* =========================
       FINANCIAL HEALTH REPORT
    ========================= */

    const healthReport =
        useMemo(() => {
            return calculateFinancialHealth(transactions);
        }, [transactions]);


    /* =========================
       LOADING STATE
    ========================= */

    if (loading) {

        return (
            <div className="dashboard">

                <div className="dashboard-header">

                    <div>

                        <h1>
                            Hi,
                        </h1>
                        <p>
                            Loading your financial overview...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    /* =========================
       DASHBOARD
    ========================= */

    return (

        <div className="dashboard">


            {/* =========================
                HEADER
            ========================= */}

            <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>

                <div>

                    <h1>
                        {greeting}, {displayName} 👋
                    </h1>

                    <p>
                        Here's your financial overview.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() => setShowStatementModal(true)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        backgroundColor: "#635bff",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(99, 91, 255, 0.2)",
                        fontFamily: "inherit",
                        transition: "all 0.15s ease"
                    }}
                    id="btn-dashboard-upload-statement"
                >
                    <FileUp size={16} />
                    <span>Upload Bank Statement</span>
                </button>

            </div>


            {/* =========================
                ERROR
            ========================= */}

            {error && (

                <div
                    className="form-error"
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    {error}
                </div>

            )}


            {/* =========================
                STAT CARDS
            ========================= */}

            <div className="stats-grid">


                <StatCard
                    title="Total Balance"
                    value={`₹${totalBalance.toLocaleString(
                        "en-IN"
                    )}`}
                    subtitle="Across all transactions"
                />


                <StatCard
                    title="Monthly Income"
                    value={`₹${monthlyIncome.toLocaleString(
                        "en-IN"
                    )}`}
                    subtitle="This month"
                />


                <StatCard
                    title="Monthly Expenses"
                    value={`₹${monthlyExpenses.toLocaleString(
                        "en-IN"
                    )}`}
                    subtitle="This month"
                />


                <StatCard
                    title="Monthly Savings"
                    value={`₹${monthlySavings.toLocaleString(
                        "en-IN"
                    )}`}
                    subtitle={`${savingsRate}% savings rate`}
                />

            </div>


            {/* =========================
                FINANCIAL HEALTH
            ========================= */}

            <FinancialHealthCard
                score={healthReport.score}
                grade={healthReport.grade}
                verdict={healthReport.verdict}
            />


            {/* =========================
                SPENDING CHART
            ========================= */}

            <SpendingChart transactions={transactions} />


            {/* =========================
                RECENT TRANSACTIONS
            ========================= */}

            <RecentTransactions
                transactions={transactions}
            />

            <BankStatementModal
                isOpen={showStatementModal}
                onClose={() => setShowStatementModal(false)}
                onImportSuccess={(newTxs) => {
                    setTransactions((prev) => [...newTxs, ...prev]);
                }}
            />

        </div>
    );
}


export default Dashboard;