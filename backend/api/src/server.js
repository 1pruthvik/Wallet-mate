const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
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
        origin: "http://localhost:5173",
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

/*
 * Start server
 */

app.listen(PORT, () => {
    console.log(
        `FinMitra API running on http://localhost:${PORT}`
    );
});