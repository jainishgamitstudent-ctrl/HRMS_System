const User = require("../models/user.model");
const Session = require("../models/session.model");
const TrustedDevice = require("../models/trustedDevice.model");
const LoginChallenge = require("../models/loginChallenge.model");
const EmailChange = require("../models/emailChange.model");
const AuthEvent = require("../models/authEvent.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendVerificationEmail, sendLoginOTPEmail, sendPasswordResetEmail, sendHrLoginOTPEmail, sendProfileEditOTPEmail, sendSuperadminOTPEmail, sendLoginAlertEmail, sendDeniedLoginAlertEmail, sendSuperadminRecoveryOTPEmail, sendSuperadminUnlockOTPEmail, sendAccountLockAlertEmail, sendEmailChangeOtpEmail, sendEmailChangeConfirmationEmail, sendEmailChangedSecurityAlertEmail } = require("../services/email.service");
const { sendSmsOtp } = require("../services/sms.service");
const logger = require("../utils/logger");
const { emitEntityEvent } = require("../utils/socketManager");
const { buildDeviceInfo, generateDeviceFingerprint, getIpSubnet, formatDeviceDisplay } = require("../utils/device.utils");
const {
    generateAlphanumericOTP,
    generateNumericOTP,
    hashOtp,
    verifyOtpHash,
    maskEmail,
    getOtpExpiry,
    isOtpExpired,
    isLocked,
    getLockRetryMinutes,
    OTP_TTL_SECONDS,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_MAX_SEND_PER_HOUR,
    OTP_MAX_VERIFY_ATTEMPTS,
    SUPERADMIN_LOCK_WINDOW_MS,
    SUPERADMIN_LOCK_DURATION_MS,
    SUPERADMIN_LOCK_THRESHOLD,
    getLockedResponse,
    maskEmailFirstLast3,
} = require("../utils/otp.utils");

// ===== Security Questions Config =====
const SECURITY_QUESTIONS_LIST = [
    { id: "q1", text: "What is the name of your first school?" },
    { id: "q2", text: "What is your childhood nickname?" },
    { id: "q3", text: "What city were you born in?" },
    { id: "q4", text: "What is your favorite book?" },
    { id: "q5", text: "What was your dream job as a child?" },
    { id: "q6", text: "What is the name of your first pet?" },
];

const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SQ_ATTEMPTS = 5;
const SQ_LOCKOUT_MINUTES = 15;
const RECOVERY_OTP_TTL_MS = 5 * 60 * 1000;
const RECOVERY_OTP_MAX_VERIFY_ATTEMPTS = 5;
const RECOVERY_OTP_MAX_SENDS_PER_HOUR = 3;

const EMAIL_CHANGE_FLOW_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const EMAIL_CHANGE_OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const EMAIL_CHANGE_MAX_OTP_ATTEMPTS = 5;
const EMAIL_CHANGE_RESEND_COOLDOWN_MS = 60 * 1000;

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

const getSuperadminUser = async (select = "") => {
    const superadminEmail = (process.env.SUPERADMIN_EMAIL || "mriya0619@gmail.com").trim().toLowerCase();
    return User.findOne({ email: superadminEmail, role: "superadmin" }).select(select);
};

const isAccountLocked = (user) => {
    const lockedUntil = user?.authSecurity?.lockedUntil;
    return lockedUntil && Date.now() < new Date(lockedUntil).getTime();
};

const sendLocked = (res, lockedUntil) => res.status(423).json(getLockedResponse(lockedUntil));

const auditSecurityEvent = (event, meta = {}) => logger.info(event, { auditEvent: event, ...meta });

const getRequestMeta = (req) => ({
    ip: req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
    userAgent: req.get("user-agent") || null,
    location: req.body?.address || req.body?.location || null,
});

const recordSuperadminFailedAttempt = async (user, req) => {
    const now = Date.now();
    const security = user.authSecurity || {};
    const windowStartedAt = security.failedAttemptsWindowStartedAt ? new Date(security.failedAttemptsWindowStartedAt).getTime() : 0;
    const inWindow = windowStartedAt && now - windowStartedAt <= SUPERADMIN_LOCK_WINDOW_MS;
    const nextCount = inWindow ? (security.failedAttemptsCount || 0) + 1 : 1;
    const shouldLock = nextCount >= SUPERADMIN_LOCK_THRESHOLD;
    const lockedUntil = shouldLock ? new Date(now + SUPERADMIN_LOCK_DURATION_MS) : security.lockedUntil;
    const wasLocked = isAccountLocked(user);
    const lockEventId = shouldLock && !wasLocked ? crypto.randomBytes(16).toString("hex") : security.lockEventId;

    // Parse device info for richer alert details
    const deviceInfo = buildDeviceInfo(req);
    const meta = {
        ip: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        browser: deviceInfo.browser !== "Unknown"
            ? `${deviceInfo.browser}${deviceInfo.browserVersion ? ` ${deviceInfo.browserVersion.split(".")[0]}` : ""}`
            : null,
        os: deviceInfo.os !== "Unknown"
            ? `${deviceInfo.os}${deviceInfo.osVersion ? ` ${deviceInfo.osVersion}` : ""}`
            : null,
        deviceType: deviceInfo.deviceType || null,
        location: deviceInfo.location !== "Unknown" ? deviceInfo.location : null,
    };

    await User.findByIdAndUpdate(user._id, {
        $set: {
            "authSecurity.failedAttemptsCount": nextCount,
            "authSecurity.failedAttemptsWindowStartedAt": inWindow ? security.failedAttemptsWindowStartedAt : new Date(now),
            "authSecurity.lockedUntil": lockedUntil || null,
            "authSecurity.lastFailedAttemptAt": new Date(now),
            "authSecurity.lastFailedAttemptMeta": meta,
            ...(lockEventId ? { "authSecurity.lockEventId": lockEventId } : {}),
        },
    });

    if (shouldLock && !wasLocked) {
        auditSecurityEvent("ACCOUNT_LOCKED", { userId: user._id, lockedUntil });
        sendAccountLockAlertOnce(user, lockedUntil, meta).catch((error) => {
            logger.warn("SuperAdmin account lock alert failed", { error: error.message });
        });
    }

    return { locked: shouldLock, lockedUntil };
};

const resetSuperadminLockout = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        $set: {
            "authSecurity.failedAttemptsCount": 0,
            "authSecurity.failedAttemptsWindowStartedAt": null,
            "authSecurity.lockedUntil": null,
            "authSecurity.lastFailedAttemptAt": null,
            "authSecurity.lastFailedAttemptMeta": {},
            "otp.emailOtp.failedAttempts": 0,
            "otp.emailOtp.lockUntil": null,
            "otp.phoneOtp.failedAttempts": 0,
            "otp.phoneOtp.lockUntil": null,
        },
    });
};

const sendAccountLockAlertOnce = async (user, lockedUntil, meta) => {
    try {
        await sendAccountLockAlertEmail(user.email, {
            lockedUntil: lockedUntil.toISOString(),
            ip: meta.ip,
            userAgent: meta.userAgent,
            location: meta.location,
        });
        await User.findByIdAndUpdate(user._id, { $set: { "authSecurity.lastLockAlertSentAt": new Date() } });
        auditSecurityEvent("LOCK_ALERT_SENT", { userId: user._id });
    } catch (error) {
        logger.warn("Account lock alert email failed", { error: error.message });
    }
};

