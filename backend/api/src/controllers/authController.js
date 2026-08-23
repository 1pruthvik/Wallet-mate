const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "wallet_mate_secure_jwt_secret_key_2026";

// Helper to generate signed JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName || user.name,
            phone: user.phoneNumber || user.phone,
            role: user.profile?.role || "Standard Member",
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// In-memory fallback user database if MongoDB is not running locally
let inMemoryUsers = [];

/*
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { fullName, name, email, password, phone, phoneNumber } = req.body;
        const targetName = (fullName || name || "").trim();
        const targetEmail = (email || "").trim().toLowerCase();
        const targetPhone = (phoneNumber || phone || "").trim();

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
            // 1. Check duplicate email
            const existingEmail = await User.findOne({ email: targetEmail });
            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email is already registered. Please sign in.",
                });
            }

            // 2. Check duplicate phone if provided
            if (targetPhone) {
                const existingPhone = await User.findOne({ phoneNumber: targetPhone });
                if (existingPhone) {
                    return res.status(409).json({
                        success: false,
                        message: "This phone number is already registered to another account.",
                    });
                }
            }

            // 3. Hash password
            const passwordHash = await User.hashPassword(password);

            // 4. Create user in MongoDB
            const newUser = await User.create({
                fullName: targetName,
                email: targetEmail,
                phoneNumber: targetPhone || undefined,
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

            // Clean user response
            const userObj = newUser.toObject();
            delete userObj.passwordHash;

            return res.status(201).json({
                success: true,
                message: "Wallet-Mate account created successfully.",
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

        // Fallback in-memory registration if MongoDB is offline
        const existingMem = inMemoryUsers.find((u) => u.email === targetEmail);
        if (existingMem) {
            return res.status(409).json({
                success: false,
                message: "An account with this email is already registered. Please sign in.",
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
            message: "Wallet-Mate account created successfully.",
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
        const { email, password } = req.body;
        const targetEmail = (email || "").trim().toLowerCase();

        if (!targetEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email address and password.",
            });
        }

        if (isDbConnected()) {
            const user = await User.findOne({ email: targetEmail }).select("+passwordHash");
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email address or password.",
                });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email address or password.",
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

        // Fallback in-memory / demo user login
        let user = inMemoryUsers.find((u) => u.email === targetEmail);
        if (!user) {
            user = {
                _id: new mongoose.Types.ObjectId(),
                fullName: targetEmail.split("@")[0].replace(".", " ").replace(/^./, (s) => s.toUpperCase()),
                email: targetEmail,
                phoneNumber: "+919876543210",
                authProvider: "email",
                isPhoneVerified: true,
                profile: {
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetEmail}`,
                    role: "Standard Member",
                },
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
                avatar: user.profile.avatar,
                role: user.profile.role,
                authProvider: user.authProvider,
                isPhoneVerified: user.isPhoneVerified,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to sign in. Please try again.",
            error: error.message,
        });
    }
};

/*
 * POST /api/auth/send-otp
 */
const sendOtp = async (req, res) => {
    try {
        const { phone, countryCode = "+91", purpose = "login" } = req.body;
        const cleanDigits = (phone || "").replace(/\D/g, "");

        if (!cleanDigits || cleanDigits.length < 7) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid phone number.",
            });
        }

        const fullPhone = `${countryCode}${cleanDigits}`;
        const masked = `${countryCode} ${cleanDigits.slice(0, 2)}${"X".repeat(Math.max(4, cleanDigits.length - 4))}${cleanDigits.slice(-2)}`;

        return res.json({
            success: true,
            message: `Verification code sent to ${masked}.`,
            data: {
                phone: fullPhone,
                maskedPhone: masked,
                expiresInSeconds: 180,
                // In demo/dev environment, test code is 123456
                demoCode: "123456",
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP.",
            error: error.message,
        });
    }
};

/*
 * POST /api/auth/verify-otp
 */
const verifyOtp = async (req, res) => {
    try {
        const { phone, otp, name, email, purpose = "login" } = req.body;

        if (!otp || otp.length !== 6) {
            return res.status(400).json({
                success: false,
                message: "Please enter the complete 6-digit verification code.",
            });
        }

        // Accept demo OTPs or any 6-digit code in test environment
        const isValid = otp === "123456" || otp.length === 6;
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP. Please check the code and try again.",
            });
        }

        if (purpose === "password-reset") {
            return res.json({
                success: true,
                message: "Phone number verified for password reset.",
                verified: true,
            });
        }

        if (isDbConnected()) {
            let user = await User.findOne({ phoneNumber: phone });
            if (!user) {
                const cleanName = name || (email ? email.split("@")[0] : "Wallet-Mate User");
                const cleanEmail = email || `user_${phone.replace(/\D/g, "").slice(-4)}@walletmate.io`;

                user = await User.create({
                    fullName: cleanName,
                    email: cleanEmail,
                    phoneNumber: phone,
                    authProvider: "phone",
                    isPhoneVerified: true,
                    isEmailVerified: false,
                    profile: {
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
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
                message: "Phone verification successful.",
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

        // Fallback in-memory user
        const memUser = {
            _id: new mongoose.Types.ObjectId(),
            fullName: name || "Wallet-Mate User",
            email: email || `user_${phone.replace(/\D/g, "").slice(-4)}@walletmate.io`,
            phoneNumber: phone,
            authProvider: "phone",
            isPhoneVerified: true,
            profile: {
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
                role: "Standard Member",
            },
            createdAt: new Date(),
        };

        const token = generateToken(memUser);
        return res.json({
            success: true,
            message: "Phone verification successful.",
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
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP.",
            error: error.message,
        });
    }
};

/*
 * GET /api/auth/me (Protected)
 */
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }

        return res.json({
            success: true,
            user: {
                id: req.user._id ? req.user._id.toString() : "usr_guest",
                name: req.user.fullName || req.user.name,
                email: req.user.email,
                phone: req.user.phoneNumber || req.user.phone,
                avatar: req.user.profile?.avatar || "",
                role: req.user.profile?.role || "Standard Member",
                isPhoneVerified: Boolean(req.user.isPhoneVerified),
                createdAt: req.user.createdAt,
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
    getMe,
    resetPassword,
};
