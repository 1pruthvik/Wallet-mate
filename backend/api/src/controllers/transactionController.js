const Transaction = require("../models/Transaction");
const { parseStatementBuffer } = require("../services/statementParser");

/*
 * Get all transactions
 */
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .sort({ date: -1 });

        res.json({
            success: true,
            transactions,
        });
    } catch (error) {
        console.error("Get transactions error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions",
        });
    }
};

/*
 * Create a single transaction
 */
const createTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.create(
            req.body
        );

        res.status(201).json({
            success: true,
            transaction,
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

        const imported = await Transaction.insertMany(formatted);

        res.status(201).json({
            success: true,
            count: imported.length,
            message: `Successfully imported ${imported.length} transactions.`,
            transactions: imported,
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