const issueSuperadminSession = async (userId, req) => {
    const user = await User.findById(userId).select("_id name email role profileImage phone").lean();
    const deviceInfo = buildDeviceInfo(req);
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(userId);
    await Session.create({
        userId,
        status: "active",
        accessTokenJti: jwt.decode(accessToken)?.jti || crypto.randomBytes(16).toString("hex"),
        refreshTokenJti: jwt.decode(refreshToken)?.jti || crypto.randomBytes(16).toString("hex"),
        deviceInfo,
        loginAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isTrustedDevice: true,
    });
    return { user, accessToken, refreshToken };
};

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
    const otp = generateAlphanumericOTP();
    user.twoFactorOTP = otp;
    user.twoFactorOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    let emailSent = false;
    try {
        if (targetEmail) {
            emailSent = await sendHrLoginOTPEmail(targetEmail, otp, user.name);
        } else {
            emailSent = await sendLoginOTPEmail(user.email, otp, user.name);
        }
    } catch (mailError) {
        logger.warn("OTP email send failed", { error: mailError.message });
    }

    return { emailSent };
};

const issueProfileEditOtpChallenge = async (editor, adminEmail, targetName, actionLabel) => {
    const otp = generateAlphanumericOTP();
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

        const resetToken = generateAlphanumericOTP();

        // Store hashed version — never store raw token in DB
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save({ validateBeforeSave: false });

        try {
            // Send the RAW token in the reset link email (not the hash)
            await sendPasswordResetEmail(user.email, resetToken, user.name);
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
 * @desc    Send both Email and Phone OTPs for SuperAdmin login
 * @route   POST /api/auth/superadmin/send-otp
 * @access  Public
 */
exports.sendSuperadminOtp = async (req, res) => {
    try {
        const superadminEmail = (process.env.SUPERADMIN_EMAIL || "mriya0619@gmail.com").trim().toLowerCase();
        const superadminPhone = process.env.SUPERADMIN_PHONE || "+919979720864";

        let user = await User.findOne({ email: superadminEmail, role: "superadmin" });
        if (!user) {
            user = await User.findOne({ email: { $regex: new RegExp("^" + superadminEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") }, role: "superadmin" });
        }

        if (!user) {
            logger.error("SuperAdmin login attempted but no superadmin user exists", { email: superadminEmail });
            return res.status(404).json({ ok: false, code: "user_not_found", message: "SuperAdmin not configured" });
        }

        if (isAccountLocked(user)) {
            return sendLocked(res, user.authSecurity.lockedUntil);
        }

        if (!user.phone) {
            user.phone = superadminPhone;
            await user.save({ validateBeforeSave: false });
        }

        // Rate limiting
        const now = Date.now();
        const requestWindowStart = user.otp?.requestWindowStart ? new Date(user.otp.requestWindowStart).getTime() : 0;
        let requestCount = user.otp?.requestCount || 0;
        const windowMs = 60 * 60 * 1000;

        if (now - requestWindowStart > windowMs) {
            requestCount = 0;
        }

        if (requestCount >= OTP_MAX_SEND_PER_HOUR) {
            return res.status(429).json({ ok: false, code: "rate_limited", message: "Too many OTP requests. Please try again later." });
        }

        const emailOtp = generateAlphanumericOTP(6);
        const phoneOtp = generateNumericOTP(6);
        const expiresAt = getOtpExpiry();

        await User.findByIdAndUpdate(user._id, {
            $set: {
                "otp.emailOtp": { code: null, hash: hashOtp(emailOtp), expiresAt, verified: false, failedAttempts: 0, lockUntil: null },
                "otp.phoneOtp": { code: null, hash: hashOtp(phoneOtp), expiresAt, verified: false, failedAttempts: 0, lockUntil: null },
                "otp.requestCount": requestCount + 1,
                "otp.requestWindowStart": requestCount === 0 ? new Date(now) : user.otp?.requestWindowStart,
            },
        });

        let emailSent = false;
        try {
            emailSent = await sendSuperadminOTPEmail(user.email, emailOtp, user.name);
        } catch (mailError) {
            logger.warn("SuperAdmin email OTP send failed", { error: mailError.message });
        }

        let smsResult = { success: false };
        try {
            smsResult = await sendSmsOtp(user.phone, phoneOtp);
        } catch (smsError) {
            logger.warn("SuperAdmin SMS OTP send failed", { error: smsError.message });
        }

        logger.info("SuperAdmin OTPs sent", { email: superadminEmail, emailSent, smsSent: smsResult.success, requestCount: requestCount + 1 });

        const maskedPhone = user.phone ? user.phone.replace(/\d(?=\d{4})/g, "*") : "";

        return res.status(200).json({
            ok: true,
            email: maskEmail(superadminEmail),
            phone: maskedPhone,
            expiresInSeconds: OTP_TTL_SECONDS,
            cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
            devEmailOtp: process.env.NODE_ENV !== "production" ? emailOtp : undefined,
            devPhoneOtp: process.env.NODE_ENV !== "production" ? phoneOtp : undefined,
        });
    } catch (error) {
        logger.error("Send SuperAdmin OTPs Error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error while sending OTPs" });
    }
};

/**
 * @desc    Verify Email OTP for SuperAdmin login
 * @route   POST /api/auth/superadmin/verify-email-otp
 * @access  Public
 */
exports.verifySuperadminEmailOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const superadminEmail = (process.env.SUPERADMIN_EMAIL || "mriya0619@gmail.com").trim().toLowerCase();

        const user = await User.findOne({ email: superadminEmail, role: "superadmin" })
            .select("_id otp authSecurity")
            .lean();

        if (!user) {
            return res.status(404).json({ ok: false, code: "user_not_found", message: "SuperAdmin not found" });
        }

        if (isAccountLocked(user)) {
            return sendLocked(res, user.authSecurity.lockedUntil);
        }

        const stored = user.otp?.emailOtp;
        if (!stored?.hash) {
            return res.status(400).json({ ok: false, code: "no_active_otp", message: "No active email OTP found." });
        }

        if (isLocked(stored.lockUntil)) {
            return res.status(423).json({ ok: false, code: "too_many_attempts", message: `Account locked. Try again in ${getLockRetryMinutes(stored.lockUntil)} minutes.` });
        }

        if (isOtpExpired(stored.expiresAt)) {
            await User.findByIdAndUpdate(user._id, {
                $set: { "otp.emailOtp.hash": null, "otp.emailOtp.expiresAt": null, "otp.emailOtp.verified": false },
            });
            return res.status(401).json({ ok: false, code: "expired_otp", message: "Email OTP has expired. Please request a new OTP." });
        }

        if (!verifyOtpHash(otp, stored.hash)) {
            const failedAttempts = (stored.failedAttempts || 0) + 1;
            const lockResult = await recordSuperadminFailedAttempt(user, req);
            const lockUntil = lockResult.locked ? lockResult.lockedUntil : stored.lockUntil;

            await User.findByIdAndUpdate(user._id, {
                $set: { "otp.emailOtp.failedAttempts": failedAttempts, "otp.emailOtp.lockUntil": lockUntil },
            });

            if (lockResult.locked) {
                return sendLocked(res, lockResult.lockedUntil);
            }
            return res.status(401).json({ ok: false, code: "invalid_otp", message: "Invalid email OTP" });
        }

        await User.findByIdAndUpdate(user._id, {
            $set: { "otp.emailOtp.verified": true, "otp.emailOtp.failedAttempts": 0, "otp.emailOtp.lockUntil": null },
        });

        const freshUser = await User.findById(user._id).select("otp.phoneOtp.verified").lean();
        return res.status(200).json({
            ok: true,
            emailVerified: true,
            phoneVerified: !!freshUser?.otp?.phoneOtp?.verified,
        });
    } catch (error) {
        logger.error("Verify SuperAdmin Email OTP Error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error during OTP verification" });
    }
};

/**
 * @desc    Verify Phone OTP for SuperAdmin login
 * @route   POST /api/auth/superadmin/verify-phone-otp
 * @access  Public
 */
exports.verifySuperadminPhoneOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const superadminEmail = (process.env.SUPERADMIN_EMAIL || "mriya0619@gmail.com").trim().toLowerCase();

        const user = await User.findOne({ email: superadminEmail, role: "superadmin" })
            .select("_id otp authSecurity")
            .lean();

        if (!user) {
            return res.status(404).json({ ok: false, code: "user_not_found", message: "SuperAdmin not found" });
        }

        if (isAccountLocked(user)) {
            return sendLocked(res, user.authSecurity.lockedUntil);
        }

        const stored = user.otp?.phoneOtp;
        if (!stored?.hash) {
            return res.status(400).json({ ok: false, code: "no_active_otp", message: "No active phone OTP found." });
        }

        if (isLocked(stored.lockUntil)) {
            return res.status(423).json({ ok: false, code: "too_many_attempts", message: `Account locked. Try again in ${getLockRetryMinutes(stored.lockUntil)} minutes.` });
        }

        if (isOtpExpired(stored.expiresAt)) {
            await User.findByIdAndUpdate(user._id, {
                $set: { "otp.phoneOtp.hash": null, "otp.phoneOtp.expiresAt": null, "otp.phoneOtp.verified": false },
            });
            return res.status(401).json({ ok: false, code: "expired_otp", message: "Phone OTP has expired. Please request a new OTP." });
        }

        if (!verifyOtpHash(otp, stored.hash)) {
            const failedAttempts = (stored.failedAttempts || 0) + 1;
            const lockResult = await recordSuperadminFailedAttempt(user, req);
            const lockUntil = lockResult.locked ? lockResult.lockedUntil : stored.lockUntil;

            await User.findByIdAndUpdate(user._id, {
                $set: { "otp.phoneOtp.failedAttempts": failedAttempts, "otp.phoneOtp.lockUntil": lockUntil },
            });

            if (lockResult.locked) {
                return sendLocked(res, lockResult.lockedUntil);
            }
            return res.status(401).json({ ok: false, code: "invalid_otp", message: "Invalid phone OTP" });
        }

        await User.findByIdAndUpdate(user._id, {
            $set: { "otp.phoneOtp.verified": true, "otp.phoneOtp.failedAttempts": 0, "otp.phoneOtp.lockUntil": null },
        });

        const freshUser = await User.findById(user._id).select("otp.emailOtp.verified").lean();
        return res.status(200).json({
            ok: true,
            phoneVerified: true,
            emailVerified: !!freshUser?.otp?.emailOtp?.verified,
        });
    } catch (error) {
        logger.error("Verify SuperAdmin Phone OTP Error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error during OTP verification" });
    }
};

