const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const {
    normalizePhoneNumber,
    maskPhoneNumber,
    sendVerificationCode,
    checkVerificationCode,
    resendVerificationCode,
} = require("../services/smsService");

const JWT_SECRET = process.env.JWT_SECRET || "finmitra_secure_jwt_secret_key_2026";

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

let inMemoryUsers = [];

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id ? user._id.toString() : user.id,
            id: user._id ? user._id.toString() : user.id,
            email: user.email,
            name: user.fullName || user.name,
            phone: user.phoneNumber || user.phone,
            role: user.profile?.role || "Standard Member",
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};

/*
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { fullName, name, email, password, phone, phoneNumber } = req.body;
        const targetName = (fullName || name || "").trim();
        const targetEmail = (email || "").trim().toLowerCase();
        const rawPhone = (phoneNumber || phone || "").trim();
        const targetPhone = rawPhone ? normalizePhoneNumber(rawPhone) : undefined;

        if (!targetName || targetName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please enter your full name (minimum 2 characters).",
            });
        }

        if (!targetEmail || !targetEmail.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long.",
            });
        }

        if (isDbConnected()) {
            const existingEmail = await User.findOne({ email: targetEmail });
            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email is already registered. Please sign in.",
                });
            }

            if (targetPhone) {
                const existingPhone = await User.findOne({ phoneNumber: targetPhone });
                if (existingPhone) {
                    return res.status(409).json({
                        success: false,
                        message: "This phone number is already registered to another account. Please sign in.",
                    });
                }
            }

            const passwordHash = await User.hashPassword(password);

            const newUser = await User.create({
                fullName: targetName,
                email: targetEmail,
                phoneNumber: targetPhone,
                passwordHash,
                authProvider: "email",
                isEmailVerified: false,
                isPhoneVerified: false,
                profile: {
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetEmail}`,
                    currency: "INR",
                    role: "Standard Member",
                },
                lastLoginAt: new Date(),
            });

            const token = generateToken(newUser);
            const userObj = newUser.toObject();
            delete userObj.passwordHash;

            return res.status(201).json({
                success: true,
                message: "FinMitra account created successfully.",
                token,
                user: {
                    id: userObj._id.toString(),
                    name: userObj.fullName,
                    email: userObj.email,
                    phone: userObj.phoneNumber,
                    avatar: userObj.profile?.avatar,
                    role: userObj.profile?.role,
                    authProvider: userObj.authProvider,
                    isPhoneVerified: userObj.isPhoneVerified,
                    createdAt: userObj.createdAt,
                },
            });
        }

        // Fallback in-memory
        const existingMem = inMemoryUsers.find((u) => u.email === targetEmail);
        if (existingMem) {
            return res.status(409).json({
                success: false,
                message: "An account with this email is already registered.",
            });
        }

        const memUser = {
            _id: new mongoose.Types.ObjectId(),
            fullName: targetName,
            email: targetEmail,
            phoneNumber: targetPhone,
            authProvider: "email",
            isEmailVerified: false,
            isPhoneVerified: false,
            profile: {
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetEmail}`,
                role: "Standard Member",
            },
            createdAt: new Date(),
        };
        inMemoryUsers.push(memUser);

        const token = generateToken(memUser);
        return res.status(201).json({
            success: true,
            message: "FinMitra account created successfully.",
            token,
            user: {
                id: memUser._id.toString(),
                name: memUser.fullName,
                email: memUser.email,
                phone: memUser.phoneNumber,
                avatar: memUser.profile.avatar,
                role: memUser.profile.role,
                authProvider: memUser.authProvider,
                isPhoneVerified: memUser.isPhoneVerified,
                createdAt: memUser.createdAt,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create account. Please try again.",
            error: error.message,
        });
    }
};

/*
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { identifier, email, phone, password } = req.body;
        const targetId = (identifier || email || phone || "").trim();

        if (!targetId || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email/phone and password.",
            });
        }

        if (isDbConnected()) {
            const query = targetId.includes("@")
                ? { email: targetId.toLowerCase() }
                : { phoneNumber: normalizePhoneNumber(targetId) || targetId };

            const user = await User.findOne(query).select("+passwordHash");
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "No registered account found with these credentials.",
                });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid password. Please check and try again.",
                });
            }

            user.lastLoginAt = new Date();
            await user.save();

            const token = generateToken(user);
            const userObj = user.toObject();
            delete userObj.passwordHash;

            return res.json({
                success: true,
                message: "Signed in successfully.",
                token,
                user: {
                    id: userObj._id.toString(),
                    name: userObj.fullName,
                    email: userObj.email,
                    phone: userObj.phoneNumber,
                    avatar: userObj.profile?.avatar,
                    role: userObj.profile?.role,
                    authProvider: userObj.authProvider,
                    isPhoneVerified: userObj.isPhoneVerified,
                    createdAt: userObj.createdAt,
                },
            });
        }

        // Fallback in-memory
        let user = inMemoryUsers.find(
            (u) => u.email === targetId.toLowerCase() || u.phoneNumber === targetId
        );
        if (!user) {
            user = {
                _id: new mongoose.Types.ObjectId(),
                fullName: "FinMitra User",
                email: targetId.includes("@") ? targetId.toLowerCase() : "user@finmitra.io",
                phoneNumber: !targetId.includes("@") ? targetId : undefined,
                authProvider: "email",
                isPhoneVerified: false,
                profile: { avatar: "", role: "Standard Member" },
                createdAt: new Date(),
            };
            inMemoryUsers.push(user);
        }

        const token = generateToken(user);
        return res.json({
            success: true,
            message: "Signed in successfully.",
            token,
            user: {
                id: user._id.toString(),
                name: user.fullName,
                email: user.email,
                phone: user.phoneNumber,
                avatar: user.profile?.avatar || "",
                role: user.profile?.role || "Standard Member",
                isPhoneVerified: Boolean(user.isPhoneVerified),
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to sign in. Please try again.",
            error: error.message,
        });
    }
};

/*
 * POST /api/auth/send-otp
 */
