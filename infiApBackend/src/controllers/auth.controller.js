const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail, sendLoginOTPEmail, sendPasswordResetEmail, sendHrLoginOTPEmail, sendProfileEditOTPEmail, sendSuperadminOTPEmail } = require("../services/email.service");
const logger = require("../utils/logger");
const { emitEntityEvent } = require("../utils/socketManager");

// ===== Token Generation =====

const generateAccessToken = (userId, email, role) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
    }
    return jwt.sign(
        { _id: userId, email, role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
};

const generateRefreshToken = (userId) => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables");
    }
    return jwt.sign(
        { _id: userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );
};

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

// ===== Helper Functions =====

const ROLE_ALIASES = {
    employee: "employee",
    user: "employee",
    manager: "manager",
    hr: "hr",
    human_resources: "hr",
    "human resources": "hr",
    admin: "admin",
    superadmin: "superadmin",
    main_admin: "superadmin",
    "main admin": "superadmin",
};

const normalizeRole = (role) => {
    if (!role) return "employee";
    const normalized = String(role).trim().toLowerCase().replace(/-/g, "_");
    return ROLE_ALIASES[normalized] || null;
};

const sanitizeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role === "main_admin" ? "superadmin" : user.role,
    department: user.department || "",
    designation: user.designation || "",
    joiningDate: user.joiningDate || null,
    phone: user.phone || "",
    address: user.address || "",
    employeeId: user.employeeId || "",
    profileImage: user.profileImage || "",
});

// Cookie options — works for both web (cookies) and mobile (token in body)
const isProduction = process.env.NODE_ENV === "production";

const getCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
});

const getClearCookieOptions = () => ({
    ...getCookieOptions(),
    maxAge: 0,
});

const buildAuthResponse = (user, accessToken, refreshToken, message = "Login successful") => ({
    message,
    require2FA: false,
    // Token in body — React Native uses this (save to AsyncStorage)
    token: accessToken,
    refreshToken,
    role: user.role === "main_admin" ? "superadmin" : user.role,
    user: sanitizeUser(user),
});

const findAdminEmail = async () => {
    const admin = await User.findOne({ role: { $in: ["admin", "superadmin"] } }).select("email").lean();
    return admin?.email || null;
};

const issueLoginOtpChallenge = async (user, targetEmail = null) => {
    const otp = crypto.randomInt(100000, 999999).toString();
    user.twoFactorOTP = otp;
    user.twoFactorOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    let emailSent = false;
    try {
        if (targetEmail) {
            emailSent = await sendHrLoginOTPEmail(targetEmail, otp, user.name);
        } else {
            emailSent = await sendLoginOTPEmail(user.email, otp);
        }
    } catch (mailError) {
        logger.warn("OTP email send failed", { error: mailError.message });
    }

    return { emailSent };
};

const issueProfileEditOtpChallenge = async (editor, adminEmail, targetName, actionLabel) => {
    const otp = crypto.randomInt(100000, 999999).toString();
    editor.profileEditOTP = otp;
    editor.profileEditOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await editor.save({ validateBeforeSave: false });

    let emailSent = false;
    try {
        emailSent = await sendProfileEditOTPEmail(adminEmail, otp, editor.name, targetName, actionLabel);
    } catch (mailError) {
        logger.warn("Profile edit OTP email send failed", { error: mailError.message });
    }

    return { emailSent };
};

const verifyProfileEditOtp = async (editor, otp) => {
    if (!editor.profileEditOTP || editor.profileEditOTP !== String(otp).trim()) {
        return { valid: false, message: "Invalid OTP" };
    }
    if (Date.now() > editor.profileEditOTPExpires) {
        return { valid: false, message: "OTP has expired. Please request a new one." };
    }
    editor.profileEditOTP = undefined;
    editor.profileEditOTPExpires = undefined;
    await editor.save({ validateBeforeSave: false });
    return { valid: true };
};

