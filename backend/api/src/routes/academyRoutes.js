const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const academyController = require("../controllers/academyController");

// Public certificate verification
router.get("/certificate/:certificateId", academyController.verifyCertificate);

// Protected user routes
router.get("/progress", authMiddleware, academyController.getProgress);
router.post("/progress", authMiddleware, academyController.updateProgress);
router.post("/exam/submit", authMiddleware, academyController.submitExam);

module.exports = router;
