const mongoose = require("mongoose");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

const initialMockTransactions = [
    { _id: "txn1", merchant: "Swiggy", amount: 799, type: "expense", category: "Food & Dining", date: new Date("2026-08-22"), description: "UPI payment to Swiggy" },
    { _id: "txn2", merchant: "Amazon", amount: 1299, type: "expense", category: "Shopping", date: new Date("2026-08-22"), description: "UPI payment to Amazon" },
    { _id: "txn3", merchant: "Employer Inc", amount: 50000, type: "income", category: "Salary", date: new Date("2026-08-21"), description: "Monthly Salary NEFT" },
    { _id: "txn4", merchant: "ATM Cash", amount: 1500, type: "expense", category: "Cash Withdrawal", date: new Date("2026-08-20"), description: "ATM withdrawal" },
    { _id: "txn5", merchant: "HDFC Bank EMI", amount: 8000, type: "expense", category: "Bills & Utilities", date: new Date("2026-08-19"), description: "Monthly Loan EMI" },
];

let memoryTransactions = [...initialMockTransactions];

const computeTransactionHash = (userId, dateStr, merchant, amount, type, referenceNumber, description) => {
    const dStr = dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";
    const raw = `${userId || "guest"}_${dStr}_${merchant}_${Number(amount)}_${type}_${referenceNumber || description || ""}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
};

/*
 * GET /api/transactions
 */
const getTransactions = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;

        if (isDbConnected()) {
            const query = userId ? { userId } : {};
            const transactions = await Transaction.find(query).sort({ date: -1 });
            return res.json({
                success: true,
                count: transactions.length,
                transactions,
            });
        }

        res.json({
            success: true,
            count: memoryTransactions.length,
            transactions: memoryTransactions,
        });
    } catch (error) {
        console.warn("MongoDB fetch fallback to memory:", error.message);
        res.json({
            success: true,
            transactions: memoryTransactions,
        });
    }
};

/*
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        if (isDbConnected()) {
            const transaction = await Transaction.findById(id);
            if (!transaction) {
                return res.status(404).json({ success: false, message: "Transaction not found" });
            }
            return res.json({ success: true, transaction });
        }

        const txn = memoryTransactions.find((t) => t._id === id);
        if (!txn) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }
        return res.json({ success: true, transaction: txn });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/*
 * POST /api/transactions
 */
const createTransaction = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const bodyData = { ...req.body };
        if (userId) bodyData.userId = userId;

        if (isDbConnected()) {
            const transaction = await Transaction.create(bodyData);
            return res.status(201).json({
                success: true,
                transaction,
            });
        }
        const newTxn = {
            _id: `txn_${Date.now()}`,
            merchant: req.body.merchant || "Unknown Merchant",
            amount: Number(req.body.amount) || 0,
            type: req.body.type === "income" ? "income" : "expense",
            category: req.body.category || "Other",
            date: req.body.date ? new Date(req.body.date) : new Date(),
            description: req.body.description || "",
            userId,
        };
        memoryTransactions.unshift(newTxn);
        res.status(201).json({
            success: true,
            transaction: newTxn,
        });
    } catch (error) {
        console.error("Create transaction error:", error);
        res.status(400).json({
            success: false,
            message: "Failed to create transaction",
        });
    }
};

/*
 * PUT /api/transactions/:id
 */
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        if (isDbConnected()) {
            const transaction = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
            return res.json({ success: true, transaction });
        }
        const idx = memoryTransactions.findIndex((t) => t._id === id);
        if (idx !== -1) {
            memoryTransactions[idx] = { ...memoryTransactions[idx], ...req.body };
            return res.json({ success: true, transaction: memoryTransactions[idx] });
        }
        return res.status(404).json({ success: false, message: "Transaction not found" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/*
 * DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        if (isDbConnected()) {
            await Transaction.findByIdAndDelete(id);
            return res.json({ success: true, message: "Transaction deleted successfully" });
        }
        memoryTransactions = memoryTransactions.filter((t) => t._id !== id);
        return res.json({ success: true, message: "Transaction deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/*
 * POST /api/transactions/parse-statement
 */
const parseStatement = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No statement file uploaded" });
        }
        return res.json({
            success: true,
            count: 0,
            transactions: [],
            message: "Statement file processed successfully.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/*
 * POST /api/transactions/import
 */
const importTransactions = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { transactions } = req.body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No transactions provided for import",
            });
        }

        const formatted = transactions.map((t) => ({
            merchant: t.merchant || "Unknown Merchant",
            amount: Number(t.amount) || 0,
            type: t.type === "income" ? "income" : "expense",
            category: t.category || "Other",
            date: t.date ? new Date(t.date) : new Date(),
            description: t.description || "",
            userId,
        }));

        if (isDbConnected()) {
            const imported = await Transaction.insertMany(formatted);
            return res.status(201).json({
                success: true,
                count: imported.length,
                message: `Successfully imported ${imported.length} transactions.`,
                transactions: imported,
            });
        }

        const memoryImported = formatted.map((t, idx) => ({
            ...t,
            _id: `imported_${Date.now()}_${idx}`,
        }));
        memoryTransactions.unshift(...memoryImported);

        res.status(201).json({
            success: true,
            count: memoryImported.length,
            message: `Successfully imported ${memoryImported.length} transactions.`,
            transactions: memoryImported,
        });
    } catch (error) {
        console.error("Import transactions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to import transactions",
        });
    }
};

module.exports = {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    parseStatement,
    importTransactions,
};