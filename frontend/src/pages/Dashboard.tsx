import { useEffect, useMemo, useState } from "react";

import StatCard from "../components/StatCard";
import SpendingChart from "../components/SpendingChart";
import RecentTransactions from "../components/RecentTransactions";
import FinancialHealthCard from "../components/FinancialHealthCard";

import {
    getTransactions,
} from "../api/transactions";

import type {
    Transaction,
} from "../api/transactions";

import { calculateFinancialHealth } from "../utils/financialHealth";


function Dashboard() {

    /* =========================
       STATE
    ========================= */

    const [transactions, setTransactions] =
        useState<Transaction[]>([]);

    const [loading, setLoading] =
        useState(true);

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
                            Good afternoon, Nivish 👋
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

            <div className="dashboard-header">

                <div>

                    <h1>
                        Good afternoon, Nivish 👋
                    </h1>

                    <p>
                        Here's your financial overview.
                    </p>

                </div>

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

        </div>
    );
}


export default Dashboard;