const express = require("express");

const {
    getTransactions,
    createTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

/*
 * GET /api/transactions
 */
router.get("/", getTransactions);

/*
 * POST /api/transactions
 */
router.post("/", createTransaction);

module.exports = router;