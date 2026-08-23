const express = require("express");
<<<<<<< HEAD
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
=======
const {
    register,
    login,
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
>>>>>>> origin/nivish
router.get("/me", authMiddleware, getMe);

module.exports = router;
