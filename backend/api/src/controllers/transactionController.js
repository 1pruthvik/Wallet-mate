const Transaction = require("../models/Transaction");

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
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions",
        });
    }
};

/*
 * Create a transaction
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
        console.error(error);

        res.status(400).json({
            success: false,
            message: "Failed to create transaction",
            error: error.message,
        });
    }
};

module.exports = {
    getTransactions,
    createTransaction,
};