// ===== Controllers =====

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedRole = normalizeRole(role);

        // Public registration is only allowed for employee role
        // Admin and HR accounts must be created by an authorized admin
        const allowedPublicRole = normalizedRole || "employee";
        if (!["employee"].includes(allowedPublicRole)) {
            return res.status(403).json({ message: "Public registration is only allowed for employee role. Admin/HR accounts must be created by an authorized administrator." });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const user = await User.create({
            name: String(name).trim(),
            email: normalizedEmail,
            password,
            role: normalizedRole,
            verificationToken,
            isEmailVerified: false,
        });

        let emailMessage = "User registered successfully.";
        try {
            const emailSent = await sendVerificationEmail(normalizedEmail, verificationToken);
            emailMessage = emailSent
                ? "User registered successfully. Please check your email for verification."
                : "User registered successfully. Email verification skipped (email not configured).";
        } catch (mailError) {
            logger.warn("Verification email skipped", { error: mailError.message });
        }

        const createdUser = await User.findById(user._id).select("-password -refreshToken -twoFactorOTP -twoFactorOTPExpires -verificationToken");

        return res.status(201).json({
            message: emailMessage,
            user: sanitizeUser(createdUser),
        });
    } catch (error) {
        logger.error("Register Error", { error: error.message });
        return res.status(500).json({ message: "Server error during registration" });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2FA already done — go straight to login (existing user who has logged in before)
        if (user.firstLogin2FAVerified) {
            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
            const loggedInUser = await User.findById(user._id).select("-password -refreshToken -twoFactorOTP -twoFactorOTPExpires -verificationToken");

            return res
                .status(200)
                .cookie("accessToken", accessToken, getCookieOptions())
                .cookie("refreshToken", refreshToken, getCookieOptions())
                .json(buildAuthResponse(loggedInUser, accessToken, refreshToken));
        }

        // For HR first login, send OTP to admin email instead of HR email
        const isHR = user.role === "hr";
        let targetEmail = null;
        if (isHR) {
            targetEmail = await findAdminEmail();
        }

        // First login — send OTP for 2FA (only for newly created users)
        const { emailSent } = await issueLoginOtpChallenge(user, targetEmail);

        // Development only: skip 2FA if email not configured (mark as verified so it won't ask again)
        if (!emailSent && process.env.NODE_ENV !== "production") {
            user.twoFactorOTP = undefined;
            user.twoFactorOTPExpires = undefined;
            user.firstLogin2FAVerified = true;
            await user.save({ validateBeforeSave: false });

            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
            const loggedInUser = await User.findById(user._id).select("-password -refreshToken -twoFactorOTP -twoFactorOTPExpires -verificationToken");

            return res
                .status(200)
                .cookie("accessToken", accessToken, getCookieOptions())
                .cookie("refreshToken", refreshToken, getCookieOptions())
                .json(buildAuthResponse(
                    loggedInUser,
                    accessToken,
                    refreshToken,
                    "Login successful. 2FA skipped (email not configured in development)."
                ));
        }

        const devOtp = (!emailSent && process.env.NODE_ENV !== "production") ? user.twoFactorOTP : undefined;

        return res.status(200).json({
            message: emailSent
                ? isHR
                    ? "A verification code has been sent to the admin email."
                    : "A verification code has been sent to your email."
                : "Unable to send verification code. Please check email configuration.",
            require2FA: true,
            emailSent,
            // userId needed by frontend to call verifyLoginOTP
            userId: user._id,
            devOtp,
        });
    } catch (error) {
        logger.error("Login Error", { error: error.message });
        return res.status(500).json({ message: "Server error during login" });
    }
};

