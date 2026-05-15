const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

// Optionally use JWT middleware here to protect these routes
// const { verifyJWT } = require("../middlewares/auth.middleware");
// router.use(verifyJWT);

// Employee Dashboard Home Data
router.get("/dashboard/home", verifyJWT, employeeController.getDashboardHome);

// Employee Punch (IN / OUT)
router.post("/emp-punch", verifyJWT, employeeController.empPunch);

// Get Attendance History with Check-in/Check-out times
router.post("/attendance-history", verifyJWT, employeeController.getAttendanceHistory);

// Get User recent Punch Status
router.get("/punch-status", verifyJWT, employeeController.getPunchStatus);

// Get Employee Leave Balance
router.get("/getemployeeleavebalance", employeeController.getEmployeeLeaveBalance);

// Late Check-in Count
router.get("/late-checkin-count", employeeController.getLateCheckinCount);

// Early Check-out Count
router.get("/early-checkout-count", employeeController.getEarlyCheckoutCount);

// Half Day Count
router.get("/Half_Day-count", employeeController.getHalfDayCount);

// Attendance Summary
router.get("/attendance-summary", verifyJWT, employeeController.getAttendanceSummary);

// Missed Punches
router.get("/missed-punches", employeeController.getMissedPunches);

// Employee of the Month
router.get("/getemployeeofthemonth", employeeController.getEmployeeOfTheMonth);

// DOB / Birthdays
router.get("/getDOB", employeeController.getDOB);

// Leave Applications route
router.post("/leaveapplications", verifyJWT, employeeController.applyLeave);
router.get("/leaveapplications", verifyJWT, employeeController.getEmployeeLeaves);

// Pending approvals route
router.get("/leaveapprovals", employeeController.getPendingApprovals);

// Approval action route
router.post("/allapprove", employeeController.approveActivity);

// InfiAp Directors List
router.get("/directors", employeeController.getDirectors);

// Get Profile Header Info
router.get("/profile/header", verifyJWT, employeeController.getProfileHeader);

// Get Personal Information
router.get("/profile/personal", verifyJWT, employeeController.getPersonalInformation);

// Get Professional Information
router.get("/profile/professional", verifyJWT, employeeController.getProfessionalInformation);

// Get Account Information
router.get("/profile/account", verifyJWT, employeeController.getAccountInformation);

// Get Profile Documents
router.get("/profile/documents", verifyJWT, employeeController.getProfileDocuments);

// Get Profile Activity Feed
router.get("/profile/activity", verifyJWT, employeeController.getProfileActivityFeed);

// Get Notification Settings
router.get("/profile/notifications", verifyJWT, employeeController.getNotificationSettings);

// Edit Personal Profile
router.post("/profile/edit", employeeController.editProfile);
router.get("/profile/me", verifyJWT, employeeController.getAuthenticatedProfile);
router.patch("/profile/me", verifyJWT, employeeController.updateAuthenticatedProfile);

// Attendance Granular APIs (Reusable - POST for GET)
router.post("/attendance/stats", employeeController.getAttendanceStats);
router.post("/attendance/work-summary", employeeController.getAttendanceWorkSummary);
router.post("/attendance/shift", employeeController.getAttendanceShift);
router.post("/attendance/timeline", employeeController.getAttendanceTimeline);
router.post("/attendance/logs", employeeController.getAttendanceHistory);

// Working Schedule Granular APIs
router.post("/schedule/current", employeeController.getCurrentSchedule);
router.post("/schedule/weekly", employeeController.getWeeklySchedule);
router.post("/schedule/holidays", employeeController.getUpcomingHolidays);
router.post("/schedule/request-shift-change", employeeController.requestShiftChange);
router.post("/schedule/holiday-calendar", employeeController.getHolidayCalendar);

// Leave Management Granular APIs (Reusable - POST for GET)
router.post("/leave/balances", employeeController.getLeaveBalances);
router.post("/leave/upcoming", employeeController.getUpcomingLeaves);
router.post("/leave/history", employeeController.getLeaveHistory);
router.post("/leave/apply", employeeController.applyLeaveRequest);

// Leave Request Management (Approver/Admin View - POST for GET)
router.post("/leave/requests/all", employeeController.getAllLeaveRequests);
router.post("/leave/requests/pending", employeeController.getPendingLeaveRequests);
router.post("/leave/requests/history", employeeController.getHistoryLeaveRequests);

// Payroll Granular APIs (Reusable - POST for GET)
router.post("/payroll/current", employeeController.getPayrollCurrent);
router.post("/payroll/history", employeeController.getPayrollHistory);
router.post("/payroll/details", employeeController.getPayrollDetails);
router.post("/payroll/notify-processed", verifyJWT, verifyRole(["hr", "admin", "superadmin"]), employeeController.notifyPayrollProcessed);

// Performance Management Granular APIs (Reusable - POST for GET)
router.post("/performance/current", employeeController.getEmployeePerformance);
router.post("/performance/history", employeeController.getPerformanceHistory);
router.post("/performance/dept-overview", employeeController.getDepartmentPerformanceOverview);
router.post("/performance/monthly-overview", employeeController.getMonthlyPerformanceOverview);
router.post("/performance/recent-achievements", employeeController.getRecentAchievementsList);
router.post("/performance/breakdown", employeeController.getEmployeePerformanceBreakdownList);
router.post("/performance/metrics", employeeController.getMonthlyPerformanceMetrics);
router.post("/performance/kpis", employeeController.getMonthlyPerformanceKPIs);
router.post("/performance/submit-review", employeeController.submitPerformanceReviewAction);
router.post("/performance/review-details", employeeController.getPerformanceReviewDetailView);

module.exports = router;
