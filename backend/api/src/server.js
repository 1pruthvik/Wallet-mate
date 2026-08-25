const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const academyRoutes = require("./routes/academyRoutes");
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
            // Allow all localhost dev origins (5173, 5174, 5175, etc.) or same-origin
            if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
                callback(null, true);
            } else {
                callback(null, true);
            }
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(morgan("dev"));

/*
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/academy", academyRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Wallet-Mate API is running",
        version: "2.0.0",
        collections: ["users", "transactions"],
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "Wallet-Mate API",
        status: "healthy",
        database: "MongoDB (users, transactions)",
    });
});

// Connect to MongoDB
connectDB();

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Wallet-Mate API running on http://localhost:${PORT}`);
    });
}

module.exports = app;