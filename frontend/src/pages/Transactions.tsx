import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Transaction {
    id: number;
    merchant: string;
    category: string;
    date: string;
    amount: number;
    type: "income" | "expense";
}

const transactionSchema = z.object({
    merchant: z
        .string()
        .min(2, "Merchant name must be at least 2 characters"),

    category: z
        .string()
        .min(1, "Please select a category"),

    amount: z
        .number({
            error: "Amount must be a number",
        })
        .positive("Amount must be greater than 0"),

    date: z
        .string()
        .min(1, "Please select a date"),

    type: z.enum(["income", "expense"]),
});

type TransactionFormData = z.infer<
    typeof transactionSchema
>;

const initialTransactions: Transaction[] = [
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
    const [transactions, setTransactions] = useState<
        Transaction[]
    >(initialTransactions);

    const [search, setSearch] = useState("");

    const [category, setCategory] =
        useState("All");

    const [showForm, setShowForm] =
        useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "expense",
        },
    });

    const filteredTransactions =
        transactions.filter((transaction) => {
            const matchesSearch =
                transaction.merchant
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                category === "All" ||
                transaction.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );
        });

    const totalIncome = transactions
        .filter(
            (transaction) =>
                transaction.type === "income"
        )
        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

    const totalExpenses = transactions
        .filter(
            (transaction) =>
                transaction.type === "expense"
        )
        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

    const onSubmit = (
        data: TransactionFormData
    ) => {
        const newTransaction: Transaction = {
            id: Date.now(),

            merchant: data.merchant,

            category: data.category,

            date: new Date(
                data.date
            ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),

            amount: data.amount,

            type: data.type,
        };

        setTransactions((current) => [
            newTransaction,
            ...current,
        ]);

        reset();

        setShowForm(false);
    };

    return (
        <div className="transactions-page">

            {/* PAGE HEADER */}

            <div className="page-header">

                <div>
                    <h1>Transactions</h1>

                    <p>
                        Track and manage your financial
                        activity.
                    </p>
                </div>

                <button
                    className="add-transaction-button"
                    onClick={() =>
                        setShowForm(true)
                    }
                >
                    + Add Transaction
                </button>

            </div>


            {/* SUMMARY */}

            <div className="transaction-summary">

                <div className="summary-card">

                    <p>Total Transactions</p>

                    <h2>
                        {transactions.length}
                    </h2>

                </div>


                <div className="summary-card">

                    <p>Total Income</p>

                    <h2>
                        ₹
                        {totalIncome.toLocaleString(
                            "en-IN"
                        )}
                    </h2>

                </div>


                <div className="summary-card">

                    <p>Total Expenses</p>

                    <h2>
                        ₹
                        {totalExpenses.toLocaleString(
                            "en-IN"
                        )}
                    </h2>

                </div>

            </div>


            {/* SEARCH AND FILTER */}

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
                        setCategory(
                            event.target.value
                        )
                    }
                >
                    <option value="All">
                        All Categories
                    </option>

                    <option value="Income">
                        Income
                    </option>

                    <option value="Food">
                        Food
                    </option>

                    <option value="Shopping">
                        Shopping
                    </option>

                    <option value="Transport">
                        Transport
                    </option>

                    <option value="Entertainment">
                        Entertainment
                    </option>

                    <option value="Bills">
                        Bills
                    </option>
                </select>

            </div>


            {/* TRANSACTION TABLE */}

            <div className="transactions-table-card">

                <div className="table-header">

                    <h2>
                        All Transactions
                    </h2>

                    <span>
                        {filteredTransactions.length}{" "}
                        results
                    </span>

                </div>


                <div className="transaction-table">

                    <div className="table-row table-heading">

                        <span>
                            Merchant
                        </span>

                        <span>
                            Category
                        </span>

                        <span>
                            Date
                        </span>

                        <span>
                            Amount
                        </span>

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
                                        transaction.type ===
                                            "income"
                                            ? "income-amount"
                                            : "expense-amount"
                                    }
                                >

                                    {transaction.type ===
                                        "income"
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


            {/* ADD TRANSACTION MODAL */}

            {showForm && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowForm(false)
                    }
                >

                    <div
                        className="transaction-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>
                                <h2>
                                    Add Transaction
                                </h2>

                                <p>
                                    Enter your transaction
                                    details.
                                </p>
                            </div>

                            <button
                                className="close-modal-button"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit(
                                onSubmit
                            )}
                            className="transaction-form"
                        >

                            {/* MERCHANT */}

                            <div className="form-group">

                                <label>
                                    Merchant
                                </label>

                                <input
                                    type="text"
                                    placeholder="Example: Amazon"
                                    {...register(
                                        "merchant"
                                    )}
                                />

                                {errors.merchant && (
                                    <p className="form-error">
                                        {
                                            errors.merchant
                                                .message
                                        }
                                    </p>
                                )}

                            </div>


                            {/* CATEGORY */}

                            <div className="form-group">

                                <label>
                                    Category
                                </label>

                                <select
                                    {...register(
                                        "category"
                                    )}
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    <option value="Income">
                                        Income
                                    </option>

                                    <option value="Food">
                                        Food
                                    </option>

                                    <option value="Shopping">
                                        Shopping
                                    </option>

                                    <option value="Transport">
                                        Transport
                                    </option>

                                    <option value="Entertainment">
                                        Entertainment
                                    </option>

                                    <option value="Bills">
                                        Bills
                                    </option>

                                </select>


                                {errors.category && (
                                    <p className="form-error">
                                        {
                                            errors.category
                                                .message
                                        }
                                    </p>
                                )}

                            </div>


                            {/* AMOUNT */}

                            <div className="form-group">

                                <label>
                                    Amount
                                </label>

                                <input
                                    type="number"
                                    placeholder="Example: 1500"
                                    step="0.01"
                                    {...register(
                                        "amount",
                                        {
                                            valueAsNumber: true,
                                        }
                                    )}
                                />

                                {errors.amount && (
                                    <p className="form-error">
                                        {
                                            errors.amount
                                                .message
                                        }
                                    </p>
                                )}

                            </div>


                            {/* DATE */}

                            <div className="form-group">

                                <label>
                                    Date
                                </label>

                                <input
                                    type="date"
                                    {...register(
                                        "date"
                                    )}
                                />

                                {errors.date && (
                                    <p className="form-error">
                                        {
                                            errors.date
                                                .message
                                        }
                                    </p>
                                )}

                            </div>


                            {/* TYPE */}

                            <div className="form-group">

                                <label>
                                    Transaction Type
                                </label>

                                <select
                                    {...register(
                                        "type"
                                    )}
                                >

                                    <option value="expense">
                                        Expense
                                    </option>

                                    <option value="income">
                                        Income
                                    </option>

                                </select>

                            </div>


                            {/* BUTTONS */}

                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="save-button"
                                >
                                    Save Transaction
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Transactions;