/**
 * @desc    Complete SuperAdmin login after both OTPs verified
 * @route   POST /api/auth/superadmin/complete-login
 * @access  Public
 */
exports.completeSuperadminLogin = async (req, res) => {
    try {
        const superadminEmail = (process.env.SUPERADMIN_EMAIL || "mriya0619@gmail.com").trim().toLowerCase();

        const user = await User.findOne({ email: superadminEmail, role: "superadmin" })
            .select("_id name email role otp securityQuestions securitySettings authSecurity")
            .lean();

        if (!user) {
            return res.status(404).json({ ok: false, code: "user_not_found", message: "SuperAdmin not found" });
        }

        if (isAccountLocked(user)) {
            return sendLocked(res, user.authSecurity.lockedUntil);
        }

        const emailVerified = !!user.otp?.emailOtp?.verified;
        const phoneVerified = !!user.otp?.phoneOtp?.verified;

        if (!emailVerified || !phoneVerified) {
            return res.status(403).json({
                ok: false,
                code: "incomplete_verification",
                message: "Both email and phone OTPs must be verified before login.",
                emailVerified,
                phoneVerified,
            });
        }

        // Build device info from request
        const deviceInfo = buildDeviceInfo(req);

        // Check if device is trusted
        const trustedDevice = await TrustedDevice.findOne({
            userId: user._id,
            deviceFingerprintHash: deviceInfo.fingerprint,
            isActive: true,
        }).lean();

        // Determine risk flags
        const recentSession = await Session.findOne({ userId: user._id, status: "active" })
            .sort({ lastActiveAt: -1 })
            .lean();

        // Geo anomaly detection using frontend-provided coordinates
        const currentGeo = deviceInfo.geoLocation;
        const previousGeo = recentSession?.deviceInfo?.geoLocation;
        let geoAnomaly = false;
        if (currentGeo && previousGeo) {
            const latDiff = Math.abs(currentGeo.latitude - previousGeo.latitude);
            const lngDiff = Math.abs(currentGeo.longitude - previousGeo.longitude);
            // Rough threshold: ~0.5 degrees ≈ 55 km at equator
            geoAnomaly = latDiff > 0.5 || lngDiff > 0.5;
        }

        const riskFlags = {
            isNewDevice: !trustedDevice,
            isNewIP: !!recentSession && recentSession.deviceInfo?.ipAddress !== deviceInfo.ipAddress,
            userAgentChanged: !!recentSession && recentSession.deviceInfo?.userAgent !== deviceInfo.userAgent,
            geoAnomaly,
        };

        const requiresExtraVerification = riskFlags.isNewDevice || riskFlags.isNewIP || riskFlags.userAgentChanged || riskFlags.geoAnomaly;

        // If no extra verification needed, complete login directly
        if (!requiresExtraVerification) {
            // Clear OTPs and create session
            await User.findByIdAndUpdate(user._id, {
                $set: {
                    "otp.emailOtp": { code: null, hash: null, expiresAt: null, verified: false, failedAttempts: 0, lockUntil: null },
                    "otp.phoneOtp": { code: null, hash: null, expiresAt: null, verified: false, failedAttempts: 0, lockUntil: null },
                    "otp.requestCount": 0,
                    "otp.requestWindowStart": null,
                },
            });

            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
            const accessTokenJti = jwt.decode(accessToken)?.jti || crypto.randomBytes(16).toString("hex");
            const refreshTokenJti = jwt.decode(refreshToken)?.jti || crypto.randomBytes(16).toString("hex");

            await Session.create({
                userId: user._id,
                status: "active",
                accessTokenJti,
                refreshTokenJti,
                deviceInfo,
                loginAt: new Date(),
                lastActiveAt: new Date(),
                expiresAt: new Date(Date.now() + (parseInt(process.env.ACCESS_TOKEN_EXPIRY, 10) || 1) * 24 * 60 * 60 * 1000),
                isTrustedDevice: true,
            });

            // Send login alert if enabled
            if (user.securitySettings?.loginAlerts !== false) {
                sendLoginAlertEmail(user.email, user.name, deviceInfo, riskFlags).catch(() => {});
            }

            logger.info("SuperAdmin login completed (trusted device)", { email: superadminEmail, userId: user._id });

            const updatedUser = await User.findById(user._id).select("-password -refreshToken -otp -verificationToken").lean();
            return res
                .status(200)
                .cookie("accessToken", accessToken, getCookieOptions())
                .cookie("refreshToken", refreshToken, getCookieOptions())
                .json({
                    ok: true,
                    nextStep: "DONE",
                    ...buildAuthResponse(updatedUser, accessToken, refreshToken, "SuperAdmin login successful"),
                });
        }

        // Auto-trust new device and complete login; alert is sent via email instead of shown on the login panel
        await TrustedDevice.create({
            userId: user._id,
            deviceFingerprintHash: deviceInfo.fingerprint,
            deviceInfo,
            firstSeenIp: deviceInfo.ipAddress,
            lastSeenIp: deviceInfo.ipAddress,
        });

        // Clear OTPs and create session
        await User.findByIdAndUpdate(user._id, {
            $set: {
                "otp.emailOtp": { code: null, hash: null, expiresAt: null, verified: false, failedAttempts: 0, lockUntil: null },
                "otp.phoneOtp": { code: null, hash: null, expiresAt: null, verified: false, failedAttempts: 0, lockUntil: null },
                "otp.requestCount": 0,
                "otp.requestWindowStart": null,
            },
        });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const accessTokenJti = jwt.decode(accessToken)?.jti || crypto.randomBytes(16).toString("hex");
        const refreshTokenJti = jwt.decode(refreshToken)?.jti || crypto.randomBytes(16).toString("hex");

        const session = await Session.create({
            userId: user._id,
            status: "active",
            accessTokenJti,
            refreshTokenJti,
            deviceInfo,
            loginAt: new Date(),
            lastActiveAt: new Date(),
            expiresAt: new Date(Date.now() + (parseInt(process.env.ACCESS_TOKEN_EXPIRY, 10) || 1) * 24 * 60 * 60 * 1000),
            isTrustedDevice: false,
        });

        // Send login alert if enabled
        if (user.securitySettings?.loginAlerts !== false) {
            sendLoginAlertEmail(user.email, user.name, deviceInfo, riskFlags).catch(() => {});
        }

        logger.info("SuperAdmin login completed (new device auto-trusted, alert emailed)", { email: superadminEmail, userId: user._id });

        const updatedUser = await User.findById(user._id).select("-password -refreshToken -otp -verificationToken").lean();
        return res
            .status(200)
            .cookie("accessToken", accessToken, getCookieOptions())
            .cookie("refreshToken", refreshToken, getCookieOptions())
            .json({
                ok: true,
                nextStep: "DONE",
                ...buildAuthResponse(updatedUser, accessToken, refreshToken, "SuperAdmin login successful"),
            });
    } catch (error) {
        logger.error("Complete SuperAdmin Login Error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error during login completion" });
    }
};

