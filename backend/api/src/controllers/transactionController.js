const Transaction = require("../models/Transaction");
const { parseStatementBuffer } = require("../services/statementParser");

const initialMockTransactions = [
    { _id: "txn1", merchant: "Swiggy", amount: 799, type: "expense", category: "Food & Dining", date: new Date("2026-08-22"), description: "UPI payment to Swiggy" },
    { _id: "txn2", merchant: "Amazon", amount: 1299, type: "expense", category: "Shopping", date: new Date("2026-08-22"), description: "UPI payment to Amazon" },
    { _id: "txn3", merchant: "Employer Inc", amount: 50000, type: "income", category: "Salary", date: new Date("2026-08-21"), description: "Monthly Salary NEFT" },
    { _id: "txn4", merchant: "ATM Cash", amount: 1500, type: "expense", category: "Cash Withdrawal", date: new Date("2026-08-20"), description: "ATM withdrawal" },
    { _id: "txn5", merchant: "HDFC Bank EMI", amount: 8000, type: "expense", category: "Bills & Utilities", date: new Date("2026-08-19"), description: "Monthly Loan EMI" },
];

let memoryTransactions = [...initialMockTransactions];

/*
 * Get all transactions
 */
const getTransactions = async (req, res) => {
    try {
        if (require("mongoose").connection.readyState === 1) {
            const transactions = await Transaction.find().sort({ date: -1 });
            return res.json({
                success: true,
                transactions,
            });
        }
        res.json({
            success: true,
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
 * Create a single transaction
 */
const createTransaction = async (req, res) => {
    try {
        if (require("mongoose").connection.readyState === 1) {
            const transaction = await Transaction.create(req.body);
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
            error: error.message,
        });
    }
};

/*
 * Parse bank statement PDF/file and return extracted transactions for preview
 */
const parseStatement = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No statement file uploaded. Please upload a PDF bank statement.",
            });
        }

        const buffer = req.file.buffer;
        const mimetype = req.file.mimetype;
        const originalname = req.file.originalname;

        const transactions = await parseStatementBuffer(buffer, mimetype, originalname);

        res.json({
            success: true,
            count: transactions.length,
            fileName: originalname,
            transactions,
        });
    } catch (error) {
        console.error("Statement parsing error:", error);

        res.status(422).json({
            success: false,
            message: error.message || "Failed to process the bank statement.",
        });
    }
};

/*
 * Batch import verified transactions into MongoDB
 */
const importTransactions = async (req, res) => {
    try {
        const { transactions } = req.body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No transactions provided for import.",
            });
        }

        // Validate and clean each transaction before insertion
        const formatted = transactions.map((t) => ({
            merchant: t.merchant || "Unknown Merchant",
            amount: Number(t.amount) || 0,
            type: t.type === "income" ? "income" : "expense",
            category: t.category || "Other",
            date: t.date ? new Date(t.date) : new Date(),
            description: t.description || "",
        }));

        if (require("mongoose").connection.readyState === 1) {
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
            message: "Failed to import transactions to database.",
            error: error.message,
        });
    }
};

module.exports = {
    getTransactions,
    createTransaction,
    parseStatement,
    importTransactions,
};