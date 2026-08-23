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
       TOTAL INCOME
    ========================= */

    const totalIncome = useMemo(() => {

        return transactions
            .filter(
                (transaction) =>
                    transaction.type === "income"
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );

    }, [transactions]);


    /* =========================
       TOTAL EXPENSES
    ========================= */

    const totalExpenses = useMemo(() => {

        return transactions
            .filter(
                (transaction) =>
                    transaction.type === "expense"
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );

    }, [transactions]);


    /* =========================
       MONTHLY SAVINGS
    ========================= */

    const monthlySavings =
        totalIncome - totalExpenses;


    /* =========================
       SAVINGS RATE
    ========================= */

    const savingsRate =
        totalIncome > 0
            ? Math.round(
                (monthlySavings / totalIncome) * 100
            )
            : 0;


    /* =========================
       TOTAL BALANCE
       
       For now we calculate:
       Income - Expenses
       
       Later this can be replaced
       with actual account balance.
    ========================= */

    const totalBalance =
        totalIncome - totalExpenses;


    /* =========================
       FORMAT MONEY
    ========================= */

    const formatMoney = (
        amount: number
    ) => {

        return `₹${amount.toLocaleString(
            "en-IN"
        )}`;

    };


    /* =========================
       LOADING
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


                <div className="stats-grid">

                    <StatCard
                        title="Total Balance"
                        value="Loading..."
                        subtitle="Please wait"
                    />

                    <StatCard
                        title="Monthly Income"
                        value="Loading..."
                        subtitle="Please wait"
                    />

                    <StatCard
                        title="Monthly Expenses"
                        value="Loading..."
                        subtitle="Please wait"
                    />

                    <StatCard
                        title="Monthly Savings"
                        value="Loading..."
                        subtitle="Please wait"
                    />

                </div>

            </div>

        );

    }


    /* =========================
       PAGE
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


                {/* TOTAL BALANCE */}

                <StatCard
                    title="Total Balance"
                    value={formatMoney(
                        totalBalance
                    )}
                    subtitle="Income minus expenses"
                />


                {/* MONTHLY INCOME */}

                <StatCard
                    title="Monthly Income"
                    value={formatMoney(
                        totalIncome
                    )}
                    subtitle="Total income"
                />


                {/* MONTHLY EXPENSES */}

                <StatCard
                    title="Monthly Expenses"
                    value={formatMoney(
                        totalExpenses
                    )}
                    subtitle="Total expenses"
                />


                {/* MONTHLY SAVINGS */}

                <StatCard
                    title="Monthly Savings"
                    value={formatMoney(
                        monthlySavings
                    )}
                    subtitle={`${savingsRate}% savings rate`}
                />

            </div>


            {/* =========================
                FINANCIAL HEALTH
            ========================= */}

            <FinancialHealthCard />


            {/* =========================
                SPENDING CHART
            ========================= */}

            <SpendingChart />


            {/* =========================
                RECENT TRANSACTIONS
            ========================= */}

            <RecentTransactions />


        </div>

    );

}


export default Dashboard;