const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"],
        },

        email: {
            type: String,
            required: [true, "Email address is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
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
            select: false, // Never return password hash in regular queries
        },

        authProvider: {
            type: String,
            enum: ["email", "phone", "google", "passkey", "sso"],
            default: "email",
        },

        googleId: {
            type: String,
            sparse: true,
            index: true,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        isPhoneVerified: {
            type: Boolean,
            default: false,
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
            timezone: {
                type: String,
                default: "Asia/Kolkata",
            },
            role: {
                type: String,
                default: "Standard Member",
            },
        },

        preferences: {
            currency: {
                type: String,
                default: "INR",
            },
            notifications: {
                type: Boolean,
                default: true,
            },
            darkMode: {
                type: Boolean,
                default: false,
            },
        },

        lastLoginAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        collection: "users",
    }
);

// Method to compare candidate password against hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash password securely
userSchema.statics.hashPassword = async function (plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
};

module.exports = mongoose.model("User", userSchema);
