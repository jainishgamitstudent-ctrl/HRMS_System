const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Verify JWT Token
const verifyJWT = async (req, res, next) => {
    try {
        // Prioritize cookies over Authorization header (cookies are set by backend)
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken",
        );

        if (!user) {
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Access Token" });
    }
};

module.exports = { verifyJWT };
