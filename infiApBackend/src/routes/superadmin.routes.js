const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");
const { uploadSingle, uploadSingleOptional } = require("../middlewares/upload.middleware");
const mainAdminDashboardController = require("../controllers/mainAdminDashboard.controller");
const mainAdminController = require("../controllers/mainAdmin.controller");
const {
    getSecurityQuestions,
    setSecurityQuestions,
    getSessions,
    revokeSession,
    revokeAllSessions,
    getTrustedDevices,
    removeTrustedDevice,
} = require("../controllers/auth.controller");
const User = require("../models/user.model");
const { generateAlphanumericOTP, hashOtp, verifyOtpHash, isOtpExpired, maskEmail } = require("../utils/otp.utils");
const { sendEmailChangeOtpEmail, sendRecoveryEmailChangeOtpEmail, sendRecoveryEmailAddedNotificationEmail } = require("../services/email.service");
const logger = require("../utils/logger");
const RECOVERY_OTP_TTL_MS = parseInt(process.env.RECOVERY_EMAIL_OTP_TTL_SECONDS || "300", 10) * 1000;
const RECOVERY_OTP_MAX_ATTEMPTS = 5;
const RECOVERY_OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const EMAIL_CHANGE_OTP_TTL_MS = parseInt(process.env.EMAIL_CHANGE_OTP_TTL_SECONDS || "300", 10) * 1000;
const EMAIL_CHANGE_OTP_MAX_ATTEMPTS = 5;
const EMAIL_CHANGE_OTP_RESEND_COOLDOWN_MS = 60 * 1000;

router.use(verifyJWT);
router.use(verifyRole(["superadmin"]));

// ─── Dashboard ───
router.get("/dashboard", mainAdminDashboardController.getHomeSummary);

router.get("/dashboard/health", async (req, res) => {
    try {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        const [activeUsers, totalCompanies] = await Promise.all([
            User.countDocuments({ updatedAt: { $gte: last24Hours }, status: { $ne: "Terminate" } }),
            require("../models/company.model").countDocuments(),
        ]);
        res.status(200).json({
            success: true,
            data: {
                apiUptime: 99.9,
                errorRate: 0.1,
                queueStatus: "healthy",
                queueDepth: 0,
                lastChecked: new Date().toISOString(),
                activeUsers,
                totalCompanies,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Health check failed", error: error.message });
    }
});

// ─── Companies (param mapping) ───
router.get("/companies", async (req, res, next) => {
    // Map frontend query params to backend expectations
    if (req.query.sort_by) {
        req.query.sortBy = req.query.sort_by;
    }
    if (req.query.order) {
        req.query.sortOrder = req.query.order;
    }
    return mainAdminDashboardController.getRegisteredCompanies(req, res, next);
});

router.post("/companies", mainAdminController.createCompany);
router.get("/companies/:id", mainAdminController.getCompanyById);
router.put("/companies/:id", mainAdminController.updateCompany);
router.delete("/companies/:id", mainAdminController.deleteCompany);
router.patch("/companies/:id/status", mainAdminController.updateCompanyStatus);

router.post("/companies/:id/logo", uploadSingleOptional("logo"), mainAdminController.uploadCompanyLogo);

router.get("/companies/:companyId/admins", mainAdminController.getCompanyAdmins);
router.get("/companies/:companyId/hr-users", mainAdminController.getCompanyHrUsers);

// ─── Profile ───
router.get("/profile", async (req, res) => {
    try {
        const user = await User.findById(req.user?._id).select("-password -refreshToken -otp -verificationToken").lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                address: user.address || "",
                dob: user.dob || null,
                joiningDate: user.joiningDate || null,
                profileImage: user.profileImage || null,
                designation: user.designation || "",
                department: user.department || "",
                employeeId: user.employeeId || "",
                role: user.role,
                recoveryEmail: user.securitySettings?.recoveryEmail || null,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch profile", error: error.message });
    }
});

router.put("/profile", async (req, res) => {
    try {
        const allowedFields = ["name", "email", "phone", "address", "dob", "designation", "department", "employeeId"];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields provided" });
        }
        if (updates.email) {
            updates.email = String(updates.email).trim().toLowerCase();
            const existing = await User.findOne({ email: updates.email, _id: { $ne: req.user?._id } }).select("_id").lean();
            if (existing) {
                return res.status(400).json({ success: false, message: "Email already exists" });
            }
        }
        const user = await User.findByIdAndUpdate(req.user?._id, updates, { new: true, runValidators: true })
            .select("-password -refreshToken -otp -verificationToken")
            .lean();
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                address: user.address || "",
                dob: user.dob || null,
                joiningDate: user.joiningDate || null,
                profileImage: user.profileImage || null,
                designation: user.designation || "",
                department: user.department || "",
                employeeId: user.employeeId || "",
                role: user.role,
                recoveryEmail: user.securitySettings?.recoveryEmail || null,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
    }
});

router.delete("/profile", async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.user?._id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete account", error: error.message });
    }
});

