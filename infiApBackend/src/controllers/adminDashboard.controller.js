const User = require("../models/user.model");
const Department = require("../models/department.model");
const Team = require("../models/team.model");
const Job = require("../models/job.model");
const LeaveApplication = require("../models/leaveApplication.model");
const Payroll = require("../models/payroll.model");
const Document = require("../models/document.model");
const Config = require("../models/config.model");
const Candidate = require("../models/candidate.model");
const Activity = require("../models/activity.model");
const SalaryStructure = require("../models/salaryStructure.model");
const Notification = require("../models/notification.model");
const Performance = require("../models/performance.model");
const Resignation = require("../models/resignation.model");
const RequestRoom = require("../models/requestRoom.model");
const { notifyUser } = require("../utils/notifier");
const { emitEntityEvent } = require("../utils/socketManager");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const DEPARTMENT_CATEGORIES = ["tech", "ui/ux", "social media", "developers", "rnd"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const JOB_STATUSES = ["Open", "Filled", "Closed", "On Hold"];
const SHORTLIST_PIPELINE_STATUSES = ["Shortlisted", "Technical Interview", "Selected", "Hired", "Rejected"];
const INTERVIEW_MODES = ["Online", "Offline"];
const NOTIFICATION_CATEGORIES = ["announcement", "policy", "alert"];
const NOTIFICATION_AUDIENCES = ["all_employee", "department", "hr"];
const NOTIFICATION_STATUSES = ["Draft", "Scheduled", "Sent"];
const ACTIVE_STAFF_ROLES = ["employee", "manager", "hr", "admin"];
const ADMIN_PROFILE_UPDATABLE_FIELDS = ["name", "email", "phone", "address", "dob", "profileImage", "designation", "department", "employeeId", "joiningDate"];

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
};

const parseStringList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || "").trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const normalizeAudience = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (["all_employee", "all employees", "all employee", "all-employee"].includes(normalized)) return "all_employee";
    if (normalized === "department") return "department";
    if (normalized === "hr") return "hr";
    return "";
};

const normalizeCategory = (value) => String(value || "").trim().toLowerCase();

const normalizeStatus = (value) => {
    if (!value) return "";
    const normalized = String(value).trim().toLowerCase();
    if (normalized === "draft") return "Draft";
    if (normalized === "scheduled") return "Scheduled";
    if (normalized === "sent") return "Sent";
    return "";
};

const getTargetedStaffCount = async (targetedAudience, targetDepartments = []) => {
    if (targetedAudience === "hr") {
        return User.countDocuments({ role: "hr", status: "Active" });
    }

    if (targetedAudience === "department") {
        return User.countDocuments({
            role: { $in: ACTIVE_STAFF_ROLES },
            status: "Active",
            department: { $in: targetDepartments }
        });
    }

    return User.countDocuments({ role: { $in: ACTIVE_STAFF_ROLES }, status: "Active" });
};

const getBroadcastType = (notification) => {
    if (notification.category === "policy") return "Policy Update";
    if (notification.sentBy?.role === "hr" || notification.targetedAudience === "hr") return "HR Announcement";
    return "Admin Announcement";
};

const formatNotificationItem = (notification) => ({
    id: notification._id,
    category: notification.category,
    targetedAudience: notification.targetedAudience,
    targetDepartments: notification.targetDepartments || [],
    status: notification.status,
    announcementHeadline: notification.headline,
    announcementDetails: notification.details,
    announcementDate: notification.createdAt,
    announcementYear: new Date(notification.createdAt).getFullYear(),
    broadcastType: getBroadcastType(notification),
    sentBy: {
        id: notification.sentBy?._id || null,
        name: notification.sentBy?.name || null,
        role: notification.sentBy?.role || null
    },
    sentCount: notification.sentCount || 0,
    resentCount: notification.resentCount || 0,
    scheduleTask: notification.scheduleAt || null,
    isActive: notification.isActive,
    options: ["edit", "resend"]
});

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getStartOfWeek = (date) => {
    const d = startOfDay(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday start
    d.setDate(d.getDate() + diff);
    return d;
};

const getRangeMetrics = async (from, to) => {
    const [payrollSummary, performanceSummary, approvedResignations, activeStaffCount] = await Promise.all([
        Payroll.aggregate([
            {
                $match: {
                    createdAt: { $gte: from, $lte: to }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: {
                            $add: [
                                { $ifNull: ["$basicSalary", 0] },
                                { $ifNull: ["$allowances", 0] },
                                { $ifNull: ["$bonus", 0] }
                            ]
                        }
                    },
                    expenses: { $sum: { $ifNull: ["$netPay", 0] } }
                }
            }
        ]),
        Performance.aggregate([
            {
                $match: {
                    createdAt: { $gte: from, $lte: to }
                }
            },
            {
                $group: {
                    _id: null,
                    efficiency: { $avg: { $ifNull: ["$overallScore", 0] } }
                }
            }
        ]),
        Resignation.countDocuments({
            status: "Approved",
            updatedAt: { $gte: from, $lte: to }
        }),
        User.countDocuments({
            role: { $in: ACTIVE_STAFF_ROLES },
            status: "Active"
        })
    ]);

    const revenue = payrollSummary[0]?.revenue || 0;
    const expenses = payrollSummary[0]?.expenses || 0;
    const efficiency = performanceSummary[0]?.efficiency || 0;
    const turnover = activeStaffCount > 0 ? (approvedResignations / activeStaffCount) * 100 : 0;

    return {
        revenue: round2(revenue),
        expenses: round2(expenses),
        efficiency: round2(efficiency),
        turnover: round2(turnover)
    };
};

const buildInterviewPerformance = (technicalInterview = {}) => {
    const score = Number.isFinite(Number(technicalInterview.score)) ? Number(technicalInterview.score) : null;

    let performanceBand = "Not Evaluated";
    if (score !== null) {
        if (score >= 8) performanceBand = "Excellent";
        else if (score >= 6) performanceBand = "Good";
        else if (score >= 4) performanceBand = "Average";
        else performanceBand = "Needs Improvement";
    }

    return {
        status: technicalInterview.status || "Pending",
        score,
        performanceBand,
        interviewer: technicalInterview.interviewer || null,
        date: technicalInterview.date || null,
        feedback: technicalInterview.feedback || null
    };
};

const formatSalaryStructure = (salary) => ({
    id: salary._id,
    employee: {
        id: salary.userId?._id,
        name: salary.userId?.name,
        email: salary.userId?.email,
        employeeId: salary.userId?.employeeId,
        department: salary.userId?.department,
        designation: salary.userId?.designation,
        profileImage: salary.userId?.profileImage
    },
    annualCtc: {
        amount: salary.annualCtcAmount
    },
    monthlyTakeHome: {
        amount: salary.monthlyTakeHomeAmount
    },
    earning: {
        baseSalary: salary.earnings?.baseSalary || 0,
        totalEarning: salary.earnings?.totalEarning || 0
    },
    deduction: {
        pf: salary.deductions?.pf || 0,
        tax: salary.deductions?.tax || 0,
        totalDeduction: salary.deductions?.totalDeduction || 0
    },
    currency: salary.currency,
    effectiveFrom: salary.effectiveFrom,
    createdAt: salary.createdAt,
    updatedAt: salary.updatedAt
});

const parseBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") return true;
        if (normalized === "false") return false;
    }
    return undefined;
};

const formatAdminPersonalInformation = (admin) => ({
    adminName: admin.name,
    email: admin.email,
    phone: admin.phone || null,
    address: admin.address || null,
    dob: admin.dob || null,
    joiningDate: admin.joiningDate || null,
    profileImage: admin.profileImage || null,
    designation: admin.designation || null,
    department: admin.department || null,
    employeeId: admin.employeeId || null,
    role: admin.role,
    companyName: admin.companyId?.companyName || null,
    companyId: admin.companyId?._id || null
});

