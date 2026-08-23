const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const transactionRoutes = require("./routes/transactionRoutes");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

/*
 * Middleware
 */

app.use(helmet());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow all localhost origins (5173, 5174, 5175, etc.) or same-origin / tools
            if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
                callback(null, true);
            } else {
                callback(null, true);
            }
        },
        credentials: true,
    })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use(
    "/api/transactions",
    transactionRoutes
);

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "FinMitra API is running",
    });
});

/*
 * API health check
 */

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "FinMitra API",
        status: "healthy",
    });
});

connectDB();

/*
 * Start server
 */

app.listen(PORT, () => {
    console.log(
        `FinMitra API running on http://localhost:${PORT}`
    );
});