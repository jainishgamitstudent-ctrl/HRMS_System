const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../utils/logger");

// Verify JWT Token
const verifyJWT = async (req, res, next) => {
    try {
        // Prioritize cookies over Authorization header (cookies are set by backend)
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            logger.info("SESSION_TIMED_OUT", { auditEvent: "SESSION_TIMED_OUT", reason: "missing_token" });
            return res.status(401).json({ code: "SESSION_TIMED_OUT", message: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken",
        );

        if (!user) {
            logger.info("SESSION_TIMED_OUT", { auditEvent: "SESSION_TIMED_OUT", reason: "invalid_user" });
            return res.status(401).json({ code: "SESSION_TIMED_OUT", message: "Invalid Access Token" });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.info("SESSION_TIMED_OUT", { auditEvent: "SESSION_TIMED_OUT", reason: "invalid_token" });
        res.status(401).json({ code: "SESSION_TIMED_OUT", message: "Invalid Access Token" });
    }
};

module.exports = { verifyJWT };
