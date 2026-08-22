import { useState } from "react";

interface Transaction {
    id: number;
    merchant: string;
    category: string;
    date: string;
    amount: number;
    type: "income" | "expense";
}

const transactionData: Transaction[] = [
    {
        id: 1,
        merchant: "Salary",
        category: "Income",
        date: "22 Aug 2026",
        amount: 75000,
        type: "income",
    },
    {
        id: 2,
        merchant: "Swiggy",
        category: "Food",
        date: "21 Aug 2026",
        amount: 450,
        type: "expense",
    },
    {
        id: 3,
        merchant: "Amazon",
        category: "Shopping",
        date: "20 Aug 2026",
        amount: 1299,
        type: "expense",
    },
    {
        id: 4,
        merchant: "Uber",
        category: "Transport",
        date: "19 Aug 2026",
        amount: 320,
        type: "expense",
    },
    {
        id: 5,
        merchant: "Netflix",
        category: "Entertainment",
        date: "18 Aug 2026",
        amount: 649,
        type: "expense",
    },
    {
        id: 6,
        merchant: "Freelance Project",
        category: "Income",
        date: "17 Aug 2026",
        amount: 15000,
        type: "income",
    },
    {
        id: 7,
        merchant: "Electricity Bill",
        category: "Bills",
        date: "16 Aug 2026",
        amount: 2300,
        type: "expense",
    },
    {
        id: 8,
        merchant: "Zomato",
        category: "Food",
        date: "15 Aug 2026",
        amount: 580,
        type: "expense",
    },
];

function Transactions() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const filteredTransactions = transactionData.filter(
        (transaction) => {
            const matchesSearch =
                transaction.merchant
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                category === "All" ||
                transaction.category === category;

            return matchesSearch && matchesCategory;
        }
    );

    const totalIncome = transactionData
        .filter((transaction) => transaction.type === "income")
        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

    const totalExpenses = transactionData
        .filter((transaction) => transaction.type === "expense")
        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

    return (
        <div className="transactions-page">

            <div className="page-header">
                <div>
                    <h1>Transactions</h1>

                    <p>
                        Track and manage your financial activity.
                    </p>
                </div>

                <button className="add-transaction-button">
                    + Add Transaction
                </button>
            </div>

            <div className="transaction-summary">

                <div className="summary-card">
                    <p>Total Transactions</p>

                    <h2>
                        {transactionData.length}
                    </h2>
                </div>

                <div className="summary-card">
                    <p>Total Income</p>

                    <h2>
                        ₹{totalIncome.toLocaleString("en-IN")}
                    </h2>
                </div>

                <div className="summary-card">
                    <p>Total Expenses</p>

                    <h2>
                        ₹{totalExpenses.toLocaleString("en-IN")}
                    </h2>
                </div>

            </div>

            <div className="transaction-controls">

                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />

                <select
                    value={category}
                    onChange={(event) =>
                        setCategory(event.target.value)
                    }
                >
                    <option value="All">All Categories</option>
                    <option value="Income">Income</option>
                    <option value="Food">Food</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">
                        Entertainment
                    </option>
                    <option value="Bills">Bills</option>
                </select>

            </div>

            <div className="transactions-table-card">

                <div className="table-header">
                    <h2>All Transactions</h2>

                    <span>
                        {filteredTransactions.length} results
                    </span>
                </div>

                <div className="transaction-table">

                    <div className="table-row table-heading">
                        <span>Merchant</span>
                        <span>Category</span>
                        <span>Date</span>
                        <span>Amount</span>
                    </div>

                    {filteredTransactions.map(
                        (transaction) => (
                            <div
                                className="table-row"
                                key={transaction.id}
                            >

                                <span className="merchant-name">
                                    {transaction.merchant}
                                </span>

                                <span>
                                    <span className="category-badge">
                                        {transaction.category}
                                    </span>
                                </span>

                                <span className="transaction-date">
                                    {transaction.date}
                                </span>

                                <span
                                    className={
                                        transaction.type === "income"
                                            ? "income-amount"
                                            : "expense-amount"
                                    }
                                >
                                    {transaction.type === "income"
                                        ? "+"
                                        : "-"}
                                    ₹
                                    {transaction.amount.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>

                            </div>
                        )
                    )}

                </div>

            </div>

        </div>
    );
}

export default Transactions;