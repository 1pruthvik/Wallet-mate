const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            default: "FinMitra User",
        },
        email: {
            type: String,
            required: [true, "Email address is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            sparse: true,
            index: true,
        },
        passwordHash: {
            type: String,
            select: false,
        },
        authProvider: {
            type: String,
            enum: ["email", "phone", "google", "passkey", "sso"],
            default: "email",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
        consent_version: {
            type: String,
            default: "1.0",
        },
        data_permissions: {
            gmail_read: { type: Boolean, default: false },
            sms_read: { type: Boolean, default: false },
            csv_import: { type: Boolean, default: true },
            manual_input: { type: Boolean, default: true },
        },
        status: {
            type: String,
            enum: ["active", "suspended", "pending"],
            default: "active",
        },
        profile: {
            avatar: {
                type: String,
                default: "",
            },
            currency: {
                type: String,
                default: "INR",
            },
            role: {
                type: String,
                default: "Standard Member",
            },
        },
        lastLoginAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