const sendOtp = async (req, res) => {
    try {
        const { phoneNumber, phone } = req.body;
        const targetPhone = (phoneNumber || phone || "").trim();

        if (!targetPhone) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid mobile number.",
            });
        }

        const normalized = normalizePhoneNumber(targetPhone);
        if (!normalized) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format. Include country code e.g., +91 9876543210.",
            });
        }

        let msg91Res = null;
        try {
            msg91Res = await sendVerificationCode(normalized);
        } catch (msg91Err) {
            return res.status(400).json({
                success: false,
                message: msg91Err.message || "Failed to send SMS verification code via MSG91.",
            });
        }

        return res.json({
            success: true,
            message: `Verification OTP sent via SMS to ${msg91Res.maskedPhone}.`,
            phone: normalized,
            maskedPhone: msg91Res.maskedPhone,
        });
    } catch (error) {
        console.error("Send OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send verification code.",
            error: error.message,
        });
    }
};

/*
 * POST /api/auth/verify-otp
 */
const verifyOtp = async (req, res) => {
    try {
        const { phoneNumber, phone, otp, code, fullName, name, email } = req.body;
        const targetPhone = (phoneNumber || phone || "").trim();
        const targetOtp = (otp || code || "").trim();

        if (!targetPhone || !targetOtp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and 6-digit verification OTP code are required.",
            });
        }

        let verifyResult = null;
        try {
            verifyResult = await checkVerificationCode(targetPhone, targetOtp);
        } catch (verifyErr) {
            return res.status(400).json({
                success: false,
                message: verifyErr.message || "Verification code is invalid or expired.",
            });
        }

        if (!verifyResult || !verifyResult.approved) {
            return res.status(400).json({
                success: false,
                message: verifyResult?.message || "Verification failed. Incorrect OTP.",
            });
        }

        const normalizedPhone = normalizePhoneNumber(targetPhone);

        if (isDbConnected()) {
            let user = await User.findOne({ phoneNumber: normalizedPhone });

            if (!user) {
                user = await User.create({
                    fullName: fullName || name || `User ${normalizedPhone.slice(-4)}`,
                    email: email ? email.toLowerCase() : `user_${normalizedPhone.replace(/\D/g, "").slice(-4)}@finmitra.io`,
                    phoneNumber: normalizedPhone,
                    authProvider: "phone",
                    isPhoneVerified: true,
                    profile: {
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedPhone}`,
                        currency: "INR",
                        role: "Standard Member",
                    },
                    lastLoginAt: new Date(),
                });
            } else {
                user.isPhoneVerified = true;
                user.lastLoginAt = new Date();
                await user.save();
            }

            const token = generateToken(user);
            const userObj = user.toObject();
            delete userObj.passwordHash;

            return res.json({
                success: true,
                verified: true,
                message: "Phone verification successful.",
                token,
                user: {
                    id: userObj._id.toString(),
                    user_id: userObj._id.toString(),
                    name: userObj.fullName,
                    email: userObj.email,
                    phone: userObj.phoneNumber,
                    avatar: userObj.profile?.avatar,
                    role: userObj.profile?.role,
                    authProvider: userObj.authProvider,
                    isPhoneVerified: userObj.isPhoneVerified,
                    createdAt: userObj.createdAt,
                },
            });
        }

        // Fallback in-memory
        const memUser = {
            _id: new mongoose.Types.ObjectId(),
            fullName: fullName || name || "FinMitra User",
            email: email || `user_${normalizedPhone.replace(/\D/g, "").slice(-4)}@finmitra.io`,
            phoneNumber: normalizedPhone,
            authProvider: "phone",
            isPhoneVerified: true,
            profile: {
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedPhone}`,
                role: "Standard Member",
            },
            createdAt: new Date(),
        };

        const token = generateToken(memUser);
        return res.json({
            success: true,
            verified: true,
            message: "Phone verification successful.",
            token,
            user: {
                id: memUser._id.toString(),
                user_id: memUser._id.toString(),
                name: memUser.fullName,
                email: memUser.email,
                phone: memUser.phoneNumber,
                avatar: memUser.profile.avatar,
                role: memUser.profile.role,
                authProvider: memUser.authProvider,
                isPhoneVerified: memUser.isPhoneVerified,
                createdAt: memUser.createdAt,
            },
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP.",
            error: error.message,
        });
    }
};

