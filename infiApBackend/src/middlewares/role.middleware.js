// Role-Based Access Control
const verifyRole = (roles) => {
    return (req, res, next) => {
        let role = req.user?.role || "";

        // Normalize role names for comparison
        const normalized = String(role).toLowerCase().trim();
        if (normalized === "main_admin" || normalized === "main admin") {
            role = "superadmin";
        } else if (normalized === "admin") {
            role = "admin";
        } else if (normalized === "hr") {
            role = "hr";
        } else if (normalized === "employee") {
            role = "employee";
        }

        if (req.user) {
            req.user.role = role;
        }

        if (!role || !roles.includes(role)) {
            return res
                .status(403)
                .json({ message: "Access Denied: Insufficient Permissions" });
        }
        next();
    };
};

module.exports = { verifyRole };
