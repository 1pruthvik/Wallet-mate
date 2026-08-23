const mongoose = require("mongoose");
const crypto = require("crypto");

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Transaction must belong to a user"],
            index: true,
        },

        source: {
            type: {
                type: String,
                enum: ["pdf", "manual", "csv", "api"],
                default: "pdf",
            },
            fileName: {
                type: String,
                default: "",
            },
            statementPeriod: {
                from: { type: Date },
                to: { type: Date },
            },
        },

        transactionDate: {
            type: Date,
            required: [true, "Transaction date is required"],
            index: true,
        },

        // Alias date field for frontend compatibility
        date: {
            type: Date,
            required: [true, "Date is required"],
            index: true,
        },

        description: {
            type: String,
            required: [true, "Transaction description is required"],
            trim: true,
        },

        merchant: {
            type: String,
            required: [true, "Merchant or counterparty name is required"],
            trim: true,
        },

        type: {
            type: String,
            enum: ["income", "expense", "transfer", "refund"],
            required: [true, "Transaction type is required"],
            index: true,
        },

        category: {
            type: String,
            required: [true, "Transaction category is required"],
            trim: true,
            index: true,
        },

        amount: {
            type: Number,
            required: [true, "Transaction amount is required"],
            min: [0.01, "Amount must be greater than zero"],
        },

        currency: {
            type: String,
            default: "INR",
            trim: true,
        },

        paymentMethod: {
            type: String,
            default: "Bank Transfer",
            trim: true,
        },

        accountNumberMasked: {
            type: String,
            default: "",
            trim: true,
        },

        referenceNumber: {
            type: String,
            default: "",
            trim: true,
        },

        balanceAfterTransaction: {
            type: Number,
            default: null,
        },

        transactionHash: {
            type: String,
            index: true,
        },

        status: {
            type: String,
            enum: ["completed", "pending", "failed"],
            default: "completed",
        },

        notes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
        collection: "transactions",
    }
);

// Pre-save hook to compute deterministic deduplication hash if not provided
transactionSchema.pre("save", function () {
    if (!this.date && this.transactionDate) {
        this.date = this.transactionDate;
    }
    if (!this.transactionDate && this.date) {
        this.transactionDate = this.date;
    }

    if (!this.transactionHash) {
        const dateIso = this.transactionDate ? this.transactionDate.toISOString().split("T")[0] : "";
        const raw = `${this.userId}_${dateIso}_${this.merchant}_${this.amount}_${this.type}_${this.referenceNumber || this.description}`;
        this.transactionHash = crypto.createHash("sha256").update(raw).digest("hex");
    }
});

// Compound indexes for user query performance & fast deduplication
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, transactionHash: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);