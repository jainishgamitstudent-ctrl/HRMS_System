const WFHRequest = require("../models/wfh.model");
const WFHPermission = require("../models/wfhPermission.model");
const User = require("../models/user.model");
const Team = require("../models/team.model");
const Department = require("../models/department.model");
const moment = require("moment");
const { notifyUser, notifyRoleUsers, emitToastToUser } = require("../utils/notifier");
const { emitToRoles } = require("../utils/socketManager");

/**
 * Check if a user has WFH permission.
 * Priority: global > employee-specific > team > department
 */
const checkUserWFHPermission = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { allowed: false, level: null, notes: null };

  // 1. Global permission
  const globalPerm = await WFHPermission.findOne({ level: "global", isActive: true });
  if (globalPerm) return { allowed: true, level: "global", notes: globalPerm.notes || null };

  // 2. Individual employee permission
  const empPerm = await WFHPermission.findOne({ level: "employee", employeeId: userId, isActive: true });
  if (empPerm) return { allowed: true, level: "employee", notes: empPerm.notes || null };

  // 3. Team-based permission
  if (user.employeeId) {
    const teams = await Team.find({ members: userId });
    const teamIds = teams.map((t) => t._id.toString());
    if (teamIds.length > 0) {
      const teamPerm = await WFHPermission.findOne({
        level: "team",
        teamId: { $in: teamIds },
        isActive: true,
      });
      if (teamPerm) return { allowed: true, level: "team", notes: teamPerm.notes || null };
    }
  }

  // 4. Department-based permission
  if (user.department) {
    const dept = await Department.findOne({ name: user.department });
    if (dept) {
      const deptPerm = await WFHPermission.findOne({
        level: "department",
        departmentId: dept._id,
        isActive: true,
      });
      if (deptPerm) return { allowed: true, level: "department", notes: deptPerm.notes || null };
    }
  }

  return { allowed: false, level: null, notes: null };
};

exports.applyWFH = async (req, res) => {
  try {
    const { date, duration, reason } = req.body;
    const employeeId = req.user ? req.user._id : req.body.employeeId || null;

    if (!employeeId) return res.status(400).json({ status: "Error", message: "employeeId required" });
    if (!date) return res.status(400).json({ status: "Error", message: "date required" });

    const permissionCheck = await checkUserWFHPermission(employeeId);
    if (!permissionCheck.allowed) {
      return res.status(403).json({
        status: "Error",
        message: "You do not have WFH access. Please contact HR/Admin.",
        wfhEnabled: false,
      });
    }

    const wfh = await WFHRequest.create({
      employeeId,
      date: moment(date).toDate(),
      duration: duration || "Full Day",
      reason,
      createdBy: employeeId,
    });

    try {
      const employee = await User.findById(employeeId).select("name").lean();
      const employeeName = employee?.name || "An employee";
      const formattedDate = moment(date).format("MMM DD, YYYY");
      await notifyRoleUsers({
        roles: ["hr", "admin", "superadmin"],
        category: "attendance",
        headline: `New WFH Request: ${employeeName}`,
        details: `${employeeName} requested WFH on ${formattedDate}${duration ? ` (${duration})` : ""}.${reason ? ` Reason: ${reason}` : ""}`,
        sentBy: employeeId,
        excludeUserId: employeeId,
      });

      // Send real-time toast popup to HR/Admin
      try {
        emitToRoles(["hr", "admin", "superadmin"], "toast", {
          type: "info",
          message: `New WFH Request from ${employeeName}`,
          category: "attendance",
        });
      } catch (toastErr) {
        console.warn("[WFH] Toast emission failed (non-blocking):", toastErr.message);
      }
    } catch (notifyErr) {
      console.warn("[WFH] notifyRoleUsers failed (non-blocking):", notifyErr.message);
    }

    return res.status(200).json({ status: "Success", message: "WFH request submitted", data: { id: wfh._id } });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to submit WFH request", error: error.message });
  }
};