/**
 * @desc    Verify 2FA OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyLoginOTP = async (req, res) => {
    try {
        const { email, userId, otp } = req.body;

        if ((!email && !userId) || !otp) {
            return res.status(400).json({ message: "Email or User ID, and OTP are required" });
        }

        const user = await User.findOne(userId ? { _id: userId } : { email: String(email).trim().toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.twoFactorOTP || user.twoFactorOTP !== String(otp).trim()) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        if (Date.now() > user.twoFactorOTPExpires) {
            return res.status(401).json({ message: "OTP has expired. Please request a new one." });
        }

        user.twoFactorOTP = undefined;
        user.twoFactorOTPExpires = undefined;
        user.firstLogin2FAVerified = true;
        await user.save({ validateBeforeSave: false });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken -twoFactorOTP -twoFactorOTPExpires -verificationToken");

        return res
            .status(200)
            .cookie("accessToken", accessToken, getCookieOptions())
            .cookie("refreshToken", refreshToken, getCookieOptions())
            .json(buildAuthResponse(loggedInUser, accessToken, refreshToken, "2FA verified. Login successful."));
    } catch (error) {
        logger.error("OTP Verification Error", { error: error.message });
        return res.status(500).json({ message: "Server error during OTP verification" });
    }
};

/**
 * @desc    Resend login OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
exports.resendLoginOTP = async (req, res) => {
    try {
        const { email, userId } = req.body;

        if (!email && !userId) {
            return res.status(400).json({ message: "Email or User ID is required" });
        }

        const user = await User.findOne(userId ? { _id: userId } : { email: String(email).trim().toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.firstLogin2FAVerified) {
            return res.status(400).json({ message: "2FA is only required on first login." });
        }

        const isHR = user.role === "hr";
        let targetEmail = null;
        if (isHR) {
            targetEmail = await findAdminEmail();
        }

        const { emailSent } = await issueLoginOtpChallenge(user, targetEmail);

        return res.status(200).json({
            message: emailSent
                ? isHR
                    ? "A new verification code has been sent to the admin email."
                    : "A new verification code has been sent to your email."
                : "Failed to send verification code. Please check email configuration.",
            emailSent,
        });
    } catch (error) {
        logger.error("Resend OTP Error", { error: error.message });
        return res.status(500).json({ message: "Server error while resending OTP" });
    }
};

/**
 * @desc    Forgot password — sends reset link to email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        // Always return 200 — don't reveal if email exists or not
        if (!user) {
            return res.status(200).json({ message: "If this email exists, a reset link has been sent." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store hashed version — never store raw token in DB
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save({ validateBeforeSave: false });

        try {
            // Send the RAW token in the reset link email (not the hash)
            await sendPasswordResetEmail(user.email, resetToken);
        } catch (mailError) {
            // If email fails, clear the token
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            logger.warn("Reset email failed", { error: mailError.message });
            return res.status(500).json({ message: "Failed to send reset email. Please try again." });
        }

        // NEVER return the token in the response — it defeats the purpose
        return res.status(200).json({
            message: "If this email exists, a reset link has been sent.",
        });
    } catch (error) {
        logger.error("Forgot Password Error", { error: error.message });
        return res.status(500).json({ message: "Server error while processing forgot password" });
    }
};

/**
 * @desc    Reset password using token from email
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: "Reset token and new password are required" });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Hash the incoming token and compare against DB
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // must not be expired
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid or expired reset token. Please request a new one." });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        // Invalidate all existing sessions
        user.refreshToken = undefined;
        await user.save();

        return res.status(200).json({ message: "Password reset successful. Please login with your new password." });
    } catch (error) {
        logger.error("Reset Password Error", { error: error.message });
        return res.status(500).json({ message: "Server error while resetting password" });
    }
};

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public (needs refresh token in cookie or body)
 */
exports.refreshAccessToken = async (req, res) => {
    try {
        // Works for both web (cookie) and React Native (body)
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired refresh token. Please login again." });
        }

        const user = await User.findById(decodedToken?._id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({ message: "Refresh token mismatch. Please login again." });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, getCookieOptions())
            .cookie("refreshToken", refreshToken, getCookieOptions())
            .json({
                message: "Access token refreshed successfully",
                token: accessToken,       // for React Native
                refreshToken,             // for React Native
            });
    } catch (error) {
        logger.error("Refresh Token Error", { error: error.message });
        return res.status(401).json({ message: "Failed to refresh access token" });
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private (requires auth middleware)
 */
exports.logout = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Invalidate refresh token in DB
        await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

        return res
            .status(200)
            .clearCookie("accessToken", getClearCookieOptions())
            .clearCookie("refreshToken", getClearCookieOptions())
            .json({ message: "Logged out successfully" });
    } catch (error) {
        logger.error("Logout Error", { error: error.message });
        return res.status(500).json({ message: "Server error during logout" });
    }
};

