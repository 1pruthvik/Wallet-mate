const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
<<<<<<< HEAD
            trim: true,
            default: "FinMitra User",
        },
=======
            required: [true, "Full name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"],
        },

>>>>>>> origin/nivish
        email: {
            type: String,
            required: [true, "Email address is required"],
            unique: true,
            lowercase: true,
            trim: true,
<<<<<<< HEAD
            index: true,
        },
=======
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
            index: true,
        },

>>>>>>> origin/nivish
        phoneNumber: {
            type: String,
            trim: true,
            sparse: true,
            index: true,
        },
<<<<<<< HEAD
        passwordHash: {
            type: String,
            select: false,
        },
=======

        passwordHash: {
            type: String,
            select: false, // Never return password hash in regular queries
        },

>>>>>>> origin/nivish
        authProvider: {
            type: String,
            enum: ["email", "phone", "google", "passkey", "sso"],
            default: "email",
        },
<<<<<<< HEAD
=======

>>>>>>> origin/nivish
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
<<<<<<< HEAD
=======

>>>>>>> origin/nivish
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
<<<<<<< HEAD
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
=======

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

>>>>>>> origin/nivish
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

<<<<<<< HEAD
=======
// Method to compare candidate password against hashed password
>>>>>>> origin/nivish
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

<<<<<<< HEAD
=======
// Static helper to hash password securely
>>>>>>> origin/nivish
userSchema.statics.hashPassword = async function (plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
};

module.exports = mongoose.model("User", userSchema);
