import { useEffect, useState } from "react";

import {
    getTransactions,
} from "../api/transactions";

import type {
    Transaction,
} from "../api/transactions";


function RecentTransactions() {

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
                    "Failed to load recent transactions:",
                    error
                );

                setError(
                    "Unable to load recent transactions."
                );

            } finally {

                setLoading(false);

            }

        };


        loadTransactions();

    }, []);


    /* =========================
       GET RECENT TRANSACTIONS
    ========================= */

    const recentTransactions =
        [...transactions]
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(a.date).getTime();

                    const dateB =
                        new Date(b.date).getTime();

                    return dateB - dateA;

                }
            )
            .slice(0, 5);


    /* =========================
       FORMAT DATE
    ========================= */

    const formatDate = (
        dateString: string
    ) => {

        const date =
            new Date(dateString);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return dateString;

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    /* =========================
       FORMAT AMOUNT
    ========================= */

    const formatAmount = (
        amount: number
    ) => {

        return amount.toLocaleString(
            "en-IN"
        );

    };


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (

            <div className="recent-transactions-card">

                <div className="recent-transactions-header">

                    <div>

                        <h2>
                            Recent Transactions
                        </h2>

                        <p>
                            Your latest financial activity
                        </p>

                    </div>

                </div>

                <div
                    className="recent-transactions-loading"
                    style={{
                        padding: "24px",
                    }}
                >

                    Loading transactions...

                </div>

            </div>

        );

    }


    /* =========================
       ERROR
    ========================= */

    if (error) {

        return (

            <div className="recent-transactions-card">

                <div className="recent-transactions-header">

                    <div>

                        <h2>
                            Recent Transactions
                        </h2>

                        <p>
                            Your latest financial activity
                        </p>

                    </div>

                </div>

                <div
                    className="recent-transactions-error"
                    style={{
                        padding: "24px",
                    }}
                >

                    {error}

                </div>

            </div>

        );

    }


    /* =========================
       PAGE
    ========================= */

    return (

        <div className="recent-transactions-card">


            {/* =========================
                HEADER
            ========================= */}

            <div className="recent-transactions-header">

                <div>

                    <h2>
                        Recent Transactions
                    </h2>

                    <p>
                        Your latest financial activity
                    </p>

                </div>


                <a
                    href="/transactions"
                    className="view-all-link"
                >
                    View all
                </a>

            </div>


            {/* =========================
                EMPTY STATE
            ========================= */}

            {recentTransactions.length === 0 ? (

                <div
                    className="recent-transactions-empty"
                    style={{
                        padding: "24px",
                    }}
                >

                    <p>
                        No transactions available yet.
                    </p>

                    <a
                        href="/transactions"
                        className="view-all-link"
                    >
                        Add your first transaction
                    </a>

                </div>

            ) : (


                /* =========================
                   TRANSACTION LIST
                ========================= */

                <div className="recent-transactions-list">

                    {recentTransactions.map(
                        (transaction) => (

                            <div
                                className="recent-transaction-row"
                                key={
                                    transaction._id ??
                                    `${transaction.merchant}-${transaction.date}-${transaction.amount}`
                                }
                            >


                                {/* =========================
                                    LEFT SIDE
                                ========================= */}

                                <div className="recent-transaction-info">

                                    <div className="recent-transaction-icon">

                                        {transaction.type ===
                                            "income"
                                            ? "↓"
                                            : "↑"}

                                    </div>


                                    <div>

                                        <h3>

                                            {
                                                transaction.merchant
                                            }

                                        </h3>


                                        <p>

                                            {
                                                transaction.category
                                            }

                                            {" • "}

                                            {
                                                formatDate(
                                                    transaction.date
                                                )
                                            }

                                        </p>

                                    </div>

                                </div>


                                {/* =========================
                                    RIGHT SIDE
                                ========================= */}

                                <div
                                    className={
                                        transaction.type ===
                                            "income"
                                            ? "recent-transaction-income"
                                            : "recent-transaction-expense"
                                    }
                                >

                                    {transaction.type ===
                                        "income"
                                        ? "+"
                                        : "-"}

                                    ₹
                                    {
                                        formatAmount(
                                            transaction.amount
                                        )
                                    }

                                </div>


                            </div>

                        )
                    )}

                </div>

            )}

        </div>

    );

}


export default RecentTransactions;