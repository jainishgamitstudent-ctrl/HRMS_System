const express = require("express");
const router = express.Router();
const adminDashboardController = require("../controllers/adminDashboard.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

// All admin dashboard routes require authentication (Admin or SuperAdmin only)
router.use(verifyJWT);
router.use(verifyRole(["admin", "superadmin"]));

// --- Summary & Insights ---
router.get("/summary", adminDashboardController.getSummaryStats);
router.get("/insights", adminDashboardController.getKeyInsights);
router.get("/analytics/report", adminDashboardController.getAnalyticsReport);

// --- Admin Profile & Account Settings ---
router.get("/profile", adminDashboardController.getAdminProfile);
router.patch("/profile", adminDashboardController.updateAdminProfile);
router.get("/account-settings", adminDashboardController.getAdminAccountSettings);
router.patch("/account-settings/personal-information", adminDashboardController.updateAdminPersonalInformation);
router.patch("/account-settings/security", adminDashboardController.updateAdminSecuritySettings);
router.patch("/account-settings/password", adminDashboardController.updateAdminPassword);
router.patch("/account-settings/notifications", adminDashboardController.updateAdminNotificationPreferences);

// --- Department Management ---
router.get("/departments", adminDashboardController.getDepartments);
router.get("/departments/create/form", adminDashboardController.getCreateDepartmentForm);
router.post("/departments", adminDashboardController.createDepartment);
router.get("/departments/add-employee/form", adminDashboardController.getDepartmentAddEmployeeForm);
router.post("/departments/add-employee", adminDashboardController.addDepartmentEmployee);
router.patch("/departments/:id", adminDashboardController.updateDepartment);
router.delete("/departments/:id", adminDashboardController.deleteDepartment);

// --- Team Management ---
router.get("/teams", adminDashboardController.getTeams);
router.get("/teams/manage/summary", adminDashboardController.getManageTeamSummary);
router.post("/teams", adminDashboardController.createTeam);
router.patch("/teams/:id", adminDashboardController.updateTeam);
router.delete("/teams/:id", adminDashboardController.deleteTeam);

// --- Payroll Management ---
router.get("/payroll/dashboard", adminDashboardController.getPayrollDashboard);
router.get("/payroll/salary-structure", adminDashboardController.getSalaryStructure);
router.post("/payroll/salary-structure", adminDashboardController.createSalaryStructure);

// --- Recruitment Control ---
router.get("/jobs", adminDashboardController.getAllJobs);
router.get("/jobs/posting/form", adminDashboardController.getJobPostingForm);
router.post("/jobs", adminDashboardController.createJob);
router.patch("/jobs/:id", adminDashboardController.updateJob);
router.delete("/jobs/:id", adminDashboardController.deleteJob);
router.get("/candidates", adminDashboardController.getAllCandidates);
router.get("/candidates/tracking", adminDashboardController.getCandidateTracking);
router.get("/candidates/interview-management", adminDashboardController.getInterviewManagement);
router.patch("/candidates/:id/status", adminDashboardController.updateCandidateStatus);
router.post("/candidates/schedule-interview", adminDashboardController.scheduleInterview);

// --- Notification Panel ---
router.get("/notifications/panel", adminDashboardController.getNotificationPanel);
router.get("/notifications", adminDashboardController.getAllNotifications);
router.get("/notifications/recent-broadcasts", adminDashboardController.getRecentBroadcasts);
router.get("/notifications/create/form", adminDashboardController.getAnnouncementForm);
router.post("/notifications", adminDashboardController.createAnnouncement);
router.patch("/notifications/:id", adminDashboardController.editAnnouncement);
router.post("/notifications/:id/resend", adminDashboardController.resendAnnouncement);

// --- Other Modules ---
router.get("/documents", adminDashboardController.getAllDocuments);
router.post("/documents", adminDashboardController.createDocument);
router.delete("/documents/:id", adminDashboardController.deleteDocument);
router.get("/settings", adminDashboardController.getSystemSettings);
router.patch("/settings", adminDashboardController.updateSystemSettings);

// --- Leave Management ---
router.get("/leaves/pending", adminDashboardController.getPendingLeaves);
router.post("/leaves/action", adminDashboardController.handleLeaveAction);

// --- Admin User Creation ---
router.post("/hr", adminDashboardController.createHR);
router.post("/employees", adminDashboardController.createEmployee);

// --- HR Management ---
router.get("/staff-directory", adminDashboardController.getStaffDirectory);
router.get("/hr-staff", adminDashboardController.getHRStaff);
router.patch("/hr-staff/permissions", adminDashboardController.updateHRPermissions);
router.delete("/hr-staff/:hrId", adminDashboardController.deleteHRUser);

// --- Activity ---
router.get("/activities", adminDashboardController.getRecentActivities);
router.post("/activities", adminDashboardController.createActivity);

module.exports = router;