exports.sendSuperadminRecoveryOtp = async (req, res) => {
    try {
        const user = await getSuperadminUser("_id name email securitySettings otp.superadminRecoveryOtp authSecurity");
        if (!user) return res.status(404).json({ ok: false, code: "user_not_found", message: "SuperAdmin not found" });
        if (!isAccountLocked(user)) return res.status(400).json({ ok: false, code: "not_locked", message: "Account is not locked" });

        const recoveryEmail = user.securitySettings?.recoveryEmail;
        if (!recoveryEmail) return res.status(400).json({ ok: false, code: "recovery_email_missing", message: "Recovery email is not configured" });

        const now = Date.now();
        const sent = user.otp?.superadminRecoveryOtp || {};
        const windowStart = sent.sendWindowStartedAt ? new Date(sent.sendWindowStartedAt).getTime() : 0;
        const inWindow = windowStart && now - windowStart <= 60 * 60 * 1000;
        const sendCount = inWindow ? sent.sendCount || 0 : 0;
        if (sendCount >= RECOVERY_OTP_MAX_SENDS_PER_HOUR) {
            return res.status(429).json({ ok: false, code: "rate_limited", message: "Max 3 recovery OTP sends per hour reached" });
        }

        const otp = generateAlphanumericOTP(6);
        await User.findByIdAndUpdate(user._id, {
            $set: {
                "otp.superadminRecoveryOtp": {
                    hash: hashOtp(otp),
                    expiresAt: new Date(now + RECOVERY_OTP_TTL_MS),
                    attempts: 0,
                    sendCount: sendCount + 1,
                    sendWindowStartedAt: inWindow ? sent.sendWindowStartedAt : new Date(now),
                    lastSentAt: new Date(now),
                },
            },
        });

        try {
            await sendSuperadminRecoveryOTPEmail(recoveryEmail, otp, user.name);
        } catch (error) {
            logger.warn("Recovery OTP email failed", { error: error.message });
        }
        auditSecurityEvent("RECOVERY_OTP_SENT", { userId: user._id });

        return res.status(200).json({
            ok: true,
            recoveryEmail: maskEmailFirstLast3(recoveryEmail),
            expiresInSeconds: Math.floor(RECOVERY_OTP_TTL_MS / 1000),
            devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
        });
    } catch (error) {
        logger.error("Send SuperAdmin Recovery OTP Error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error while sending recovery OTP" });
    }
};

exports.verifySuperadminRecoveryOtp = async (req, res) => {
    try {
        const otp = String(req.body?.otp || "").trim().toUpperCase();
        const user = await getSuperadminUser("_id name email role phone profileImage otp.superadminRecoveryOtp authSecurity");
        if (!user) return res.status(404).json({ ok: false, code: "user_not_found", message: "SuperAdmin not found" });
        const stored = user.otp?.superadminRecoveryOtp;
        if (!stored?.hash) return res.status(400).json({ ok: false, code: "no_active_otp", message: "No active recovery OTP" });
        if (isOtpExpired(stored.expiresAt)) return res.status(401).json({ ok: false, code: "expired_otp", message: "Recovery OTP expired" });
        if ((stored.attempts || 0) >= RECOVERY_OTP_MAX_VERIFY_ATTEMPTS) return res.status(429).json({ ok: false, code: "too_many_attempts", message: "Too many recovery attempts" });

        if (!verifyOtpHash(otp, stored.hash)) {
            await User.findByIdAndUpdate(user._id, { $inc: { "otp.superadminRecoveryOtp.attempts": 1 } });
            return res.status(401).json({ ok: false, code: "invalid_otp", message: "Invalid recovery OTP" });
        }

        await resetSuperadminLockout(user._id);
        await User.findByIdAndUpdate(user._id, {
            $set: { "otp.superadminRecoveryOtp.hash": null, "otp.superadminRecoveryOtp.expiresAt": null, "otp.superadminRecoveryOtp.attempts": 0 },
        });
        const { user: freshUser, accessToken, refreshToken } = await issueSuperadminSession(user._id, req);
        auditSecurityEvent("ACCOUNT_UNLOCKED_VIA_RECOVERY", { userId: user._id });

        return res
            .status(200)
            .cookie("accessToken", accessToken, getCookieOptions())
            .cookie("refreshToken", refreshToken, getCookieOptions())
            .json({ ok: true, nextStep: "DONE", ...buildAuthResponse(freshUser, accessToken, refreshToken, "Recovery successful") });
    } catch (error) {
        logger.error("Verify SuperAdmin Recovery OTP Error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error while verifying recovery OTP" });
    }
};

exports.sendSuperadminUnlockOtp = async (req, res) => {
    try {
        const user = await User.findById(req.user?._id).select("_id name email role otp.superadminUnlockOtp").lean();
        if (!user || user.role !== "superadmin") return res.status(403).json({ ok: false, message: "Forbidden" });
        const otp = generateAlphanumericOTP(6);
        await User.findByIdAndUpdate(user._id, {
            $set: {
                "otp.superadminUnlockOtp.hash": hashOtp(otp),
                "otp.superadminUnlockOtp.expiresAt": new Date(Date.now() + RECOVERY_OTP_TTL_MS),
                "otp.superadminUnlockOtp.attempts": 0,
                "otp.superadminUnlockOtp.lastSentAt": new Date(),
            },
        });
        await sendSuperadminUnlockOTPEmail(user.email, otp, user.name).catch((error) => logger.warn("Unlock OTP email failed", { error: error.message }));
        auditSecurityEvent("INACTIVITY_LOCKED", { userId: user._id });
        return res.status(200).json({ ok: true, email: maskEmail(user.email), expiresInSeconds: 300, devOtp: process.env.NODE_ENV !== "production" ? otp : undefined });
    } catch (error) {
        logger.error("Send SuperAdmin Unlock OTP Error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error while sending unlock OTP" });
    }
};