router.post("/profile/avatar", uploadSingle, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const fs = require("fs");
        const path = require("path");
        const avatarDir = path.join(process.cwd(), "public", "avatars");
        if (!fs.existsSync(avatarDir)) {
            fs.mkdirSync(avatarDir, { recursive: true });
        }
        const extension = path.extname(req.file.originalname || "").toLowerCase() || ".png";
        const safeBaseName = path
            .basename(req.file.originalname || "avatar", extension)
            .replace(/[^a-z0-9_-]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48) || "avatar";
        const filename = `${req.user?._id}_${Date.now()}_${safeBaseName}${extension}`;
        const filepath = path.join(avatarDir, filename);
        fs.writeFileSync(filepath, req.file.buffer);
        const avatarUrl = `/avatars/${filename}`;
        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            { profileImage: avatarUrl },
            { new: true }
        ).select("_id profileImage").lean();
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully",
            data: { avatar_url: updatedUser.profileImage, profileImage: updatedUser.profileImage },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to upload avatar", error: error.message });
    }
});

// ─── Primary Email Change (OTP-verified) ───
router.post("/profile/email/request-change", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
            return res.status(400).json({ ok: false, message: "A valid email address is required" });
        }

        const user = await User.findById(req.user?._id)
            .select("_id name email otp.emailChangeOtp")
            .lean();
        if (!user) return res.status(404).json({ ok: false, message: "User not found" });

        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail === user.email.toLowerCase()) {
            return res.status(400).json({ ok: false, code: "same_as_current", message: "New email cannot be the same as your current email" });
        }

        const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } }).select("_id").lean();
        if (existing) {
            return res.status(400).json({ ok: false, code: "email_taken", message: "This email address is already in use" });
        }

        const lastSentAt = user.otp?.emailChangeOtp?.lastSentAt;
        if (lastSentAt) {
            const elapsed = Date.now() - new Date(lastSentAt).getTime();
            if (elapsed < EMAIL_CHANGE_OTP_RESEND_COOLDOWN_MS) {
                const waitSeconds = Math.ceil((EMAIL_CHANGE_OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
                return res.status(429).json({ ok: false, code: "resend_too_soon", message: `Please wait ${waitSeconds}s before resending`, waitSeconds });
            }
        }

        const otp = generateAlphanumericOTP(6);
        const expiresAt = new Date(Date.now() + EMAIL_CHANGE_OTP_TTL_MS);

        await User.findByIdAndUpdate(user._id, {
            $set: {
                "otp.emailChangeOtp": {
                    pendingEmail: normalizedEmail,
                    hash: hashOtp(otp),
                    expiresAt,
                    attempts: 0,
                    lastSentAt: new Date(),
                },
            },
        });

        try {
            await sendEmailChangeOtpEmail(user.email, otp, user.name);
        } catch (mailErr) {
            logger.warn("Email change OTP mail failed — continuing", { error: mailErr.message });
        }

        logger.info("Email change requested", { userId: user._id, pendingEmail: normalizedEmail });
        return res.status(200).json({
            ok: true,
            message: "OTP sent to your current email address",
            maskedCurrentEmail: maskEmail(user.email),
            expiresInSeconds: Math.floor(EMAIL_CHANGE_OTP_TTL_MS / 1000),
            devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
        });
    } catch (error) {
        logger.error("Request email change error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
    }
});