exports.getUpcomingWFH = async (req, res) => {
  try {
    const employeeId = req.user ? req.user._id : req.query.employeeId || null;
    if (!employeeId) return res.status(400).json({ status: "Error", message: "employeeId required" });

    const permissionCheck = await checkUserWFHPermission(employeeId);
    if (!permissionCheck.allowed) {
      return res.status(200).json({ status: "Success", data: [], wfhEnabled: false });
    }

    const today = moment().startOf("day").toDate();
    const upcoming = await WFHRequest.find({ employeeId, date: { $gte: today } }).sort({ date: 1 }).limit(50);

    const data = upcoming.map((w) => ({
      id: w._id,
      date: w.date,
      duration: w.duration,
      reason: w.reason,
      status: w.status,
    }));

    return res.status(200).json({ status: "Success", data, wfhEnabled: true });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to get upcoming WFH", error: error.message });
  }
};

/**
 * Check current user's WFH permission status
 */
exports.checkMyWFHPermission = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.employeeId || null;
    if (!userId) return res.status(400).json({ status: "Error", message: "employeeId required" });

    const permissionCheck = await checkUserWFHPermission(userId);
    return res.status(200).json({
      status: "Success",
      data: {
        wfhEnabled: permissionCheck.allowed,
        level: permissionCheck.level,
        notes: permissionCheck.notes,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to check WFH permission", error: error.message });
  }
};

/**
 * Grant WFH permission (HR/Admin only)
 */
exports.grantWFHPermission = async (req, res) => {
  try {
    console.log("[grantWFHPermission] Request body:", req.body);
    console.log("[grantWFHPermission] User:", req.user?._id, "Role:", req.user?.role);
    const { level, employeeId, teamId, departmentId, notes } = req.body;
    const grantedBy = req.user ? req.user._id : null;

    if (!grantedBy) {
      console.log("[grantWFHPermission] Unauthorized - no grantedBy");
      return res.status(401).json({ status: "Error", message: "Unauthorized" });
    }
    if (!level || !["global", "employee", "team", "department"].includes(level)) {
      return res.status(400).json({ status: "Error", message: "Valid level is required (global, employee, team, department)" });
    }

    // Validation based on level
    if (level === "employee" && !employeeId) {
      return res.status(400).json({ status: "Error", message: "employeeId is required for individual-level permission" });
    }
    if (level === "team" && !teamId) {
      return res.status(400).json({ status: "Error", message: "teamId is required for team-level permission" });
    }
    if (level === "department" && !departmentId) {
      return res.status(400).json({ status: "Error", message: "departmentId is required for department-level permission" });
    }

    // Deactivate any existing active permission for the same target
    const deactivateQuery = { level, isActive: true };
    if (level === "employee") deactivateQuery.employeeId = employeeId;
    if (level === "team") deactivateQuery.teamId = teamId;
    if (level === "department") deactivateQuery.departmentId = departmentId;

    const deactivated = await WFHPermission.updateMany(deactivateQuery, { isActive: false, revokedAt: new Date() });
    console.log("[grantWFHPermission] Deactivated existing:", deactivated.modifiedCount);

    const newPermission = await WFHPermission.create({
      level,
      employeeId: level === "employee" ? employeeId : null,
      teamId: level === "team" ? teamId : null,
      departmentId: level === "department" ? departmentId : null,
      isActive: true,
      grantedBy,
      notes,
    });
    console.log("[grantWFHPermission] Created permission:", newPermission._id.toString());

    // Notify affected employee when individual-level permission is granted
    try {
      if (level === "employee" && employeeId) {
        const grantorName = req.user?.name || "HR/Admin";
        await notifyUser({
          recipient: employeeId,
          category: "attendance",
          headline: "WFH Permission Granted",
          details: `You have been granted WFH permission by ${grantorName}.${notes ? " Notes: " + notes : ""}`,
          sentBy: grantedBy,
        });
      }
    } catch (notifyErr) {
      console.warn("[grantWFHPermission] notifyUser failed (non-blocking):", notifyErr.message);
    }

    return res.status(200).json({
      status: "Success",
      message: `WFH permission granted at ${level} level`,
      data: { id: newPermission._id, level, isActive: true },
    });
  } catch (error) {
    console.error("[grantWFHPermission] Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ status: "Error", message: "Active permission already exists for this target" });
    }
    return res.status(500).json({ status: "Error", message: "Failed to grant WFH permission", error: error.message });
  }
};

/**
 * Revoke WFH permission (HR/Admin only)
 */
exports.revokeWFHPermission = async (req, res) => {
  try {
    console.log("[revokeWFHPermission] Revoking:", req.params.permissionId);
    const { permissionId } = req.params;

    const permission = await WFHPermission.findById(permissionId);
    console.log("[revokeWFHPermission] Found:", permission ? permission._id.toString() : "NOT FOUND");
    if (!permission) {
      return res.status(404).json({ status: "Error", message: "Permission not found" });
    }

    const wasEmployeeLevel = permission.level === "employee" && permission.employeeId;
    const affectedEmployeeId = wasEmployeeLevel ? permission.employeeId : null;

    permission.isActive = false;
    permission.revokedAt = new Date();
    await permission.save();

    // Notify affected employee
    try {
      if (affectedEmployeeId) {
        const revokerName = req.user?.name || "HR/Admin";
        await notifyUser({
          recipient: affectedEmployeeId,
          category: "attendance",
          headline: "WFH Permission Revoked",
          details: `Your WFH permission has been revoked by ${revokerName}.`,
          sentBy: req.user?._id,
        });
      }
    } catch (notifyErr) {
      console.warn("[revokeWFHPermission] notifyUser failed (non-blocking):", notifyErr.message);
    }

    return res.status(200).json({
      status: "Success",
      message: "WFH permission revoked successfully",
      data: { id: permission._id, level: permission.level, isActive: false },
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to revoke WFH permission", error: error.message });
  }
};

/**
 * Update WFH permission (HR/Admin only)
 */
exports.updateWFHPermission = async (req, res) => {
  try {
    const { permissionId } = req.params;
    const { level, employeeId, teamId, departmentId, notes } = req.body;

    const permission = await WFHPermission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({ status: "Error", message: "Permission not found" });
    }

    if (level) permission.level = level;
    if (employeeId !== undefined) permission.employeeId = level === "employee" ? employeeId : null;
    if (teamId !== undefined) permission.teamId = level === "team" ? teamId : null;
    if (departmentId !== undefined) permission.departmentId = level === "department" ? departmentId : null;
    if (notes !== undefined) permission.notes = notes;

    await permission.save();

    // Notify affected employee if permission targets a specific employee
    try {
      if (permission.level === "employee" && permission.employeeId) {
        const updaterName = req.user?.name || "HR/Admin";
        await notifyUser({
          recipient: permission.employeeId,
          category: "attendance",
          headline: "WFH Permission Updated",
          details: `Your WFH permission has been updated by ${updaterName}.${notes ? " Notes: " + notes : ""}`,
          sentBy: req.user?._id,
        });
      }
    } catch (notifyErr) {
      console.warn("[updateWFHPermission] notifyUser failed (non-blocking):", notifyErr.message);
    }

    return res.status(200).json({
      status: "Success",
      message: "WFH permission updated successfully",
      data: { id: permission._id, level: permission.level, isActive: permission.isActive },
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to update WFH permission", error: error.message });
  }
};

/**
 * Delete WFH permission permanently (HR/Admin only)
 */
exports.deleteWFHPermission = async (req, res) => {
  try {
    const { permissionId } = req.params;
    const permission = await WFHPermission.findByIdAndDelete(permissionId);
    if (!permission) {
      return res.status(404).json({ status: "Error", message: "Permission not found" });
    }

    // Notify affected employee
    try {
      if (permission.level === "employee" && permission.employeeId) {
        const deleterName = req.user?.name || "HR/Admin";
        await notifyUser({
          recipient: permission.employeeId,
          category: "attendance",
          headline: "WFH Permission Removed",
          details: `Your WFH permission has been permanently removed by ${deleterName}.`,
          sentBy: req.user?._id,
        });
      }
    } catch (notifyErr) {
      console.warn("[deleteWFHPermission] notifyUser failed (non-blocking):", notifyErr.message);
    }

    return res.status(200).json({
      status: "Success",
      message: "WFH permission deleted permanently",
      data: { id: permission._id },
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to delete WFH permission", error: error.message });
  }
};

/**
 * Get all WFH permissions with optional filters (HR/Admin only)
 */
exports.getWFHPermissions = async (req, res) => {
  try {
    console.log("[getWFHPermissions] Query:", req.query);
    const { level, isActive, employeeId, teamId, departmentId } = req.query;
    const query = {};

    if (level) query.level = level;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (employeeId) query.employeeId = employeeId;
    if (teamId) query.teamId = teamId;
    if (departmentId) query.departmentId = departmentId;

    const permissions = await WFHPermission.find(query)
      .populate("grantedBy", "name email")
      .populate("employeeId", "name email employeeId department")
      .populate("teamId", "name")
      .populate("departmentId", "name")
      .sort({ createdAt: -1 });
    console.log("[getWFHPermissions] Found:", permissions.length);

    const data = permissions.map((p) => ({
      id: p._id,
      level: p.level,
      isActive: p.isActive,
      grantedAt: p.grantedAt,
      revokedAt: p.revokedAt,
      notes: p.notes,
      grantedBy: p.grantedBy ? { id: p.grantedBy._id, name: p.grantedBy.name, email: p.grantedBy.email } : null,
      employee: p.employeeId ? { id: p.employeeId._id, name: p.employeeId.name, email: p.employeeId.email, employeeId: p.employeeId.employeeId } : null,
      team: p.teamId ? { id: p.teamId._id, name: p.teamId.name } : null,
      department: p.departmentId ? { id: p.departmentId._id, name: p.departmentId.name } : null,
    }));

    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to get WFH permissions", error: error.message });
  }
};

/**
 * Approve or Reject WFH request (HR/Admin only)
 */
exports.reviewWFHRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, reason } = req.body; // status: "Approved" | "Rejected"
    const approverId = req.user ? req.user._id : null;
    const approverName = (req.user && req.user.name) || "Approver";
    const approverRole = req.user?.role;

    if (!approverId) {
      return res.status(401).json({ status: "Error", message: "Unauthorized" });
    }
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ status: "Error", message: "Status must be Approved or Rejected" });
    }

    const wfh = await WFHRequest.findById(requestId);
    if (!wfh) {
      return res.status(404).json({ status: "Error", message: "WFH request not found" });
    }

    const canAct = ["hr", "admin", "superadmin"].includes(approverRole);
    if (!canAct) {
      return res.status(403).json({ status: "Error", message: "Only HR/Admin can approve or reject WFH requests" });
    }

    wfh.status = status;
    await wfh.save();

    // Notify employee
    const formattedDate = moment(wfh.date).format("MMM DD, YYYY");
    await notifyUser({
      recipient: wfh.employeeId,
      category: "attendance",
      headline: status === "Rejected" ? "WFH Request Rejected" : "WFH Request Approved",
      details: status === "Rejected"
        ? `Your WFH request for ${formattedDate} was rejected by ${approverName}.${reason ? " Reason: " + reason : ""}`
        : `Your WFH request for ${formattedDate} has been approved by ${approverName}.`,
      sentBy: approverId,
    });

    // Notify the other authority
    const otherRoles = approverRole === "hr" ? ["admin", "superadmin"] : ["hr", "superadmin"];
    await notifyRoleUsers({
      roles: otherRoles,
      category: "attendance",
      headline: status === "Rejected" ? "WFH Rejected" : "WFH Approved",
      details: `${approverName} ${status === "Rejected" ? "rejected" : "approved"} a WFH request for ${formattedDate}.`,
      sentBy: approverId,
      excludeUserId: approverId,
    });

    // Confirmation popup to the approver
    emitToastToUser(approverId, "success", status === "Rejected" ? "WFH request rejected." : "WFH request approved.");

    return res.status(200).json({ status: "Success", message: `WFH request ${status.toLowerCase()}.`, data: { id: wfh._id, status: wfh.status } });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to review WFH request", error: error.message });
  }
};