exports.verifySuperadminUnlockOtp = async (req, res) => {
    try {
        const otp = String(req.body?.otp || "").trim().toUpperCase();
        const user = await User.findById(req.user?._id).select("_id role otp.superadminUnlockOtp").lean();
        if (!user || user.role !== "superadmin") return res.status(403).json({ ok: false, message: "Forbidden" });
        const stored = user.otp?.superadminUnlockOtp;
        if (!stored?.hash) return res.status(400).json({ ok: false, code: "no_active_otp", message: "No active unlock OTP" });
        if (isOtpExpired(stored.expiresAt)) return res.status(401).json({ ok: false, code: "expired_otp", message: "Unlock OTP expired" });
        if ((stored.attempts || 0) >= RECOVERY_OTP_MAX_VERIFY_ATTEMPTS) return res.status(429).json({ ok: false, code: "too_many_attempts", message: "Too many unlock attempts" });
        if (!verifyOtpHash(otp, stored.hash)) {
            await User.findByIdAndUpdate(user._id, { $inc: { "otp.superadminUnlockOtp.attempts": 1 } });
            return res.status(401).json({ ok: false, code: "invalid_otp", message: "Invalid unlock OTP" });
        }
        await User.findByIdAndUpdate(user._id, { $set: { "otp.superadminUnlockOtp.hash": null, "otp.superadminUnlockOtp.expiresAt": null, "otp.superadminUnlockOtp.attempts": 0 } });
        auditSecurityEvent("UNLOCKED_VIA_OTP", { userId: user._id });
        return res.status(200).json({ ok: true, message: "Session unlocked" });
    } catch (error) {
        logger.error("Verify SuperAdmin Unlock OTP Error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error while verifying unlock OTP" });
    }
};

/**
 * @desc    Handle device confirmation decision (YES / NO)
 * @route   POST /api/auth/superadmin/challenge/decision
 * @access  Public
 */
exports.challengeDecision = async (req, res) => {
    try {
        const { challengeId, decision } = req.body;
        if (!challengeId || !["YES", "NO"].includes(decision)) {
            return res.status(400).json({ ok: false, message: "Invalid challengeId or decision" });
        }

        const challenge = await LoginChallenge.findById(challengeId);
        if (!challenge || challenge.status !== "pending") {
            return res.status(404).json({ ok: false, code: "challenge_not_found", message: "Challenge not found or already resolved" });
        }
        if (new Date() > challenge.expiresAt) {
            challenge.status = "expired";
            await challenge.save();
            return res.status(410).json({ ok: false, code: "challenge_expired", message: "Challenge expired. Please restart login." });
        }

        const user = await User.findById(challenge.userId).select("name email role securitySettings").lean();
        if (!user) {
            return res.status(404).json({ ok: false, code: "user_not_found", message: "User not found" });
        }

        challenge.decision = decision;
        challenge.decisionAt = new Date();

        if (decision === "NO") {
            challenge.status = "denied";
            await challenge.save();

            // Revoke ALL sessions for this user
            await Session.updateMany(
                { userId: user._id, status: "active" },
                { $set: { status: "revoked", revokedAt: new Date(), revokedReason: "user_denied_login" } }
            );

            // Invalidate refresh tokens
            await User.findByIdAndUpdate(user._id, { $set: { refreshToken: null } });

            // Send denied alert
            if (user.securitySettings?.loginAlerts !== false) {
                sendDeniedLoginAlertEmail(user.email, user.name, challenge.deviceInfo, challenge.riskFlags).catch(() => {});
            }

            logger.warn("SuperAdmin denied login challenge; all sessions revoked", { userId: user._id, challengeId });
            return res.status(200).json({ ok: true, action: "ALL_SESSIONS_REVOKED", message: "Login denied. All sessions have been logged out." });
        }

        // YES — check if security questions are configured
        const hasSecurityQuestions = Array.isArray(user.securityQuestions) && user.securityQuestions.length >= 3;

        if (!hasSecurityQuestions) {
            // No security questions configured — trust device and complete login
            challenge.status = "completed";
            challenge.completedAt = new Date();
            await challenge.save();

            await TrustedDevice.create({
                userId: user._id,
                deviceFingerprintHash: challenge.deviceInfo.fingerprint,
                deviceInfo: challenge.deviceInfo,
                firstSeenIp: challenge.deviceInfo.ipAddress,
                lastSeenIp: challenge.deviceInfo.ipAddress,
            });

            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
            const accessTokenJti = jwt.decode(accessToken)?.jti || crypto.randomBytes(16).toString("hex");
            const refreshTokenJti = jwt.decode(refreshToken)?.jti || crypto.randomBytes(16).toString("hex");

            const session = await Session.create({
                userId: user._id,
                status: "active",
                accessTokenJti,
                refreshTokenJti,
                deviceInfo: challenge.deviceInfo,
                loginAt: new Date(),
                lastActiveAt: new Date(),
                expiresAt: new Date(Date.now() + (parseInt(process.env.ACCESS_TOKEN_EXPIRY, 10) || 1) * 24 * 60 * 60 * 1000),
                isTrustedDevice: true,
            });
            challenge.sessionId = session._id;
            await challenge.save();

            await User.findByIdAndUpdate(user._id, {
                $set: {
                    "otp.emailOtp": { code: null, hash: null, expiresAt: null, verified: false, failedAttempts: 0, lockUntil: null },
                    "otp.phoneOtp": { code: null, hash: null, expiresAt: null, verified: false, failedAttempts: 0, lockUntil: null },
                    "otp.requestCount": 0,
                    "otp.requestWindowStart": null,
                },
            });

            if (user.securitySettings?.loginAlerts !== false) {
                sendLoginAlertEmail(user.email, user.name, challenge.deviceInfo, challenge.riskFlags).catch(() => {});
            }

            logger.info("SuperAdmin login completed (no security questions)", { userId: user._id });
            const updatedUser = await User.findById(user._id).select("-password -refreshToken -otp -verificationToken").lean();
            return res
                .status(200)
                .cookie("accessToken", accessToken, getCookieOptions())
                .cookie("refreshToken", refreshToken, getCookieOptions())
                .json({
                    ok: true,
                    nextStep: "DONE",
                    ...buildAuthResponse(updatedUser, accessToken, refreshToken, "SuperAdmin login successful"),
                });
        }

        // Security questions required
        challenge.status = "approved";
        await challenge.save();

        // Pick 2 random questions (or all if fewer)
        const questionsToAsk = user.securityQuestions
            .map((sq) => ({ questionId: sq.questionId, questionText: sq.questionText }))
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);

        return res.status(200).json({
            ok: true,
            nextStep: "SECURITY_QUESTIONS",
            challengeId: challenge._id,
            questions: questionsToAsk,
            attemptsLeft: MAX_SQ_ATTEMPTS - challenge.failedAttempts,
        });
    } catch (error) {
        logger.error("Challenge Decision Error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
    }
};

/**
 * @desc    Verify security questions for a login challenge
 * @route   POST /api/auth/superadmin/challenge/verify-security-questions
 * @access  Public
 */