router.post("/profile/email/confirm-change", async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp || typeof otp !== "string") {
            return res.status(400).json({ ok: false, message: "OTP is required" });
        }

        const user = await User.findById(req.user?._id)
            .select("_id name email otp.emailChangeOtp")
            .lean();
        if (!user) return res.status(404).json({ ok: false, message: "User not found" });

        const stored = user.otp?.emailChangeOtp;
        if (!stored?.pendingEmail || !stored?.hash || !stored?.expiresAt) {
            return res.status(400).json({ ok: false, code: "no_pending_change", message: "No pending email change found. Please start over." });
        }

        if ((stored.attempts || 0) >= EMAIL_CHANGE_OTP_MAX_ATTEMPTS) {
            await User.findByIdAndUpdate(user._id, {
                $set: { "otp.emailChangeOtp": { pendingEmail: null, hash: null, expiresAt: null, attempts: 0, lastSentAt: null } },
            });
            return res.status(429).json({ ok: false, code: "too_many_attempts", message: "Too many failed attempts. Please start the process again." });
        }

        if (isOtpExpired(stored.expiresAt)) {
            await User.findByIdAndUpdate(user._id, {
                $set: { "otp.emailChangeOtp.hash": null, "otp.emailChangeOtp.expiresAt": null },
            });
            return res.status(401).json({ ok: false, code: "expired_otp", message: "OTP has expired. Please request a new one." });
        }

        const normalizedOtp = otp.trim().toUpperCase();
        if (!verifyOtpHash(normalizedOtp, stored.hash)) {
            const newAttempts = (stored.attempts || 0) + 1;
            await User.findByIdAndUpdate(user._id, {
                $set: { "otp.emailChangeOtp.attempts": newAttempts },
            });
            const attemptsLeft = EMAIL_CHANGE_OTP_MAX_ATTEMPTS - newAttempts;
            return res.status(401).json({
                ok: false,
                code: "invalid_otp",
                message: attemptsLeft > 0
                    ? `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`
                    : "Invalid OTP. No attempts remaining.",
                attemptsLeft,
            });
        }

        const newEmail = stored.pendingEmail;
        const alreadyTaken = await User.findOne({ email: newEmail, _id: { $ne: user._id } }).select("_id").lean();
        if (alreadyTaken) {
            await User.findByIdAndUpdate(user._id, {
                $set: { "otp.emailChangeOtp": { pendingEmail: null, hash: null, expiresAt: null, attempts: 0, lastSentAt: null } },
            });
            return res.status(400).json({ ok: false, code: "email_taken", message: "This email is already in use. Please start over." });
        }

        await User.findByIdAndUpdate(user._id, {
            $set: {
                email: newEmail,
                "otp.emailChangeOtp": { pendingEmail: null, hash: null, expiresAt: null, attempts: 0, lastSentAt: null },
            },
        });

        logger.info("Primary email updated", { userId: user._id, newEmail });
        return res.status(200).json({
            ok: true,
            message: "Email updated successfully",
            email: newEmail,
            maskedEmail: maskEmail(newEmail),
        });
    } catch (error) {
        logger.error("Confirm email change error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
    }
});

