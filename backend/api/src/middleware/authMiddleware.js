const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required",
            });
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || "finmitra_jwt_secret_dev_key";

        try {
            const decoded = jwt.verify(token, secret);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authentication middleware error",
        });
    }
};

module.exports = authMiddleware;
