const express = require("express");
const multer = require("multer");

const {
    getTransactions,
    createTransaction,
    parseStatement,
    importTransactions,
} = require("../controllers/transactionController");

const router = express.Router();

// Configure multer for in-memory statement uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB max
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

/*
 * GET /api/transactions
 */
router.get("/", getTransactions);

/*
 * POST /api/transactions
 */
router.post("/", createTransaction);

/*
 * POST /api/transactions/parse-statement
 */
router.post("/parse-statement", upload.single("statement"), parseStatement);

/*
 * POST /api/transactions/import
 */
router.post("/import", importTransactions);

module.exports = router;