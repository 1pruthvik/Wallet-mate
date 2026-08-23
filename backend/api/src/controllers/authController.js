const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || "finmitra_jwt_secret_dev_key";
    return jwt.sign(
        {
            userId: user._id ? user._id.toString() : user.user_id,
            email: user.email,
            phone: user.phoneNumber || user.phone_number,
        },
        secret,
        { expiresIn: "7d" }
    );
};

const register = async (req, res) => {
    try {
        const { email, password, phoneNumber, fullName } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }

        const passwordHash = await User.hashPassword(password);
        const user = await User.create({
            fullName: fullName || "FinMitra User",
            email: email.toLowerCase(),
            phoneNumber,
            passwordHash,
            isEmailVerified: false,
            isPhoneVerified: false,
        });

        const token = generateToken(user);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                phone: user.phoneNumber,
                name: user.fullName,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: "Identifier and password required" });
        }

        const user = await User.findOne({
            $or: [{ email: identifier.toLowerCase() }, { phoneNumber: identifier }],
        }).select("+passwordHash");

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(user);
        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                phone: user.phoneNumber,
                name: user.fullName,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                phone: user.phoneNumber,
                name: user.fullName,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
                status: user.status,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
};