const formatAdminSecuritySettings = (admin) => ({
    twoFactorEnabled: admin.securitySettings?.twoFactorEnabled ?? false,
    loginAlerts: admin.securitySettings?.loginAlerts ?? true,
    recoveryEmail: admin.securitySettings?.recoveryEmail || null,
    sessionTimeoutMinutes: admin.securitySettings?.sessionTimeoutMinutes ?? 30,
    passwordUpdatedAt: admin.securitySettings?.passwordUpdatedAt || null
});

const getNotificationPerformanceSummary = async (adminId) => {
    const now = new Date();

    const [notificationSentTotal, scheduledTask, totalActiveAlerts] = await Promise.all([
        Notification.countDocuments({ sentBy: adminId, status: "Sent" }),
        Notification.countDocuments({ sentBy: adminId, status: "Scheduled", scheduleAt: { $gte: now } }),
        Notification.countDocuments({ sentBy: adminId, category: "alert", isActive: true })
    ]);

    return {
        notificationSentTotal,
        scheduledTask,
        totalActiveAlerts
    };
};

const updateAdminProfileFields = async (adminId, payload) => {
    const updates = {};

    ADMIN_PROFILE_UPDATABLE_FIELDS.forEach((field) => {
        if (payload[field] !== undefined) updates[field] = payload[field];
    });

    if (Object.keys(updates).length === 0) {
        return { error: "No valid profile fields provided" };
    }

    if (updates.email !== undefined) {
        updates.email = String(updates.email).trim().toLowerCase();
        const existing = await User.findOne({ email: updates.email, _id: { $ne: adminId } }).select("_id");
        if (existing) {
            return { error: "Email already exists" };
        }
    }

    const updatedAdmin = await User.findByIdAndUpdate(
        adminId,
        updates,
        { new: true, runValidators: true }
    )
        .populate("companyId", "companyName")
        .select("-password -refreshToken")
        .lean();

    return { data: updatedAdmin };
};

