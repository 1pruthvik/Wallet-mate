const mongoose = require("mongoose");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const { parseStatementBuffer } = require("../services/statementParser");

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// In-memory fallback per user if MongoDB is disconnected
let inMemoryTransactions = [];

// Helper to compute deterministic transaction hash for deduplication
const computeTransactionHash = (userId, dateStr, merchant, amount, type, referenceNumber, description) => {
    const dStr = dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";
    const raw = `${userId}_${dStr}_${merchant}_${Number(amount)}_${type}_${referenceNumber || description || ""}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
};

/*
 * GET /api/transactions
 * Retrieve all transactions belonging strictly to the authenticated user
 */
const getTransactions = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required",
            });
        }

        if (isDbConnected()) {
            const transactions = await Transaction.find({ userId })
                .sort({ date: -1, transactionDate: -1, createdAt: -1 });

            return res.json({
                success: true,
                count: transactions.length,
                transactions,
            });
        }

        // In-memory user-filtered transactions
        const userTxs = inMemoryTransactions.filter(
            (tx) => tx.userId?.toString() === userId.toString()
        );

        return res.json({
            success: true,
            count: userTxs.length,
            transactions: userTxs,
        });
    } catch (error) {
        console.error("Get transactions error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch transactions",
            error: error.message,
        });
    }
};

/*
 * GET /api/transactions/:id
 * Retrieve a specific transaction with ownership check
 */
const getTransactionById = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID format",
            });
        }

        if (isDbConnected()) {
            const transaction = await Transaction.findOne({ _id: id, userId });
            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: "Transaction not found or access denied.",
                });
            }

            return res.json({
                success: true,
                transaction,
            });
        }

        const tx = inMemoryTransactions.find(
            (t) => t._id?.toString() === id && t.userId?.toString() === userId.toString()
        );

        if (!tx) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        return res.json({
            success: true,
            transaction: tx,
        });
    } catch (error) {
        console.error("Get transaction by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch transaction",
            error: error.message,
        });
    }
};

/*
 * POST /api/transactions
 * Create a single transaction linked to authenticated user
 */
const createTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const {
            merchant,
            amount,
            type,
            category,
            date,
            transactionDate,
            description,
            paymentMethod,
            accountNumberMasked,
            referenceNumber,
            balanceAfterTransaction,
            notes,
        } = req.body;

        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Transaction amount must be greater than zero.",
            });
        }

        if (!merchant || !merchant.trim()) {
            return res.status(400).json({
                success: false,
                message: "Merchant name is required.",
            });
        }

        const targetDate = date ? new Date(date) : (transactionDate ? new Date(transactionDate) : new Date());
        const targetType = type === "income" ? "income" : "expense";
        const targetCategory = (category || "Other").trim();
        const targetDescription = (description || merchant).trim();

        const hash = computeTransactionHash(
            userId.toString(),
            targetDate.toISOString(),
            merchant.trim(),
            numAmount,
            targetType,
            referenceNumber,
            targetDescription
        );

        if (isDbConnected()) {
            // Deduplication check
            const duplicate = await Transaction.findOne({ userId, transactionHash: hash });
            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: "A duplicate transaction already exists for this date, merchant, and amount.",
                    transaction: duplicate,
                });
            }

            const transaction = await Transaction.create({
                userId,
                source: {
                    type: "manual",
                    fileName: "",
                },
                transactionDate: targetDate,
                date: targetDate,
                description: targetDescription,
                merchant: merchant.trim(),
                type: targetType,
                category: targetCategory,
                amount: numAmount,
                currency: "INR",
                paymentMethod: paymentMethod || "UPI",
                accountNumberMasked: accountNumberMasked || "",
                referenceNumber: referenceNumber || "",
                balanceAfterTransaction: balanceAfterTransaction ? Number(balanceAfterTransaction) : null,
                transactionHash: hash,
                notes: notes || "",
            });

            return res.status(201).json({
                success: true,
                message: "Transaction created successfully.",
                transaction,
            });
        }

        // In-memory fallback
        const newTx = {
            _id: new mongoose.Types.ObjectId(),
            userId,
            source: { type: "manual" },
            transactionDate: targetDate,
            date: targetDate,
            description: targetDescription,
            merchant: merchant.trim(),
            type: targetType,
            category: targetCategory,
            amount: numAmount,
            currency: "INR",
            paymentMethod: paymentMethod || "UPI",
            transactionHash: hash,
            createdAt: new Date(),
        };

        inMemoryTransactions.unshift(newTx);

        return res.status(201).json({
            success: true,
            message: "Transaction created successfully.",
            transaction: newTx,
        });
    } catch (error) {
        console.error("Create transaction error:", error);
        return res.status(400).json({
            success: false,
            message: "Failed to create transaction",
            error: error.message,
        });
    }
};

/*
 * PUT /api/transactions/:id
 * Update an existing transaction with ownership verification
 */
const updateTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID format",
            });
        }

        if (isDbConnected()) {
            const updated = await Transaction.findOneAndUpdate(
                { _id: id, userId },
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Transaction not found or access denied.",
                });
            }

            return res.json({
                success: true,
                message: "Transaction updated successfully.",
                transaction: updated,
            });
        }

        const index = inMemoryTransactions.findIndex(
            (t) => t._id?.toString() === id && t.userId?.toString() === userId.toString()
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found or access denied.",
            });
        }

        inMemoryTransactions[index] = {
            ...inMemoryTransactions[index],
            ...req.body,
            updatedAt: new Date(),
        };

        return res.json({
            success: true,
            message: "Transaction updated successfully.",
            transaction: inMemoryTransactions[index],
        });
    } catch (error) {
        console.error("Update transaction error:", error);
        return res.status(400).json({
            success: false,
            message: "Failed to update transaction",
            error: error.message,
        });
    }
};

/*
 * DELETE /api/transactions/:id
 * Delete a transaction with strict ownership check
 */
const deleteTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID format",
            });
        }

        if (isDbConnected()) {
            const deleted = await Transaction.findOneAndDelete({ _id: id, userId });
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Transaction not found or access denied.",
                });
            }

            return res.json({
                success: true,
                message: "Transaction deleted successfully.",
            });
        }

        const prevLen = inMemoryTransactions.length;
        inMemoryTransactions = inMemoryTransactions.filter(
            (t) => !(t._id?.toString() === id && t.userId?.toString() === userId.toString())
        );

        if (inMemoryTransactions.length === prevLen) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found or access denied.",
            });
        }

        return res.json({
            success: true,
            message: "Transaction deleted successfully.",
        });
    } catch (error) {
        console.error("Delete transaction error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete transaction",
            error: error.message,
        });
    }
};

/*
 * POST /api/transactions/parse-statement
 * Parse uploaded PDF bank statement and return extracted preview records
 */
const parseStatement = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No statement file uploaded. Please upload a valid PDF bank statement.",
            });
        }

        const buffer = req.file.buffer;
        const mimetype = req.file.mimetype;
        const originalname = req.file.originalname;

        const result = await parseStatementBuffer(buffer, mimetype, originalname);

        return res.json({
            success: true,
            count: result.transactions.length,
            pagesProcessed: result.pagesProcessed || 1,
            fileName: result.fileName || originalname,
            transactions: result.transactions,
        });
    } catch (error) {
        console.error("Statement parsing error:", error);
        return res.status(422).json({
            success: false,
            message: error.message || "Failed to process the bank statement PDF.",
        });
    }
};

/*
 * POST /api/transactions/import
 * Batch import extracted PDF transactions into MongoDB with user ownership and deduplication
 */
const importTransactions = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to import transactions.",
            });
        }

        const { transactions, fileName } = req.body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No transactions provided for import.",
            });
        }

        let newCount = 0;
        let duplicateCount = 0;
        const documentsToInsert = [];

        // 1. Fetch existing hashes for this user to check duplicates
        let existingHashSet = new Set();
        if (isDbConnected()) {
            const existing = await Transaction.find({ userId }).select("transactionHash");
            existingHashSet = new Set(existing.map((t) => t.transactionHash).filter(Boolean));
        } else {
            inMemoryTransactions
                .filter((t) => t.userId?.toString() === userId.toString())
                .forEach((t) => {
                    if (t.transactionHash) existingHashSet.add(t.transactionHash);
                });
        }

        // 2. Prepare and deduplicate transactions
        for (const t of transactions) {
            const amount = Math.abs(Number(t.amount)) || 0;
            if (amount <= 0) continue;

            const merchant = (t.merchant || "Unknown Merchant").trim();
            const type = t.type === "income" ? "income" : "expense";
            const category = (t.category || "Other").trim();
            const dateObj = t.date ? new Date(t.date) : new Date();
            const description = (t.description || merchant).trim();
            const referenceNumber = (t.referenceNumber || "").trim();

            const hash = computeTransactionHash(
                userId.toString(),
                dateObj.toISOString(),
                merchant,
                amount,
                type,
                referenceNumber,
                description
            );

            if (existingHashSet.has(hash)) {
                duplicateCount++;
                continue;
            }

            existingHashSet.add(hash);
            newCount++;

            documentsToInsert.push({
                userId,
                source: {
                    type: "pdf",
                    fileName: fileName || "bank_statement.pdf",
                },
                transactionDate: dateObj,
                date: dateObj,
                description,
                merchant,
                type,
                category,
                amount,
                currency: "INR",
                paymentMethod: t.paymentMethod || "Bank Transfer",
                accountNumberMasked: t.accountNumberMasked || "",
                referenceNumber,
                balanceAfterTransaction: t.balanceAfterTransaction ? Number(t.balanceAfterTransaction) : null,
                transactionHash: hash,
                status: "completed",
            });
        }

        // 3. Save to MongoDB
        if (isDbConnected() && documentsToInsert.length > 0) {
            const inserted = await Transaction.insertMany(documentsToInsert);
            return res.status(201).json({
                success: true,
                message: `Import complete. ${newCount} new transactions added, ${duplicateCount} duplicates skipped.`,
                data: {
                    fileName: fileName || "statement.pdf",
                    totalExtracted: transactions.length,
                    newTransactions: newCount,
                    duplicatesSkipped: duplicateCount,
                    transactions: inserted,
                },
                transactions: inserted,
            });
        }

        // In-memory fallback
        if (documentsToInsert.length > 0) {
            const inMemDocs = documentsToInsert.map((d) => ({
                ...d,
                _id: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
            }));
            inMemoryTransactions = [...inMemDocs, ...inMemoryTransactions];

            return res.status(201).json({
                success: true,
                message: `Import complete. ${newCount} new transactions added, ${duplicateCount} duplicates skipped.`,
                data: {
                    fileName: fileName || "statement.pdf",
                    totalExtracted: transactions.length,
                    newTransactions: newCount,
                    duplicatesSkipped: duplicateCount,
                    transactions: inMemDocs,
                },
                transactions: inMemDocs,
            });
        }

        return res.json({
            success: true,
            message: `All ${transactions.length} transactions were already imported (skipped duplicates).`,
            data: {
                fileName: fileName || "statement.pdf",
                totalExtracted: transactions.length,
                newTransactions: 0,
                duplicatesSkipped: duplicateCount,
                transactions: [],
            },
            transactions: [],
        });
    } catch (error) {
        console.error("Import transactions error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to import transactions.",
            error: error.message,
        });
    }
};

/*
 * GET /api/transactions/summary
 * Dynamically computes real financial metrics strictly from authenticated user's stored transactions
 */
const getTransactionSummary = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        let userTransactions = [];
        if (isDbConnected()) {
            userTransactions = await Transaction.find({ userId }).sort({ date: -1 });
        } else {
            userTransactions = inMemoryTransactions.filter(
                (tx) => tx.userId?.toString() === userId.toString()
            );
        }

        if (!userTransactions || userTransactions.length === 0) {
            return res.json({
                success: true,
                summary: {
                    totalBalance: 0,
                    totalIncome: 0,
                    totalExpenses: 0,
                    monthlyIncome: 0,
                    monthlyExpenses: 0,
                    monthlySavings: 0,
                    savingsRate: 0,
                    totalTransactions: 0,
                    categoryBreakdown: [],
                    monthlyTrend: [],
                },
            });
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let totalIncome = 0;
        let totalExpenses = 0;
        let monthlyIncome = 0;
        let monthlyExpenses = 0;

        const categoryMap = {};
        const monthTotals = {};
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        for (const t of userTransactions) {
            const amt = Number(t.amount) || 0;
            const isIncome = t.type === "income";
            const txDate = t.date ? new Date(t.date) : (t.transactionDate ? new Date(t.transactionDate) : null);
            const isValidDate = txDate && !isNaN(txDate.getTime());

            if (isIncome) {
                totalIncome += amt;
                if (isValidDate && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                    monthlyIncome += amt;
                }
            } else {
                totalExpenses += amt;
                if (isValidDate && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                    monthlyExpenses += amt;
                }

                // Category breakdown for expenses
                const cat = (t.category || "Other").trim();
                if (!categoryMap[cat]) {
                    categoryMap[cat] = { total: 0, count: 0 };
                }
                categoryMap[cat].total += amt;
                categoryMap[cat].count += 1;

                // Monthly trend
                if (isValidDate) {
                    const mName = txDate.toLocaleString("en-US", { month: "short" });
                    monthTotals[mName] = (monthTotals[mName] || 0) + amt;
                }
            }
        }

        const totalBalance = totalIncome - totalExpenses;
        const monthlySavings = monthlyIncome - monthlyExpenses;
        const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

        const categoryBreakdown = Object.entries(categoryMap)
            .map(([category, data]) => ({
                category,
                total: data.total,
                count: data.count,
                percentage: totalExpenses > 0 ? Math.round((data.total / totalExpenses) * 100) : 0,
            }))
            .sort((a, b) => b.total - a.total);

        const monthlyTrend = monthOrder
            .filter((m) => monthTotals[m] !== undefined)
            .map((month) => ({
                month,
                spending: monthTotals[month],
            }));

        return res.json({
            success: true,
            summary: {
                totalBalance,
                totalIncome,
                totalExpenses,
                monthlyIncome,
                monthlyExpenses,
                monthlySavings,
                savingsRate,
                totalTransactions: userTransactions.length,
                categoryBreakdown,
                monthlyTrend,
            },
        });
    } catch (error) {
        console.error("Get transaction summary error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to calculate transaction summary",
            error: error.message,
        });
    }
};

module.exports = {
    getTransactions,
    getTransactionById,
    getTransactionSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    parseStatement,
    importTransactions,
};