exports.verifySecurityQuestions = async (req, res) => {
    try {
        const { challengeId, answers } = req.body;
        if (!challengeId || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ ok: false, message: "challengeId and answers required" });
        }

        const challenge = await LoginChallenge.findById(challengeId);
        if (!challenge || challenge.status !== "approved") {
            return res.status(404).json({ ok: false, code: "challenge_not_found", message: "Challenge not found or not approved" });
        }
        if (new Date() > challenge.expiresAt) {
            challenge.status = "expired";
            await challenge.save();
            return res.status(410).json({ ok: false, code: "challenge_expired", message: "Challenge expired. Please restart login." });
        }
        if (challenge.lockUntil && new Date() < challenge.lockUntil) {
            const mins = Math.ceil((challenge.lockUntil.getTime() - Date.now()) / 60000);
            return res.status(423).json({ ok: false, code: "locked", message: `Too many attempts. Try again in ${mins} minute(s).` });
        }

        const user = await User.findById(challenge.userId).select("name email role securityQuestions securitySettings").lean();
        if (!user) {
            return res.status(404).json({ ok: false, code: "user_not_found", message: "User not found" });
        }

        // Normalize and verify answers
        const storedMap = new Map(user.securityQuestions.map((sq) => [sq.questionId, sq.answerHash]));
        let allCorrect = true;
        for (const ans of answers) {
            const storedHash = storedMap.get(ans.questionId);
            if (!storedHash) {
                allCorrect = false;
                break;
            }
            const normalized = String(ans.answer).trim().toLowerCase().replace(/\s+/g, " ");
            const match = await bcrypt.compare(normalized, storedHash);
            if (!match) {
                allCorrect = false;
                break;
            }
        }

        if (!allCorrect) {
            challenge.failedAttempts += 1;
            if (challenge.failedAttempts >= MAX_SQ_ATTEMPTS) {
                challenge.lockUntil = new Date(Date.now() + SQ_LOCKOUT_MINUTES * 60 * 1000);
            }
            await challenge.save();
            const attemptsLeft = Math.max(0, MAX_SQ_ATTEMPTS - challenge.failedAttempts);
            return res.status(401).json({
                ok: false,
                code: "INCORRECT_ANSWERS",
                message: "One or more answers are incorrect.",
                attemptsLeft,
                locked: !!challenge.lockUntil,
            });
        }

        // Success — trust device and complete login
        challenge.status = "completed";
        challenge.completedAt = new Date();
        await challenge.save();

        await TrustedDevice.create({
            userId: user._id,
            deviceFingerprintHash: challenge.deviceInfo.fingerprint,
            deviceInfo: challenge.deviceInfo,
            firstSeenIp: challenge.deviceInfo.ipAddress,
            lastSeenIp: challenge.deviceInfo.ipAddress,
        });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const accessTokenJti = jwt.decode(accessToken)?.jti || crypto.randomBytes(16).toString("hex");
        const refreshTokenJti = jwt.decode(refreshToken)?.jti || crypto.randomBytes(16).toString("hex");

        const session = await Session.create({
            userId: user._id,
            status: "active",
            accessTokenJti,
            refreshTokenJti,
            deviceInfo: challenge.deviceInfo,
            loginAt: new Date(),
            lastActiveAt: new Date(),
            expiresAt: new Date(Date.now() + (parseInt(process.env.ACCESS_TOKEN_EXPIRY, 10) || 1) * 24 * 60 * 60 * 1000),
            isTrustedDevice: true,
        });
        challenge.sessionId = session._id;
        await challenge.save();

        await User.findByIdAndUpdate(user._id, {
            $set: {
                "otp.emailOtp": { code: null, hash: null, expiresAt: null, verified: false, failedAttempts: 0, lockUntil: null },
                "otp.phoneOtp": { code: null, hash: null, expiresAt: null, verified: false, failedAttempts: 0, lockUntil: null },
                "otp.requestCount": 0,
                "otp.requestWindowStart": null,
            },
        });

        if (user.securitySettings?.loginAlerts !== false) {
            sendLoginAlertEmail(user.email, user.name, challenge.deviceInfo, challenge.riskFlags).catch(() => {});
        }

        logger.info("SuperAdmin login completed via security questions", { userId: user._id });
        const updatedUser = await User.findById(user._id).select("-password -refreshToken -otp -verificationToken").lean();
        return res
            .status(200)
            .cookie("accessToken", accessToken, getCookieOptions())
            .cookie("refreshToken", refreshToken, getCookieOptions())
            .json({
                ok: true,
                nextStep: "DONE",
                ...buildAuthResponse(updatedUser, accessToken, refreshToken, "SuperAdmin login successful"),
            });
    } catch (error) {
        logger.error("Verify Security Questions Error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error during verification" });
    }
};

/**
 * @desc    Get predefined security questions list + user's configured questions
 * @route   GET /api/superadmin/security-questions
 * @access  Private (SuperAdmin)
 */
