const WFHRequest = require("../models/wfh.model");
const WFHPermission = require("../models/wfhPermission.model");
const User = require("../models/user.model");
const Team = require("../models/team.model");
const Department = require("../models/department.model");
const moment = require("moment");

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

    permission.isActive = false;
    permission.revokedAt = new Date();
    await permission.save();

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
