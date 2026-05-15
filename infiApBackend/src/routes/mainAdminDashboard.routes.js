const express = require("express");
const router = express.Router();
const mainAdminDashboardController = require("../controllers/mainAdminDashboard.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

router.use(verifyJWT);
router.use(verifyRole(["superadmin"]));

router.get("/home-summary", mainAdminDashboardController.getHomeSummary);
router.get("/platform-activity", mainAdminDashboardController.getPlatformActivityGraph);
router.get("/registered-companies", mainAdminDashboardController.getRegisteredCompanies);
router.get("/system-integrations/status", mainAdminDashboardController.getSystemIntegrationStatus);
router.get("/system-alerts", mainAdminDashboardController.getSystemAlerts);
router.post("/system-alerts/:id/acknowledge", mainAdminDashboardController.acknowledgeSystemAlert);

router.post("/quick-actions/add-company", mainAdminDashboardController.quickAddCompany);
router.get("/quick-actions/previous-users", mainAdminDashboardController.getPreviousUsersInfo);
router.post("/quick-actions/deep-audit", mainAdminDashboardController.runDeepAudit);
router.post("/quick-actions/broadcast", mainAdminDashboardController.broadcastMessage);

module.exports = router;
