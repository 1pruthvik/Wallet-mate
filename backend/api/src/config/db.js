const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/finmitra";
        const connection = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 2000,
        });

        console.log(
            `MongoDB connected: ${connection.connection.host}`
        );
    } catch (error) {
        console.warn(
            "⚠️ MongoDB connection notice:",
            error.message,
            "- Running with in-memory transaction store."
        );
    }
};

module.exports = connectDB;