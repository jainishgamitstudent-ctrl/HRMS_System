const User = require("../models/user.model");

/**
 * Middleware to enforce department-based access control.
 * 
 * Rules:
 * - Admin / Main Admin / SuperAdmin: full access to all employees
 * - HR: can only access employees within their own department
 * - Others: denied
 */
const verifyDepartmentAccess = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized request" });
        }

        const normalizedRole = String(user.role || "").toLowerCase().trim();

        // Admin roles have unrestricted access
        const adminRoles = ["admin", "main_admin", "superadmin"];
        if (adminRoles.includes(normalizedRole)) {
            return next();
        }

        // HR can only manage employees in their own department
        if (normalizedRole === "hr") {
            const employeeId = req.params.id;
            if (!employeeId) {
                return res.status(400).json({ success: false, message: "Employee ID is required" });
            }

            const employee = await User.findById(employeeId).select("department").lean();
            if (!employee) {
                return res.status(404).json({ success: false, message: "Employee not found" });
            }

            const hrDepartment = String(user.department || "").trim();
            const employeeDepartment = String(employee.department || "").trim();

            if (hrDepartment !== employeeDepartment) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied: Cannot manage employees from other departments"
                });
            }

            // Attach employee to request for downstream use
            req.employee = employee;
            return next();
        }

        // All other roles are denied
        return res.status(403).json({ success: false, message: "Unauthorized" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { verifyDepartmentAccess };
