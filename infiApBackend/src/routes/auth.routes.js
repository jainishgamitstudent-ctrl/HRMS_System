const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    resendLoginOTP,
    forgotPassword,
    resetPassword,
    verifyLoginOTP,
    refreshAccessToken,
    logout,
    getMe,
    getAllUsers,
    deleteUser,
    requestProfileEditOTP,
    verifyProfileEditOTP
} = require("../controllers/auth.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/security.middleware");
const { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyOTPSchema } = require("../middlewares/validation.middleware");

// ===== Public Routes =====
router.post("/signup", authLimiter, validate(registerSchema), registerUser);
router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/resend-2fa", authLimiter, validate(forgotPasswordSchema), resendLoginOTP);
router.post("/verify-2fa", authLimiter, validate(verifyOTPSchema), verifyLoginOTP);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
router.post("/refresh-token", authLimiter, refreshAccessToken);

// ===== Protected Routes =====
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getMe);
router.get("/users", verifyJWT, getAllUsers);
router.delete("/users/:id", verifyJWT, deleteUser);
router.post("/request-edit-otp", verifyJWT, requestProfileEditOTP);
router.post("/verify-edit-otp", verifyJWT, verifyProfileEditOTP);

module.exports = router;
