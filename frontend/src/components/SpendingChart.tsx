import { useEffect, useMemo, useState } from "react";

import {
    getTransactions,
} from "../api/transactions";

import type {
    Transaction,
} from "../api/transactions";


interface MonthlySpending {
    month: string;
    spending: number;
}


function SpendingChart() {

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
                    "Failed to load spending data:",
                    error
                );

                setError(
                    "Unable to load spending data."
                );

            } finally {

                setLoading(false);

            }

        };


        loadTransactions();

    }, []);


    /* =========================
       CALCULATE MONTHLY SPENDING
    ========================= */

    const monthlySpending =
        useMemo<MonthlySpending[]>(() => {

            const monthTotals: Record<
                string,
                number
            > = {};


            transactions
                .filter(
                    (transaction) =>
                        transaction.type ===
                        "expense"
                )
                .forEach(
                    (transaction) => {

                        const date =
                            new Date(
                                transaction.date
                            );


                        if (
                            Number.isNaN(
                                date.getTime()
                            )
                        ) {
                            return;
                        }


                        const month =
                            date.toLocaleString(
                                "en-US",
                                {
                                    month: "short",
                                }
                            );


                        monthTotals[month] =
                            (monthTotals[month] || 0) +
                            transaction.amount;

                    }
                );


            const monthOrder = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];


            return monthOrder
                .filter(
                    (month) =>
                        monthTotals[month] !==
                        undefined
                )
                .map(
                    (month) => ({
                        month,
                        spending:
                            monthTotals[month],
                    })
                );

        }, [transactions]);


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (

            <div className="spending-chart-card">

                <h2>
                    Spending Overview
                </h2>

                <p>
                    Loading spending data...
                </p>

            </div>

        );

    }


    /* =========================
       ERROR
    ========================= */

    if (error) {

        return (

            <div className="spending-chart-card">

                <h2>
                    Spending Overview
                </h2>

                <p>
                    {error}
                </p>

            </div>

        );

    }


    /* =========================
       NO DATA
    ========================= */

    if (monthlySpending.length === 0) {

        return (

            <div className="spending-chart-card">

                <h2>
                    Spending Overview
                </h2>

                <p>
                    No expense transactions available yet.
                </p>

            </div>

        );

    }


    /* =========================
       FIND MAX VALUE
    ========================= */

    const maxSpending =
        Math.max(
            ...monthlySpending.map(
                (item) =>
                    item.spending
            )
        );


    /* =========================
       PAGE
    ========================= */

    return (

        <div className="spending-chart-card">

            <div className="spending-chart-header">

                <div>

                    <h2>
                        Spending Overview
                    </h2>

                    <p>
                        Monthly spending trend
                    </p>

                </div>

            </div>


            <div
                className="spending-chart"
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "24px",
                    minHeight: "280px",
                    padding:
                        "30px 20px 20px",
                    overflowX: "auto",
                }}
            >

                {monthlySpending.map(
                    (item) => {

                        const height =
                            maxSpending > 0
                                ? Math.max(
                                    20,
                                    (item.spending /
                                        maxSpending) *
                                    220
                                )
                                : 20;


                        return (

                            <div
                                key={item.month}
                                style={{
                                    minWidth: "70px",
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "flex-end",
                                    height:
                                        "250px",
                                }}
                            >

                                {/* AMOUNT */}

                                <span
                                    style={{
                                        fontSize:
                                            "12px",
                                        marginBottom:
                                            "8px",
                                    }}
                                >

                                    ₹
                                    {item.spending.toLocaleString(
                                        "en-IN"
                                    )}

                                </span>


                                {/* BAR */}

                                <div
                                    title={`${item.month}: ₹${item.spending.toLocaleString(
                                        "en-IN"
                                    )}`}
                                    style={{
                                        width:
                                            "45px",
                                        height:
                                            `${height}px`,
                                        borderRadius:
                                            "8px 8px 0 0",
                                        background:
                                            "currentColor",
                                        opacity:
                                            0.8,
                                        transition:
                                            "height 0.3s ease",
                                    }}
                                />


                                {/* MONTH */}

                                <span
                                    style={{
                                        fontSize:
                                            "13px",
                                        marginTop:
                                            "10px",
                                    }}
                                >

                                    {item.month}

                                </span>

                            </div>

                        );

                    }
                )}

            </div>

        </div>

    );

}


export default SpendingChart;