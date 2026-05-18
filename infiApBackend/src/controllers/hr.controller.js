const mongoose = require("mongoose");
const User = require("../models/user.model");
const Punch = require("../models/punch.model");
const LeaveApplication = require("../models/leaveApplication.model");
const LeaveBalance = require("../models/leaveBalance.model");
const RequestRoom = require("../models/requestRoom.model");
const Candidate = require("../models/candidate.model");
const Performance = require("../models/performance.model");
const Payroll = require("../models/payroll.model");
const Resignation = require("../models/resignation.model");
const Holiday = require("../models/holiday.model");
const Job = require("../models/job.model");
const DoubleShiftRequest = require("../models/doubleShiftRequest.model");
const logger = require("../utils/logger");
const { notifyUser, notifyRoleUsers, emitToastToUser } = require("../utils/notifier");
const { emitToRoles, emitEntityEvent } = require("../utils/socketManager");

// ---> Welcome Page Greeting <---
exports.getDashboardSummary = async (req, res) => {
    try {
        const totalEmployees = await User.countDocuments({ role: "employee" });
        
        // Find today's date range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Calculate Present by checking punches today
        const distinctPunches = await Punch.distinct("userId", {
            PunchTime: { $gte: startOfDay, $lte: endOfDay }
        });
        const presentCount = distinctPunches.length;

        // Check if today is a holiday
        const holiday = await Holiday.findOne({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                presentCount,
                isHoliday: !!holiday,
                holidayDetails: holiday || null,
                greeting: "Welcome to HR Dashboard"
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHRAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user?._id).select("-password -refreshToken");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const hrProfile = {
            header: {
                profileImage: user.profileImage,
                name: user.name,
                post: user.designation || "HR Administrator",
                hrId: user.employeeId
            },
            personalInfo: {
                fullName: user.name,
                joiningDate: user.joiningDate,
                phoneNumber: user.phone,
                emailId: user.email,
                address: user.address
            },
            professionalInfo: {
                department: user.department,
                designation: user.designation,
                employeeId: user.employeeId
            },
            administrativeAccess: {
                accessLevel: user.role, // e.g. "hr", "admin"
                complianceStatus: user.complianceStatus || "Compliant"
            }
        };

        res.status(200).json({ success: true, data: hrProfile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---> HR Operations: Employee <---
exports.addEmployee = async (req, res) => {
    try {
        const { name, email, phone, role: providedRole, employeeId: providedEmployeeId, department, designation, reportingManager, annualSalary, employmentType, status, joiningDate, password = "Password@123" } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Name and email are required" });
        }

        // Validate phone: if provided, must contain at least 10 digits (country code + 10 digits)
        if (phone) {
            const digitsOnly = String(phone).replace(/\D/g, '');
            if (digitsOnly.length < 10) {
                return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits" });
            }
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

        // Determine role — default to employee; only admin/superadmin can create HR
        let targetRole = String(providedRole || "employee").trim().toLowerCase();
        if (!["employee", "hr"].includes(targetRole)) {
            targetRole = "employee";
        }
        const requesterRole = String(req.user?.role || "").toLowerCase();
        if (targetRole === "hr" && !["admin", "superadmin", "main_admin"].includes(requesterRole)) {
            return res.status(403).json({ success: false, message: "Only Admin can create HR users" });
        }

        // Auto-generate employeeId if not provided
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

        const userData = {
            name, email, phone, password, role: targetRole,
            employeeId, department, designation, annualSalary, employmentType,
            status: status || "Active"
        };
        if (joiningDate) {
            userData.joiningDate = new Date(joiningDate);
        }
        if (reportingManager && String(reportingManager).trim()) {
            userData.reportingManager = reportingManager;
        }

        const newEmployee = new User(userData);

        await newEmployee.save();

        // Send welcome notification to new employee
        try {
            await notifyUser({
                recipient: newEmployee._id,
                category: "system",
                headline: "Welcome to the Team!",
                details: `Welcome ${name}! Your employee ID is ${employeeId}. Contact HR for login details.`,
                sentBy: req.user?._id,
            });
        } catch (notifyErr) {
            console.warn("[AddEmployee] notifyUser failed (non-blocking):", notifyErr.message);
        }

        res.status(201).json({ success: true, message: "Employee added successfully", data: newEmployee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.editEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        delete updates.password; // Forbid password update here

        // Validate phone if being updated (country code + number = >= 10 digits total)
        if (updates.phone) {
            const digitsOnly = String(updates.phone).replace(/\D/g, '');
            if (digitsOnly.length < 10) {
                return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits" });
            }
        }

        // Strip empty-string ObjectId fields to avoid cast errors
        if (updates.reportingManager !== undefined && !String(updates.reportingManager).trim()) {
            delete updates.reportingManager;
        }

        // Log for debugging
        logger.info('Edit Employee', { id });
        logger.info('Edit Employee updates', { updates: Object.keys(updates) });

        // Handle file upload if present
        if (req.file) {
            // Convert buffer to base64 for storage (or use cloud storage in production)
            const base64Image = req.file.buffer.toString('base64');
            const mimeType = req.file.mimetype;
            updates.profileImage = `data:${mimeType};base64,${base64Image}`;
        }

        // Fetch old employee to compare actual changes
        const oldEmployee = await User.findById(id).lean();
        if (!oldEmployee) return res.status(404).json({ success: false, message: "Employee not found" });

        const employee = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: false });

        // Emit real-time event
        emitEntityEvent('employee', 'updated', employee.toObject(), {
            targetRoles: ['HR', 'Admin', 'Employee']
        });

        res.status(200).json({ success: true, message: "Employee updated successfully", data: employee });

        // Notify employee of significant changes (only if value actually changed)
        try {
            const fieldLabels = {
                department: 'Department',
                designation: 'Designation',
                reportingManager: 'Reporting Manager',
                doubleShiftAllowed: 'Double Shift Permission',
            };
            const fieldsToNotify = Object.keys(fieldLabels);
            const changedFields = fieldsToNotify.filter(f => {
                if (updates[f] === undefined) return false;
                // Compare as strings for consistent matching
                const oldVal = oldEmployee[f] !== undefined && oldEmployee[f] !== null ? String(oldEmployee[f]) : '';
                const newVal = String(updates[f]);
                return oldVal !== newVal;
            });
            if (changedFields.length > 0) {
                const actorName = req.user?.name || "HR";
                const labelText = changedFields.map(f => fieldLabels[f] || f).join(", ");
                await notifyUser({
                    recipient: id,
                    category: "system",
                    headline: "Profile Updated",
                    details: `Your profile has been updated by ${actorName}. Changed: ${labelText}`,
                    sentBy: req.user?._id,
                });

                // If doubleShiftAllowed changed, also send dedicated notification to other HR/Admin roles
                if (changedFields.includes('doubleShiftAllowed')) {
                    const actorRole = req.user?.role;
                    const otherRoles = actorRole === "hr" ? ["admin", "superadmin"] : ["hr", "superadmin"];
                    const employeeName = employee?.name || oldEmployee?.name || "an employee";
                    await notifyRoleUsers({
                        roles: otherRoles,
                        category: "attendance",
                        headline: String(updates.doubleShiftAllowed) === "true" ? "Double Shift Permission Granted" : "Double Shift Permission Revoked",
                        details: `${actorName} ${String(updates.doubleShiftAllowed) === "true" ? "granted" : "revoked"} double shift permission for ${employeeName}.`,
                        sentBy: req.user?._id,
                        excludeUserId: req.user?._id,
                    });
                }
            }
        } catch (notifyErr) {
            console.warn("[EditEmployee] notifyUser failed (non-blocking):", notifyErr.message);
        }
    } catch (error) {
        logger.error('Edit Employee Error', { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterRole = String(req.user?.role || "").toLowerCase();

        const employee = await User.findById(id);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const targetRole = String(employee.role || "").toLowerCase();

        // Prevent deletion of protected roles
        if (["admin", "superadmin", "main_admin"].includes(targetRole)) {
            return res.status(403).json({ success: false, message: "Cannot delete admin accounts via employee endpoint" });
        }

        // HR can only delete employees and managers
        if (requesterRole === "hr" && !["employee", "manager"].includes(targetRole)) {
            return res.status(403).json({ success: false, message: "HR can only delete employees and managers" });
        }

        await User.findByIdAndDelete(id);

        // Emit real-time event
        emitEntityEvent('employee', 'deleted', { _id: id }, {
            targetRoles: ['HR', 'Admin', 'Employee']
        });

        return res.status(200).json({ success: true, message: "Employee deleted successfully" });
    } catch (error) {
        logger.error('Delete Employee Error', { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDoubleShiftPermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { doubleShiftAllowed } = req.body;

        if (typeof doubleShiftAllowed !== 'boolean') {
            return res.status(400).json({ success: false, message: "doubleShiftAllowed must be a boolean" });
        }

        const employee = await User.findByIdAndUpdate(
            id,
            { doubleShiftAllowed },
            { new: true, runValidators: false }
        ).select("-password -refreshToken");

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        res.status(200).json({
            success: true,
            message: `Double shift permission ${doubleShiftAllowed ? 'granted' : 'revoked'} successfully`,
            data: employee,
        });

        // Notify employee about double shift permission change
        try {
            const actorName = req.user?.name || "HR";
            const actorRole = req.user?.role;
            await notifyUser({
                recipient: id,
                category: "attendance",
                headline: doubleShiftAllowed ? "Double Shift Permission Granted" : "Double Shift Permission Revoked",
                details: doubleShiftAllowed
                    ? `You have been granted double shift permission by ${actorName}.`
                    : `Your double shift permission has been revoked by ${actorName}.`,
                sentBy: req.user?._id,
            });

            // Notify Admin about the change
            const otherRoles = actorRole === "hr" ? ["admin", "superadmin"] : ["hr", "superadmin"];
            const employee = await User.findById(id).select("name").lean();
            const employeeName = employee?.name || "an employee";
            await notifyRoleUsers({
                roles: otherRoles,
                category: "attendance",
                headline: doubleShiftAllowed ? "Double Shift Permission Granted" : "Double Shift Permission Revoked",
                details: `${actorName} ${doubleShiftAllowed ? "granted" : "revoked"} double shift permission for ${employeeName}.`,
                sentBy: req.user?._id,
                excludeUserId: req.user?._id,
            });
        } catch (notifyErr) {
            console.warn("[DoubleShift] notifyUser failed (non-blocking):", notifyErr.message);
        }
    } catch (error) {
        logger.error('Update Double Shift Permission Error', { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const { department, role, search, page = 1, limit = 20 } = req.query;
        const requesterRole = String(req.user?.role || "").toLowerCase();
        const filter = {};

        // HR should only see actual employees; Admin/SuperAdmin can see all non-admin staff
        if (requesterRole === "hr") {
            filter.role = "employee";
        } else {
            filter.role = { $nin: ["main_admin", "superadmin", "admin"] };
        }

        // Optional department filter from query params for both HR and Admin
        if (department) {
            filter.department = department;
        }

        if (role) filter.designation = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { employeeId: { $regex: search, $options: "i" } }
            ];
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const employees = await User.find(filter)
            .select("-password -refreshToken")
            .populate("reportingManager", "name employeeId")
            .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
        const total = await User.countDocuments(filter);
        res.status(200).json({ success: true, data: employees, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getEmployeeProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate("reportingManager", "name employeeId").lean();
        if(!user) return res.status(404).json({ success: false, message: "Employee not found" });

        // Basic Profile Info
        const profileInfo = {
            profileImage: user.profileImage,
            name: user.name,
            employeeId: user.employeeId,
        };

        const personalInfo = {
            email: user.email,
            phone: user.phone
        };

        const jobDetails = {
            department: user.department,
            role: user.designation,
            manager: user.reportingManager,
            joiningDate: user.joiningDate,
            employeeType: user.employmentType,
            status: user.status || "Active"
        };

        // Real attendance calculation for current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const punchDays = await Punch.distinct("PunchTime", {
            userId: id,
            PunchType: 1,
            PunchTime: { $gte: startOfMonth, $lte: endOfMonth }
        });
        const presentDays = new Set(punchDays.map(d => new Date(d).toDateString())).size;

        const leaveCount = await LeaveApplication.countDocuments({
            EmployeeID: id,
            ApprovalStatus: "Approved",
            StartDate: { $gte: startOfMonth },
            EndDate: { $lte: endOfMonth }
        });

        const workingDays = now.getDate();
        const absentDays = Math.max(0, workingDays - presentDays - leaveCount);

        const attendanceSummary = { present: presentDays, absent: absentDays, leave: leaveCount };

        const currentMonth = now.toISOString().slice(0, 7);
        const performance = await Performance.findOne({ userId: id, month: currentMonth });
        const payroll = await Payroll.find({ userId: id }).sort({ createdAt: -1 }).limit(1);

        res.status(200).json({
            success: true,
            data: {
                profileInfo,
                attendanceSummary,
                personalInfo,
                jobDetails,
                performance: performance || { message: "No performance data for current month" },
                financial: {
                    currentBaseSalary: user.currentBaseSalary || (user.annualSalary ? Math.round(user.annualSalary / 12) : 0),
                    annualSalaryUSD: user.annualSalary || 0,
                    lastPayslip: payroll[0] || null
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ---> HR Operations: Attendance <---
// ============================================================

// --- CHECK-IN RECORDS ---

// 1. Daily Overview (Present Today, Absent, Late Arrivals, WFH)
exports.getAttendanceDailyOverview = async (req, res) => {
    try {
        const { date } = req.query;

        // Parse date in UTC to avoid timezone mismatches
        let targetDate;
        if (date) {
            const [year, month, day] = date.split('-').map(Number);
            targetDate = new Date(Date.UTC(year, month - 1, day));
        } else {
            const now = new Date();
            targetDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        }

        const startOfDay = new Date(targetDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const OFFICE_START = 9; // 9 AM — configurable
        // Don't filter by role strictly - include all users with punch records
        const totalEmployees = await User.countDocuments({ role: { $nin: ["main_admin", "superadmin"] } });

        // All punch-in records today (PunchType 1 = in)
        const todayPunchIns = await Punch.find({
            PunchType: 1,
            PunchTime: { $gte: startOfDay, $lte: endOfDay }
        }).populate("userId", "name email employeeId department designation");

        // Unique present employees
        const presentMap = new Map();
        todayPunchIns.forEach(p => {
            const uid = p.userId?._id?.toString();
            if (uid && !presentMap.has(uid)) presentMap.set(uid, p);
        });
        const presentToday = presentMap.size;

        // Late Arrivals (punched in after OFFICE_START)
        let lateArrivals = 0;
        presentMap.forEach(punch => {
            const punchHour = new Date(punch.PunchTime).getHours();
            if (punchHour >= OFFICE_START + 1) lateArrivals++; // 1 hour grace
        });

        // WFH (WorkMode 2 = WFH)
        const wfhPunches = await Punch.distinct("userId", {
            PunchType: 1, WorkMode: 2,
            PunchTime: { $gte: startOfDay, $lte: endOfDay }
        });
        const wfhCount = wfhPunches.length;

        const absentCount = Math.max(0, totalEmployees - presentToday);

        res.status(200).json({
            success: true,
            data: {
                date: targetDate.toISOString().slice(0, 10),
                totalEmployees,
                presentToday,
                absent: absentCount,
                lateArrivals,
                wfh: wfhCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Check-in Records list (Name, Team, Status, In Time, Out Time)
exports.getCheckInRecords = async (req, res) => {
    try {
        const { date, department, page = 1, limit = 30 } = req.query;

        // Parse date in UTC to avoid timezone mismatches
        let targetDate;
        if (date) {
            const [year, month, day] = date.split('-').map(Number);
            targetDate = new Date(Date.UTC(year, month - 1, day));
        } else {
            const now = new Date();
            targetDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        }

        const startOfDay = new Date(targetDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const OFFICE_START = 9;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get all employees
        const empFilter = {};
        if (department) empFilter.department = department;
        const employees = await User.find(empFilter)
            .select("name email employeeId department designation profileImage")
            .lean()
            .skip(skip).limit(parseInt(limit));
        const totalEmps = await User.countDocuments(empFilter);

        // Get today's punches (lean for plain objects)
        const todayPunches = await Punch.find({
            PunchTime: { $gte: startOfDay, $lte: endOfDay }
        }).lean();

        logger.info('getCheckInRecords request', { date });
        logger.info('getCheckInRecords punches found', { count: todayPunches.length });
        logger.info('getCheckInRecords employees', { count: employees.length });
        if (todayPunches.length > 0) {
            logger.info('getCheckInRecords sample punch found');
        }

        // Build records per employee
        const records = employees.map(emp => {
            const empIdStr = emp._id.toString();
            const empPunches = todayPunches.filter(p => {
                const punchUserId = p.userId ? p.userId.toString() : '';
                return punchUserId === empIdStr;
            });

            logger.info('Employee punches', { name: emp.name, count: empPunches.length });

            const punchIn = empPunches.find(p => p.PunchType === 1);
            const punchOut = empPunches.filter(p => p.PunchType === 2).pop(); // last out

            // Use any available punch for metadata (prefer in-punch, fallback to out-punch)
            const anyPunch = punchIn || punchOut;
            const punchMode = anyPunch ? anyPunch.WorkMode : null;

            let status = "Absent";
            if (punchIn) {
                const inHour = new Date(punchIn.PunchTime).getHours();
                status = inHour >= OFFICE_START + 1 ? "Late" : "Present";
            } else if (punchOut) {
                status = "Checked Out";
            }

            return {
                employeeId: emp.employeeId,
                name: emp.name,
                designation: emp.designation || 'Employee',
                team: emp.department || "—",
                status,
                inTime: punchIn ? punchIn.PunchTime : null,
                outTime: punchOut ? punchOut.PunchTime : null,
                workMode: punchMode,
                profileImage: emp.profileImage || null,
                latitude: anyPunch ? anyPunch.Latitude : null,
                longitude: anyPunch ? anyPunch.Longitude : null,
                isAway: anyPunch ? anyPunch.IsAway : false,
                device: anyPunch ? (punchMode === 2 ? 'Remote Device' : punchMode === 3 ? 'Mobile App' : punchMode === 4 ? 'Offsite Tracker' : 'Office Terminal') : null
            };
        });

        logger.info('getCheckInRecords returning', { count: records.length });

        res.status(200).json({
            success: true,
            data: records,
            pagination: { total: totalEmps, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(totalEmps / parseInt(limit)) }
        });
    } catch (error) {
        logger.error('getCheckInRecords error', { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2b. Raw Punch Records (for attendance records display)
exports.getPunchRecords = async (req, res) => {
    try {
        const { date, page = 1, limit = 50 } = req.query;

        let targetDate;
        if (date) {
            const [year, month, day] = date.split('-').map(Number);
            targetDate = new Date(Date.UTC(year, month - 1, day));
        } else {
            const now = new Date();
            targetDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        }

        const startOfDay = new Date(targetDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get raw punch records with user details
        const punches = await Punch.find({
            PunchTime: { $gte: startOfDay, $lte: endOfDay }
        })
        .populate("userId", "name email employeeId department designation profileImage")
        .sort({ PunchTime: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

        const total = await Punch.countDocuments({
            PunchTime: { $gte: startOfDay, $lte: endOfDay }
        });

        // Transform to include user details
        const records = punches.map(p => ({
            _id: p._id,
            userId: p.userId?._id,
            userName: p.userId?.name || 'Unknown',
            userEmail: p.userId?.email || '',
            employeeId: p.userId?.employeeId || '',
            department: p.userId?.department || '',
            designation: p.userId?.designation || '',
            profileImage: p.userId?.profileImage || null,
            PunchType: p.PunchType,
            Latitude: p.Latitude,
            Longitude: p.Longitude,
            IsAway: p.IsAway,
            WorkMode: p.WorkMode,
            PunchTime: p.PunchTime,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        }));

        res.status(200).json({
            success: true,
            data: records,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('getPunchRecords error', { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Monthly Attendance Grid (per-employee daily status)
exports.getMonthlyAttendance = async (req, res) => {
    try {
        const { year, month, department } = req.query;
        const now = new Date();
        const y = year ? parseInt(year) : now.getFullYear();
        const m = month ? parseInt(month) - 1 : now.getMonth();

        const startOfMonth = new Date(y, m, 1);
        const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);
        const daysInMonth = endOfMonth.getDate();
        const OFFICE_START = 9;

        const empFilter = { role: { $nin: ["main_admin", "superadmin"] } };
        if (department) empFilter.department = department;

        const employees = await User.find(empFilter)
            .select("name employeeId department designation profileImage")
            .lean();

        const punches = await Punch.find({
            PunchType: 1,
            PunchTime: { $gte: startOfMonth, $lte: endOfMonth }
        }).lean();

        const holidays = await Holiday.find({
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).lean();

        const holidayDates = new Set(holidays.map(h => new Date(h.date).toDateString()));

        const records = employees.map(emp => {
            const empIdStr = emp._id.toString();
            const empPunches = punches.filter(p => {
                const pUid = p.userId ? p.userId.toString() : '';
                return pUid === empIdStr;
            });

            const punchByDay = new Map();
            empPunches.forEach(p => {
                const d = new Date(p.PunchTime);
                const day = d.getDate();
                if (!punchByDay.has(day) || d < new Date(punchByDay.get(day).PunchTime)) {
                    punchByDay.set(day, p);
                }
            });

            const history = [];
            const summary = { P: 0, A: 0, L: 0, W: 0, H: 0 };

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(y, m, day);
                const dayOfWeek = date.getDay();

                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    history.push('W');
                    summary.W++;
                } else if (holidayDates.has(date.toDateString())) {
                    history.push('H');
                    summary.H++;
                } else {
                    const punch = punchByDay.get(day);
                    if (!punch) {
                        history.push('A');
                        summary.A++;
                    } else {
                        const punchHour = new Date(punch.PunchTime).getHours();
                        if (punchHour >= OFFICE_START + 1) {
                            history.push('L');
                            summary.L++;
                        } else {
                            history.push('P');
                            summary.P++;
                        }
                    }
                }
            }

            return {
                id: emp._id,
                employeeId: emp.employeeId,
                name: emp.name,
                designation: emp.designation || 'Employee',
                department: emp.department || '—',
                avatar: emp.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=1e293b&color=fff`,
                history,
                summary
            };
        });

        res.status(200).json({
            success: true,
            data: { year: y, month: m + 1, daysInMonth, records }
        });
    } catch (error) {
        logger.error('getMonthlyAttendance error', { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- CORRECTION REQUESTS ---
const AttendanceCorrection = require("../models/attendanceCorrection.model");

// 3. Submit correction request (employee submits)
exports.submitCorrectionRequest = async (req, res) => {
    try {
        const { correctionDate, correctionTime, reason, duration } = req.body;
        const correction = new AttendanceCorrection({
            userId: req.user._id,
            correctionDate: new Date(correctionDate),
            correctionTime,
            reason,
            duration
        });
        await correction.save();
        res.status(201).json({ success: true, message: "Correction request submitted", data: correction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Get correction requests with filter (Pending, Approved, Rejected)
exports.getCorrectionRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const requests = await AttendanceCorrection.find(filter)
            .populate("userId", "name email employeeId department designation")
            .populate("reviewedBy", "name")
            .sort({ createdAt: -1 })
            .skip(skip).limit(parseInt(limit));

        const total = await AttendanceCorrection.countDocuments(filter);

        // Format response to match the UI spec
        const formatted = requests.map(r => ({
            _id: r._id,
            employeeName: r.userId?.name,
            employeeId: r.userId?.employeeId,
            department: r.userId?.department,
            status: r.status,
            date: {
                month: new Date(r.correctionDate).toLocaleString("en", { month: "long" }),
                date: new Date(r.correctionDate).getDate(),
                year: new Date(r.correctionDate).getFullYear()
            },
            time: r.correctionTime,
            requestedCorrection: {
                date: r.correctionDate,
                time: r.correctionTime,
                reason: r.reason,
                duration: r.duration
            },
            reviewedBy: r.reviewedBy?.name || null,
            reviewedAt: r.reviewedAt,
            reviewRemarks: r.reviewRemarks,
            createdAt: r.createdAt
        }));

        res.status(200).json({
            success: true,
            data: formatted,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Review / Approve / Reject correction
exports.reviewCorrectionRequest = async (req, res) => {
    try {
        const { correctionId, status, reviewRemarks } = req.body; // status: "Approved" or "Rejected"
        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be Approved or Rejected" });
        }

        const correction = await AttendanceCorrection.findByIdAndUpdate(
            correctionId,
            { status, reviewedBy: req.user._id, reviewedAt: new Date(), reviewRemarks },
            { new: true }
        ).populate("userId", "name employeeId");

        if (!correction) return res.status(404).json({ success: false, message: "Correction request not found" });

        // If approved, update the actual punch record
        if (status === "Approved" && correction.originalPunchId) {
            await Punch.findByIdAndUpdate(correction.originalPunchId, {
                PunchTime: new Date(correction.correctionDate.toISOString().slice(0, 10) + "T" + correction.correctionTime)
            });
        }

        res.status(200).json({ success: true, message: `Correction ${status}`, data: correction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- REPORTS ---

// 6. Attendance Reports (daily, weekly, monthly + department filter)
exports.getAttendanceReports = async (req, res) => {
    try {
        const { filter = "daily", department, date } = req.query;
        const now = date ? new Date(date) : new Date();
        let start, end;

        if (filter === "daily") {
            start = new Date(now); start.setHours(0, 0, 0, 0);
            end = new Date(now); end.setHours(23, 59, 59, 999);
        } else if (filter === "weekly") {
            const dayOfWeek = now.getDay();
            start = new Date(now); start.setDate(now.getDate() - dayOfWeek); start.setHours(0, 0, 0, 0);
            end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
        } else if (filter === "monthly") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        const OFFICE_START = 9;

        // Build aggregation
        const pipeline = [
            { $match: { PunchType: 1, PunchTime: { $gte: start, $lte: end } } },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
        ];
        if (department) pipeline.push({ $match: { "user.department": department } });

        pipeline.push({
            $group: {
                _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$PunchTime" } }, department: "$user.department" },
                totalPresent: { $addToSet: "$userId" },
                lateArrivals: {
                    $sum: { $cond: [{ $gte: [{ $hour: "$PunchTime" }, OFFICE_START + 1] }, 1, 0] }
                },
                wfhCount: {
                    $sum: { $cond: [{ $eq: ["$WorkMode", 2] }, 1, 0] }
                }
            }
        });
        pipeline.push({
            $project: {
                _id: 0, date: "$_id.date", department: "$_id.department",
                presentCount: { $size: "$totalPresent" }, lateArrivals: 1, wfhCount: 1
            }
        });
        pipeline.push({ $sort: { date: -1 } });

        const report = await Punch.aggregate(pipeline);

        res.status(200).json({
            success: true,
            filter,
            dateRange: { start, end },
            data: report
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Notifications & Alerts (Late check-ins, Pending corrections)
exports.getAttendanceNotifications = async (req, res) => {
    try {
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
        const OFFICE_START = 9;

        // Late check-ins today
        const latePunches = await Punch.find({
            PunchType: 1,
            PunchTime: { $gte: startOfDay, $lte: endOfDay }
        }).populate("userId", "name employeeId department");

        const lateAlerts = latePunches
            .filter(p => new Date(p.PunchTime).getHours() >= OFFICE_START + 1)
            .map(p => ({
                type: "late_checkin",
                message: `Late Check-in detected: ${p.userId?.name} (${p.userId?.employeeId})`,
                employee: p.userId?.name,
                employeeId: p.userId?.employeeId,
                department: p.userId?.department,
                punchTime: p.PunchTime
            }));

        // Pending correction requests
        const pendingCorrections = await AttendanceCorrection.find({ status: "Pending" })
            .populate("userId", "name employeeId department");

        const correctionAlerts = pendingCorrections.map(c => ({
            type: "correction_request",
            message: `Correction request from ${c.userId?.name} (${c.userId?.employeeId})`,
            employee: c.userId?.name,
            employeeId: c.userId?.employeeId,
            department: c.userId?.department,
            correctionDate: c.correctionDate,
            reason: c.reason,
            createdAt: c.createdAt
        }));

        res.status(200).json({
            success: true,
            data: {
                lateCheckins: lateAlerts,
                correctionRequests: correctionAlerts,
                totalAlerts: lateAlerts.length + correctionAlerts.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 8. Generate Report (returns data for PDF / share)
exports.generateAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate, department, format = "json" } = req.body;
        if (!startDate || !endDate) return res.status(400).json({ success: false, message: "startDate and endDate are required" });

        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        const OFFICE_START = 9;

        const empFilter = { role: "employee" };
        if (department) empFilter.department = department;
        const employees = await User.find(empFilter).select("name employeeId department designation").lean();

        const punches = await Punch.find({ PunchTime: { $gte: start, $lte: end } });

        const reportData = employees.map(emp => {
            const empPunches = punches.filter(p => p.userId.toString() === emp._id.toString());
            const punchInDays = new Set();
            let lateCount = 0;
            let wfhDays = 0;

            empPunches.forEach(p => {
                if (p.PunchType === 1) {
                    const dayStr = new Date(p.PunchTime).toDateString();
                    if (!punchInDays.has(dayStr)) {
                        punchInDays.add(dayStr);
                        if (new Date(p.PunchTime).getHours() >= OFFICE_START + 1) lateCount++;
                        if (p.WorkMode === 2) wfhDays++;
                    }
                }
            });

            return {
                name: emp.name,
                employeeId: emp.employeeId,
                department: emp.department,
                designation: emp.designation,
                totalPresent: punchInDays.size,
                lateArrivals: lateCount,
                wfhDays,
            };
        });

        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        res.status(200).json({
            success: true,
            report: {
                title: "Attendance Report",
                dateRange: { start: startDate, end: endDate },
                department: department || "All Departments",
                totalWorkingDays: totalDays,
                totalEmployees: employees.length,
                records: reportData
            },
            message: format === "pdf" ? "PDF generation can be handled on client side" : "Report generated"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---> HR Operations: Leaves <---

// 1. Get All Pending Leaves (Detailed for Pending Page)
exports.getPendingLeavesDetailed = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const pendingLeaves = await LeaveApplication.find({ ApprovalStatus: "Awaiting Approve" })
            .populate("EmployeeID", "name department employeeId profileImage")
            .sort({ createdAt: -1 })
            .skip(skip).limit(parseInt(limit));

        const total = await LeaveApplication.countDocuments({ ApprovalStatus: "Awaiting Approve" });

        // Map data to include duration (number of days)
        const detailedData = pendingLeaves.map(leave => {
            const start = new Date(leave.StartDate);
            const end = new Date(leave.EndDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            return {
                id: leave._id,
                employeeProfile: leave.EmployeeID?.profileImage,
                employeeName: leave.EmployeeID?.name,
                employeeId: leave.EmployeeID?.employeeId,
                department: leave.EmployeeID?.department,
                leaveType: leave.LeaveType,
                durationDays: leave.IsHalfDay ? 0.5 : diffDays,
                startDate: leave.StartDate,
                endDate: leave.EndDate,
                appliedAt: leave.createdAt,
                reason: leave.Reason,
                redirectedToAdmin: leave.redirectedToAdmin || false
            };
        });

        res.status(200).json({ 
            success: true, 
            data: detailedData,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get Leave Applications (with optional status filter: Pending, Approved, Rejected)
exports.getLeaveApplications = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        
        // Map status names to ApprovalStatus strings
        if (status === "Pending") filter.ApprovalStatus = "Awaiting Approve";
        else if (status === "Approved") filter.ApprovalStatus = "Approved";
        else if (status === "Rejected") filter.ApprovalStatus = "Rejected";

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const requests = await LeaveApplication.find(filter)
            .populate("EmployeeID", "name department employeeId profileImage")
            .sort({ createdAt: -1 })
            .skip(skip).limit(parseInt(limit));
        
        const total = await LeaveApplication.countDocuments(filter);

        res.status(200).json({ 
            success: true, 
            data: requests,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get Employees on Leave Today
exports.getEmployeesOnLeaveToday = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeLeaves = await LeaveApplication.find({
            ApprovalStatus: "Approved",
            StartDate: { $lte: today },
            EndDate: { $gte: today }
        }).populate("EmployeeID", "name department employeeId profileImage");

        res.status(200).json({ success: true, data: activeLeaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Leave Stats (Counts for Pending, Approved, Rejected, On Leave Today)
exports.getLeaveStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [pendingCount, approvedCount, rejectedCount, onLeaveTodayCount] = await Promise.all([
            LeaveApplication.countDocuments({ ApprovalStatus: "Awaiting Approve" }),
            LeaveApplication.countDocuments({ ApprovalStatus: "Approved" }),
            LeaveApplication.countDocuments({ ApprovalStatus: "Rejected" }),
            LeaveApplication.countDocuments({
                ApprovalStatus: "Approved",
                StartDate: { $lte: today },
                EndDate: { $gte: today }
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
                onLeaveToday: onLeaveTodayCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLeaveRequests = async (req, res) => {
    try {
        const requests = await LeaveApplication.find({ ApprovalStatus: "Awaiting Approve" }).populate("EmployeeID", "name department employeeId profileImage");
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveLeave = async (req, res) => {
    try {
        const { leaveId, status } = req.body; // status: "Approved" or "Rejected"
        const statusId = status === "Approved" ? 1 : 2;

        const leave = await LeaveApplication.findById(leaveId);
        if (!leave) return res.status(404).json({ success: false, message: "Leave application not found" });

        const previousStatus = leave.ApprovalStatus;

        // Update leave application
        leave.ApprovalStatus = status;
        leave.ApprovalStatusID = statusId;
        leave.ApproverID = req.user?._id;
        leave.ApprovalUsername = req.user?.name;
        await leave.save();

        // Calculate leave days
        let days = 0.5;
        if (!leave.IsHalfDay) {
            const diffTime = Math.abs(leave.EndDate - leave.StartDate);
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        // Map LeaveType to balance key
        const typeLower = leave.LeaveType.toLowerCase();
        let balanceKey = null;
        if (typeLower.includes('privilege') || typeLower.includes('pl')) balanceKey = 'PL';
        else if (typeLower.includes('casual') || typeLower.includes('cl')) balanceKey = 'CL';
        else if (typeLower.includes('sick') || typeLower.includes('sl')) balanceKey = 'SL';

        // Adjust leave balance
        if (balanceKey) {
            const balance = await LeaveBalance.findOne({ userId: leave.EmployeeID });
            if (balance) {
                if (status === 'Approved' && previousStatus !== 'Approved') {
                    balance[balanceKey] = Math.max(0, balance[balanceKey] - days);
                    await balance.save();
                } else if (status === 'Rejected' && previousStatus === 'Approved') {
                    balance[balanceKey] = balance[balanceKey] + days;
                    await balance.save();
                }
            }
        }

        const isReject = status === "Rejected";
        const approverName = req.user?.name || "HR";
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
            console.warn("[HR] RequestRoom update failed (non-blocking):", roomErr.message);
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

        res.status(200).json({ success: true, message: `Leave ${status}`, data: leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.redirectLeaveToAdmin = async (req, res) => {
    try {
        const { leaveId } = req.body;
        const hrUserId = req.user?._id;
        const hrName = req.user?.name || "HR";

        if (!leaveId) {
            return res.status(400).json({ success: false, message: "leaveId is required" });
        }

        const leave = await LeaveApplication.findById(leaveId).populate("EmployeeID", "name");
        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave application not found" });
        }

        if (leave.redirectedToAdmin) {
            return res.status(400).json({ success: false, message: "Leave already redirected to admin" });
        }

        leave.redirectedToAdmin = true;
        leave.redirectedBy = hrUserId;
        await leave.save();

        const employeeName = leave.EmployeeID?.name || "An employee";
        const dateRange = leave.StartDate && leave.EndDate
            ? ` (${new Date(leave.StartDate).toDateString()} - ${new Date(leave.EndDate).toDateString()})`
            : "";

        let room = null;
        try {
            room = await RequestRoom.findOneAndUpdate(
                { relatedLeaveId: leave._id },
                { status: "redirected_to_admin" }
            );
        } catch (roomErr) {
            console.warn("[HR] RequestRoom update failed (non-blocking):", roomErr.message);
        }

        // Notify admin users
        await notifyRoleUsers({
            roles: ["admin", "superadmin"],
            category: "leave",
            headline: `Leave Redirected by ${hrName}`,
            details: `${hrName} redirected ${employeeName}'s ${leave.LeaveType} leave${dateRange} to admin for review. Reason: ${leave.Reason}`,
            sentBy: hrUserId,
            relatedRoomId: room?._id || null,
        });

        // Send real-time toast popup to admin users
        const { emitToRoles } = require("../utils/socketManager");
        emitToRoles(["admin", "superadmin"], "toast", {
            type: "info",
            message: `Leave redirected by ${hrName}: ${employeeName} - ${leave.LeaveType}`,
            category: "leave",
            relatedRoomId: room ? String(room._id) : null,
        });

        res.status(200).json({ success: true, message: "Leave redirected to admin successfully", data: leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLeaveHistory = async (req, res) => {
    try {
        const { employeeId, status } = req.query;
        const filter = {};
        if (employeeId) filter.EmployeeID = employeeId;
        if (status) filter.ApprovalStatus = status;
        const history = await LeaveApplication.find(filter).populate("EmployeeID", "name department employeeId").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.generateLeaveReport = async (req, res) => {
    try {
        const { startDate, endDate, department, status, format = "json" } = req.body;
        
        let filter = { ApprovalStatus: { $ne: "Awaiting Approve" } }; // Focus on past records (Approved/Rejected)
        
        if (status) filter.ApprovalStatus = status;

        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate + 'T23:59:59.999Z')
            };
        }

        let applications = await LeaveApplication.find(filter)
            .populate("EmployeeID", "name department employeeId")
            .populate("ApproverID", "name")
            .sort({ createdAt: -1 })
            .lean();

        // Optional department filter
        if (department) {
            applications = applications.filter(app => app.EmployeeID?.department === department);
        }

        const reportData = applications.map(app => ({
            id: app._id,
            employeeName: app.EmployeeID?.name || "N/A",
            employeeId: app.EmployeeID?.employeeId || "N/A",
            department: app.EmployeeID?.department || "N/A",
            leaveType: app.LeaveType,
            reason: app.Reason,
            startDate: app.StartDate,
            endDate: app.EndDate,
            status: app.ApprovalStatus, // Approved or Rejected
            reviewedBy: app.ApproverID?.name || app.ApprovalUsername || "N/A",
            appliedOn: app.createdAt
        }));

        res.status(200).json({
            success: true,
            report: {
                title: "Leave History Report",
                filters: { startDate, endDate, department, status },
                totalRecords: reportData.length,
                records: reportData
            },
            message: format === "pdf" || format === "excel" ? `${format.toUpperCase()} generation can be handled on client side using this data.` : "Report generated successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---> HR Operations: Recruitment <---

// 1. Get Recruitment Dashboard Summary (Open Jobs, Candidates, Interview, Filled Roles)
// 1. Get Recruitment Dashboard Summary
exports.getRecruitmentDashboard = async (req, res) => {
    try {
        const [openJobs, totalCandidates, interviewCount, filledRoles] = await Promise.all([
            Job.countDocuments({ status: "Open" }),
            Candidate.countDocuments(),
            Candidate.countDocuments({ status: "Technical Interview" }),
            Job.countDocuments({ status: "Hired" })
        ]);

        res.status(200).json({
            success: true,
            data: { openJobs, totalCandidates, interviewCount, filledRoles }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Candidate Tracking — List all candidates with filters
exports.getCandidateTrackingList = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const candidates = await Candidate.find(filter)
            .select("applicantName profileImage jobTitle yearsOfExperience appliedDate status technicalInterview")
            .sort({ appliedDate: -1 })
            .skip(skip).limit(parseInt(limit));
        
        const total = await Candidate.countDocuments(filter);
        console.log('[getCandidateTrackingList] Found', total, 'candidates, returning', candidates.length);

        res.status(200).json({
            success: true,
            data: candidates,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. View Candidate Profile — Detailed view
exports.getCandidateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await Candidate.findById(id).populate("jobId");
        if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });

        res.status(200).json({ success: true, data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Shortlist Candidate
exports.shortlistCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await Candidate.findByIdAndUpdate(id, { 
            status: "Shortlisted",
            $push: { recruitmentProgress: { stage: "Shortlisted", remarks: "Candidate shortlisted for technical round" } }
        }, { new: true });
        res.status(200).json({ success: true, message: "Candidate shortlisted", data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Reject Candidate
exports.rejectCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const candidate = await Candidate.findByIdAndUpdate(id, { 
            status: "Rejected",
            $push: { recruitmentProgress: { stage: "Rejected", remarks: reason || "Does not meet requirements" } }
        }, { new: true });
        res.status(200).json({ success: true, message: "Candidate rejected", data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Technical Interview Stage
exports.updateTechnicalInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, interviewer, score, feedback, passed } = req.body;
        
        const status = passed ? "Selected" : "Rejected";
        const progressStage = passed ? "Technical Interview Passed" : "Technical Interview Failed";

        const candidate = await Candidate.findByIdAndUpdate(id, {
            status: passed ? "Selected" : "Rejected",
            technicalInterview: { date, interviewer, score, feedback, status: passed ? "Passed" : "Failed" },
            $push: { recruitmentProgress: { stage: progressStage, remarks: feedback } }
        }, { new: true });

        res.status(200).json({ success: true, message: "Technical interview updated", data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Select Candidate (Move to Offer Stage)
exports.selectCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await Candidate.findByIdAndUpdate(id, { 
            status: "Selected",
            $push: { recruitmentProgress: { stage: "Selected", remarks: "Final selection completed" } }
        }, { new: true });
        res.status(200).json({ success: true, message: "Candidate selected", data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 8. Send Offer Letter (Trigger logic)
exports.sendOfferLetter = async (req, res) => {
    try {
        const { id } = req.params;
        // Placeholder for logic (e.g., email service)
        const candidate = await Candidate.findByIdAndUpdate(id, { 
            $push: { recruitmentProgress: { stage: "Offer Sent", remarks: "Offer letter sent via email" } }
        }, { new: true });
        res.status(200).json({ success: true, message: "Offer letter sent successfully", data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 9. Get Recent Candidates
exports.getRecentCandidatesDetail = async (req, res) => {
    try {
        const candidates = await Candidate.find()
            .sort({ appliedDate: -1 })
            .limit(10)
            .select("applicantName profileImage status jobTitle yearsOfExperience location appliedDate");

        res.status(200).json({ success: true, data: candidates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 10. Review Applications — New applications needing attention
exports.getReviewApplications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Fetch only those in 'Applied' status and populate Job details
        const applications = await Candidate.find({ status: "Applied" })
            .populate("jobId", "department type") // team and work mode
            .sort({ appliedDate: -1 })
            .skip(skip).limit(parseInt(limit));
        
        const total = await Candidate.countDocuments({ status: "Applied" });

        res.status(200).json({
            success: true,
            data: applications,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 8b. Create a new candidate
exports.createCandidate = async (req, res) => {
    try {
        const { applicantName, jobTitle, email, phone, location, status, technicalInterview } = req.body;

        if (!applicantName || !jobTitle) {
            return res.status(400).json({ success: false, message: "applicantName and jobTitle are required" });
        }

        const candidateData = {
            applicantName,
            jobTitle,
            email: email || `${applicantName.replace(/\s+/g, '.').toLowerCase()}@placeholder.com`,
            status: status || "Applied"
        };

        if (phone) candidateData.phone = phone;
        if (location) candidateData.location = location;

        if (technicalInterview) {
            candidateData.technicalInterview = {
                date: technicalInterview.date ? new Date(technicalInterview.date) : undefined,
                interviewer: technicalInterview.interviewer
            };
            // If an interview is scheduled, update status accordingly
            if (technicalInterview.date && technicalInterview.interviewer) {
                candidateData.status = "Technical Interview";
            }
        }

        const candidate = new Candidate(candidateData);
        await candidate.save();

        res.status(201).json({ success: true, message: "Candidate created successfully", data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 11. Schedule Interview Action
exports.scheduleTechnicalInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, interviewer } = req.body;

        const candidate = await Candidate.findByIdAndUpdate(id, { 
            status: "Technical Interview",
            "technicalInterview.date": date,
            "technicalInterview.interviewer": interviewer,
            $push: { recruitmentProgress: { stage: "Interview Scheduled", remarks: `Technical interview scheduled with ${interviewer} on ${date}` } }
        }, { new: true });

        res.status(200).json({ success: true, message: "Interview scheduled", data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 12. Job Management (Internal for HR)
exports.addJob = async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();

        // Notify all employees about the new job posting
        notifyRoleUsers({
            roles: ["employee", "hr"],
            category: "job",
            headline: `New Job Opening: ${job.title}`,
            details: `A new ${job.type} position in ${job.department} is now open. Apply now!`,
            sentBy: req.user?._id
        }).catch(() => {});

        res.status(201).json({ success: true, message: "Job posted", data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addRecruitmentRequirement = async (req, res) => {
    try {
        const { id } = req.params;
        const requirementValue = typeof req.body.requirement === "string"
            ? req.body.requirement.trim()
            : Array.isArray(req.body.requirements) && req.body.requirements.length
                ? String(req.body.requirements[0]).trim()
                : "";

        if (!requirementValue) {
            return res.status(400).json({ success: false, message: "Requirement is required" });
        }

        const job = await Job.findByIdAndUpdate(
            id,
            { $addToSet: { requirements: requirementValue } },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        res.status(200).json({ success: true, message: "Requirement added", data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---> HR Operations: Performance <---

// 1. Performance Dashboard Stats (Monthly)
exports.getPerformanceDashboard = async (req, res) => {
    try {
        const { month, year } = req.query; // e.g. "2023-10", 2023
        const filter = {};
        if (month) filter.month = month;
        if (year) filter.year = parseInt(year);

        const performances = await Performance.find(filter).populate("userId", "name department");

        if (performances.length === 0) {
            return res.status(200).json({
                success: true,
                data: { averageScore: 0, topPerformer: null, onTarget: 0, belowTarget: 0 }
            });
        }

        let totalScore = 0;
        let topPerformer = performances[0];
        let onTargetCount = 0;
        let belowTargetCount = 0;

        performances.forEach(p => {
            totalScore += p.overallScore;
            // Top performer check
            if (p.overallScore > topPerformer.overallScore) {
                topPerformer = p;
            }
            // Status check
            if (p.status === "On Target" || p.status === "Exceeding") {
                onTargetCount++;
            } else {
                belowTargetCount++;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                averageScore: (totalScore / performances.length).toFixed(1),
                topPerformer: {
                    name: topPerformer.userId?.name,
                    department: topPerformer.userId?.department,
                    score: topPerformer.overallScore.toFixed(1)
                },
                onTarget: onTargetCount,
                belowTarget: belowTargetCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Performance Employee List
exports.getPerformanceList = async (req, res) => {
    try {
        const { month, department } = req.query;
        let query = {};
        if (month) query.month = month;

        let perfs = await Performance.find(query)
            .populate("userId", "name department profileImage")
            .sort({ overallScore: -1 });

        // Filter by department if provided (since department is in the populated User model)
        if (department) {
            perfs = perfs.filter(p => p.userId && p.userId.department === department);
        }

        const data = perfs.map(p => ({
            id: p._id,
            profileImage: p.userId?.profileImage,
            name: p.userId?.name,
            department: p.userId?.department,
            score: p.overallScore.toFixed(1),
            progress: p.targetPercentage, // target completion %
            status: p.status
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Performance Feedback Section Summary
exports.getPerformanceFeedbackStats = async (req, res) => {
    try {
        const stats = await Performance.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    completedCount: { $count: {} }
                }
            }
        ]);

        const result = stats.length > 0 ? {
            avgRating: stats[0].avgRating.toFixed(1),
            completedReviews: stats[0].completedCount
        } : { avgRating: 0, completedReviews: 0 };

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Performance Recent Reviews List
exports.getRecentFeedbackList = async (req, res) => {
    try {
        const reviews = await Performance.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("userId", "name department profileImage")
            .populate("reviewer", "name designation");

        const data = reviews.map(r => ({
            id: r._id,
            profileImage: r.userId?.profileImage,
            name: r.userId?.name,
            department: r.userId?.department,
            status: "Completed",
            reviewName: r.reviewTitle || "Monthly Performance Review",
            jobRole: r.userId?.designation || "Employee",
            description: r.feedback,
            rating: r.rating,
            reviewer: {
                name: r.reviewerName || r.reviewer?.name,
                role: r.reviewerRole || r.reviewer?.designation
            },
            date: r.createdAt
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Performance Report Summary
exports.getPerformanceReportSummary = async (req, res) => {
    try {
        const stats = await Performance.aggregate([
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: "$overallScore" },
                    totalReports: { $count: {} }
                }
            }
        ]);

        const data = stats.length > 0 ? {
            avgScore: stats[0].avgScore.toFixed(1),
            totalReports: stats[0].totalReports
        } : { avgScore: 0, totalReports: 0 };

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Performance Monthly Trends (Dataset for charts)
exports.getPerformanceTrends = async (req, res) => {
    try {
        const trends = await Performance.aggregate([
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    avgScore: { $avg: "$overallScore" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 } // Last 12 months
        ]);

        const data = trends.map(t => ({
            month: t._id.month,
            avgScore: t.avgScore.toFixed(1)
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Generate Performance Report (PDF/Excel)
exports.generatePerformanceReport = async (req, res) => {
    try {
        const { type, month, year, department } = req.body; // type: 'PDF' | 'EXCEL'
        
        // Fetch data based on filters
        let query = {};
        if (month) query.month = month;
        if (year) query.year = year;

        const data = await Performance.find(query).populate("userId", "name department employeeId");

        // Logic placeholder for generation
        // ... (use libraries like exceljs or pdfkit)

        res.status(200).json({ 
            success: true, 
            message: `${type} Report for ${month || 'all time'} ready for download`,
            downloadUrl: `http://api.hrms.com/reports/performance_${Date.now()}.${type.toLowerCase()}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addFeedback = async (req, res) => {
    try {
        const performance = new Performance(req.body);
        await performance.save();
        res.status(201).json({ success: true, message: "Feedback added", data: performance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---> HR Operations: Finance <---

// 1. Get Salary Processing List (Show all employees for the month)
exports.getSalaryProcessingList = async (req, res) => {
    try {
        const { month, year } = req.query; // e.g. "October", 2023
        
        // Find existing payrolls for the criteria
        let payrolls = await Payroll.find({ month, year })
            .populate("userId", "name department designation profileImage");

        if (payrolls.length === 0) {
            // If No records for this month yet, suggest creating them from User's base salaries
            const users = await User.find({ isTerminated: { $ne: true } }).select("name department designation profileImage financialDetails");
            
            payrolls = users.map(user => ({
                userId: user,
                month,
                year,
                basicSalary: user.financialDetails?.currentBaseSalary || 0,
                bonus: 0,
                deductions: 0,
                netPay: user.financialDetails?.currentBaseSalary || 0,
                status: "Pending"
            }));
        }

        res.status(200).json({ success: true, data: payrolls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Create/Update a salary record (Manual adjustment)
exports.processSalary = async (req, res) => {
    try {
        const { userId, month, year, basicSalary, bonus, deductions, status = "Processed" } = req.body;

        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: "Valid userId is required" });
        }
        if (!month || !year || basicSalary === undefined || deductions === undefined) {
            return res.status(400).json({ success: false, message: "month, year, basicSalary, and deductions are required" });
        }

        const targetUser = await User.findById(userId).select("role name").lean();
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "Target user not found" });
        }

        const requesterRole = String(req.user?.role || "").trim().toLowerCase();
        const targetRole = String(targetUser.role || "").trim().toLowerCase();

        if (requesterRole === "hr" && ["admin", "main_admin", "superadmin"].includes(targetRole)) {
            return res.status(403).json({
                success: false,
                message: "HR cannot assign salary records for admin accounts"
            });
        }

        const netPay = (Number(basicSalary) + Number(bonus || 0)) - Number(deductions || 0);

        const payroll = await Payroll.findOneAndUpdate(
            { userId, month, year },
            { basicSalary: Number(basicSalary), bonus: Number(bonus || 0), deductions: Number(deductions || 0), allowances: 0, netPay, status },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Notify employee about payroll update
        try {
            const { notifyUser, notifyRoleUsers, emitToastToUser } = require("../utils/notifier");
            const actorName = req.user?.name || "HR/Admin";
            const actorRole = req.user?.role;
            await notifyUser({
                recipient: userId,
                category: "payroll",
                headline: `Payroll Updated: ${month} ${year}`,
                details: `Your salary record for ${month} ${year} has been updated by ${actorName}. Net Pay: ${netPay.toLocaleString()}.`,
                sentBy: req.user?._id,
            });

            // Notify the other authority
            const otherRoles = actorRole === "hr" ? ["admin", "superadmin"] : ["hr", "superadmin"];
            await notifyRoleUsers({
                roles: otherRoles,
                category: "payroll",
                headline: `Payroll Updated: ${targetUser.name || "Employee"}`,
                details: `${actorName} updated the salary record for ${targetUser.name || "an employee"} (${month} ${year}).`,
                sentBy: req.user?._id,
                excludeUserId: req.user?._id,
            });

            // Confirmation to actor
            emitToastToUser(req.user?._id, "success", `Salary record for ${month} ${year} saved.`);
        } catch (notifyErr) {
            console.warn("[Payroll] Notification failed (non-blocking):", notifyErr.message);
        }

        res.status(201).json({ success: true, message: "Salary record saved", data: payroll });
    } catch (error) {
        logger.error("processSalary error", { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Payslip
exports.getPayslip = async (req, res) => {
    try {
        const { id } = req.params; // payroll ID
        const payslip = await Payroll.findById(id).populate("userId");
        res.status(200).json({ success: true, data: payslip });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---> HR Operations: Resignation <---
exports.submitResignation = async (req, res) => {
    try {
        const {
            userId, employeeId, employeeName, employeeEmail,
            department, designation, reason, noticePeriodDays, lastWorkingDate, comments
        } = req.body;
        const effectiveUserId = userId || employeeId;

        if (!effectiveUserId || !reason) {
            return res.status(400).json({ success: false, message: "userId and reason are required" });
        }

        const reqData = new Resignation({
            userId: effectiveUserId,
            employeeName,
            employeeEmail,
            employeeId,
            department,
            designation,
            reason,
            noticePeriodDays: Number.isFinite(Number(noticePeriodDays)) ? Number(noticePeriodDays) : 30,
            lastWorkingDate: lastWorkingDate || undefined,
            managerRemarks: comments || undefined
        });
        await reqData.save();

        // Notify HR/Admin about new resignation
        try {
            const nameForNotify = employeeName || "An employee";
            await notifyRoleUsers({
                roles: ["hr", "admin", "superadmin"],
                category: "alert",
                headline: `New Resignation: ${nameForNotify}`,
                details: `${nameForNotify} submitted a resignation request.${lastWorkingDate ? " Last working date: " + lastWorkingDate : ""}${reason ? " Reason: " + reason : ""}`,
                sentBy: effectiveUserId,
                excludeUserId: effectiveUserId,
            });

            // Send real-time toast popup to HR/Admin
            try {
                emitToRoles(["hr", "admin", "superadmin"], "toast", {
                    type: "info",
                    message: `New Resignation from ${nameForNotify}`,
                    category: "alert",
                });
            } catch (toastErr) {
                console.warn("[Resignation] Toast emission failed (non-blocking):", toastErr.message);
            }

            // Emit entity event for real-time dashboard refresh
            emitEntityEvent("resignation", "created", {
                id: reqData._id,
                userId: effectiveUserId,
                employeeName: nameForNotify,
                reason,
                lastWorkingDate,
                status: "pending",
            }, {
                userId: effectiveUserId,
                targetRoles: ["hr", "admin", "superadmin"],
            });
        } catch (notifyErr) {
            console.warn("[Resignation] notifyRoleUsers failed (non-blocking):", notifyErr.message);
        }

        res.status(201).json({ success: true, message: "Resignation submitted", data: reqData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getResignations = async (req, res) => {
    try {
        const list = await Resignation.find()
            .populate("userId", "name department profileImage")
            .populate("redirectedBy", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.processExit = async (req, res) => {
    try {
        const { resignationId, status, managerRemarks } = req.body;
        const update = { status, managerRemarks };
        if (req.user?.name && (status === 'Approved' || status === 'Rejected')) {
            update.actionedBy = req.user.name;
        }
        const exitData = await Resignation.findByIdAndUpdate(resignationId, update, { new: true });
        res.status(200).json({ success: true, message: "Exit Processed", data: exitData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.redirectResignationToAdmin = async (req, res) => {
    try {
        const { resignationId } = req.body;
        const hrUserId = req.user?._id;
        const hrName = req.user?.name || "HR";

        if (!resignationId) {
            return res.status(400).json({ success: false, message: "resignationId is required" });
        }

        const resignation = await Resignation.findById(resignationId);
        if (!resignation) {
            return res.status(404).json({ success: false, message: "Resignation not found" });
        }

        if (resignation.redirectedToAdmin) {
            return res.status(400).json({ success: false, message: "Resignation already redirected to admin" });
        }

        resignation.redirectedToAdmin = true;
        resignation.redirectedBy = hrUserId;
        await resignation.save();

        const employeeName = resignation.employeeName || "An employee";
        const lastWorkingDate = resignation.lastWorkingDate
            ? new Date(resignation.lastWorkingDate).toDateString()
            : "";

        // Notify admin users
        await notifyRoleUsers({
            roles: ["admin", "superadmin"],
            category: "alert",
            headline: `Resignation Redirected by ${hrName}`,
            details: `${hrName} redirected ${employeeName}'s resignation to admin for review.${lastWorkingDate ? " Last working date: " + lastWorkingDate : ""} Reason: ${resignation.reason}`,
            sentBy: hrUserId,
        });

        // Send real-time toast popup to admin users
        emitToRoles(["admin", "superadmin"], "toast", {
            type: "info",
            message: `Resignation redirected by ${hrName}: ${employeeName}`,
            category: "alert",
        });

        res.status(200).json({ success: true, message: "Resignation redirected to admin successfully", data: resignation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---> HR Operations: Analytics <---
exports.getAnalyticsReport = async (req, res) => {
    try {
        // Dept-wise employee counts
        const deptAttendance = await User.aggregate([
            { $match: { department: { $ne: null } } },
            { $group: { _id: "$department", totalEmployees: { $sum: 1 } } }
        ]);
        
        const deptPerformance = await User.aggregate([
            {
                $lookup: {
                    from: "performances",
                    localField: "_id",
                    foreignField: "userId",
                    as: "perf"
                }
            },
            { $unwind: { path: "$perf", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$department",
                    avgEfficiency: { $avg: "$perf.efficiencyScore" },
                    avgQuality: { $avg: "$perf.qualityScore" },
                    avgReliability: { $avg: "$perf.reliabilityScore" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                attendanceByDepartment: deptAttendance,
                performanceAvgByDepartment: deptPerformance
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Attendance Analytics
exports.getAttendanceAnalytics = async (req, res) => {
    try {
        const { department, startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        const matchStage = { PunchTime: { $gte: start, $lte: end } };

        const pipeline = [
            { $match: matchStage },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
        ];
        if (department) pipeline.push({ $match: { "user.department": department } });
        pipeline.push(
            {
                $group: {
                    _id: { department: "$user.department", date: { $dateToString: { format: "%Y-%m-%d", date: "$PunchTime" } } },
                    uniqueEmployees: { $addToSet: "$userId" }
                }
            },
            {
                $group: {
                    _id: "$_id.department",
                    dailyRecords: { $push: { date: "$_id.date", presentCount: { $size: "$uniqueEmployees" } } }
                }
            }
        );

        const result = await Punch.aggregate(pipeline);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Performance Analytics
exports.getPerformanceAnalytics = async (req, res) => {
    try {
        const { department, month, year } = req.query;
        const filter = {};
        if (month) filter.month = month;
        if (year) filter.year = parseInt(year);

        const pipeline = [
            { $match: filter },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
        ];
        if (department) pipeline.push({ $match: { "user.department": department } });
        pipeline.push({
            $group: {
                _id: "$user.department",
                avgEfficiency: { $avg: "$efficiencyScore" },
                avgQuality: { $avg: "$qualityScore" },
                avgReliability: { $avg: "$reliabilityScore" },
                totalReviews: { $sum: 1 }
            }
        });

        const result = await Performance.aggregate(pipeline);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Double Shift Request Management (HR/Admin) --- //
exports.getDoubleShiftRequests = async (req, res) => {
    try {
        const { status, employeeId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (employeeId) filter.employeeId = employeeId;

        const requests = await DoubleShiftRequest.find(filter)
            .populate("employeeId", "name employeeId department designation email")
            .populate("reviewedBy", "name")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            status: "Success",
            data: requests,
        });
    } catch (error) {
        console.error("[getDoubleShiftRequests] Error:", error);
        return res.status(500).json({ status: "Error", message: "Failed to fetch double shift requests", error: error.message });
    }
};

exports.reviewDoubleShiftRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, reviewNotes } = req.body;
        const reviewerId = req.user?._id;
        const reviewerRole = req.user?.role;

        if (!reviewerId) {
            return res.status(401).json({ status: "Error", message: "Unauthorized" });
        }
        if (!status || !["approved", "rejected"].includes(status)) {
            return res.status(400).json({ status: "Error", message: "Valid status (approved/rejected) is required" });
        }

        const request = await DoubleShiftRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ status: "Error", message: "Double shift request not found" });
        }
        if (request.status !== "pending") {
            return res.status(409).json({ status: "Error", message: "Request has already been reviewed" });
        }

        request.status = status;
        request.reviewedBy = reviewerId;
        request.reviewedAt = new Date();
        request.reviewNotes = reviewNotes || "";
        await request.save();

        // If approved, also update the employee's doubleShiftAllowed flag
        if (status === "approved") {
            await User.findByIdAndUpdate(request.employeeId, { doubleShiftAllowed: true });
        }

        const reviewerName = req.user?.name || "HR/Admin";
        const isReject = status === "rejected";
        const formattedDate = request.requestDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        // Notify the employee
        try {
            await notifyUser({
                recipient: request.employeeId,
                category: "attendance",
                headline: isReject ? "Double Shift Request Rejected" : "Double Shift Request Approved",
                details: isReject
                    ? `Your double shift request for ${formattedDate} was rejected by ${reviewerName}.${reviewNotes ? " Reason: " + reviewNotes : ""}`
                    : `Your double shift request for ${formattedDate} has been approved by ${reviewerName}.`,
                sentBy: reviewerId,
            });
        } catch (notifyErr) {
            console.warn("[reviewDoubleShift] notifyUser failed (non-blocking):", notifyErr.message);
        }

        // Notify Admin (and other roles)
        try {
            const otherRoles = reviewerRole === "hr" ? ["admin", "superadmin"] : ["hr", "superadmin"];
            const employee = await User.findById(request.employeeId).select("name").lean();
            const employeeName = employee?.name || "an employee";
            await notifyRoleUsers({
                roles: otherRoles,
                category: "attendance",
                headline: isReject ? "Double Shift Request Rejected" : "Double Shift Request Approved",
                details: `${reviewerName} ${isReject ? "rejected" : "approved"} double shift request for ${employeeName} (${formattedDate}).`,
                sentBy: reviewerId,
                excludeUserId: reviewerId,
            });
        } catch (notifyErr) {
            console.warn("[reviewDoubleShift] notifyRoleUsers failed (non-blocking):", notifyErr.message);
        }

        return res.status(200).json({
            status: "Success",
            message: `Double shift request ${status}`,
            data: request,
        });
    } catch (error) {
        console.error("[reviewDoubleShiftRequest] Error:", error);
        return res.status(500).json({ status: "Error", message: "Failed to review double shift request", error: error.message });
    }
};
