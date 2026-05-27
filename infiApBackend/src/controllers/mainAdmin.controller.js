const Company = require("../models/company.model");
const User = require("../models/user.model");
const Config = require("../models/config.model");
const Integration = require("../models/integration.model");
const SecurityRequest = require("../models/securityRequest.model");
const crypto = require("crypto");

const generateAlphanumericOTP = (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += chars.charAt(crypto.randomInt(0, chars.length));
    }
    return otp;
};

// --- Company Setup --- //
exports.createCompany = async (req, res) => {
    try {
        const {
            companyName, name,
            email,
            phone, address,
            industry,
            totalEmployees, size,
            country, plan, subdomain, primaryColor, primary_color,
            admin_name, admin_email
        } = req.body;

        const companyData = {
            companyName: companyName || name,
            email,
            phone,
            address,
            industry,
            size,
            totalEmployees: totalEmployees !== undefined ? Number(totalEmployees) : undefined,
            country,
            plan,
            subdomain,
            primaryColor: primaryColor || primary_color,
        };

        let newCompany = await Company.create(companyData);

        // Handle admin user creation if provided
        if (admin_name && admin_email) {
            const existingUser = await User.findOne({ email: admin_email });
            if (!existingUser) {
                await User.create({
                    name: admin_name,
                    email: admin_email,
                    password: crypto.randomBytes(8).toString("hex"),
                    role: "admin",
                    companyId: newCompany._id,
                    isEmailVerified: true
                });
            }
        }

        res.status(201).json({ success: true, message: "Company created successfully", data: { company: newCompany } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create company", error: error.message });
    }
};

exports.uploadCompanyLogo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const fs = require("fs");
        const path = require("path");
        const logoDir = path.join(process.cwd(), "public", "logos");
        if (!fs.existsSync(logoDir)) {
            fs.mkdirSync(logoDir, { recursive: true });
        }
        const filename = `${id}_${Date.now()}_${req.file.originalname}`;
        const filepath = path.join(logoDir, filename);
        fs.writeFileSync(filepath, req.file.buffer);
        const logoUrl = `/logos/${filename}`;

        const updatedCompany = await Company.findByIdAndUpdate(id, { logo: logoUrl }, { new: true });
        if (!updatedCompany) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.status(200).json({ success: true, message: "Logo uploaded successfully", logo_url: logoUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to upload logo", error: error.message });
    }
};

exports.getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findById(id).lean();
        if (!company) return res.status(404).json({ success: false, message: "Company not found" });

        const roleStats = { admin: 0, hr: 0, employee: 0, manager: 0 };
        const users = await User.find({ companyId: company._id }).select("role status updatedAt").lean();
        users.forEach((u) => { if (roleStats[u.role] !== undefined) roleStats[u.role]++; });
        const activeUsers = users.filter((u) => u.status === "Active").length;
        const lastActivityAt = users.length > 0 ? users.reduce((max, u) => u.updatedAt > max ? u.updatedAt : max, users[0].updatedAt) : company.updatedAt;
        const registrationStatus = roleStats.admin > 0 || roleStats.hr > 0 ? "active" : "pending_setup";

        res.status(200).json({
            success: true,
            data: {
                company: {
                    id: company._id,
                    ...company,
                    registrationStatus,
                    userStats: { ...roleStats, activeUsers },
                    lastActivityAt,
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch company", error: error.message });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const updatableFields = ["companyName", "email", "phone", "address", "industry", "size", "totalEmployees", "country", "plan", "subdomain", "primaryColor", "logo"];
        const updates = {};
        for(let field of updatableFields) {
            if(req.body[field] !== undefined) updates[field] = req.body[field];
        }
        
        const updatedCompany = await Company.findByIdAndUpdate(id, updates, { new: true });
        if(!updatedCompany) return res.status(404).json({ success: false, message: "Company not found" });

        res.status(200).json({ success: true, message: "Company updated successfully", data: { company: updatedCompany } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update company", error: error.message });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Company.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Company not found" });
        res.status(200).json({ success: true, message: "Company deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete company", error: error.message });
    }
};

exports.updateCompanyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const updated = await Company.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: "Company not found" });
        res.status(200).json({ success: true, message: "Status updated", data: { company: updated, reason } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update status", error: error.message });
    }
};

exports.getCompanyAdmins = async (req, res) => {
    try {
        const { companyId } = req.params;
        const admins = await User.find({ companyId, role: "admin" }).select("-password -refreshToken").lean();
        res.status(200).json({ success: true, data: admins });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch admins", error: error.message });
    }
};

exports.getCompanyHrUsers = async (req, res) => {
    try {
        const { companyId } = req.params;
        const hrUsers = await User.find({ companyId, role: "hr" }).select("-password -refreshToken").lean();
        res.status(200).json({ success: true, data: hrUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch HR users", error: error.message });
    }
};

// --- Global User Management --- //
const createCompanyUser = async (req, res, targetRole) => {
    try {
        const { name, email, password, role, companyId } = req.body;
        // fallback role if not passed or not matching the explicit target:
        const normalizedRole = String(role || targetRole).trim().toLowerCase().replace(/-/g, "_");
        const userRole = normalizedRole === "main_admin" ? "superadmin" : normalizedRole;

        if (!["admin", "hr", "superadmin"].includes(userRole)) {
            return res.status(400).json({ message: "Invalid role selected" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ message: "User email already exists" });

        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
            companyId,
            isEmailVerified: true // Auto verified for admin-created users
        });

        // Omit password from response
        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({ message: "User created successfully", user: userObj });
    } catch (error) {
        res.status(500).json({ message: "Failed to create user", error: error.message });
    }
};

exports.createAdmin = (req, res) => createCompanyUser(req, res, "admin");
exports.createHR = (req, res) => createCompanyUser(req, res, "hr");

exports.updateUserPermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(id, { permissions }, { new: true }).select("-password");
        if(!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User permissions updated", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Failed to update permissions", error: error.message });
    }
};