/**
 * @desc    Delete a user (admin/superadmin only)
 * @route   DELETE /api/auth/users/:id
 * @access  Private (Admin/SuperAdmin only)
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterRole = String(req.user.role).toLowerCase().trim();

        if (!["admin", "superadmin", "main_admin"].includes(requesterRole)) {
            return res.status(403).json({ message: "Access Denied: Only admins can delete users" });
        }

        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent admins from deleting superadmins or other admins
        const targetRole = String(userToDelete.role).toLowerCase().trim();
        if (targetRole === "superadmin" || targetRole === "main_admin") {
            return res.status(403).json({ message: "Cannot delete superadmin accounts" });
        }
        if (targetRole === "admin" && requesterRole !== "superadmin" && requesterRole !== "main_admin") {
            return res.status(403).json({ message: "Only superadmins can delete admin accounts" });
        }

        await User.findByIdAndDelete(id);

        // Emit real-time event
        emitEntityEvent('employee', 'deleted', { _id: id }, {
            targetRoles: ['HR', 'Admin', 'Employee']
        });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        logger.error("Delete User Error", { error: error.message });
        return res.status(500).json({ message: "Server error deleting user" });
    }
};

/**
 * @desc    Get all users (role-based filtering)
 * @route   GET /api/auth/users
 * @access  Private (Admin/HR only)
 */
exports.getAllUsers = async (req, res) => {
    try {
        const requestingUser = req.user;
        const { role, search, page = 1, limit = 50 } = req.query;

        const filter = {};
        const requesterRole = String(requestingUser.role).toLowerCase().trim();

        // Role-based visibility rules
        if (requesterRole === "hr") {
            // HR can only see employees and managers, never admin/superadmin
            filter.role = { $nin: ["admin", "superadmin", "main_admin"] };
        } else if (requesterRole === "admin" || requesterRole === "superadmin" || requesterRole === "main_admin") {
            // Admin/Superadmin can see all roles (including hr and employee)
            // Optionally filter by requested role
            if (role) {
                filter.role = role;
            }
        } else if (requesterRole === "employee") {
            // Employee can only see themselves
            filter._id = requestingUser._id;
        }

        if (search) {
            const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            if (filter.$or) {
                filter.$or.push(
                    { name: searchRegex },
                    { email: searchRegex },
                    { employeeId: searchRegex }
                );
            } else {
                filter.$or = [
                    { name: searchRegex },
                    { email: searchRegex },
                    { employeeId: searchRegex }
                ];
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await User.find(filter)
            .select("-password -refreshToken -twoFactorOTP -twoFactorOTPExpires -verificationToken -resetPasswordToken -resetPasswordExpires")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

        return res.status(200).json({
            message: "Users fetched successfully",
            data: users.map(sanitizeUser),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        logger.error("Get All Users Error", { error: error.message });
        return res.status(500).json({ message: "Server error fetching users" });
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private (requires auth middleware)
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -refreshToken -twoFactorOTP -twoFactorOTPExpires -verificationToken -resetPasswordToken -resetPasswordExpires");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user: sanitizeUser(user),
        });
    } catch (error) {
        logger.error("Get Me Error", { error: error.message });
        return res.status(500).json({ message: "Server error fetching user" });
    }
};

/**
 * @desc    Request OTP for profile edit (HR editing employee or Admin editing HR)
 * @route   POST /api/auth/request-edit-otp
 * @access  Private
 */
exports.requestProfileEditOTP = async (req, res) => {
    try {
        const { targetUserId, actionLabel } = req.body;
        const editor = await User.findById(req.user?._id);

        if (!editor) {
            return res.status(404).json({ message: "Editor user not found" });
        }

        const adminEmail = await findAdminEmail();
        if (!adminEmail) {
            return res.status(500).json({ message: "No admin email found in the system" });
        }

        // Resolve target name
        let targetName = "Unknown";
        if (targetUserId) {
            const target = await User.findById(targetUserId).select("name").lean();
            if (target) targetName = target.name;
        }

        const label = actionLabel || "Profile Edit";
        const { emailSent } = await issueProfileEditOtpChallenge(editor, adminEmail, targetName, label);

        // Development helper: return OTP if email not configured
        const devOtp = (!emailSent && process.env.NODE_ENV !== "production") ? editor.profileEditOTP : undefined;

        return res.status(200).json({
            message: emailSent
                ? "A verification code has been sent to the admin email."
                : "Unable to send verification code. Please check email configuration.",
            emailSent,
            devOtp,
        });
    } catch (error) {
        logger.error("Request Profile Edit OTP Error", { error: error.message });
        return res.status(500).json({ message: "Server error while requesting edit OTP" });
    }
};

/**
 * @desc    Verify profile edit OTP (optional standalone endpoint)
 * @route   POST /api/auth/verify-edit-otp
 * @access  Private
 */
exports.verifyProfileEditOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const editor = await User.findById(req.user?._id);

        if (!editor) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!otp) {
            return res.status(400).json({ message: "OTP is required" });
        }

        const result = await verifyProfileEditOtp(editor, otp);
        if (!result.valid) {
            return res.status(401).json({ message: result.message });
        }

        return res.status(200).json({ message: "OTP verified successfully. You may now save changes." });
    } catch (error) {
        logger.error("Verify Profile Edit OTP Error", { error: error.message });
        return res.status(500).json({ message: "Server error while verifying edit OTP" });
    }
};