exports.getSecurityQuestions = async (req, res) => {
    try {
        const userId = req.user?._id;
        const user = await User.findById(userId).select("securityQuestions").lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const configured = (user.securityQuestions || []).map((sq) => ({
            questionId: sq.questionId,
            questionText: sq.questionText,
        }));
        return res.status(200).json({
            success: true,
            data: {
                predefined: SECURITY_QUESTIONS_LIST,
                configured,
                isConfigured: configured.length >= 3,
            },
        });
    } catch (error) {
        logger.error("Get Security Questions Error", { error: error.message });
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc    Set/update security questions (requires 3+)
 * @route   POST /api/superadmin/security-questions
 * @access  Private (SuperAdmin)
 */
exports.setSecurityQuestions = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { questions } = req.body; // [{ questionId, questionText, answer }, ...]

        if (!Array.isArray(questions) || questions.length < 3) {
            return res.status(400).json({ success: false, message: "At least 3 security questions required" });
        }

        // Validate all fields present
        for (const q of questions) {
            if (!q.questionId || !q.questionText || !q.answer || String(q.answer).trim().length < 2) {
                return res.status(400).json({ success: false, message: "Each question must have an answer of at least 2 characters" });
            }
        }

        const hashed = await Promise.all(
            questions.map(async (q) => {
                const normalized = String(q.answer).trim().toLowerCase().replace(/\s+/g, " ");
                const answerHash = await bcrypt.hash(normalized, 10);
                return {
                    questionId: q.questionId,
                    questionText: q.questionText,
                    answerHash,
                };
            })
        );

        await User.findByIdAndUpdate(userId, { $set: { securityQuestions: hashed } });
        logger.info("Security questions updated", { userId });
        return res.status(200).json({ success: true, message: "Security questions updated successfully" });
    } catch (error) {
        logger.error("Set Security Questions Error", { error: error.message });
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc    Get active sessions for SuperAdmin
 * @route   GET /api/superadmin/sessions
 * @access  Private (SuperAdmin)
 */
exports.getSessions = async (req, res) => {
    try {
        const userId = req.user?._id;
        const sessions = await Session.find({ userId, status: "active" })
            .sort({ lastActiveAt: -1 })
            .select("-refreshTokenJti -accessTokenJti")
            .lean();
        return res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        logger.error("Get Sessions Error", { error: error.message });
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc    Revoke a specific session
 * @route   POST /api/superadmin/sessions/revoke
 * @access  Private (SuperAdmin)
 */
exports.revokeSession = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ success: false, message: "sessionId required" });
        }
        const session = await Session.findOneAndUpdate(
            { _id: sessionId, userId },
            { $set: { status: "revoked", revokedAt: new Date(), revokedReason: "manual_revoke" } },
            { new: true }
        );
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }
        return res.status(200).json({ success: true, message: "Session revoked" });
    } catch (error) {
        logger.error("Revoke Session Error", { error: error.message });
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc    Revoke ALL sessions for SuperAdmin (logout all devices)
 * @route   POST /api/superadmin/sessions/revoke-all
 * @access  Private (SuperAdmin)
 */
exports.revokeAllSessions = async (req, res) => {
    try {
        const userId = req.user?._id;
        await Session.updateMany(
            { userId, status: "active" },
            { $set: { status: "revoked", revokedAt: new Date(), revokedReason: "revoke_all" } }
        );
        await User.findByIdAndUpdate(userId, { $set: { refreshToken: null } });
        return res.status(200).json({ success: true, message: "All sessions revoked" });
    } catch (error) {
        logger.error("Revoke All Sessions Error", { error: error.message });
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc    Get trusted devices for SuperAdmin
 * @route   GET /api/superadmin/trusted-devices
 * @access  Private (SuperAdmin)
 */
exports.getTrustedDevices = async (req, res) => {
    try {
        const userId = req.user?._id;
        const devices = await TrustedDevice.find({ userId, isActive: true })
            .sort({ lastSeenAt: -1 })
            .lean();
        return res.status(200).json({ success: true, data: devices });
    } catch (error) {
        logger.error("Get Trusted Devices Error", { error: error.message });
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc    Remove trust from a device
 * @route   POST /api/superadmin/trusted-devices/remove
 * @access  Private (SuperAdmin)
 */
exports.removeTrustedDevice = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { deviceId } = req.body;
        if (!deviceId) {
            return res.status(400).json({ success: false, message: "deviceId required" });
        }
        const device = await TrustedDevice.findOneAndUpdate(
            { _id: deviceId, userId },
            { $set: { isActive: false } },
            { new: true }
        );
        if (!device) {
            return res.status(404).json({ success: false, message: "Device not found" });
        }
        return res.status(200).json({ success: true, message: "Device trust removed" });
    } catch (error) {
        logger.error("Remove Trusted Device Error", { error: error.message });
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ===== Email Change Flow (SuperAdmin) =====

/**
 * @desc    Initiate email change — sends OTP to current email
 * @route   POST /api/auth/email-change/initiate
 * @access  Private (SuperAdmin)
 */
exports.initiateEmailChange = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { newEmail } = req.body;

        if (!newEmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newEmail.trim())) {
            return res.status(400).json({ ok: false, message: "A valid email address is required" });
        }

        const user = await User.findById(userId).select("_id name email role").lean();
        if (!user) return res.status(404).json({ ok: false, message: "User not found" });
        if (String(user.role || "").toLowerCase() !== "superadmin") return res.status(403).json({ ok: false, message: "Only superadmins can use this flow" });

        const normalizedNewEmail = newEmail.trim().toLowerCase();
        if (normalizedNewEmail === user.email.toLowerCase()) {
            return res.status(400).json({ ok: false, code: "same_as_current", message: "New email cannot be the same as your current email" });
        }

        const existingUser = await User.findOne({ email: normalizedNewEmail, _id: { $ne: user._id } }).select("_id").lean();
        if (existingUser) {
            return res.status(400).json({ ok: false, code: "email_taken", message: "This email address is already in use" });
        }

        // Check for pending email change
        const pending = await EmailChange.findOne({ userId: user._id, status: { $in: ["awaiting_otp", "awaiting_new_email_confirm"] } }).lean();
        if (pending) {
            const timeLeft = Math.max(0, Math.ceil((new Date(pending.expiresAt).getTime() - Date.now()) / 1000));
            if (timeLeft > 0) {
                return res.status(409).json({ ok: false, code: "pending_change", message: "You already have a pending email change", emailChangeId: pending._id, timeLeft });
            }
        }

        // Generate OTP for old email
        const otp = generateAlphanumericOTP(6);
        const otpHash = hashOtp(otp);
        const expiresAt = new Date(Date.now() + EMAIL_CHANGE_FLOW_TTL_MS);
        const otpExpiresAt = new Date(Date.now() + EMAIL_CHANGE_OTP_TTL_MS);

        // Cancel any previous pending changes for this user
        await EmailChange.updateMany(
            { userId: user._id, status: { $in: ["awaiting_otp", "awaiting_new_email_confirm"] } },
            { $set: { status: "cancelled" } }
        );

        const emailChange = await EmailChange.create({
            userId: user._id,
            oldEmail: user.email,
            newEmail: normalizedNewEmail,
            otpHash,
            otpAttempts: 0,
            status: "awaiting_otp",
            expiresAt,
        });

        try {
            await sendEmailChangeOtpEmail(user.email, otp, user.name);
        } catch (mailErr) {
            logger.warn("Email change OTP mail failed — continuing", { error: mailErr.message });
        }

        auditSecurityEvent("EMAIL_CHANGE_INITIATED", { userId: user._id, emailChangeId: emailChange._id, newEmail: normalizedNewEmail });

        return res.status(200).json({
            ok: true,
            message: "OTP sent to your current email address",
            emailChangeId: emailChange._id,
            maskedCurrentEmail: maskEmail(user.email),
            expiresInSeconds: Math.floor(EMAIL_CHANGE_FLOW_TTL_MS / 1000),
            otpExpiresInSeconds: Math.floor(EMAIL_CHANGE_OTP_TTL_MS / 1000),
            devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
        });
    } catch (error) {
        logger.error("Initiate email change error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
    }
};

/**
 * @desc    Verify OTP sent to old email, then send confirmation link to new email
 * @route   POST /api/auth/email-change/verify-otp
 * @access  Private (SuperAdmin)
 */
exports.verifyEmailChangeOtp = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { emailChangeId, otp } = req.body;

        if (!emailChangeId || !otp || typeof otp !== "string") {
            return res.status(400).json({ ok: false, message: "emailChangeId and OTP are required" });
        }

        const emailChange = await EmailChange.findOne({ _id: emailChangeId, userId }).lean();
        if (!emailChange) {
            return res.status(404).json({ ok: false, code: "not_found", message: "Email change request not found" });
        }

        if (emailChange.status !== "awaiting_otp") {
            return res.status(400).json({ ok: false, code: "invalid_status", message: `Request is already ${emailChange.status}` });
        }

        if (Date.now() > new Date(emailChange.expiresAt).getTime()) {
            await EmailChange.findByIdAndUpdate(emailChange._id, { $set: { status: "expired" } });
            return res.status(410).json({ ok: false, code: "expired", message: "Email change request has expired. Please start over." });
        }

        if (emailChange.otpAttempts >= EMAIL_CHANGE_MAX_OTP_ATTEMPTS) {
            await EmailChange.findByIdAndUpdate(emailChange._id, { $set: { status: "expired" } });
            return res.status(429).json({ ok: false, code: "too_many_attempts", message: "Too many failed attempts. Please start over." });
        }

        const normalizedOtp = otp.trim().toUpperCase();
        if (!verifyOtpHash(normalizedOtp, emailChange.otpHash)) {
            await EmailChange.findByIdAndUpdate(emailChange._id, { $inc: { otpAttempts: 1 } });
            const attemptsLeft = EMAIL_CHANGE_MAX_OTP_ATTEMPTS - (emailChange.otpAttempts + 1);
            return res.status(401).json({
                ok: false,
                code: "invalid_otp",
                message: attemptsLeft > 0 ? `Invalid OTP. ${attemptsLeft} attempt(s) remaining.` : "Invalid OTP. No attempts remaining.",
                attemptsLeft: Math.max(0, attemptsLeft),
            });
        }

        // Generate signed JWT confirmation token
        const confirmationToken = jwt.sign(
            { emailChangeId: emailChange._id.toString(), newEmail: emailChange.newEmail, purpose: "email_change_confirm" },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "24h" }
        );
        const confirmationTokenHash = crypto.createHash("sha256").update(confirmationToken).digest("hex");

        await EmailChange.findByIdAndUpdate(emailChange._id, {
            $set: { status: "awaiting_new_email_confirm", confirmationTokenHash, otpHash: null },
        });

        const confirmationLink = `${process.env.CLIENT_URL}/auth/email-change/confirm?token=${confirmationToken}`;

        try {
            await sendEmailChangeConfirmationEmail(emailChange.newEmail, confirmationLink);
        } catch (mailErr) {
            logger.warn("Email change confirmation mail failed", { error: mailErr.message });
        }

        auditSecurityEvent("EMAIL_CHANGE_OTP_VERIFIED", { userId, emailChangeId: emailChange._id });

        return res.status(200).json({
            ok: true,
            message: "Confirmation link sent to your new email address",
            maskedNewEmail: maskEmail(emailChange.newEmail),
            expiresInSeconds: Math.floor(EMAIL_CHANGE_FLOW_TTL_MS / 1000),
        });
    } catch (error) {
        logger.error("Verify email change OTP error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
    }
};

/**
 * @desc    Confirm email change via JWT link from new email
 * @route   GET /api/auth/email-change/confirm/:token
 * @access  Public
 */
exports.confirmEmailChange = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ ok: false, message: "Token is required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({ ok: false, code: "invalid_token", message: "Invalid or expired confirmation link" });
        }

        if (decoded.purpose !== "email_change_confirm" || !decoded.emailChangeId || !decoded.newEmail) {
            return res.status(400).json({ ok: false, code: "invalid_token", message: "Invalid confirmation token" });
        }

        const emailChange = await EmailChange.findById(decoded.emailChangeId).lean();
        if (!emailChange) {
            return res.status(404).json({ ok: false, code: "not_found", message: "Email change request not found" });
        }

        if (emailChange.status === "completed") {
            // Already completed — redirect to login
            const redirectUrl = `${process.env.CLIENT_URL}/auth/login?message=email_changed`;
            return res.redirect(redirectUrl);
        }

        if (emailChange.status !== "awaiting_new_email_confirm") {
            return res.status(400).json({ ok: false, code: "invalid_status", message: "This email change request is no longer valid" });
        }

        if (Date.now() > new Date(emailChange.expiresAt).getTime()) {
            await EmailChange.findByIdAndUpdate(emailChange._id, { $set: { status: "expired" } });
            return res.status(410).json({ ok: false, code: "expired", message: "Email change request has expired" });
        }

        // Verify token hash matches (prevent reuse if token was leaked)
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        if (tokenHash !== emailChange.confirmationTokenHash) {
            return res.status(401).json({ ok: false, code: "token_mismatch", message: "Invalid confirmation link" });
        }

        // Check new email is still available
        const existingUser = await User.findOne({ email: decoded.newEmail, _id: { $ne: emailChange.userId } }).select("_id").lean();
        if (existingUser) {
            await EmailChange.findByIdAndUpdate(emailChange._id, { $set: { status: "expired" } });
            return res.status(409).json({ ok: false, code: "email_taken", message: "This email address is already in use" });
        }

        const user = await User.findById(emailChange.userId).select("_id name email").lean();
        if (!user) {
            return res.status(404).json({ ok: false, message: "User not found" });
        }

        // Update user email, mark email change completed, revoke sessions
        await User.findByIdAndUpdate(emailChange.userId, { $set: { email: decoded.newEmail } });
        await EmailChange.findByIdAndUpdate(emailChange._id, {
            $set: { status: "completed", completedAt: new Date(), confirmationTokenHash: null },
        });
        await Session.updateMany(
            { userId: emailChange.userId, status: "active" },
            { $set: { status: "revoked", revokedAt: new Date(), revokedReason: "email_change" } }
        );
        await User.findByIdAndUpdate(emailChange.userId, { $unset: { refreshToken: 1 } });

        // Send security alert to old email
        try {
            await sendEmailChangedSecurityAlertEmail(emailChange.oldEmail, decoded.newEmail, user.name);
        } catch (mailErr) {
            logger.warn("Email changed security alert failed", { error: mailErr.message });
        }

        // Log auth event
        await AuthEvent.create({
            userId: emailChange.userId,
            action: "EMAIL_CHANGE_CONFIRMED",
            metadata: { oldEmail: emailChange.oldEmail, newEmail: decoded.newEmail, emailChangeId: emailChange._id },
            ip: req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
            userAgent: req.get("user-agent") || null,
        });

        auditSecurityEvent("EMAIL_CHANGE_CONFIRMED", { userId: emailChange.userId, oldEmail: emailChange.oldEmail, newEmail: decoded.newEmail });

        const redirectUrl = `${process.env.CLIENT_URL}/auth/email-change/confirm?status=success`;
        return res.redirect(redirectUrl);
    } catch (error) {
        logger.error("Confirm email change error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
    }
};

