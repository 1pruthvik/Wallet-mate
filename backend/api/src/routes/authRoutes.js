const express = require("express");
const {
    register,
    login,
    googleAuth,
    sendOtp,
    verifyOtp,
    getMe,
    resetPassword,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * POST /api/auth/register
 */
router.post("/register", register);

/*
 * POST /api/auth/login
 */
router.post("/login", login);

/*
 * POST /api/auth/google
 */
router.post("/google", googleAuth);

/*
 * POST /api/auth/send-otp
 */
router.post("/send-otp", sendOtp);

/*
 * POST /api/auth/verify-otp
 */
router.post("/verify-otp", verifyOtp);

/*
 * POST /api/auth/reset-password
 */
router.post("/reset-password", resetPassword);

/*
 * GET /api/auth/me (Protected)
 */
router.get("/me", authMiddleware, getMe);

module.exports = router;
