const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/finmitra";
    try {
        const connection = await mongoose.connect(uri);
        console.log(
            `MongoDB connected: ${connection.connection.host}`
        );
    } catch (error) {
        console.warn(
            "MongoDB connection warning:",
            error.message,
            "- Running with mock in-memory fallback for API endpoints."
        );
    }
};

module.exports = connectDB;