/*
 * POST /api/auth/resend-otp
 */
const resendOtp = async (req, res) => {
    try {
        const { phoneNumber, phone, retryType } = req.body;
        const targetPhone = (phoneNumber || phone || "").trim();

        if (!targetPhone) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid mobile number.",
            });
        }

        const normalized = normalizePhoneNumber(targetPhone);
        if (!normalized) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format.",
            });
        }

        let resendRes = null;
        try {
            resendRes = await resendVerificationCode(normalized, retryType || "text");
        } catch (resendErr) {
            return res.status(400).json({
                success: false,
                message: resendErr.message || "Failed to resend OTP.",
            });
        }

        return res.json({
            success: true,
            message: `OTP resent successfully via SMS to ${resendRes.maskedPhone}.`,
            phone: normalized,
            maskedPhone: resendRes.maskedPhone,
        });
    } catch (error) {
        console.error("Resend OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to resend OTP.",
            error: error.message,
        });
    }
};

/*
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }

        if (isDbConnected()) {
            const user = await User.findById(req.user.userId || req.user.id);
            if (user) {
                return res.json({
                    success: true,
                    user: {
                        id: user._id.toString(),
                        user_id: user._id.toString(),
                        name: user.fullName,
                        email: user.email,
                        phone: user.phoneNumber,
                        avatar: user.profile?.avatar || "",
                        role: user.profile?.role || "Standard Member",
                        isPhoneVerified: Boolean(user.isPhoneVerified),
                        createdAt: user.createdAt,
                    },
                });
            }
        }

        return res.json({
            success: true,
            user: {
                id: req.user.userId || req.user.id || "usr_guest",
                user_id: req.user.userId || req.user.id || "usr_guest",
                name: req.user.fullName || req.user.name || "FinMitra User",
                email: req.user.email,
                phone: req.user.phoneNumber || req.user.phone,
                avatar: req.user.profile?.avatar || "",
                role: req.user.profile?.role || "Standard Member",
                isPhoneVerified: Boolean(req.user.isPhoneVerified),
                createdAt: req.user.createdAt || new Date(),
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get current user info.",
            error: error.message,
        });
    }
};

/*
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
    try {
        const { identifier, newPassword } = req.body;
        if (!identifier || !newPassword || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid identifier and password of at least 8 characters.",
            });
        }

        if (isDbConnected()) {
            const user = await User.findOne({
                $or: [{ email: identifier.toLowerCase() }, { phoneNumber: identifier }],
            });

            if (user) {
                user.passwordHash = await User.hashPassword(newPassword);
                await user.save();
            }
        }

        return res.json({
            success: true,
            message: "Password has been successfully updated. You can now sign in.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to reset password.",
            error: error.message,
        });
    }
};

module.exports = {
    register,
    login,
    sendOtp,
    verifyOtp,
    resendOtp,
    getMe,
    resetPassword,
};
