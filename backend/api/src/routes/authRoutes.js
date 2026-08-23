const express = require("express");
const {
    register,
    login,
    sendOtp,
    verifyOtp,
    resendOtp,
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
 * POST /api/auth/send-otp (MSG91 Official OTP Send)
 */
router.post("/send-otp", sendOtp);

/*
 * POST /api/auth/verify-otp (MSG91 Official OTP Verify)
 */
router.post("/verify-otp", verifyOtp);

/*
 * POST /api/auth/resend-otp (MSG91 Official OTP Resend/Retry)
 */
router.post("/resend-otp", resendOtp);

/*
 * POST /api/auth/reset-password
 */
router.post("/reset-password", resetPassword);

/*
 * GET /api/auth/me (Protected)
 */
router.get("/me", authMiddleware, getMe);

module.exports = router;