/**
 * @desc    Send email OTP to SuperAdmin
 * @route   POST /api/auth/superadmin/send-otp
 * @access  Public
 */
exports.sendSuperadminEmailOTP = async (req, res) => {
    try {
        const superadminEmail = (process.env.SUPERADMIN_EMAIL || "mriya0619@gmail.com").trim().toLowerCase();

        const user = await User.findOne({ email: superadminEmail, role: "superadmin" });

        if (!user) {
            logger.error("SuperAdmin login attempted but no superadmin user exists", { email: superadminEmail });
            return res.status(404).json({ message: "SuperAdmin not configured" });
        }

        // Rate limiting: configurable via env (default 10 requests per 30 min)
        const now = Date.now();
        const windowMinutes = parseInt(process.env.SUPERADMIN_OTP_WINDOW_MINUTES, 10) || 30;
        const maxRequests = parseInt(process.env.SUPERADMIN_OTP_MAX_REQUESTS, 10) || 10;
        const windowMs = windowMinutes * 60 * 1000;
        const requestWindowStart = user.otp?.requestWindowStart ? new Date(user.otp.requestWindowStart).getTime() : 0;
        let requestCount = user.otp?.requestCount || 0;

        if (now - requestWindowStart > windowMs) {
            requestCount = 0;
        }

        if (requestCount >= maxRequests) {
            logger.warn("SuperAdmin OTP rate limit exceeded", { email: superadminEmail, requestCount, maxRequests, windowMinutes });
            return res.status(429).json({ message: `Too many OTP requests. Please try again in ${windowMinutes} minutes.` });
        }

        const emailOtp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const otpHash = crypto.createHash("sha256").update(emailOtp).digest("hex");

        user.otp = {
            emailOtp: {
                code: null,
                hash: otpHash,
                expiresAt,
                verified: false,
                failedAttempts: 0,
                lockUntil: null,
            },
            requestCount: requestCount + 1,
            requestWindowStart: requestCount === 0 ? new Date(now) : user.otp?.requestWindowStart,
        };
        await user.save({ validateBeforeSave: false });

        let emailSent = false;
        try {
            emailSent = await sendSuperadminOTPEmail(user.email, emailOtp);
        } catch (mailError) {
            logger.warn("SuperAdmin email OTP send failed", { error: mailError.message });
        }

        logger.info("SuperAdmin OTP sent", { email: superadminEmail, emailSent, requestCount: requestCount + 1 });

        return res.status(200).json({
            message: `OTP sent to ${superadminEmail}`,
            emailSent,
            // Dev helper: return OTP when email not configured in development
            devEmailOtp: (!emailSent && process.env.NODE_ENV !== "production") ? emailOtp : undefined,
        });
    } catch (error) {
        logger.error("Send SuperAdmin Email OTP Error", { error: error.message });
        return res.status(500).json({ message: "Server error while sending OTP" });
    }
};

/**
 * @desc    Verify email OTP for SuperAdmin login
 * @route   POST /api/auth/superadmin/verify-otp
 * @access  Public
 */
