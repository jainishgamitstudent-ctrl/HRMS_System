const LeaveApplication = require("../models/leaveApplication.model");
const LeaveBalance = require("../models/leaveBalance.model");
const User = require("../models/user.model");
const RequestRoom = require("../models/requestRoom.model");
const { notifyUser, notifyRoleUsers, notifyUsers, emitToastToUser } = require("../utils/notifier");
const { emitToRoles } = require("../utils/socketManager");

const normalizeLeaveDate = (value) => {
    if (typeof value === "string") {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
            return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
        }
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const nextDate = (date) => {
    const value = new Date(date);
    value.setUTCDate(value.getUTCDate() + 1);
    return value;
};

const mapLeaveApplication = (leave) => ({
    LeaveApplicationMasterID: leave._id,
    EmployeeID: leave.EmployeeID,
    LeaveType: leave.LeaveType,
    ApprovalStatusID: leave.ApprovalStatusID,
    ApprovalStatus: leave.ApprovalStatus,
    ApprovalUsername: leave.ApprovalUsername,
    Reason: leave.Reason,
    StartDate: leave.StartDate,
    EndDate: leave.EndDate,
    IsHalfDay: leave.IsHalfDay,
    IsFirstHalf: leave.IsFirstHalf,
    CreatedBy: leave.CreatedBy,
    UpdatedBy: leave.UpdatedBy,
    CreatedDate: leave.createdAt,
    UpdatedDate: leave.updatedAt
});

const dedupeLeaveApplications = (leaves) => {
    const seen = new Set();
    return leaves.filter((leave) => {
        const key = [
            String(leave.EmployeeID),
            leave.LeaveType,
            leave.StartDate ? leave.StartDate.toISOString().split("T")[0] : "",
            leave.EndDate ? leave.EndDate.toISOString().split("T")[0] : "",
            leave.Reason,
            leave.ApprovalStatus
        ].join("|");

        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

// 1. Submit Leave Application (POST /leaveapplications/)
exports.applyLeave = async (req, res) => {
    try {
        const { LeaveType, Reason, StartDate, EndDate, IsHalfDay, IsFirstHalf } = req.body;
        
        const userId = req.user._id; 
        const normalizedStartDate = normalizeLeaveDate(StartDate);
        const normalizedEndDate = normalizeLeaveDate(EndDate);

        if (!LeaveType || !Reason || !normalizedStartDate || !normalizedEndDate) {
            return res.status(400).json({ status: "Error", message: "Leave type, reason, start date, and end date are required." });
        }

        if (normalizedEndDate < normalizedStartDate) {
            return res.status(400).json({ status: "Error", message: "End date cannot be before start date." });
        }

        const existingLeave = await LeaveApplication.findOne({
            EmployeeID: userId,
            LeaveType,
            Reason,
            StartDate: { $gte: normalizedStartDate, $lt: nextDate(normalizedStartDate) },
            EndDate: { $gte: normalizedEndDate, $lt: nextDate(normalizedEndDate) },
            ApprovalStatusID: { $in: [1, 3] }
        }).sort({ createdAt: -1 });

        if (existingLeave) {
            return res.status(200).json({
                status: "Success",
                message: "Leave application already exists.",
                data: mapLeaveApplication(existingLeave)
            });
        }

        const leaveApp = await LeaveApplication.create({
            EmployeeID: userId,
            LeaveType,
            Reason,
            StartDate: normalizedStartDate,
            EndDate: normalizedEndDate,
            IsHalfDay,
            IsFirstHalf,
            ApprovalStatusID: 3,
            ApprovalStatus: "Awaiting Approve",
            ApprovalUsername: "Main Admin", // You could logically infer this from the user's manager
            CreatedBy: userId,
            UpdatedBy: userId
        });

        try {
            const hrAndAdmins = await User.find({
                role: { $in: ["hr", "admin", "superadmin"] },
                status: "Active",
            }).select("_id").lean();
            const participantIds = [userId, ...hrAndAdmins.map((u) => u._id)];
            const dateRange = normalizedStartDate && normalizedEndDate
                ? ` (${new Date(normalizedStartDate).toDateString()} - ${new Date(normalizedEndDate).toDateString()})`
                : "";
            const room = await RequestRoom.create({
                title: `Leave Request: ${LeaveType}${dateRange}`,
                description: Reason,
                requestType: "leave",
                leaveType: LeaveType,
                requestData: { startDate: normalizedStartDate, endDate: normalizedEndDate, isHalfDay: IsHalfDay, isFirstHalf: IsFirstHalf },
                status: "pending",
                createdBy: userId,
                participants: participantIds,
                relatedLeaveId: leaveApp._id,
            });
            console.log(`[Leave] RequestRoom created for leave ${leaveApp._id}`);

            // Notify HR/Admin dashboards about new leave request
            const employee = await User.findById(userId).select("name").lean();
            const employeeName = employee?.name || "An employee";
            await notifyRoleUsers({
                roles: ["hr", "admin", "superadmin"],
                category: "leave",
                headline: `New Leave Request: ${employeeName}`,
                details: `${employeeName} applied for ${LeaveType}${dateRange}. Reason: ${Reason}`,
                sentBy: userId,
                relatedRoomId: room._id,
                excludeUserId: userId,
            });

            // Send real-time toast popup to HR/Admin
            try {
                emitToRoles(["hr", "admin", "superadmin"], "toast", {
                    type: "info",
                    message: `New Leave Request from ${employeeName}`,
                    category: "leave",
                    relatedRoomId: String(room._id),
                });
            } catch (toastErr) {
                console.warn("[Leave] Toast emission failed (non-blocking):", toastErr.message);
            }
        } catch (roomErr) {
            console.warn("[Leave] RequestRoom creation failed (non-blocking):", roomErr.message);
        }

        res.status(200).json({
            status: "Success",
            message: "Leave application submitted successfully.",
            data: mapLeaveApplication(leaveApp)
        });
    } catch (error) {
        res.status(500).json({ status: "Error", message: "Failed to apply for leave", error: error.message });
    }
};

// 2. Get Leave Application (GET /leaveapplications/)
exports.getLeaveApplications = async (req, res) => {
    try {
        const userId = req.user._id; 

        const leaves = await LeaveApplication.find({ EmployeeID: userId }).sort({ createdAt: -1 });

        if (!leaves.length) {
            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                data: []
            });
        }

        res.status(200).json({
            status: "Success",
            statusCode: 200,
            data: dedupeLeaveApplications(leaves).map(mapLeaveApplication)
        });

    } catch (error) {
        res.status(500).json({ status: "Error", message: "Failed to get leaves", error: error.message });
    }
};

// 3. Get Leave Approvals (GET /leaveapprovals/)
exports.getLeaveApprovals = async (req, res) => {
    try {
        // Mocking user ID for approver
        const approverId = req.user ? req.user._id : "656b23d91f4a9b2b2c3d4e5f"; 
        
        // Let's query pending leaves. For now, mock based on provided request:
        res.status(200).json({
            status: "Success",
            total_pending_approvals: 1,
            pending_approvals: [
                {
                    "Leave_ID": 9,
                    "employee_name": "Riya mishra",
                    "leave_type": "Sick Leave",
                    "start_date": "2026-01-18",
                    "end_date": "2026-01-18",
                    "reason": "Family function 111111..",
                    "profile_image": "/img/StoreGoogle_Play_TypeLight_LanguageEnglish3x.png",
                    "applied_on": "2026-01-16",
                    "IsHalfDay": false,
                    "IsFirstHalf": false
                }
            ]
        });
    } catch (error) {
        res.status(500).json({ status: "Error", message: "Failed to get pending approvals", error: error.message });
    }
};

// 4. Approve / Reject Leave (POST /allapprove/)
exports.approveLeave = async (req, res) => {
    try {
        const { ProgramID, TranID, Reason, Action } = req.body;
        const approverID = req.user ? req.user._id : null;
        const approverName = (req.user && req.user.name) || "Approver";
        const isReject = String(Action || "").toLowerCase() === "reject";

        const leave = await LeaveApplication.findById(TranID);
        if (!leave) {
            return res.status(404).json({ status: "Error", message: "Leave application not found" });
        }

        const previousStatus = leave.ApprovalStatus;

        leave.ApprovalStatusID = isReject ? 4 : 1;
        leave.ApprovalStatus = isReject ? "Rejected" : "Approved";
        leave.ApproverID = approverID;
        leave.ApprovalUsername = approverName;
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
                if (!isReject && previousStatus !== 'Approved') {
                    balance[balanceKey] = Math.max(0, balance[balanceKey] - days);
                    await balance.save();
                } else if (isReject && previousStatus === 'Approved') {
                    balance[balanceKey] = balance[balanceKey] + days;
                    await balance.save();
                }
            }
        }

        if (leave.EmployeeID) {
            const dateRange =
                leave.StartDate && leave.EndDate
                    ? ` (${new Date(leave.StartDate).toDateString()} - ${new Date(leave.EndDate).toDateString()})`
                    : "";
            let room = null;
            try {
                room = await RequestRoom.findOneAndUpdate(
                    { relatedLeaveId: leave._id },
                    { status: isReject ? "rejected" : "approved" }
                );
            } catch (roomErr) {
                console.warn("[Leave] RequestRoom update failed (non-blocking):", roomErr.message);
            }
            await notifyUser({
                recipient: leave.EmployeeID,
                category: "leave",
                headline: isReject ? "Leave Request Rejected" : "Leave Request Approved",
                details: isReject
                    ? `Your ${leave.LeaveType} leave${dateRange} was rejected by ${approverName}.${Reason ? " Reason: " + Reason : ""}`
                    : `Your ${leave.LeaveType} leave${dateRange} has been approved by ${approverName}.`,
                sentBy: approverID,
                relatedRoomId: room?._id || null,
            });

            // Notify the other authority (if HR acted, notify Admin; if Admin acted, notify HR)
            const approverRole = req.user?.role;
            const otherRoles = approverRole === "hr" ? ["admin", "superadmin"] : ["hr", "superadmin"];
            await notifyRoleUsers({
                roles: otherRoles,
                category: "leave",
                headline: isReject ? "Leave Rejected" : "Leave Approved",
                details: `${approverName} ${isReject ? "rejected" : "approved"} ${leave.LeaveType} leave for an employee.${dateRange}`,
                sentBy: approverID,
                relatedRoomId: room?._id || null,
                excludeUserId: approverID,
            });

            // Confirmation popup to the approver
            emitToastToUser(approverID, "success", isReject ? "Leave rejected successfully." : "Leave approved successfully.");
        }

        res.status(200).json({
            status: "Success",
            statusCode: 200,
            message: isReject ? "Leave rejected." : "Approval updated successfully."
        });
    } catch (error) {
        res.status(500).json({ status: "Error", message: "Failed to approve leave", error: error.message });
    }
};
