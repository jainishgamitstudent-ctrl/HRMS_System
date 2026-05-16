const express = require("express");
const router = express.Router();
const hrController = require("../controllers/hr.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");
const { verifyDepartmentAccess } = require("../middlewares/departmentAuth.middleware");
const { uploadSingle } = require("../middlewares/upload.middleware");
const { uploadLimiter } = require("../middlewares/security.middleware");

// All HR routes require authentication
router.use(verifyJWT);

// -> Routes accessible to Manager, HR, Admin, and SuperAdmin
router.put("/leaves/approve", verifyRole(["hr", "admin", "superadmin", "manager"]), hrController.approveLeave);
router.post("/performance/feedback", verifyRole(["hr", "admin", "superadmin", "manager"]), hrController.addFeedback);

// -> Global role protection: remaining routes are HR/Admin/SuperAdmin only
router.use(verifyRole(["hr", "admin", "superadmin"]));

// -> Welcome Page
router.get("/dashboard/summary", hrController.getDashboardSummary);
router.get("/profile", hrController.getHRAdminProfile);

// -> Employee
router.get("/employees", hrController.getAllEmployees);
router.post("/employees", hrController.addEmployee);
router.put("/employees/:id/json", verifyDepartmentAccess, hrController.editEmployee);
router.put("/employees/:id", uploadLimiter, uploadSingle, verifyDepartmentAccess, hrController.editEmployee);
router.get("/employees/:id/profile", hrController.getEmployeeProfile);
router.put("/employees/:id/double-shift", verifyDepartmentAccess, hrController.updateDoubleShiftPermission);

// -> Attendance (Detailed)
router.get("/attendance/daily-overview", hrController.getAttendanceDailyOverview);
router.get("/attendance/records", hrController.getCheckInRecords);
router.get("/attendance/punch-records", hrController.getPunchRecords);
router.get("/attendance/monthly", hrController.getMonthlyAttendance);
router.post("/attendance/correction/submit", hrController.submitCorrectionRequest);
router.get("/attendance/correction/requests", hrController.getCorrectionRequests);
router.put("/attendance/correction/review", hrController.reviewCorrectionRequest);
router.get("/attendance/notifications", hrController.getAttendanceNotifications);
router.get("/attendance/reports", hrController.getAttendanceReports);
router.post("/attendance/generate-report", hrController.generateAttendanceReport);

// -> Leaves
router.get("/leaves/stats", hrController.getLeaveStats);
router.get("/leaves/pending-detailed", hrController.getPendingLeavesDetailed);
router.get("/leaves/applications", hrController.getLeaveApplications);
router.get("/leaves/today", hrController.getEmployeesOnLeaveToday);
router.get("/leaves/requests", hrController.getLeaveRequests);
router.get("/leaves/history", hrController.getLeaveHistory);
router.post("/leaves/generate-report", hrController.generateLeaveReport);

// -> Recruitment
router.get("/recruitment/dashboard", hrController.getRecruitmentDashboard);
router.get("/recruitment/candidates/tracking", hrController.getCandidateTrackingList);
router.get("/recruitment/candidates/review", hrController.getReviewApplications);
router.get("/recruitment/candidates/recent", hrController.getRecentCandidatesDetail);
router.get("/recruitment/candidates/:id/profile", hrController.getCandidateProfile);
router.put("/recruitment/candidates/:id/schedule-interview", hrController.scheduleTechnicalInterview);
router.put("/recruitment/candidates/:id/shortlist", hrController.shortlistCandidate);
router.put("/recruitment/candidates/:id/reject", hrController.rejectCandidate);
router.put("/recruitment/candidates/:id/interview", hrController.updateTechnicalInterview);
router.put("/recruitment/candidates/:id/select", hrController.selectCandidate);
router.post("/recruitment/candidates/:id/offer", hrController.sendOfferLetter);
router.get("/recruitment/jobs", hrController.getJobs);
router.post("/recruitment/jobs", hrController.addJob);
router.post("/recruitment/jobs/:id/requirements", hrController.addRecruitmentRequirement);

// -> Performance
router.get("/performance/dashboard", hrController.getPerformanceDashboard);
router.get("/performance/list", hrController.getPerformanceList);
router.get("/performance/feedback/stats", hrController.getPerformanceFeedbackStats);
router.get("/performance/feedback/recent", hrController.getRecentFeedbackList);
router.get("/performance/report/summary", hrController.getPerformanceReportSummary);
router.get("/performance/report/trends", hrController.getPerformanceTrends);
router.post("/performance/report/generate", hrController.generatePerformanceReport);

// -> Finance
router.get("/finance/salary-list", hrController.getSalaryProcessingList);
router.get("/finance/payroll", hrController.getSalaryProcessingList); // keeping old path as alias
router.post("/finance/salary/process", hrController.processSalary);
router.get("/finance/payslip/:id", hrController.getPayslip);

// -> Resignation
router.post("/resignation", hrController.submitResignation);
router.get("/resignation/register", hrController.getResignations);
router.put("/resignation/exit-process", hrController.processExit);

// -> Analytics
router.get("/analytics/report", hrController.getAnalyticsReport);
router.get("/analytics/attendance", hrController.getAttendanceAnalytics);
router.get("/analytics/performance", hrController.getPerformanceAnalytics);

module.exports = router;
