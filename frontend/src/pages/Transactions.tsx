import { useEffect, useMemo, useState } from "react";
import {
    getTransactions,
    createTransaction,
    deleteTransaction,
    type Transaction,
} from "../api/transactions";
import BankStatementModal from "../components/BankStatementModal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Search,
    Plus,
    FileUp,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    ReceiptText,
    X,
    Loader2,
} from "lucide-react";

const CATEGORIES = [
    "Salary",
    "Freelance",
    "Investment",
    "Food",
    "Dining",
    "Shopping",
    "Transport",
    "Bills",
    "Utilities",
    "Entertainment",
    "Health",
    "Education",
    "Other",
];

const transactionSchema = z.object({
    merchant: z.string().trim().min(2, "Merchant name must be at least 2 characters"),
    category: z.string().min(1, "Please select a category"),
    amount: z.number().positive("Amount must be greater than 0"),
    date: z.string().min(1, "Please select a date"),
    type: z.enum(["income", "expense"]),
    notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showStatementModal, setShowStatementModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "expense",
            date: new Date().toISOString().split("T")[0],
            category: "Food",
        },
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getTransactions();
            setTransactions(data || []);
        } catch (error) {
            console.error("Failed to load transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onAddSubmit = async (formData: TransactionFormData) => {
        try {
            const created = await createTransaction({
                merchant: formData.merchant,
                category: formData.category,
                amount: Number(formData.amount),
                date: new Date(formData.date).toISOString(),
                type: formData.type,
                notes: formData.notes,
                source: { type: "manual" },
            });
            setTransactions((prev) => [created, ...prev]);
            setShowAddModal(false);
            reset();
            setFeedbackMsg({ text: "Transaction added successfully.", type: "success" });
            setTimeout(() => setFeedbackMsg(null), 4000);
        } catch (err: any) {
            console.error("Add transaction error:", err);
            setFeedbackMsg({ text: err.message || "Failed to add transaction.", type: "error" });
        }
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        if (!window.confirm("Are you sure you want to delete this transaction record?")) return;

        try {
            setDeletingId(id);
            await deleteTransaction(id);
            setTransactions((prev) => prev.filter((t) => (t._id || t.id) !== id));
            setFeedbackMsg({ text: "Transaction removed.", type: "success" });
            setTimeout(() => setFeedbackMsg(null), 3000);
        } catch (err) {
            console.error("Delete error:", err);
            setFeedbackMsg({ text: "Failed to delete transaction.", type: "error" });
        } finally {
            setDeletingId(null);
        }
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const matchSearch =
                (t.merchant || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.notes || "").toLowerCase().includes(searchTerm.toLowerCase());

            const matchType = typeFilter === "all" || t.type === typeFilter;
            const matchCategory = categoryFilter === "all" || (t.category || "").toLowerCase() === categoryFilter.toLowerCase();

            return matchSearch && matchType && matchCategory;
        });
    }, [transactions, searchTerm, typeFilter, categoryFilter]);

    const totalIncome = useMemo(() => {
        return filteredTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    }, [filteredTransactions]);

    const totalExpenses = useMemo(() => {
        return filteredTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    }, [filteredTransactions]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="wm-page-wrapper">
            {/* Page Header */}
            <div className="wm-page-header">
                <div>
                    <h1 className="wm-page-title">Transactions Ledger</h1>
                    <p className="wm-page-subtitle">
                        Inspect, search, and manage all user-verified credits and debits stored in your database.
                    </p>
                </div>

                <div className="wm-header-actions">
                    <button
                        type="button"
                        onClick={() => setShowStatementModal(true)}
                        className="wm-btn-secondary"
                        id="btn-transactions-import"
                    >
                        <FileUp size={16} />
                        <span>Import Statement</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="wm-btn-primary"
                        id="btn-transactions-add"
                    >
                        <Plus size={16} />
                        <span>Add Transaction</span>
                    </button>
                </div>
            </div>

            {/* Feedback Alert */}
            {feedbackMsg && (
                <div className={`wm-alert ${feedbackMsg.type === 'success' ? 'wm-alert-success' : 'wm-alert-error'}`} style={{ marginBottom: "20px" }}>
                    <span>{feedbackMsg.text}</span>
                </div>
            )}

            {/* Metric Overview Bar */}
            <div className="wm-tx-metrics-bar">
                <div className="wm-tx-metric-box">
                    <span className="label">Total Records</span>
                    <span className="value">{filteredTransactions.length}</span>
                </div>
                <div className="wm-tx-metric-divider" />
                <div className="wm-tx-metric-box">
                    <span className="label">Filtered Inflow</span>
                    <span className="value income">+₹{totalIncome.toLocaleString("en-IN")}</span>
                </div>
                <div className="wm-tx-metric-divider" />
                <div className="wm-tx-metric-box">
                    <span className="label">Filtered Outflow</span>
                    <span className="value expense">-₹{totalExpenses.toLocaleString("en-IN")}</span>
                </div>
                <div className="wm-tx-metric-divider" />
                <div className="wm-tx-metric-box">
                    <span className="label">Net Position</span>
                    <span className={`value ${(totalIncome - totalExpenses) >= 0 ? 'income' : 'expense'}`}>
                        ₹{(totalIncome - totalExpenses).toLocaleString("en-IN")}
                    </span>
                </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="wm-table-toolbar">
                <div className="wm-search-input-wrapper">
                    <Search size={16} className="wm-search-icon" />
                    <input
                        type="text"
                        placeholder="Search merchant, category, or note..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="wm-search-input"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="wm-clear-search-btn"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="wm-filter-group">
                    {/* Type Filter */}
                    <div className="wm-segmented-control">
                        <button
                            type="button"
                            className={`wm-seg-btn ${typeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setTypeFilter('all')}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className={`wm-seg-btn ${typeFilter === 'income' ? 'active' : ''}`}
                            onClick={() => setTypeFilter('income')}
                        >
                            Income
                        </button>
                        <button
                            type="button"
                            className={`wm-seg-btn ${typeFilter === 'expense' ? 'active' : ''}`}
                            onClick={() => setTypeFilter('expense')}
                        >
                            Expenses
                        </button>
                    </div>

                    {/* Category Filter */}
                    <div className="wm-select-wrapper">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="wm-select"
                        >
                            <option value="all">All Categories</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Transactions Table / Cards */}
            <div className="wm-card wm-table-card">
                {loading ? (
                    <div className="wm-table-loading">
                        <Loader2 size={24} className="wm-spinner" />
                        <span>Loading transactions from database...</span>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="wm-empty-state-lg">
                        <div className="wm-empty-icon">
                            <ReceiptText size={32} />
                        </div>
                        <h4>No transactions match your criteria</h4>
                        <p>
                            {transactions.length === 0
                                ? "You have not recorded any transactions yet. Start with ₹0 and upload your bank statement PDF to get started."
                                : "No records found matching the active search/filters."}
                        </p>
                        {transactions.length === 0 && (
                            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowStatementModal(true)}
                                    className="wm-btn-primary"
                                >
                                    <FileUp size={16} />
                                    <span>Import PDF Statement</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(true)}
                                    className="wm-btn-secondary"
                                >
                                    <Plus size={16} />
                                    <span>Add Manually</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="wm-table-container">
                        <table className="wm-data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Merchant / Source</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th style={{ textAlign: "right" }}>Amount</th>
                                    <th style={{ textAlign: "center" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((tx) => {
                                    const isIncome = tx.type === "income";
                                    const id = tx._id || tx.id;
                                    return (
                                        <tr key={id || `${tx.merchant}-${tx.date}-${tx.amount}`}>
                                            <td className="wm-td-date">
                                                {formatDate(tx.date || tx.transactionDate)}
                                            </td>
                                            <td className="wm-td-merchant">
                                                <div className="merchant-name">{tx.merchant}</div>
                                                {tx.notes && <div className="merchant-notes">{tx.notes}</div>}
                                            </td>
                                            <td>
                                                <span className="wm-category-badge">{tx.category || "General"}</span>
                                            </td>
                                            <td>
                                                <span className={`wm-type-badge ${isIncome ? 'income' : 'expense'}`}>
                                                    {isIncome ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                    <span>{isIncome ? 'Income' : 'Expense'}</span>
                                                </span>
                                            </td>
                                            <td className={`wm-td-amount ${isIncome ? 'income' : 'expense'}`}>
                                                {isIncome ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString("en-IN")}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(id)}
                                                    disabled={deletingId === id}
                                                    className="wm-row-action-btn delete"
                                                    title="Delete transaction"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Manual Transaction Creation */}
            {showAddModal && (
                <div className="wm-modal-backdrop" onClick={() => setShowAddModal(false)}>
                    <div className="wm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="wm-modal-header">
                            <div>
                                <h3>Add Transaction</h3>
                                <p>Record a verified incoming or outgoing transaction.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="wm-modal-close-btn"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onAddSubmit)} className="wm-modal-form">
                            {/* Type Toggle */}
                            <div className="wm-form-group">
                                <label className="wm-label">Transaction Type</label>
                                <div className="wm-segmented-control" style={{ width: "100%" }}>
                                    <button
                                        type="button"
                                        className={`wm-seg-btn ${register("type").name === "type" ? "" : ""}`}
                                        style={{ flex: 1 }}
                                        onClick={() => reset({ ...register("type"), type: "expense" })}
                                    >
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        className="wm-seg-btn"
                                        style={{ flex: 1 }}
                                        onClick={() => reset({ ...register("type"), type: "income" })}
                                    >
                                        Income
                                    </button>
                                </div>
                            </div>

                            {/* Merchant */}
                            <div className="wm-form-group">
                                <label className="wm-label">Merchant / Source</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Swiggy, Tech Corp Salary, Amazon"
                                    {...register("merchant")}
                                    className={`wm-input ${errors.merchant ? 'wm-input-error' : ''}`}
                                />
                                {errors.merchant && (
                                    <span className="wm-field-error">{errors.merchant.message}</span>
                                )}
                            </div>

                            {/* Amount & Category Grid */}
                            <div className="wm-form-row">
                                <div className="wm-form-group">
                                    <label className="wm-label">Amount (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register("amount", { valueAsNumber: true })}
                                        className={`wm-input ${errors.amount ? 'wm-input-error' : ''}`}
                                    />
                                    {errors.amount && (
                                        <span className="wm-field-error">{errors.amount.message}</span>
                                    )}
                                </div>

                                <div className="wm-form-group">
                                    <label className="wm-label">Category</label>
                                    <select
                                        {...register("category")}
                                        className={`wm-select ${errors.category ? 'wm-input-error' : ''}`}
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="wm-form-group">
                                <label className="wm-label">Date</label>
                                <input
                                    type="date"
                                    {...register("date")}
                                    className={`wm-input ${errors.date ? 'wm-input-error' : ''}`}
                                />
                                {errors.date && (
                                    <span className="wm-field-error">{errors.date.message}</span>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="wm-form-group">
                                <label className="wm-label">Notes (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Optional description or invoice ref..."
                                    {...register("notes")}
                                    className="wm-input"
                                />
                            </div>

                            <div className="wm-modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="wm-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="wm-btn-primary"
                                >
                                    {isSubmitting ? "Saving..." : "Save Transaction"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Bank Statement Import */}
            <BankStatementModal
                isOpen={showStatementModal}
                onClose={() => setShowStatementModal(false)}
                onImportSuccess={(newTxs) => {
                    setTransactions((prev) => [...newTxs, ...prev]);
                    setFeedbackMsg({ text: `Imported ${newTxs.length} transactions successfully.`, type: "success" });
                    setTimeout(() => setFeedbackMsg(null), 4000);
                }}
            />
        </div>
    );
}

export default Transactions;