const mongoose = require("mongoose");

let isConnecting = false;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    if (isConnecting) {
        return;
    }

    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/finmitra";
    isConnecting = true;

    try {
        const connection = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Atlas connected successfully: ${connection.connection.host}`);
    } catch (error) {
        console.warn(
            `⚠️ MongoDB connection warning: ${error.message}. If running on Render, verify that IP 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.`
        );
    } finally {
        isConnecting = false;
    }
};

// Monitor connection events
mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected. Reconnection will be attempted on next request.");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message);
});

module.exports = connectDB;
