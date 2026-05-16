const Company = require("../models/company.model");
const User = require("../models/user.model");
const Config = require("../models/config.model");
const Integration = require("../models/integration.model");
const SecurityRequest = require("../models/securityRequest.model");
const crypto = require("crypto");

// --- Company Setup --- //
exports.createCompany = async (req, res) => {
    try {
        const { companyName, email, phone, address, industry, totalEmployees } = req.body;
        const newCompany = await Company.create({
            companyName, email, phone, address, industry, totalEmployees
        });
        res.status(201).json({ message: "Company created successfully", company: newCompany });
    } catch (error) {
        res.status(500).json({ message: "Failed to create company", error: error.message });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const updatableFields = ["companyName", "email", "phone", "address", "industry", "totalEmployees"];
        const updates = {};
        for(let field of updatableFields) {
            if(req.body[field] !== undefined) updates[field] = req.body[field];
        }
        
        const updatedCompany = await Company.findByIdAndUpdate(id, updates, { new: true });
        if(!updatedCompany) return res.status(404).json({ message: "Company not found" });

        res.status(200).json({ message: "Company updated successfully", company: updatedCompany });
    } catch (error) {
        res.status(500).json({ message: "Failed to update company", error: error.message });
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

        const otp = crypto.randomInt(100000, 999999).toString();
        
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
