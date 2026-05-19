/**
 * Middleware to enforce department-based access control.
 *
 * Rules:
 * - Admin / Main Admin / SuperAdmin / HR: full access to all employees
 * - Others: denied
 */
const verifyDepartmentAccess = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized request" });
        }

        const normalizedRole = String(user.role || "").toLowerCase().trim();

        // Admin and HR roles have unrestricted access
        const adminRoles = ["admin", "main_admin", "superadmin", "hr"];
        if (adminRoles.includes(normalizedRole)) {
            return next();
        }

        // All other roles are denied
        return res.status(403).json({ success: false, message: "Unauthorized" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { verifyDepartmentAccess };
