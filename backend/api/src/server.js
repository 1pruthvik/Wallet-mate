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
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow all origins (localhost, onrender.com, vercel.app, custom domains)
            callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-auth-token"],
    })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(morgan("dev"));

// Ensure DB Connection Middleware for all requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
    } catch (err) {
        console.error("MongoDB connection middleware error:", err.message);
    }
    next();
});

// Initial DB Connection Attempt on startup
connectDB();

/*
 * Health Checks & Root
 */
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Wallet-Mate API is running",
        version: "2.0.0",
        database: mongoose.connection?.readyState === 1 ? "connected" : "fallback_in_memory",
        collections: ["users", "transactions", "academy_progress"],
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "Wallet-Mate API",
        status: "healthy",
        database: mongoose.connection?.readyState === 1 ? "connected" : "fallback_in_memory",
        timestamp: new Date().toISOString(),
    });
});

/*
 * API Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/academy", academyRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

if (require.main === module) {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Wallet-Mate API running on port ${PORT}`);
    });
}

module.exports = app;