// --- 1. Dashboard Summary Stats ---
exports.getSummaryStats = async (req, res) => {
    try {
        const [
            totalDepartments,
            activeDepartments,
            totalEmployees,
            activeStaff,
            totalTeams,
            activeTeams,
            activeJobs,
            pendingLeaves,
            resignations
        ] = await Promise.all([
            Department.countDocuments(),
            Department.countDocuments({ isActive: true }),
            User.countDocuments({ role: { $in: ["employee", "hr", "admin"] }, status: { $ne: "Terminate" } }),
            User.countDocuments({ role: { $in: ["employee", "hr", "admin"] }, status: "Active" }),
            Team.countDocuments(),
            Team.countDocuments({ isActive: true }),
            Job.countDocuments({ status: "Open" }),
            LeaveApplication.countDocuments({ ApprovalStatus: "Awaiting Approve" }),
            Resignation.countDocuments({ status: { $in: ["Submitted", "Under Review"] } })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalDepartments,
                activeDepartments,
                departments: activeDepartments,
                totalEmployees,
                activeStaff,
                employees: activeStaff,
                totalTeams,
                activeTeams,
                teams: totalTeams,
                activeJobs,
                openJobs: activeJobs,
                pendingLeaves,
                resignations
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 2. Key Insights ---
exports.getKeyInsights = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Stats
        const [pendingLeaves, openPositions] = await Promise.all([
            LeaveApplication.countDocuments({ ApprovalStatus: "Awaiting Approve" }),
            Job.countDocuments({ status: "Open" })
        ]);

        // Monthly Payroll (Sum of netPay for current month)
        // Note: In a real app, you'd filter by month/year fields if they exist, or createdAt
        const monthlyPayrollData = await Payroll.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPayroll: { $sum: "$netPay" }
                }
            }
        ]);
        const monthlyPayroll = monthlyPayrollData.length > 0 ? monthlyPayrollData[0].totalPayroll : 0;

        // New Hires (joined this month)
        const newHires = await User.countDocuments({
            role: { $in: ["employee", "hr"] },
            joiningDate: { $gte: startOfMonth }
        });

        res.status(200).json({
            success: true,
            data: {
                pendingLeaves,
                monthlyPayroll,
                openPositions,
                newHires
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 3. Admin Profile & Account Settings ---
exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user?._id)
            .populate("companyId", "companyName")
            .select("-password -refreshToken")
            .lean();

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                adminName: admin.name,
                companyName: admin.companyId?.companyName || null,
                profile: formatAdminPersonalInformation(admin)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAdminAccountSettings = async (req, res) => {
    try {
        const admin = await User.findById(req.user?._id)
            .populate("companyId", "companyName")
            .select("-password -refreshToken")
            .lean();

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const notificationPerformance = await getNotificationPerformanceSummary(admin._id);

        res.status(200).json({
            success: true,
            data: {
                personalInformation: formatAdminPersonalInformation(admin),
                securityAndPassword: formatAdminSecuritySettings(admin),
                notificationPerformance: {
                    ...notificationPerformance,
                    preferences: {
                        emailNotifications: admin.notificationPreferences?.emailNotifications ?? true,
                        hrAnnouncements: admin.notificationPreferences?.hrAnnouncements ?? true,
                        adminAnnouncements: admin.notificationPreferences?.adminAnnouncements ?? true,
                        policyUpdates: admin.notificationPreferences?.policyUpdates ?? true,
                        alerts: admin.notificationPreferences?.alerts ?? true
                    }
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAdminProfile = async (req, res) => {
    try {
        const result = await updateAdminProfileFields(req.user?._id, req.body);

        if (result.error) {
            return res.status(400).json({ success: false, message: result.error });
        }

        if (!result.data) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: formatAdminPersonalInformation(result.data)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAdminPersonalInformation = async (req, res) => {
    try {
        const result = await updateAdminProfileFields(req.user?._id, req.body);

        if (result.error) {
            return res.status(400).json({ success: false, message: result.error });
        }

        if (!result.data) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.status(200).json({
            success: true,
            message: "Personal information updated successfully",
            data: formatAdminPersonalInformation(result.data)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAdminSecuritySettings = async (req, res) => {
    try {
        const { twoFactorEnabled, loginAlerts, recoveryEmail, sessionTimeoutMinutes } = req.body;
        const admin = await User.findById(req.user?._id);

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const securitySettings = { ...(admin.securitySettings?.toObject?.() || admin.securitySettings || {}) };
        let hasChanges = false;

        if (twoFactorEnabled !== undefined) {
            const parsed = parseBoolean(twoFactorEnabled);
            if (parsed === undefined) {
                return res.status(400).json({ success: false, message: "twoFactorEnabled must be true or false" });
            }
            securitySettings.twoFactorEnabled = parsed;
            hasChanges = true;
        }

        if (loginAlerts !== undefined) {
            const parsed = parseBoolean(loginAlerts);
            if (parsed === undefined) {
                return res.status(400).json({ success: false, message: "loginAlerts must be true or false" });
            }
            securitySettings.loginAlerts = parsed;
            hasChanges = true;
        }

        if (recoveryEmail !== undefined) {
            const normalizedRecoveryEmail = String(recoveryEmail || "").trim().toLowerCase();
            if (normalizedRecoveryEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(normalizedRecoveryEmail)) {
                    return res.status(400).json({ success: false, message: "Invalid recoveryEmail format" });
                }
            }
            securitySettings.recoveryEmail = normalizedRecoveryEmail || undefined;
            hasChanges = true;
        }

        if (sessionTimeoutMinutes !== undefined) {
            const parsedTimeout = Number(sessionTimeoutMinutes);
            if (!Number.isInteger(parsedTimeout) || parsedTimeout < 5 || parsedTimeout > 1440) {
                return res.status(400).json({
                    success: false,
                    message: "sessionTimeoutMinutes must be an integer between 5 and 1440"
                });
            }
            securitySettings.sessionTimeoutMinutes = parsedTimeout;
            hasChanges = true;
        }

        if (!hasChanges) {
            return res.status(400).json({ success: false, message: "No security settings provided" });
        }

        admin.securitySettings = securitySettings;
        await admin.save();

        const updatedAdmin = await User.findById(admin._id)
            .populate("companyId", "companyName")
            .select("-password -refreshToken")
            .lean();

        res.status(200).json({
            success: true,
            message: "Security settings updated successfully",
            data: formatAdminSecuritySettings(updatedAdmin)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAdminPassword = async (req, res) => {
    try {
        const { currentPassword, oldPassword, newPassword, confirmPassword } = req.body;
        const existingPassword = currentPassword || oldPassword;

        if (!existingPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "currentPassword and newPassword are required"
            });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({ success: false, message: "newPassword must be at least 6 characters" });
        }

        if (confirmPassword !== undefined && String(confirmPassword) !== String(newPassword)) {
            return res.status(400).json({ success: false, message: "confirmPassword does not match newPassword" });
        }

        if (String(existingPassword) === String(newPassword)) {
            return res.status(400).json({ success: false, message: "newPassword must be different from current password" });
        }

        const admin = await User.findById(req.user?._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const isPasswordValid = await admin.isPasswordCorrect(String(existingPassword));
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        admin.password = String(newPassword);
        admin.securitySettings = {
            ...(admin.securitySettings?.toObject?.() || admin.securitySettings || {}),
            passwordUpdatedAt: new Date()
        };
        await admin.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAdminNotificationPreferences = async (req, res) => {
    try {
        const admin = await User.findById(req.user?._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const preferences = {
            ...(admin.notificationPreferences?.toObject?.() || admin.notificationPreferences || {})
        };

        const preferenceFields = ["emailNotifications", "hrAnnouncements", "adminAnnouncements", "policyUpdates", "alerts"];
        let hasChanges = false;

        preferenceFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                const parsed = parseBoolean(req.body[field]);
                if (parsed !== undefined) {
                    preferences[field] = parsed;
                    hasChanges = true;
                }
            }
        });

        if (!hasChanges) {
            return res.status(400).json({ success: false, message: "No valid notification preference fields provided" });
        }

        admin.notificationPreferences = preferences;
        await admin.save();

        const notificationPerformance = await getNotificationPerformanceSummary(admin._id);

        res.status(200).json({
            success: true,
            message: "Notification preferences updated successfully",
            data: {
                ...notificationPerformance,
                preferences
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAnalyticsReport = async (req, res) => {
    try {
        const now = new Date();
        const weekStart = getStartOfWeek(now);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        const yearStart = new Date(now.getFullYear(), 0, 1);
        yearStart.setHours(0, 0, 0, 0);

        const [thisWeek, thisMonth, thisYear] = await Promise.all([
            getRangeMetrics(weekStart, now),
            getRangeMetrics(monthStart, now),
            getRangeMetrics(yearStart, now)
        ]);

        res.status(200).json({
            success: true,
            data: {
                thisWeek,
                thisMonth,
                thisYear,
                generatedAt: now
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 3. Department Management ---
exports.getCreateDepartmentForm = async (req, res) => {
    try {
        const [potentialHeads, totalDepartments, totalTeams, totalStaff] = await Promise.all([
            User.find({ role: { $nin: ["main_admin", "superadmin"] } })
                .select("name email designation role")
                .sort({ name: 1 })
                .lean(),
            Department.countDocuments({ isActive: true }),
            Team.countDocuments(),
            User.countDocuments({ role: "employee" })
        ]);

        res.status(200).json({
            success: true,
            data: {
                title: "Create Department",
                summary: {
                    totalDepartments,
                    totalTeams,
                    totalStaff
                },
                fields: [
                    { key: "departmentName", label: "Department Name", type: "text", required: true },
                    {
                        key: "departmentHead",
                        label: "Department Head",
                        type: "select",
                        required: true,
                        options: potentialHeads.map((user) => ({
                            value: user._id,
                            label: `${user.name} (${user.email})`,
                            meta: {
                                designation: user.designation || null,
                                role: user.role
                            }
                        }))
                    },
                    {
                        key: "departmentCategory",
                        label: "Department Category",
                        type: "select",
                        required: true,
                        options: DEPARTMENT_CATEGORIES
                    },
                    { key: "numberOfTeams", label: "Number of Teams", type: "number", required: true, min: 0 }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const {
            departmentName,
            departmentHead,
            departmentCategory,
            numberOfTeams,
            numberOrTeams,
            name,
            head,
            category,
            description,
            tag,
            tagColor
        } = req.body;

        const normalizedName = String(departmentName || name || "").trim();
        const normalizedHead = String(departmentHead || head || "").trim();
        const normalizedCategory = String(departmentCategory || category || "").trim().toLowerCase();
        const parsedTeams = Number(numberOfTeams ?? numberOrTeams);

        if (!normalizedName || !normalizedHead || !normalizedCategory || Number.isNaN(parsedTeams)) {
            return res.status(400).json({
                success: false,
                message: "departmentName, departmentHead, departmentCategory, and numberOfTeams are required"
            });
        }

        if (!DEPARTMENT_CATEGORIES.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                message: `departmentCategory must be one of: ${DEPARTMENT_CATEGORIES.join(", ")}`
            });
        }

        if (!Number.isInteger(parsedTeams) || parsedTeams < 0) {
            return res.status(400).json({
                success: false,
                message: "numberOfTeams must be a non-negative integer"
            });
        }

        const headUser = await User.findById(normalizedHead).select("_id name email designation");
        if (!headUser) {
            return res.status(404).json({ success: false, message: "Department head user not found" });
        }

        const exists = await Department.findOne({
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" }
        });
        if (exists) return res.status(400).json({ success: false, message: "Department already exists" });

        const dept = await Department.create({
            name: normalizedName,
            description,
            head: headUser._id,
            category: normalizedCategory,
            numberOfTeams: parsedTeams,
            tag,
            tagColor
        });

        const populatedDepartment = await Department.findById(dept._id).populate("head", "name email designation role");
        res.status(201).json({ success: true, data: populatedDepartment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDepartmentAddEmployeeForm = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true }).select("name").sort({ name: 1 }).lean();

        res.status(200).json({
            success: true,
            data: {
                title: "Add Employee",
                fields: [
                    { key: "fullName", label: "Full Name", type: "text", required: true },
                    { key: "email", label: "Email Address", type: "email", required: true },
                    { key: "designation", label: "Designation", type: "text", required: true },
                    {
                        key: "department",
                        label: "Department",
                        type: "select",
                        required: true,
                        options: departments.map((dept) => dept.name)
                    },
                    { key: "password", label: "Password", type: "password", required: true }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addDepartmentEmployee = async (req, res) => {
    try {
        const { fullName, name, email, designation, department, password } = req.body;

        const normalizedName = (fullName || name || "").trim();
        const normalizedEmail = (email || "").trim().toLowerCase();
        const normalizedDesignation = (designation || "").trim();
        const normalizedDepartment = (department || "").trim();

        if (!normalizedName || !normalizedEmail || !normalizedDesignation || !normalizedDepartment || !password) {
            return res.status(400).json({
                success: false,
                message: "fullName, email, designation, department, and password are required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (String(password).trim().length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const departmentDoc = await Department.findOne({
            name: { $regex: `^${escapeRegex(normalizedDepartment)}$`, $options: "i" },
            isActive: true
        });

        if (!departmentDoc) {
            return res.status(404).json({ success: false, message: "Department not found or inactive" });
        }

        const employee = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password: String(password),
            role: "employee",
            designation: normalizedDesignation,
            department: departmentDoc.name,
            isEmailVerified: true
        });

        const createdEmployee = await User.findById(employee._id).select("-password -refreshToken");

        res.status(201).json({
            success: true,
            message: "Employee added successfully",
            data: createdEmployee
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDepartments = async (req, res) => {
    try {
        const depts = await Department.find().populate("head", "name email");
        
        // Add member counts dynamically for each department
        const deptsWithCounts = await Promise.all(depts.map(async (dept) => {
            const [employeeCount, activeStaffCount, totalTeamCount, activeTeamCount] = await Promise.all([
                User.countDocuments({ department: dept.name, status: { $ne: "Terminate" } }),
                User.countDocuments({ department: dept.name, status: "Active" }),
                Team.countDocuments({ departmentId: dept._id }),
                Team.countDocuments({ departmentId: dept._id, isActive: true })
            ]);
            return {
                ...dept._doc,
                employeeCount: activeStaffCount,
                totalEmployees: employeeCount,
                teamCount: totalTeamCount,
                activeTeams: activeTeamCount,
                teams: totalTeamCount,
                employees: activeStaffCount
            };
        }));

        res.status(200).json({ success: true, data: deptsWithCounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const dept = await Department.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, data: dept });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        await Department.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 4. Team Management ---
exports.createTeam = async (req, res) => {
    try {
        const { name, departmentId, lead, members, icon, color } = req.body;
        const team = await Team.create({ name, departmentId, lead, members, icon, color });
        
        // Update the department's team count if the new actual count exceeds the initial planned count
        const actualTeamCount = await Team.countDocuments({ departmentId, isActive: true });
        await Department.findByIdAndUpdate(departmentId, {
            $max: { numberOfTeams: actualTeamCount }
        });

        res.status(201).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getManageTeamSummary = async (req, res) => {
    try {
        const [departments, totalTeams, totalStaff] = await Promise.all([
            Department.find({ isActive: true }).select("name").lean(),
            Team.countDocuments({ isActive: true }),
            User.countDocuments({ role: { $in: ["employee", "hr", "admin"] }, status: "Active" })
        ]);

        const departmentCards = await Promise.all(
            departments.map(async (department) => {
                const [members, totalDepartmentTeams] = await Promise.all([
                    User.find({
                        department: { $regex: `^${escapeRegex(department.name)}$`, $options: "i" },
                        role: { $in: ["employee", "hr", "admin"] },
                        status: "Active"
                    })
                        .select("name email employeeId designation department profileImage status")
                        .sort({ name: 1 })
                        .lean(),
                    Team.countDocuments({ departmentId: department._id, isActive: true })
                ]);

                return {
                    departmentName: department.name,
                    totalMembers: members.length,
                    totalTeams: totalDepartmentTeams,
                    members
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                totals: {
                    totalDepartments: departments.length,
                    totalTeams,
                    totalStaff
                },
                departments: departmentCards
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate("departmentId", "name category numberOfTeams")
            .populate("lead", "name email employeeId designation department profileImage status")
            .populate("members", "name email employeeId designation department profileImage status")
            .sort({ createdAt: -1 });

        const teamsByDepartment = teams.reduce((acc, team) => {
            const departmentName = team.departmentId?.name || "Unassigned";
            if (!acc[departmentName]) {
                acc[departmentName] = {
                    departmentName,
                    departmentId: team.departmentId?._id || null,
                    category: team.departmentId?.category || null,
                    teams: []
                };
            }

            acc[departmentName].teams.push({
                _id: team._id,
                name: team.name,
                icon: team.icon,
                color: team.color,
                isActive: team.isActive,
                createdAt: team.createdAt,
                lead: team.lead,
                totalMembers: team.members?.length || 0,
                members: team.members || []
            });

            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                totalTeams: teams.length,
                departments: Object.values(teamsByDepartment)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findByIdAndUpdate(id, req.body, { new: true })
            .populate("departmentId", "name category numberOfTeams")
            .populate("lead", "name email employeeId designation department profileImage status")
            .populate("members", "name email employeeId designation department profileImage status");

        res.status(200).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        await Team.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Team deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 5. Payroll Management ---
exports.createSalaryStructure = async (req, res) => {
    try {
        const {
            userId,
            annualCtcAmount,
            monthlyTakeHomeAmount,
            earnings = {},
            deductions = {},
            baseSalary,
            totalEarning,
            pf,
            tax,
            totalDeduction,
            currency = "INR",
            effectiveFrom
        } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }

        const employee = await User.findById(userId).select("_id name email employeeId department designation profileImage");
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const normalizedBaseSalary = toNumber(earnings.baseSalary ?? baseSalary);
        const normalizedTotalEarning = toNumber(earnings.totalEarning ?? totalEarning ?? normalizedBaseSalary);
        const normalizedPf = toNumber(deductions.pf ?? pf ?? 0);
        const normalizedTax = toNumber(deductions.tax ?? tax ?? 0);
        const normalizedTotalDeduction = toNumber(deductions.totalDeduction ?? totalDeduction ?? (normalizedPf + normalizedTax));
        const normalizedMonthlyTakeHome = toNumber(monthlyTakeHomeAmount ?? (normalizedTotalEarning - normalizedTotalDeduction));
        const normalizedAnnualCtc = toNumber(annualCtcAmount ?? (normalizedMonthlyTakeHome * 12));

        const salaryValues = [
            normalizedBaseSalary,
            normalizedTotalEarning,
            normalizedPf,
            normalizedTax,
            normalizedTotalDeduction,
            normalizedMonthlyTakeHome,
            normalizedAnnualCtc
        ];

        if (salaryValues.some((value) => !Number.isFinite(value) || value < 0)) {
            return res.status(400).json({
                success: false,
                message: "Invalid salary values. All amounts must be valid non-negative numbers"
            });
        }

        const payload = {
            userId,
            annualCtcAmount: normalizedAnnualCtc,
            monthlyTakeHomeAmount: normalizedMonthlyTakeHome,
            earnings: {
                baseSalary: normalizedBaseSalary,
                totalEarning: normalizedTotalEarning
            },
            deductions: {
                pf: normalizedPf,
                tax: normalizedTax,
                totalDeduction: normalizedTotalDeduction
            },
            currency: String(currency || "INR").trim().toUpperCase(),
            effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date()
        };

        const salaryStructure = await SalaryStructure.findOneAndUpdate(
            { userId },
            payload,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).populate("userId", "name email employeeId department designation profileImage");

        res.status(201).json({
            success: true,
            message: "Salary structure saved successfully",
            data: formatSalaryStructure(salaryStructure)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSalaryStructure = async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = {};
        if (userId) filter.userId = userId;

        const structures = await SalaryStructure.find(filter)
            .populate("userId", "name email employeeId department designation profileImage")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: userId ? (structures[0] ? formatSalaryStructure(structures[0]) : null) : structures.map(formatSalaryStructure)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPayrollDashboard = async (req, res) => {
    try {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const { month, year } = req.query;
        const now = new Date();
        const targetYear = Number(year) || now.getFullYear();

        let targetMonthName = monthNames[now.getMonth()];
        if (month) {
            const monthIndex = Number(month);
            if (Number.isInteger(monthIndex) && monthIndex >= 1 && monthIndex <= 12) {
                targetMonthName = monthNames[monthIndex - 1];
            } else {
                const normalizedMonth = String(month).trim().toLowerCase();
                const matchedMonth = monthNames.find((m) => m.toLowerCase() === normalizedMonth);
                if (matchedMonth) targetMonthName = matchedMonth;
            }
        }

        const monthlyFilter = { month: targetMonthName, year: targetYear };

        const monthlySummaryRows = await Payroll.aggregate([
            { $match: monthlyFilter },
            {
                $group: {
                    _id: null,
                    totalMonthlyPayroll: { $sum: "$netPay" },
                    paidAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Paid"] }, "$netPay", 0]
                        }
                    },
                    pendingAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Pending"] }, "$netPay", 0]
                        }
                    },
                    processedAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Processed"] }, "$netPay", 0]
                        }
                    },
                    payrollCount: { $sum: 1 },
                    paidCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Paid"] }, 1, 0]
                        }
                    },
                    pendingCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Pending"] }, 1, 0]
                        }
                    },
                    processedCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Processed"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const monthlySummary = monthlySummaryRows[0] || {
            totalMonthlyPayroll: 0,
            paidAmount: 0,
            pendingAmount: 0,
            processedAmount: 0,
            payrollCount: 0,
            paidCount: 0,
            pendingCount: 0,
            processedCount: 0
        };

        const outstandingAmount = monthlySummary.totalMonthlyPayroll - monthlySummary.paidAmount;

        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Monthly payroll trend for chart
        const payrollTrend = await Payroll.aggregate([
            {
                $match: { createdAt: { $gte: startOfYear } }
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    total: { $sum: "$netPay" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Status counts
        const statusStats = await Payroll.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                month: targetMonthName,
                year: targetYear,
                summary: {
                    totalMonthlyPayroll: monthlySummary.totalMonthlyPayroll,
                    paid: monthlySummary.paidAmount,
                    pending: monthlySummary.pendingAmount,
                    outstanding: outstandingAmount,
                    processed: monthlySummary.processedAmount,
                    counts: {
                        total: monthlySummary.payrollCount,
                        paid: monthlySummary.paidCount,
                        pending: monthlySummary.pendingCount,
                        processed: monthlySummary.processedCount
                    }
                },
                trend: payrollTrend,
                statusStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// --- 6. Recruitment Control ---
exports.getCandidateTracking = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;

        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));
        const skip = (pageNumber - 1) * limitNumber;

        const basePipelineFilter = {
            $or: [
                { status: { $in: SHORTLIST_PIPELINE_STATUSES } },
                { "recruitmentProgress.stage": "Shortlisted" }
            ]
        };

        let filter = { ...basePipelineFilter };

        if (status && status !== "all") {
            filter = { status };
        }

        if (search) {
            const searchRegex = new RegExp(escapeRegex(String(search).trim()), "i");
            const searchFilter = {
                $or: [
                    { applicantName: searchRegex },
                    { email: searchRegex },
                    { jobTitle: searchRegex },
                    { skills: searchRegex }
                ]
            };

            filter = { $and: [filter, searchFilter] };
        }

        const [candidates, total, shortlistCount, interviewCount, selectedCount, hiredCount, rejectedCount] = await Promise.all([
            Candidate.find(filter)
                .populate("jobId", "title department type description requirements experienceYears salaryRange status location closingDate")
                .sort({ appliedDate: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            Candidate.countDocuments(filter),
            Candidate.countDocuments({ status: "Shortlisted" }),
            Candidate.countDocuments({ status: "Technical Interview" }),
            Candidate.countDocuments({ status: "Selected" }),
            Candidate.countDocuments({ status: "Hired" }),
            Candidate.countDocuments({ status: "Rejected" })
        ]);

        const detailedCandidates = candidates.map((candidate) => ({
            id: candidate._id,
            candidateInfo: {
                applicantName: candidate.applicantName,
                email: candidate.email,
                phone: candidate.phone || null,
                profileImage: candidate.profileImage || null,
                location: candidate.location || null,
                portfolioUrl: candidate.portfolioUrl || null,
                resumeUrl: candidate.resumeUrl || null
            },
            professionalInfo: {
                yearsOfExperience: candidate.yearsOfExperience || 0,
                skills: candidate.skills || [],
                professionalSummary: candidate.professionalSummary || null,
                experience: candidate.experience || [],
                education: candidate.education || []
            },
            jobApplied: {
                jobId: candidate.jobId?._id || null,
                title: candidate.jobId?.title || candidate.jobTitle,
                department: candidate.jobId?.department || null,
                type: candidate.jobId?.type || null,
                description: candidate.jobId?.description || null,
                requirements: candidate.jobId?.requirements || [],
                experienceYears: candidate.jobId?.experienceYears ?? null,
                salaryRange: candidate.jobId?.salaryRange || null,
                location: candidate.jobId?.location || null,
                status: candidate.jobId?.status || null,
                closingDate: candidate.jobId?.closingDate || null
            },
            tracking: {
                status: candidate.status,
                appliedDate: candidate.appliedDate,
                recruitmentProgress: candidate.recruitmentProgress || []
            },
            interviewPerformance: buildInterviewPerformance(candidate.technicalInterview)
        }));

        res.status(200).json({
            success: true,
            data: detailedCandidates,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            },
            summary: {
                shortlisted: shortlistCount,
                technicalInterview: interviewCount,
                selected: selectedCount,
                hired: hiredCount,
                rejected: rejectedCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getJobPostingForm = async (req, res) => {
    try {
        const [departments, openJobsCount] = await Promise.all([
            Department.find({ isActive: true }).select("name category").sort({ name: 1 }).lean(),
            Job.countDocuments({ status: "Open" })
        ]);

        res.status(200).json({
            success: true,
            data: {
                title: "Create Job Posting",
                summary: {
                    totalDepartments: departments.length,
                    activeOpenings: openJobsCount
                },
                fields: [
                    { key: "title", label: "Job Title", type: "text", required: true },
                    {
                        key: "department",
                        label: "Department",
                        type: "select",
                        required: true,
                        options: departments.map((dept) => ({
                            value: dept.name,
                            label: dept.name,
                            category: dept.category || null
                        }))
                    },
                    { key: "type", label: "Job Type", type: "select", required: true, options: JOB_TYPES },
                    { key: "description", label: "Job Description", type: "textarea", required: true },
                    { key: "experienceYears", label: "Experience (Years)", type: "number", required: true, min: 0 },
                    { key: "requirements", label: "Requirements", type: "tags", required: false },
                    { key: "location", label: "Job Location", type: "text", required: false },
                    { key: "salaryMin", label: "Minimum Salary", type: "number", required: false, min: 0 },
                    { key: "salaryMax", label: "Maximum Salary", type: "number", required: false, min: 0 },
                    { key: "closingDate", label: "Application Closing Date", type: "date", required: false },
                    { key: "status", label: "Posting Status", type: "select", required: false, options: JOB_STATUSES }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createJob = async (req, res) => {
    try {
        const {
            title,
            jobTitle,
            department,
            type,
            jobType,
            description,
            jobDescription,
            experienceYears,
            experience,
            requirements,
            location,
            salaryRange,
            salaryMin,
            salaryMax,
            status,
            closingDate
        } = req.body;

        const normalizedTitle = String(title || jobTitle || "").trim();
        const normalizedDepartment = String(department || "").trim();
        const normalizedType = String(type || jobType || "").trim();
        const normalizedDescription = String(description || jobDescription || "").trim();
        const parsedExperienceYears = Number(experienceYears ?? experience);

        if (!normalizedTitle || !normalizedDepartment || !normalizedType || !normalizedDescription || !Number.isFinite(parsedExperienceYears)) {
            return res.status(400).json({
                success: false,
                message: "title, department, type, description, and experienceYears are required"
            });
        }

        if (!JOB_TYPES.includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: `type must be one of: ${JOB_TYPES.join(", ")}`
            });
        }

        if (parsedExperienceYears < 0) {
            return res.status(400).json({ success: false, message: "experienceYears must be 0 or greater" });
        }

        const departmentExists = await Department.findOne({
            name: { $regex: `^${escapeRegex(normalizedDepartment)}$`, $options: "i" },
            isActive: true
        }).select("name");

        if (!departmentExists) {
            return res.status(404).json({ success: false, message: "Department not found or inactive" });
        }

        const parsedRequirements = parseStringList(requirements);
        const parsedSalaryMin = salaryRange?.min ?? salaryMin;
        const parsedSalaryMax = salaryRange?.max ?? salaryMax;

        const hasSalaryMin = parsedSalaryMin !== undefined && parsedSalaryMin !== null && parsedSalaryMin !== "";
        const hasSalaryMax = parsedSalaryMax !== undefined && parsedSalaryMax !== null && parsedSalaryMax !== "";

        const normalizedSalaryMin = hasSalaryMin ? Number(parsedSalaryMin) : null;
        const normalizedSalaryMax = hasSalaryMax ? Number(parsedSalaryMax) : null;

        if ((hasSalaryMin && !Number.isFinite(normalizedSalaryMin)) || (hasSalaryMax && !Number.isFinite(normalizedSalaryMax))) {
            return res.status(400).json({ success: false, message: "salaryMin and salaryMax must be valid numbers" });
        }

        if (Number.isFinite(normalizedSalaryMin) && normalizedSalaryMin < 0) {
            return res.status(400).json({ success: false, message: "salaryMin must be 0 or greater" });
        }

        if (Number.isFinite(normalizedSalaryMax) && normalizedSalaryMax < 0) {
            return res.status(400).json({ success: false, message: "salaryMax must be 0 or greater" });
        }

        if (Number.isFinite(normalizedSalaryMin) && Number.isFinite(normalizedSalaryMax) && normalizedSalaryMax < normalizedSalaryMin) {
            return res.status(400).json({ success: false, message: "salaryMax must be greater than or equal to salaryMin" });
        }

        const normalizedStatus = status && JOB_STATUSES.includes(status) ? status : "Open";

        const payload = {
            title: normalizedTitle,
            department: departmentExists.name,
            type: normalizedType,
            description: normalizedDescription,
            experienceYears: parsedExperienceYears,
            requirements: parsedRequirements,
            location: String(location || "").trim() || undefined,
            status: normalizedStatus,
            postedBy: req.user?._id,
            closingDate: closingDate ? new Date(closingDate) : undefined
        };

        if (Number.isFinite(normalizedSalaryMin) || Number.isFinite(normalizedSalaryMax)) {
            payload.salaryRange = {
                min: Number.isFinite(normalizedSalaryMin) ? normalizedSalaryMin : undefined,
                max: Number.isFinite(normalizedSalaryMax) ? normalizedSalaryMax : undefined
            };
        }

        const job = await Job.create(payload);
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        await Job.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find().populate("jobId").sort({ appliedDate: -1 });
        res.status(200).json({ success: true, data: candidates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInterviewManagement = async (req, res) => {
    try {
        const { page = 1, limit = 20, mode } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (pageNumber - 1) * limitNumber;

        const filter = {
            $or: [
                { status: "Technical Interview" },
                { "technicalInterview.date": { $exists: true, $ne: null } }
            ]
        };

        if (mode && INTERVIEW_MODES.includes(String(mode).trim())) {
            filter["technicalInterview.mode"] = String(mode).trim();
        }

        const [candidates, total, onlineCount, offlineCount] = await Promise.all([
            Candidate.find(filter)
                .populate("jobId", "title department type")
                .select("applicantName profileImage email phone jobTitle status technicalInterview appliedDate yearsOfExperience")
                .sort({ "technicalInterview.date": 1, appliedDate: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            Candidate.countDocuments(filter),
            Candidate.countDocuments({ ...filter, "technicalInterview.mode": "Online" }),
            Candidate.countDocuments({ ...filter, "technicalInterview.mode": "Offline" })
        ]);

        const data = candidates.map((candidate) => ({
            id: candidate._id,
            name: candidate.applicantName,
            profileImage: candidate.profileImage || null,
            email: candidate.email,
            phone: candidate.phone || null,
            jobRole: candidate.jobId?.title || candidate.jobTitle,
            department: candidate.jobId?.department || null,
            jobType: candidate.jobId?.type || null,
            interviewDateTime: candidate.technicalInterview?.date || null,
            interviewerName: candidate.technicalInterview?.interviewer || null,
            interviewMode: candidate.technicalInterview?.mode || "Online",
            interviewStatus: candidate.technicalInterview?.status || "Pending",
            meetingLink: candidate.technicalInterview?.meetingLink || null,
            venue: candidate.technicalInterview?.venue || null,
            interviewScore: Number.isFinite(Number(candidate.technicalInterview?.score)) ? Number(candidate.technicalInterview?.score) : null,
            interviewFeedback: candidate.technicalInterview?.feedback || null,
            candidateStatus: candidate.status,
            appliedDate: candidate.appliedDate,
            yearsOfExperience: candidate.yearsOfExperience || 0
        }));

        res.status(200).json({
            success: true,
            data,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            },
            summary: {
                totalInterviewCandidates: total,
                online: onlineCount,
                offline: offlineCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCandidateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const candidate = await Candidate.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.scheduleInterview = async (req, res) => {
    try {
        const { candidateId, date, interviewer, remarks, mode, interviewMode, meetingLink, venue } = req.body;

        if (!candidateId || !date || !interviewer) {
            return res.status(400).json({
                success: false,
                message: "candidateId, date, and interviewer are required"
            });
        }

        const normalizedMode = String(mode || interviewMode || "Online").trim();
        if (!INTERVIEW_MODES.includes(normalizedMode)) {
            return res.status(400).json({
                success: false,
                message: `Interview mode must be one of: ${INTERVIEW_MODES.join(", ")}`
            });
        }

        const candidate = await Candidate.findByIdAndUpdate(candidateId, {
            status: "Technical Interview",
            technicalInterview: {
                date: new Date(date),
                interviewer,
                mode: normalizedMode,
                meetingLink: normalizedMode === "Online" ? meetingLink : undefined,
                venue: normalizedMode === "Offline" ? venue : undefined,
                status: "Pending",
                feedback: remarks
            },
            $push: {
                recruitmentProgress: {
                    stage: "Interview Scheduled",
                    remarks: `Interview scheduled (${normalizedMode}) with ${interviewer}`,
                    status: "Completed"
                }
            }
        }, { new: true });

        if (!candidate) {
            return res.status(404).json({ success: false, message: "Candidate not found" });
        }

        res.status(200).json({ success: true, data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 7. Notification Panel ---
exports.getNotificationPanel = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (pageNumber - 1) * limitNumber;
        const now = new Date();

        const [notifications, total, recentBroadcasts, notificationSentTotal, scheduledTask, totalActiveAlerts, activeStaff] = await Promise.all([
            Notification.find()
                .populate("sentBy", "name role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            Notification.countDocuments(),
            Notification.find({ status: { $in: ["Sent", "Scheduled"] } })
                .populate("sentBy", "name role")
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
            Notification.countDocuments({ status: "Sent" }),
            Notification.countDocuments({ status: "Scheduled", scheduleAt: { $gte: now } }),
            Notification.countDocuments({ category: "alert", isActive: true }),
            User.countDocuments({ role: { $in: ACTIVE_STAFF_ROLES }, status: "Active" })
        ]);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    notificationSentTotal,
                    scheduledTask,
                    totalActiveAlerts,
                    activeStaff
                },
                allNotifications: notifications.map(formatNotificationItem),
                recentBroadcasts: recentBroadcasts.map(formatNotificationItem)
            },
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllNotifications = async (req, res) => {
    try {
        const { category, targetedAudience, status, page = 1, limit = 20 } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (pageNumber - 1) * limitNumber;

        const filter = {};

        const normalizedCategory = normalizeCategory(category);
        if (normalizedCategory && NOTIFICATION_CATEGORIES.includes(normalizedCategory)) {
            filter.category = normalizedCategory;
        }

        const normalizedAudience = normalizeAudience(targetedAudience);
        if (normalizedAudience && NOTIFICATION_AUDIENCES.includes(normalizedAudience)) {
            filter.targetedAudience = normalizedAudience;
        }

        const normalizedStatus = normalizeStatus(status);
        if (normalizedStatus && NOTIFICATION_STATUSES.includes(normalizedStatus)) {
            filter.status = normalizedStatus;
        }

        const [notifications, total] = await Promise.all([
            Notification.find(filter)
                .populate("sentBy", "name role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            Notification.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: notifications.map(formatNotificationItem),
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRecentBroadcasts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));

        const broadcasts = await Notification.find({ status: { $in: ["Sent", "Scheduled"] } })
            .populate("sentBy", "name role")
            .sort({ createdAt: -1 })
            .limit(limitNumber)
            .lean();

        res.status(200).json({ success: true, data: broadcasts.map(formatNotificationItem) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAnnouncementForm = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true }).select("name").sort({ name: 1 }).lean();

        res.status(200).json({
            success: true,
            data: {
                title: "Create Announcement",
                fields: [
                    { key: "category", label: "Category", type: "select", required: true, options: NOTIFICATION_CATEGORIES },
                    { key: "title", label: "Title", type: "text", required: true },
                    { key: "description", label: "Description", type: "textarea", required: true },
                    {
                        key: "targetedAudience",
                        label: "Targeted Audience",
                        type: "select",
                        required: true,
                        options: ["all_employee", "department", "hr"]
                    },
                    {
                        key: "targetDepartments",
                        label: "Departments",
                        type: "multiselect",
                        required: false,
                        options: departments.map((dept) => dept.name)
                    },
                    { key: "scheduleAt", label: "Schedule Task", type: "datetime", required: false }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const {
            category,
            title,
            headline,
            description,
            details,
            targetedAudience,
            targetAudience,
            targetDepartments,
            departments,
            scheduleAt,
            scheduleTask,
            status
        } = req.body;

        const normalizedCategory = normalizeCategory(category);
        const normalizedHeadline = String(title || headline || "").trim();
        const normalizedDetails = String(description || details || "").trim();
        const normalizedAudience = normalizeAudience(targetedAudience || targetAudience);

        if (!normalizedCategory || !normalizedHeadline || !normalizedDetails || !normalizedAudience) {
            return res.status(400).json({
                success: false,
                message: "category, title, description, and targetedAudience are required"
            });
        }

        if (!NOTIFICATION_CATEGORIES.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                message: `category must be one of: ${NOTIFICATION_CATEGORIES.join(", ")}`
            });
        }

        if (!NOTIFICATION_AUDIENCES.includes(normalizedAudience)) {
            return res.status(400).json({
                success: false,
                message: `targetedAudience must be one of: ${NOTIFICATION_AUDIENCES.join(", ")}`
            });
        }

        const normalizedTargetDepartments = parseStringList(targetDepartments || departments);
        if (normalizedAudience === "department" && normalizedTargetDepartments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "targetDepartments are required when targetedAudience is department"
            });
        }

        const scheduleValue = scheduleAt || scheduleTask;
        let parsedScheduleAt = null;
        if (scheduleValue) {
            parsedScheduleAt = new Date(scheduleValue);
            if (Number.isNaN(parsedScheduleAt.getTime())) {
                return res.status(400).json({ success: false, message: "Invalid scheduleAt value" });
            }
        }

        const normalizedStatus = normalizeStatus(status);
        let computedStatus = normalizedStatus || "Sent";
        if (!normalizedStatus && parsedScheduleAt && parsedScheduleAt > new Date()) {
            computedStatus = "Scheduled";
        }

        if (computedStatus === "Scheduled" && !parsedScheduleAt) {
            return res.status(400).json({ success: false, message: "scheduleAt is required when status is Scheduled" });
        }

        const sentCount = computedStatus === "Sent"
            ? await getTargetedStaffCount(normalizedAudience, normalizedTargetDepartments)
            : 0;

        const notification = await Notification.create({
            category: normalizedCategory,
            headline: normalizedHeadline,
            details: normalizedDetails,
            targetedAudience: normalizedAudience,
            targetDepartments: normalizedAudience === "department" ? normalizedTargetDepartments : [],
            scheduleAt: parsedScheduleAt || undefined,
            status: computedStatus,
            sentCount,
            sentBy: req.user?._id,
            isActive: true
        });

        const createdNotification = await Notification.findById(notification._id).populate("sentBy", "name role").lean();

        res.status(201).json({ success: true, data: formatNotificationItem(createdNotification) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.editAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Notification.findById(id).lean();
        if (!existing) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        const {
            category,
            title,
            headline,
            description,
            details,
            targetedAudience,
            targetAudience,
            targetDepartments,
            departments,
            scheduleAt,
            scheduleTask,
            status,
            isActive
        } = req.body;

        const normalizedCategory = category !== undefined ? normalizeCategory(category) : existing.category;
        const normalizedHeadline = title !== undefined || headline !== undefined
            ? String(title || headline || "").trim()
            : existing.headline;
        const normalizedDetails = description !== undefined || details !== undefined
            ? String(description || details || "").trim()
            : existing.details;
        const normalizedAudience = targetedAudience !== undefined || targetAudience !== undefined
            ? normalizeAudience(targetedAudience || targetAudience)
            : existing.targetedAudience;

        if (!normalizedCategory || !normalizedHeadline || !normalizedDetails || !normalizedAudience) {
            return res.status(400).json({
                success: false,
                message: "category, title, description, and targetedAudience are required"
            });
        }

        if (!NOTIFICATION_CATEGORIES.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                message: `category must be one of: ${NOTIFICATION_CATEGORIES.join(", ")}`
            });
        }

        if (!NOTIFICATION_AUDIENCES.includes(normalizedAudience)) {
            return res.status(400).json({
                success: false,
                message: `targetedAudience must be one of: ${NOTIFICATION_AUDIENCES.join(", ")}`
            });
        }

        const normalizedTargetDepartments =
            targetDepartments !== undefined || departments !== undefined
                ? parseStringList(targetDepartments || departments)
                : (existing.targetDepartments || []);

        if (normalizedAudience === "department" && normalizedTargetDepartments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "targetDepartments are required when targetedAudience is department"
            });
        }

        const scheduleValue = scheduleAt !== undefined || scheduleTask !== undefined
            ? (scheduleAt || scheduleTask)
            : existing.scheduleAt;

        let parsedScheduleAt = null;
        if (scheduleValue) {
            parsedScheduleAt = new Date(scheduleValue);
            if (Number.isNaN(parsedScheduleAt.getTime())) {
                return res.status(400).json({ success: false, message: "Invalid scheduleAt value" });
            }
        }

        const normalizedStatus = normalizeStatus(status);
        let computedStatus = normalizedStatus || existing.status;
        if (!normalizedStatus && parsedScheduleAt) {
            computedStatus = parsedScheduleAt > new Date() ? "Scheduled" : "Sent";
        }

        if (computedStatus === "Scheduled" && !parsedScheduleAt) {
            return res.status(400).json({ success: false, message: "scheduleAt is required when status is Scheduled" });
        }

        const sentCount = computedStatus === "Sent"
            ? await getTargetedStaffCount(normalizedAudience, normalizedTargetDepartments)
            : existing.sentCount;

        const updated = await Notification.findByIdAndUpdate(
            id,
            {
                category: normalizedCategory,
                headline: normalizedHeadline,
                details: normalizedDetails,
                targetedAudience: normalizedAudience,
                targetDepartments: normalizedAudience === "department" ? normalizedTargetDepartments : [],
                scheduleAt: parsedScheduleAt || undefined,
                status: computedStatus,
                sentCount,
                isActive: isActive === undefined ? existing.isActive : Boolean(isActive)
            },
            { new: true }
        ).populate("sentBy", "name role").lean();

        res.status(200).json({ success: true, data: formatNotificationItem(updated) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.resendAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Notification.findById(id).lean();
        if (!existing) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        const sentCount = await getTargetedStaffCount(existing.targetedAudience, existing.targetDepartments || []);

        const resent = await Notification.findByIdAndUpdate(
            id,
            {
                status: "Sent",
                sentCount,
                scheduleAt: null,
                isActive: true,
                $inc: { resentCount: 1 }
            },
            { new: true }
        ).populate("sentBy", "name role").lean();

        res.status(200).json({
            success: true,
            message: "Announcement resent successfully",
            data: formatNotificationItem(resent)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 8. Other Modules (Policies & Docs) ---
exports.getAllDocuments = async (req, res) => {
    try {
        const { type } = req.query; // "Policy" or "Security"
        const filter = type ? { type } : {};
        const docs = await Document.find(filter).populate("uploadedBy", "fullName");
        res.status(200).json({ success: true, data: docs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createDocument = async (req, res) => {
    try {
        const doc = await Document.create({ ...req.body, uploadedBy: req.user._id });
        res.status(201).json({ success: true, data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        await Document.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Document deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSystemSettings = async (req, res) => {
    try {
        let config = await Config.findOne();
        if (!config) config = await Config.create({});
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSystemSettings = async (req, res) => {
    try {
        const config = await Config.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 8. Leave Management ---
exports.getPendingLeaves = async (req, res) => {
    try {
        const leaves = await LeaveApplication.find({ ApprovalStatus: "Awaiting Approve" })
            .populate("EmployeeID", "name email profileImage department designation")
            .sort({ createdAt: -1 });

        const formatted = leaves.map(l => ({
            id: l._id,
            employeeName: l.EmployeeID?.name,
            leaveType: l.LeaveType,
            startDate: l.StartDate,
            endDate: l.EndDate,
            totalDays: l.IsHalfDay
                ? 0.5
                : Math.max(
                    1,
                    Math.ceil((new Date(l.EndDate) - new Date(l.StartDate)) / (1000 * 60 * 60 * 24)) + 1
                ),
            status: l.ApprovalStatus,
            actionOptions: ["Approved", "Rejected"]
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.handleLeaveAction = async (req, res) => {
    try {
        const { leaveId, action } = req.body;

        const normalizedAction = String(action || "").trim().toLowerCase();
        const actionMap = {
            approve: "Approved",
            approved: "Approved",
            reject: "Rejected",
            rejected: "Rejected"
        };

        const nextStatus = actionMap[normalizedAction];
        if (!leaveId || !nextStatus) {
            return res.status(400).json({
                success: false,
                message: "leaveId and valid action (Approved/Rejected) are required"
            });
        }

        const statusId = nextStatus === "Approved" ? 1 : 2;

        const leave = await LeaveApplication.findByIdAndUpdate(leaveId, {
            ApprovalStatus: nextStatus,
            ApprovalStatusID: statusId,
            ApproverID: req.user?._id,
            ApprovalUsername: req.user?.name
        }, { new: true }).populate("EmployeeID", "name email profileImage department designation");

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave request not found" });
        }

        const isReject = nextStatus === "Rejected";
        const approverName = req.user?.name || "Admin";
        const dateRange = leave.StartDate && leave.EndDate
            ? ` (${new Date(leave.StartDate).toDateString()} - ${new Date(leave.EndDate).toDateString()})`
            : "";
        let room = null;
        try {
            room = await RequestRoom.findOneAndUpdate(
                { relatedLeaveId: leave._id },
                { status: isReject ? "rejected" : "approved" }
            );
        } catch (roomErr) {
            console.warn("[Admin] RequestRoom update failed (non-blocking):", roomErr.message);
        }
        await notifyUser({
            recipient: leave.EmployeeID,
            category: "leave",
            headline: isReject ? "Leave Request Rejected" : "Leave Request Approved",
            details: isReject
                ? `Your ${leave.LeaveType} leave${dateRange} was rejected by ${approverName}.`
                : `Your ${leave.LeaveType} leave${dateRange} has been approved by ${approverName}.`,
            sentBy: req.user?._id,
            relatedRoomId: room?._id || null,
        });

        res.status(200).json({ success: true, data: leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 8.5 Admin User Creation (HR & Employee) ---
exports.createHR = async (req, res) => {
    try {
        const { name, email, password, department, designation, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }
        const existing = await User.findOne({ email: String(email).trim().toLowerCase() });
        if (existing) return res.status(409).json({ success: false, message: "User with this email already exists" });

        const user = await User.create({
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            password,
            role: "hr",
            department,
            designation,
            phone,
            isEmailVerified: true,
            firstLogin2FAVerified: false,
        });
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).json({ success: true, message: "HR account created successfully", user: userObj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const { name, email, password, department, designation, phone, employeeId: providedEmployeeId, reportingManager, annualSalary, employmentType } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }
        const existing = await User.findOne({ email: String(email).trim().toLowerCase() });
        if (existing) return res.status(409).json({ success: false, message: "User with this email already exists" });

        let employeeId = providedEmployeeId;
        if (!employeeId) {
            const latestUser = await User.findOne({ employeeId: { $regex: /^EMP-\d+$/ } })
                .sort({ employeeId: -1 })
                .select("employeeId")
                .lean();
            let nextNum = 1;
            if (latestUser?.employeeId) {
                const match = latestUser.employeeId.match(/EMP-(\d+)/);
                if (match) nextNum = parseInt(match[1], 10) + 1;
            }
            employeeId = `EMP-${String(nextNum).padStart(4, '0')}`;
        }

        const user = await User.create({
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            password,
            role: "employee",
            department,
            designation,
            phone,
            employeeId,
            reportingManager,
            annualSalary,
            employmentType,
            isEmailVerified: true,
        });
        const userObj = user.toObject();
        delete userObj.password;

        // Emit real-time event
        emitEntityEvent('employee', 'created', userObj, {
            targetRoles: ['HR', 'Admin', 'Employee']
        });

        res.status(201).json({ success: true, message: "Employee created successfully", user: userObj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 9. Manage HR Department ---
exports.getStaffDirectory = async (req, res) => {
    try {
        const { search, department, jobRole, page = 1, limit = 20 } = req.query;

        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (pageNumber - 1) * limitNumber;

        const filter = { role: { $in: ["employee", "manager", "hr", "admin"] } };

        if (department) {
            filter.department = { $regex: `^${escapeRegex(String(department).trim())}$`, $options: "i" };
        }

        if (jobRole) {
            filter.designation = { $regex: `^${escapeRegex(String(jobRole).trim())}$`, $options: "i" };
        }

        if (search) {
            const searchRegex = new RegExp(escapeRegex(String(search).trim()), "i");
            filter.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { employeeId: searchRegex },
                { designation: searchRegex },
                { department: searchRegex }
            ];
        }

        const [staff, total] = await Promise.all([
            User.find(filter)
                .select("name profileImage designation department email phone role employeeId status")
                .sort({ name: 1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            User.countDocuments(filter)
        ]);

        const data = staff.map((member) => ({
            id: member._id,
            staffProfile: member.profileImage || null,
            staffName: member.name,
            staffJobRole: member.designation || member.role,
            staffDepartment: member.department || null,
            contactInfo: {
                email: member.email,
                phone: member.phone || null
            },
            employeeId: member.employeeId || null,
            status: member.status || "Active"
        }));

        res.status(200).json({
            success: true,
            data,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHRStaff = async (req, res) => {
    try {
        const hrStaff = await User.find({ role: "hr" })
            .select("fullName email profileImage department designation permissions joiningDate status");
        res.status(200).json({ success: true, data: hrStaff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateHRPermissions = async (req, res) => {
    try {
        const { hrId, permissions } = req.body;
        const hr = await User.findByIdAndUpdate(hrId, { permissions }, { new: true });
        res.status(200).json({ success: true, data: hr });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteHRUser = async (req, res) => {
    try {
        const { hrId } = req.params;
        await User.findByIdAndDelete(hrId);
        res.status(200).json({ success: true, message: "HR staff removed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 10. Recent Activity ---
exports.getRecentActivities = async (req, res) => {
    try {
        const activities = await Activity.find()
            .populate("userAccount", "fullName profileImage")
            .sort({ timestamp: -1 })
            .limit(10);
        res.status(200).json({ success: true, data: activities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createActivity = async (req, res) => {
    try {
        const { type, title, message, icon, color } = req.body;
        const activity = await Activity.create({
            type,
            title,
            message,
            icon,
            color,
            userAccount: req.user._id
        });
        res.status(201).json({ success: true, data: activity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