// --- Platform Configuration --- //
exports.updateConfig = async (req, res) => {
    try {
        const { maintenanceMode, maxUsersPerCompany, defaultLeaveDays } = req.body;
        // Since there is usually only one global config, let's find the first one or create it.
        let config = await Config.findOne();
        if(!config) {
            config = new Config({});
        }

        if(maintenanceMode !== undefined) config.maintenanceMode = maintenanceMode;
        if(maxUsersPerCompany !== undefined) config.maxUsersPerCompany = maxUsersPerCompany;
        if(defaultLeaveDays !== undefined) config.defaultLeaveDays = defaultLeaveDays;

        await config.save();
        res.status(200).json({ message: "Config updated successfully", config });
    } catch (error) {
        res.status(500).json({ message: "Failed to update config", error: error.message });
    }
};

// --- System Integrations --- //
const upsertIntegration = async (req, res, type) => {
    try {
        const data = { ...req.body, type };
        const integration = await Integration.findOneAndUpdate(
            { type }, 
            data, 
            { new: true, upsert: true }
        );
        res.status(200).json({ message: "Integration updated successfully", integration });
    } catch (error) {
        res.status(500).json({ message: "Failed to update integration", error: error.message });
    }
};

exports.updateIntegrationCloud = (req, res) => upsertIntegration(req, res, "cloud");
exports.updateIntegrationEmail = (req, res) => upsertIntegration(req, res, "email");
exports.updateIntegrationSecurity = (req, res) => upsertIntegration(req, res, "security");

// --- OTP Approval System --- //
exports.generateOTP = async (req, res) => {
    try {
        const { action, requestedBy } = req.body;

        const otp = generateAlphanumericOTP();
        
        const request = await SecurityRequest.create({
            action,
            requestedBy,
            otp,
            status: "pending"
        });

        // You would typically send this OTP to the admin's email or phone here
        res.status(201).json({ message: "OTP generated", requestId: request._id });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate OTP", error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { otp, requestId } = req.body;

        const request = await SecurityRequest.findById(requestId);
        if(!request) return res.status(404).json({ message: "Request not found" });

        if(request.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        request.status = "verified";
        await request.save();

        res.status(200).json({ message: "OTP verified", requestId: request._id });
    } catch (error) {
        res.status(500).json({ message: "Failed to verify OTP", error: error.message });
    }
};

exports.approveChange = async (req, res) => {
    try {
        const { requestId, approvedBy } = req.body;

        const request = await SecurityRequest.findById(requestId);
        if(!request) return res.status(404).json({ message: "Request not found" });

        if(request.status !== "verified") {
            return res.status(400).json({ message: "Request must be verified first" });
        }

        request.status = "approved";
        request.approvedBy = approvedBy;
        await request.save();

        res.status(200).json({ message: "Change approved", requestId: request._id });
    } catch (error) {
        res.status(500).json({ message: "Failed to approve change", error: error.message });
    }
};

exports.rejectChange = async (req, res) => {
    try {
        const { requestId, reason } = req.body;

        const request = await SecurityRequest.findById(requestId);
        if(!request) return res.status(404).json({ message: "Request not found" });

        request.status = "rejected";
        request.reason = reason;
        await request.save();

        res.status(200).json({ message: "Change rejected", requestId: request._id });
    } catch (error) {
        res.status(500).json({ message: "Failed to reject change", error: error.message });
    }
};
