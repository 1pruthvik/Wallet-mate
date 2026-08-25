const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState >= 1) {
        return;
    }
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/finmitra";
    try {
        const connection = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });

        isConnected = connection.connections[0].readyState;
        console.log(
            `MongoDB connected: ${connection.connection.host}`
        );
    } catch (error) {
        console.warn(
            "MongoDB connection notice:",
            error.message,
            "- Running with mock in-memory fallback for API endpoints."
        );
    }
};

module.exports = connectDB;