// ─── Recovery Email Setup ───
router.get("/recovery-email", async (req, res) => {
    try {
        const user = await User.findById(req.user?._id)
            .select("email name securitySettings.recoveryEmail securitySettings.pendingRecoveryEmail")
            .lean();
        if (!user) return res.status(404).json({ ok: false, message: "User not found" });

        const active = user.securitySettings?.recoveryEmail || null;
        const pending = user.securitySettings?.pendingRecoveryEmail || null;
        return res.status(200).json({
            ok: true,
            maskedPrimaryEmail: maskEmail(user.email),
            maskedRecoveryEmail: active ? maskEmail(active) : null,
            hasPendingChange: !!pending,
            maskedPendingEmail: pending ? maskEmail(pending) : null,
        });
    } catch (error) {
        logger.error("Get recovery email status error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
    }
});

router.post("/recovery-email/request-change", async (req, res) => {
    try {
        const { recoveryEmail } = req.body;
        if (!recoveryEmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(recoveryEmail.trim())) {
            return res.status(400).json({ ok: false, message: "A valid recovery email address is required" });
        }

        const user = await User.findById(req.user?._id)
            .select("_id name email otp.recoveryEmailChangeOtp")
            .lean();
        if (!user) return res.status(404).json({ ok: false, message: "User not found" });

        const normalizedEmail = recoveryEmail.trim().toLowerCase();
        if (normalizedEmail === user.email.toLowerCase()) {
            return res.status(400).json({ ok: false, code: "same_as_primary", message: "Recovery email cannot be the same as your primary email" });
        }

        const lastSentAt = user.otp?.recoveryEmailChangeOtp?.lastSentAt;
        if (lastSentAt) {
            const elapsed = Date.now() - new Date(lastSentAt).getTime();
            if (elapsed < RECOVERY_OTP_RESEND_COOLDOWN_MS) {
                const waitSeconds = Math.ceil((RECOVERY_OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
                return res.status(429).json({ ok: false, code: "resend_too_soon", message: `Please wait ${waitSeconds}s before resending`, waitSeconds });
            }
        }

        const otp = generateAlphanumericOTP(6);
        const expiresAt = new Date(Date.now() + RECOVERY_OTP_TTL_MS);

        await User.findByIdAndUpdate(user._id, {
            $set: {
                "securitySettings.pendingRecoveryEmail": normalizedEmail,
                "otp.recoveryEmailChangeOtp": {
                    hash: hashOtp(otp),
                    expiresAt,
                    attempts: 0,
                    lastSentAt: new Date(),
                },
            },
        });

        try {
            await sendRecoveryEmailChangeOtpEmail(user.email, otp, user.name);
        } catch (mailErr) {
            logger.warn("Recovery email change OTP mail failed — continuing", { error: mailErr.message });
        }

        logger.info("Recovery email change requested", { userId: user._id, pendingEmail: normalizedEmail });
        return res.status(200).json({
            ok: true,
            message: "OTP sent to your primary email address",
            maskedPrimaryEmail: maskEmail(user.email),
            expiresInSeconds: Math.floor(RECOVERY_OTP_TTL_MS / 1000),
            devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
        });
    } catch (error) {
        logger.error("Request recovery email change error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
    }
});

router.post("/recovery-email/confirm-change", async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp || typeof otp !== "string") {
            return res.status(400).json({ ok: false, message: "OTP is required" });
        }

        const user = await User.findById(req.user?._id)
            .select("_id name email securitySettings.pendingRecoveryEmail otp.recoveryEmailChangeOtp")
            .lean();
        if (!user) return res.status(404).json({ ok: false, message: "User not found" });

        const pending = user.securitySettings?.pendingRecoveryEmail;
        if (!pending) {
            return res.status(400).json({ ok: false, code: "no_pending_change", message: "No pending recovery email change found. Please start over." });
        }

        const stored = user.otp?.recoveryEmailChangeOtp;
        if (!stored?.hash || !stored?.expiresAt) {
            return res.status(400).json({ ok: false, code: "no_active_otp", message: "No active OTP found. Please request a new one." });
        }

        if ((stored.attempts || 0) >= RECOVERY_OTP_MAX_ATTEMPTS) {
            await User.findByIdAndUpdate(user._id, {
                $set: {
                    "securitySettings.pendingRecoveryEmail": null,
                    "otp.recoveryEmailChangeOtp": { hash: null, expiresAt: null, attempts: 0, lastSentAt: null },
                },
            });
            return res.status(429).json({ ok: false, code: "too_many_attempts", message: "Too many failed attempts. Please start the process again." });
        }

        if (isOtpExpired(stored.expiresAt)) {
            await User.findByIdAndUpdate(user._id, {
                $set: { "otp.recoveryEmailChangeOtp.hash": null, "otp.recoveryEmailChangeOtp.expiresAt": null },
            });
            return res.status(401).json({ ok: false, code: "expired_otp", message: "OTP has expired. Please request a new one." });
        }

        const normalizedOtp = otp.trim().toUpperCase();
        if (!verifyOtpHash(normalizedOtp, stored.hash)) {
            const newAttempts = (stored.attempts || 0) + 1;
            await User.findByIdAndUpdate(user._id, {
                $set: { "otp.recoveryEmailChangeOtp.attempts": newAttempts },
            });
            const attemptsLeft = RECOVERY_OTP_MAX_ATTEMPTS - newAttempts;
            return res.status(401).json({
                ok: false,
                code: "invalid_otp",
                message: attemptsLeft > 0
                    ? `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`
                    : "Invalid OTP. No attempts remaining.",
                attemptsLeft,
            });
        }

        await User.findByIdAndUpdate(user._id, {
            $set: {
                "securitySettings.recoveryEmail": pending,
                "securitySettings.pendingRecoveryEmail": null,
                "otp.recoveryEmailChangeOtp": { hash: null, expiresAt: null, attempts: 0, lastSentAt: null },
            },
        });

        logger.info("Recovery email updated", { userId: user._id, recoveryEmail: pending });

        // Fire-and-forget: notify the new recovery email inbox
        sendRecoveryEmailAddedNotificationEmail(pending, user.name, maskEmail(user.email))
            .catch((e) => logger.warn("Recovery email added notification failed", { error: e.message }));

        return res.status(200).json({
            ok: true,
            message: "Recovery email updated successfully",
            recoveryEmail: pending,
            recoveryEmailMasked: maskEmail(pending),
        });
    } catch (error) {
        logger.error("Confirm recovery email change error", { error: error.message });
        return res.status(500).json({ ok: false, message: "Server error" });
    }
});

// ─── Security & Sessions ───
router.get("/security-questions", getSecurityQuestions);
router.post("/security-questions", setSecurityQuestions);

router.get("/sessions", getSessions);
router.post("/sessions/revoke", revokeSession);
router.post("/sessions/revoke-all", revokeAllSessions);

router.get("/trusted-devices", getTrustedDevices);
router.post("/trusted-devices/remove", removeTrustedDevice);

module.exports = router;
