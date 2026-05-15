const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");
const wfhController = require("../controllers/wfh.controller");

// Public/employee routes
router.post("/apply", verifyJWT, wfhController.applyWFH);
router.get("/upcoming", verifyJWT, wfhController.getUpcomingWFH);
router.get("/permission/check", verifyJWT, wfhController.checkMyWFHPermission);

// Admin/HR-only routes
router.post(
  "/permissions",
  (req, res, next) => {
    console.log("[ROUTE] POST /wfh/permissions hit. Body:", req.body, "User:", req.user?._id, "Role:", req.user?.role);
    next();
  },
  verifyJWT,
  verifyRole(["admin", "hr", "superadmin"]),
  wfhController.grantWFHPermission
);

router.patch(
  "/permissions/:permissionId/revoke",
  verifyJWT,
  verifyRole(["admin", "hr", "superadmin"]),
  wfhController.revokeWFHPermission
);

router.put(
  "/permissions/:permissionId",
  verifyJWT,
  verifyRole(["admin", "hr", "superadmin"]),
  wfhController.updateWFHPermission
);

router.delete(
  "/permissions/:permissionId",
  verifyJWT,
  verifyRole(["admin", "hr", "superadmin"]),
  wfhController.deleteWFHPermission
);

router.get(
  "/permissions",
  verifyJWT,
  verifyRole(["admin", "hr", "superadmin"]),
  wfhController.getWFHPermissions
);

module.exports = router;
