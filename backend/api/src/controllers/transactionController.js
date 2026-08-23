const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const { parseStatementBuffer } = require("../services/statementParser");

// In-memory transaction seed for smooth local development without MongoDB requirement
let inMemoryTransactions = [
    {
        _id: "tx_mock_01",
        merchant: "Tech Corp Inc (Salary)",
        amount: 85000,
        type: "income",
        category: "Salary",
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        description: "Monthly salary credit",
    },
    {
        _id: "tx_mock_02",
        merchant: "Swiggy",
        amount: 640,
        type: "expense",
        category: "Food",
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        description: "Dinner order",
    },
    {
        _id: "tx_mock_03",
        merchant: "Amazon.in",
        amount: 2499,
        type: "expense",
        category: "Shopping",
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        description: "Electronics & Accessories",
    },
    {
        _id: "tx_mock_04",
        merchant: "Cult.fit",
        amount: 1499,
        type: "expense",
        category: "Health",
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        description: "Monthly Fitness pass",
    },
    {
        _id: "tx_mock_05",
        merchant: "Upstox / Zerodha SIP",
        amount: 10000,
        type: "expense",
        category: "Investment",
        date: new Date(Date.now() - 6 * 86400000).toISOString(),
        description: "Nifty 50 Index Fund SIP",
    },
    {
        _id: "tx_mock_06",
        merchant: "Shell Fuel Station",
        amount: 2100,
        type: "expense",
        category: "Transport",
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        description: "Petrol refill",
    },
    {
        _id: "tx_mock_07",
        merchant: "Freelance Client UI Project",
        amount: 24500,
        type: "income",
        category: "Freelance",
        date: new Date(Date.now() - 10 * 86400000).toISOString(),
        description: "Design consultation payout",
    },
    {
        _id: "tx_mock_08",
        merchant: "Netflix",
        amount: 499,
        type: "expense",
        category: "Entertainment",
        date: new Date(Date.now() - 12 * 86400000).toISOString(),
        description: "Monthly Subscription",
    }
];

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

/*
 * Get all transactions
 */
const getTransactions = async (req, res) => {
    try {
        if (isDbConnected()) {
            const transactions = await Transaction.find().sort({ date: -1 });
            return res.json({
                success: true,
                transactions,
            });
        }

        // Return in-memory transactions if MongoDB is not active
        return res.json({
            success: true,
            transactions: inMemoryTransactions,
        });
    } catch (error) {
        console.error("Get transactions fallback error:", error);
        return res.json({
            success: true,
            transactions: inMemoryTransactions,
        });
    }
};

/*
 * Create a single transaction
 */
const createTransaction = async (req, res) => {
    try {
        if (isDbConnected()) {
            const transaction = await Transaction.create(req.body);
            return res.status(201).json({
                success: true,
                transaction,
            });
        }

        const newTx = {
            _id: `tx_${Date.now()}`,
            merchant: req.body.merchant || "Unknown Merchant",
            amount: Number(req.body.amount) || 0,
            type: req.body.type === "income" ? "income" : "expense",
            category: req.body.category || "General",
            date: req.body.date ? new Date(req.body.date).toISOString() : new Date().toISOString(),
            description: req.body.description || "",
        };

        inMemoryTransactions.unshift(newTx);

        return res.status(201).json({
            success: true,
            transaction: newTx,
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
 * Batch import verified transactions into MongoDB / In-memory
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

        const formatted = transactions.map((t) => ({
            merchant: t.merchant || "Unknown Merchant",
            amount: Number(t.amount) || 0,
            type: t.type === "income" ? "income" : "expense",
            category: t.category || "Other",
            date: t.date ? new Date(t.date) : new Date(),
            description: t.description || "",
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

        const withIds = formatted.map((tx, idx) => ({
            ...tx,
            _id: `tx_imported_${Date.now()}_${idx}`,
            date: tx.date.toISOString(),
        }));

        inMemoryTransactions = [...withIds, ...inMemoryTransactions];

        return res.status(201).json({
            success: true,
            count: withIds.length,
            message: `Successfully imported ${withIds.length} transactions.`,
            transactions: withIds,
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