/**
 * @desc    Get email change status for polling
 * @route   GET /api/auth/email-change/status
 * @access  Private (SuperAdmin)
 */
exports.getEmailChangeStatus = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { emailChangeId } = req.query;

        if (!emailChangeId) {
            return res.status(400).json({ ok: false, message: "emailChangeId is required" });
        }

        const emailChange = await EmailChange.findOne({ _id: emailChangeId, userId }).lean();
        if (!emailChange) {
            return res.status(404).json({ ok: false, code: "not_found", message: "Email change request not found" });
        }

        const isExpired = Date.now() > new Date(emailChange.expiresAt).getTime();
        if (isExpired && emailChange.status !== "completed" && emailChange.status !== "cancelled") {
            return res.status(200).json({
                ok: true,
                status: "expired",
                expired: true,
                message: "Email change request has expired",
            });
        }

        return res.status(200).json({
            ok: true,
            status: emailChange.status,
            oldEmail: emailChange.oldEmail,
            newEmail: emailChange.newEmail,
            expiresAt: emailChange.expiresAt,
            completedAt: emailChange.completedAt || null,
        });
    } catch (error) {
        logger.error("Get email change status error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
    }
};

/**
 * @desc    Cancel a pending email change
 * @route   POST /api/auth/email-change/cancel
 * @access  Private (SuperAdmin)
 */
exports.cancelEmailChange = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { emailChangeId } = req.body;

        if (!emailChangeId) {
            return res.status(400).json({ ok: false, message: "emailChangeId is required" });
        }

        const emailChange = await EmailChange.findOne({ _id: emailChangeId, userId });
        if (!emailChange) {
            return res.status(404).json({ ok: false, code: "not_found", message: "Email change request not found" });
        }

        if (emailChange.status === "completed") {
            return res.status(400).json({ ok: false, code: "already_completed", message: "This email change has already been completed" });
        }

        emailChange.status = "cancelled";
        await emailChange.save();

        auditSecurityEvent("EMAIL_CHANGE_CANCELLED", { userId, emailChangeId: emailChange._id });

        return res.status(200).json({ ok: true, message: "Email change request cancelled" });
    } catch (error) {
        logger.error("Cancel email change error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
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
    sendSuperadminOtp: exports.sendSuperadminOtp,
    verifySuperadminEmailOtp: exports.verifySuperadminEmailOtp,
    verifySuperadminPhoneOtp: exports.verifySuperadminPhoneOtp,
    completeSuperadminLogin: exports.completeSuperadminLogin,
    sendSuperadminRecoveryOtp: exports.sendSuperadminRecoveryOtp,
    verifySuperadminRecoveryOtp: exports.verifySuperadminRecoveryOtp,
    sendSuperadminUnlockOtp: exports.sendSuperadminUnlockOtp,
    verifySuperadminUnlockOtp: exports.verifySuperadminUnlockOtp,
    challengeDecision: exports.challengeDecision,
    verifySecurityQuestions: exports.verifySecurityQuestions,
    getSecurityQuestions: exports.getSecurityQuestions,
    setSecurityQuestions: exports.setSecurityQuestions,
    getSessions: exports.getSessions,
    revokeSession: exports.revokeSession,
    revokeAllSessions: exports.revokeAllSessions,
    getTrustedDevices: exports.getTrustedDevices,
    removeTrustedDevice: exports.removeTrustedDevice,
    initiateEmailChange: exports.initiateEmailChange,
    verifyEmailChangeOtp: exports.verifyEmailChangeOtp,
    confirmEmailChange: exports.confirmEmailChange,
    getEmailChangeStatus: exports.getEmailChangeStatus,
    cancelEmailChange: exports.cancelEmailChange,
    // Exported for use in other controllers if needed
    generateAccessToken,
    generateRefreshToken,
    generateAccessAndRefreshTokens,
    findAdminEmail,
    issueProfileEditOtpChallenge,
    verifyProfileEditOtp,
};
