const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const {
    getTransactions,
    getTransactionById,
    getTransactionSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    parseStatement,
    importTransactions,
} = require("../controllers/transactionController");

const router = express.Router();

// Configure multer for in-memory statement uploads (max 15MB)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMime = [
            "application/pdf",
            "text/csv",
            "text/plain",
            "application/octet-stream",
        ];
        const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");
        const isCsvExt = file.originalname.toLowerCase().endsWith(".csv");
        const isTxtExt = file.originalname.toLowerCase().endsWith(".txt");

        if (allowedMime.includes(file.mimetype) || isPdfExt || isCsvExt || isTxtExt) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF and CSV bank statements are supported."), false);
        }
    },
});

// All transaction operations require authentication
router.use(authMiddleware);

/*
 * GET /api/transactions
 */
router.get("/", getTransactions);

/*
 * GET /api/transactions/summary
 */
router.get("/summary", getTransactionSummary);

/*
 * GET /api/transactions/:id
 */
router.get("/:id", getTransactionById);

/*
 * POST /api/transactions
 */
router.post("/", createTransaction);

/*
 * PUT /api/transactions/:id
 */
router.put("/:id", updateTransaction);

/*
 * DELETE /api/transactions/:id
 */
router.delete("/:id", deleteTransaction);

/*
 * POST /api/transactions/parse-statement
 */
router.post("/parse-statement", upload.single("statement"), parseStatement);

/*
 * POST /api/transactions/import
 */
router.post("/import", importTransactions);
router.post("/import-pdf", importTransactions);

module.exports = router;