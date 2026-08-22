const express = require("express");

const router = express.Router();

/*
 * GET /api/transactions
 */

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Transactions endpoint is working",
        transactions: [],
    });
});

module.exports = router;