exports.verifySuperadminEmailOTP = async (req, res) => {
    try {
        const { emailOtp } = req.body;
        const superadminEmail = (process.env.SUPERADMIN_EMAIL || "mriya0619@gmail.com").trim().toLowerCase();

        const user = await User.findOne({ email: superadminEmail, role: "superadmin" });

        if (!user) {
            return res.status(404).json({ message: "SuperAdmin not found" });
        }

        const storedEmailOtp = user.otp?.emailOtp;

        if (!storedEmailOtp?.hash) {
            return res.status(400).json({ message: "No active OTP found. Please request a new OTP." });
        }

        // Check brute-force lock
        if (storedEmailOtp.lockUntil && Date.now() < new Date(storedEmailOtp.lockUntil).getTime()) {
            const retryAfter = Math.ceil((new Date(storedEmailOtp.lockUntil).getTime() - Date.now()) / 1000 / 60);
            logger.warn("SuperAdmin login locked due to failed attempts", { email: superadminEmail, retryAfter });
            return res.status(423).json({ message: `Account temporarily locked due to failed attempts. Try again in ${retryAfter} minutes.` });
        }

        if (Date.now() > new Date(storedEmailOtp.expiresAt).getTime()) {
            user.otp = {
                emailOtp: { code: null, hash: null, expiresAt: null, verified: false, failedAttempts: storedEmailOtp.failedAttempts || 0, lockUntil: storedEmailOtp.lockUntil },
                requestCount: user.otp?.requestCount || 0,
                requestWindowStart: user.otp?.requestWindowStart || null,
            };
            await user.save({ validateBeforeSave: false });
            return res.status(401).json({ message: "OTP has expired. Please request a new OTP." });
        }

        const incomingHash = crypto.createHash("sha256").update(String(emailOtp).trim()).digest("hex");

        if (storedEmailOtp.hash !== incomingHash) {
            const failedAttempts = (storedEmailOtp.failedAttempts || 0) + 1;
            const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : storedEmailOtp.lockUntil;

            user.otp.emailOtp.failedAttempts = failedAttempts;
            user.otp.emailOtp.lockUntil = lockUntil;
            await user.save({ validateBeforeSave: false });

            logger.warn("SuperAdmin OTP verification failed", { email: superadminEmail, failedAttempts, locked: !!lockUntil });

            if (lockUntil && failedAttempts >= 5) {
                return res.status(401).json({ message: "Too many failed attempts. Account locked for 30 minutes." });
            }
            return res.status(401).json({ message: "Invalid OTP" });
        }

        // Success: clear OTP and security counters
        user.otp = {
            emailOtp: { code: null, hash: null, expiresAt: null, verified: true, failedAttempts: 0, lockUntil: null },
            requestCount: 0,
            requestWindowStart: null,
        };
        await user.save({ validateBeforeSave: false });

        // Generate tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken -otp -verificationToken");

        logger.info("SuperAdmin login successful", { email: superadminEmail, userId: user._id });

        return res
            .status(200)
            .cookie("accessToken", accessToken, getCookieOptions())
            .cookie("refreshToken", refreshToken, getCookieOptions())
            .json(buildAuthResponse(loggedInUser, accessToken, refreshToken, "SuperAdmin login successful"));
    } catch (error) {
        logger.error("Verify SuperAdmin Email OTP Error", { error: error.message });
        return res.status(500).json({ message: "Server error during OTP verification" });
    }
};

module.exports = {
    registerUser: exports.registerUser,
    loginUser: exports.loginUser,
    verifyLoginOTP: exports.verifyLoginOTP,
    resendLoginOTP: exports.resendLoginOTP,
    forgotPassword: exports.forgotPassword,
    resetPassword: exports.resetPassword,
    refreshAccessToken: exports.refreshAccessToken,
    logout: exports.logout,
    getMe: exports.getMe,
    getAllUsers: exports.getAllUsers,
    deleteUser: exports.deleteUser,
    requestProfileEditOTP: exports.requestProfileEditOTP,
    verifyProfileEditOTP: exports.verifyProfileEditOTP,
    sendSuperadminEmailOTP: exports.sendSuperadminEmailOTP,
    verifySuperadminEmailOTP: exports.verifySuperadminEmailOTP,
    // Exported for use in other controllers if needed
    generateAccessToken,
    generateRefreshToken,
    generateAccessAndRefreshTokens,
    findAdminEmail,
    issueProfileEditOtpChallenge,
    verifyProfileEditOtp,
};