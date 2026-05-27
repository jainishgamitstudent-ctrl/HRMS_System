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
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
    }
});

router.post("/profile/avatar", uploadSingle, async (req, res) => {
    try {
        console.log("[DEBUG] Avatar upload — req.file:", req.file ? { name: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype } : null);
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        // Save file to public/avatars and store path
        const fs = require("fs");
        const path = require("path");
        const avatarDir = path.join(process.cwd(), "public", "avatars");
        if (!fs.existsSync(avatarDir)) {
            fs.mkdirSync(avatarDir, { recursive: true });
        }
        const filename = `${req.user?._id}_${Date.now()}_${req.file.originalname}`;
        const filepath = path.join(avatarDir, filename);
        fs.writeFileSync(filepath, req.file.buffer);
        const avatarUrl = `/avatars/${filename}`;
        console.log("[DEBUG] Avatar saved to:", filepath, "URL:", avatarUrl);
        await User.findByIdAndUpdate(req.user?._id, { profileImage: avatarUrl });
        res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully",
            data: { avatar_url: avatarUrl },
        });
    } catch (error) {
        console.error("[DEBUG] Avatar upload error:", error);
        res.status(500).json({ success: false, message: "Failed to upload avatar", error: error.message });
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
