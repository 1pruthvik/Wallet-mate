import { useEffect, useState } from "react";

import {
    getTransactions,
    createTransaction,
} from "../api/transactions";

import type {
    Transaction,
} from "../api/transactions";

import { useForm } from "react-hook-form";

import { z } from "zod";

import {
    zodResolver,
} from "@hookform/resolvers/zod";


/* =========================================================
   CONSTANTS
========================================================= */

const categories = [
    "Income",
    "Food",
    "Shopping",
    "Transport",
    "Entertainment",
    "Bills",
    "Other",
];


/* =========================================================
   FORM VALIDATION
========================================================= */

const transactionSchema = z.object({

    merchant: z
        .string()
        .trim()
        .min(
            2,
            "Merchant name must be at least 2 characters"
        ),

    category: z
        .string()
        .min(
            1,
            "Please select a category"
        ),

    amount: z
        .number({
            error: "Amount must be a number",
        })
        .positive(
            "Amount must be greater than 0"
        ),

    date: z
        .string()
        .min(
            1,
            "Please select a date"
        ),

    type: z.enum([
        "income",
        "expense",
    ]),
});


type TransactionFormData =
    z.infer<typeof transactionSchema>;


/* =========================================================
   HELPER FUNCTION
========================================================= */

const formatDate = (date: string) => {

    if (!date) {
        return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


/* =========================================================
   TRANSACTIONS COMPONENT
========================================================= */

function Transactions() {

    /* =====================================================
       STATE
    ===================================================== */

    const [
        transactions,
        setTransactions,
    ] = useState<Transaction[]>([]);


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        category,
        setCategory,
    ] = useState("All");


    const [
        showForm,
        setShowForm,
    ] = useState(false);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    /* =====================================================
       FORM
    ===================================================== */

    const {
        register,
        handleSubmit,
        reset,
        formState: {
            errors,
        },
    } = useForm<TransactionFormData>({

        resolver:
            zodResolver(
                transactionSchema
            ),

        defaultValues: {
            type: "expense",
            category: "",
            merchant: "",
            amount: undefined,
            date: "",
        },
    });


    /* =====================================================
       LOAD TRANSACTIONS FROM BACKEND
    ===================================================== */

    useEffect(() => {

        const loadTransactions =
            async () => {

                try {

                    setLoading(true);

                    setError("");

                    const data =
                        await getTransactions();

                    setTransactions(data);

                } catch (err) {

                    console.error(
                        "Failed to load transactions:",
                        err
                    );

                    setError(
                        "Unable to load transactions. Please make sure the backend server is running."
                    );

                } finally {

                    setLoading(false);

                }
            };


        loadTransactions();

    }, []);


    /* =====================================================
       FILTER TRANSACTIONS
    ===================================================== */

    const filteredTransactions =
        transactions.filter(
            (transaction) => {

                const merchant =
                    transaction.merchant
                        ?.toLowerCase() ?? "";


                const searchText =
                    search
                        .toLowerCase()
                        .trim();


                const matchesSearch =
                    merchant.includes(
                        searchText
                    );


                const matchesCategory =
                    category === "All" ||
                    transaction.category ===
                    category;


                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );


    /* =====================================================
       TOTAL INCOME
    ===================================================== */

    const totalIncome =
        transactions
            .filter(
                (transaction) =>
                    transaction.type ===
                    "income"
            )
            .reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    Number(
                        transaction.amount
                    ),
                0
            );


    /* =====================================================
       TOTAL EXPENSES
    ===================================================== */

    const totalExpenses =
        transactions
            .filter(
                (transaction) =>
                    transaction.type ===
                    "expense"
            )
            .reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    Number(
                        transaction.amount
                    ),
                0
            );


    /* =====================================================
       ADD TRANSACTION
    ===================================================== */

    const onSubmit =
        async (
            data: TransactionFormData
        ) => {

            try {

                setSaving(true);

                setError("");


                /*
                 * Send transaction to backend.
                 *
                 * The backend will create the MongoDB
                 * document and return the saved transaction.
                 */

                const newTransaction =
                    await createTransaction({

                        merchant:
                            data.merchant.trim(),

                        category:
                            data.category,

                        amount:
                            data.amount,

                        date:
                            data.date,

                        type:
                            data.type,

                    });


                /*
                 * Add the newly created transaction
                 * to the beginning of our list.
                 */

                setTransactions(
                    (current) => [
                        newTransaction,
                        ...current,
                    ]
                );


                /*
                 * Clear the form.
                 */

                reset({
                    merchant: "",
                    category: "",
                    amount: undefined,
                    date: "",
                    type: "expense",
                });


                /*
                 * Close modal.
                 */

                setShowForm(false);


            } catch (err) {

                console.error(
                    "Failed to create transaction:",
                    err
                );

                setError(
                    "Failed to add transaction. Please make sure the backend server is running."
                );

            } finally {

                setSaving(false);

            }
        };


    /* =====================================================
       OPEN FORM
    ===================================================== */

    const openForm = () => {

        setError("");

        reset({
            merchant: "",
            category: "",
            amount: undefined,
            date: "",
            type: "expense",
        });

        setShowForm(true);
    };


    /* =====================================================
       CLOSE FORM
    ===================================================== */

    const closeForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);

        reset({
            merchant: "",
            category: "",
            amount: undefined,
            date: "",
            type: "expense",
        });
    };


    /* =====================================================
       LOADING SCREEN
    ===================================================== */

    if (loading) {

        return (

            <div className="transactions-page">

                <div className="page-header">

                    <div>

                        <h1>
                            Transactions
                        </h1>

                        <p>
                            Loading your
                            transactions...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    /* =====================================================
       MAIN PAGE
    ===================================================== */

    return (

        <div className="transactions-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <h1>
                        Transactions
                    </h1>

                    <p>
                        Track and manage your
                        financial activity.
                    </p>

                </div>


                <button
                    type="button"
                    className="add-transaction-button"
                    onClick={openForm}
                >
                    + Add Transaction
                </button>

            </div>


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

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


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="transaction-summary">


                {/* TOTAL TRANSACTIONS */}

                <div className="summary-card">

                    <p>
                        Total Transactions
                    </p>

                    <h2>
                        {
                            transactions.length
                        }
                    </h2>

                </div>


                {/* TOTAL INCOME */}

                <div className="summary-card">

                    <p>
                        Total Income
                    </p>

                    <h2>
                        ₹
                        {totalIncome.toLocaleString(
                            "en-IN"
                        )}
                    </h2>

                </div>


                {/* TOTAL EXPENSES */}

                <div className="summary-card">

                    <p>
                        Total Expenses
                    </p>

                    <h2>
                        ₹
                        {totalExpenses.toLocaleString(
                            "en-IN"
                        )}
                    </h2>

                </div>


            </div>


            {/* =================================================
                SEARCH + CATEGORY FILTER
            ================================================= */}

            <div className="transaction-controls">


                {/* SEARCH */}

                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />


                {/* CATEGORY */}

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


                    {categories.map(
                        (item) => (

                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>

                        )
                    )}

                </select>


            </div>


            {/* =================================================
                TRANSACTIONS TABLE
            ================================================= */}

            <div className="transactions-table-card">


                {/* TABLE HEADER */}

                <div className="table-header">

                    <h2>
                        All Transactions
                    </h2>

                    <span>
                        {
                            filteredTransactions.length
                        }{" "}
                        results
                    </span>

                </div>


                {/* TABLE */}

                <div className="transaction-table">


                    {/* COLUMN HEADERS */}

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


                    {/* NO RESULTS */}

                    {filteredTransactions.length ===
                        0 ? (

                        <div
                            className="table-row"
                            style={{
                                display: "block",
                                textAlign: "center",
                                padding: "30px",
                            }}
                        >

                            <span>
                                No transactions found.
                            </span>

                        </div>

                    ) : (


                        /* TRANSACTION ROWS */

                        filteredTransactions.map(
                            (
                                transaction,
                                index
                            ) => (

                                <div
                                    className="table-row"
                                    key={
                                        transaction._id ??
                                        `${transaction.merchant}-${transaction.date}-${index}`
                                    }
                                >


                                    {/* MERCHANT */}

                                    <span className="merchant-name">

                                        {
                                            transaction.merchant
                                        }

                                    </span>


                                    {/* CATEGORY */}

                                    <span>

                                        <span className="category-badge">

                                            {
                                                transaction.category
                                            }

                                        </span>

                                    </span>


                                    {/* DATE */}

                                    <span className="transaction-date">

                                        {
                                            formatDate(
                                                transaction.date
                                            )
                                        }

                                    </span>


                                    {/* AMOUNT */}

                                    <span
                                        className={
                                            transaction.type ===
                                                "income"
                                                ? "income-amount"
                                                : "expense-amount"
                                        }
                                    >

                                        {
                                            transaction.type ===
                                                "income"
                                                ? "+"
                                                : "-"
                                        }

                                        ₹

                                        {
                                            Number(
                                                transaction.amount
                                            ).toLocaleString(
                                                "en-IN"
                                            )
                                        }

                                    </span>


                                </div>

                            )
                        )

                    )}

                </div>

            </div>


            {/* =================================================
                ADD TRANSACTION MODAL
            ================================================= */}

            {showForm && (

                <div
                    className="modal-overlay"
                    onClick={closeForm}
                >


                    <div
                        className="transaction-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

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
                                type="button"
                                className="close-modal-button"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                ×
                            </button>


                        </div>


                        {/* =================================================
                            FORM
                        ================================================= */}

                        <form
                            className="transaction-form"
                            onSubmit={handleSubmit(
                                onSubmit
                            )}
                        >


                            {/* =================================================
                                MERCHANT
                            ================================================= */}

                            <div className="form-group">

                                <label htmlFor="merchant">
                                    Merchant
                                </label>

                                <input
                                    id="merchant"
                                    type="text"
                                    placeholder="Example: Amazon"
                                    {...register(
                                        "merchant"
                                    )}
                                />


                                {errors.merchant && (

                                    <p className="form-error">

                                        {
                                            errors.merchant.message
                                        }

                                    </p>

                                )}

                            </div>


                            {/* =================================================
                                CATEGORY
                            ================================================= */}

                            <div className="form-group">

                                <label htmlFor="category">
                                    Category
                                </label>

                                <select
                                    id="category"
                                    {...register(
                                        "category"
                                    )}
                                >

                                    <option value="">
                                        Select category
                                    </option>


                                    {categories.map(
                                        (item) => (

                                            <option
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </option>

                                        )
                                    )}

                                </select>


                                {errors.category && (

                                    <p className="form-error">

                                        {
                                            errors.category.message
                                        }

                                    </p>

                                )}

                            </div>


                            {/* =================================================
                                AMOUNT
                            ================================================= */}

                            <div className="form-group">

                                <label htmlFor="amount">
                                    Amount
                                </label>

                                <input
                                    id="amount"
                                    type="number"
                                    placeholder="Example: 1500"
                                    step="0.01"
                                    min="0"
                                    {...register(
                                        "amount",
                                        {
                                            valueAsNumber:
                                                true,
                                        }
                                    )}
                                />


                                {errors.amount && (

                                    <p className="form-error">

                                        {
                                            errors.amount.message
                                        }

                                    </p>

                                )}

                            </div>


                            {/* =================================================
                                DATE
                            ================================================= */}

                            <div className="form-group">

                                <label htmlFor="date">
                                    Date
                                </label>

                                <input
                                    id="date"
                                    type="date"
                                    {...register(
                                        "date"
                                    )}
                                />


                                {errors.date && (

                                    <p className="form-error">

                                        {
                                            errors.date.message
                                        }

                                    </p>

                                )}

                            </div>


                            {/* =================================================
                                TRANSACTION TYPE
                            ================================================= */}

                            <div className="form-group">

                                <label htmlFor="type">
                                    Transaction Type
                                </label>

                                <select
                                    id="type"
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


                            {/* =================================================
                                FORM BUTTONS
                            ================================================= */}

                            <div className="form-actions">


                                {/* CANCEL */}

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                {/* SAVE */}

                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : "Save Transaction"}

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