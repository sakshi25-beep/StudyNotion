const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth middleware
exports.auth = async (req, res, next) => {
    try {
        // 1. Token extract karein
        let token = 
            req.cookies?.token || 
            req.body?.token || 
            req.header("Authorization")?.replace("Bearer ", "").replace("bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is missing',
            });
        }

        // 2. Verify karein
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        } catch (jwtError) {
            console.log("JWT VERIFY FAILED:", jwtError.message);
            return res.status(401).json({
                success: false,
                message: `Token is invalid: ${jwtError.message}`,
            });
        }

        next();
    } catch (error) {
        console.log("CRITICAL AUTH MIDDLEWARE ERROR:", error.message);
        return res.status(401).json({
            success: false,
            message: `Something went wrong while validating the token: ${error.message}`,
        });
    }
};

// isStudent middleware
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for students only',
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified PLEASE TRY AGAIN'
        });
    }
};

// isInstructor middleware
exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType.toLowerCase() !== "instructor".toLowerCase()) {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Instructor only',
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified PLEASE TRY AGAIN'
        });
    }
};

// isAdmin middleware
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Admin only',
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified PLEASE TRY AGAIN'
        });
    }
};