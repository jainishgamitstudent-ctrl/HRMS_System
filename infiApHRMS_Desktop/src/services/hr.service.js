import apiClient from "./apiClient";

export const hrService = {
  // --- Welcome / Profile ---
  getDashboardSummary: () =>
    apiClient.get("/hr/dashboard/summary").then(r => r.data),

  getProfile: () =>
    apiClient.get("/hr/profile").then(r => r.data),

  // --- Employees ---
  getEmployees: (params = {}) =>
    apiClient.get("/hr/employees", { params }).then(r => r.data),

  addEmployee: (data) =>
    apiClient.post("/hr/employees", data).then(r => r.data),

  updateEmployee: (id, data) =>
    apiClient.put(`/hr/employees/${id}`, data).then(r => r.data),

  getEmployeeProfile: (id) =>
    apiClient.get(`/hr/employees/${id}/profile`).then(r => r.data),

  // --- Attendance ---
  getAttendanceDailyOverview: (date) =>
    apiClient.get("/hr/attendance/daily-overview", { params: { date } }).then(r => r.data),

  getCheckInRecords: (params) =>
    apiClient.get("/hr/attendance/records", { params }).then(r => r.data),

  getMonthlyAttendance: (year, month, department) =>
    apiClient.get("/hr/attendance/monthly", { params: { year, month, department } }).then(r => r.data),

  submitCorrectionRequest: (data) =>
    apiClient.post("/hr/attendance/correction/submit", data).then(r => r.data),

  getCorrectionRequests: (status) =>
    apiClient.get("/hr/attendance/correction/requests", { params: { status } }).then(r => r.data),

  reviewCorrectionRequest: (correctionId, status, remarks) =>
    apiClient.put("/hr/attendance/correction/review", {
      correctionId, status, reviewRemarks: remarks
    }).then(r => r.data),

  getAttendanceReports: (filter, department) =>
    apiClient.get("/hr/attendance/reports", { params: { filter, department } }).then(r => r.data),

  generateAttendanceReport: (startDate, endDate, department) =>
    apiClient.post("/hr/attendance/generate-report", {
      startDate, endDate, department
    }).then(r => r.data),

  // --- Leaves ---
  getLeaveStats: () =>
    apiClient.get("/hr/leaves/stats").then(r => r.data),

  getPendingLeaves: () =>
    apiClient.get("/hr/leaves/pending-detailed").then(r => r.data),

  getLeaveApplications: (status) =>
    apiClient.get("/hr/leaves/applications", { params: { status } }).then(r => r.data),

  approveLeave: (leaveId, status) =>
    apiClient.put("/hr/leaves/approve", { leaveId, status }).then(r => r.data),

  redirectLeaveToAdmin: (leaveId) =>
    apiClient.put("/hr/leaves/redirect-to-admin", { leaveId }).then(r => r.data),

  // --- Recruitment ---
  getRecruitmentDashboard: () =>
    apiClient.get("/hr/recruitment/dashboard").then(r => r.data),

  getCandidates: (status) =>
    apiClient.get("/hr/recruitment/candidates/tracking", { params: { status } }).then(r => r.data),

  getReviewApplications: () =>
    apiClient.get("/hr/recruitment/candidates/review").then(r => r.data),

  getCandidateProfile: (id) =>
    apiClient.get(`/hr/recruitment/candidates/${id}/profile`).then(r => r.data),

  shortlistCandidate: (id) =>
    apiClient.put(`/hr/recruitment/candidates/${id}/shortlist`).then(r => r.data),

  rejectCandidate: (id, reason) =>
    apiClient.put(`/hr/recruitment/candidates/${id}/reject`, { reason }).then(r => r.data),

  scheduleInterview: (id, date, interviewer) =>
    apiClient.put(`/hr/recruitment/candidates/${id}/schedule-interview`, {
      date, interviewer
    }).then(r => r.data),

  selectCandidate: (id) =>
    apiClient.put(`/hr/recruitment/candidates/${id}/select`).then(r => r.data),

  sendOfferLetter: (id) =>
    apiClient.post(`/hr/recruitment/candidates/${id}/offer`).then(r => r.data),

  // --- Performance ---
  getPerformanceDashboard: (month, year) =>
    apiClient.get("/hr/performance/dashboard", { params: { month, year } }).then(r => r.data),

  getPerformanceList: (month, department) =>
    apiClient.get("/hr/performance/list", { params: { month, department } }).then(r => r.data),

  addPerformanceFeedback: (data) =>
    apiClient.post("/hr/performance/feedback", data).then(r => r.data),

  // --- Finance ---
  getSalaryList: (month, year) =>
    apiClient.get("/hr/finance/salary-list", { params: { month, year } }).then(r => r.data),

  processSalary: (data) =>
    apiClient.post("/hr/finance/salary/process", data).then(r => r.data),

  getPayslip: (id) =>
    apiClient.get(`/hr/finance/payslip/${id}`).then(r => r.data),

  // --- Resignation ---
  getResignationRegister: (params) =>
    apiClient.get("/hr/resignation/register", { params }).then(r => r.data),

  createResignation: (data) =>
    apiClient.post("/hr/resignation", data).then(r => r.data),

  updateExitProcess: (data) =>
    apiClient.put("/hr/resignation/exit-process", data).then(r => r.data),

  redirectResignationToAdmin: (resignationId) =>
    apiClient.put("/hr/resignation/redirect-to-admin", { resignationId }).then(r => r.data),

  // --- Attendance Extras ---
  getAttendanceNotifications: () =>
    apiClient.get("/hr/attendance/notifications").then(r => r.data),

  // --- Leaves Extras ---
  getTodayLeaves: (params) =>
    apiClient.get("/hr/leaves/today", { params }).then(r => r.data),

  getLeaveRequests: (params) =>
    apiClient.get("/hr/leaves/requests", { params }).then(r => r.data),

  // --- Recruitment Extras ---
  getRecruitmentJobs: (params) =>
    apiClient.get("/hr/recruitment/jobs", { params }).then(r => r.data),

  createRecruitmentJob: (data) =>
    apiClient.post("/hr/recruitment/jobs", data).then(r => r.data),

  // --- Profile Update (Multipart) ---
  updateProfile: async (employeeId, profileData, imageFile) => {
    const formData = new FormData();
    if (imageFile) {
      if (imageFile instanceof File) {
        formData.append('profilePicture', imageFile);
      } else if (imageFile.uri) {
        const filename = imageFile.name || imageFile.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        formData.append('profilePicture', {
          uri: imageFile.uri,
          name: filename,
          type,
        });
      }
    }
    Object.keys(profileData || {}).forEach((key) => {
      const value = profileData[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return apiClient.put(`/hr/employees/${employeeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },

  // --- Analytics ---
  getAnalyticsReport: () =>
    apiClient.get("/hr/analytics/report").then(r => r.data),

  getAttendanceAnalytics: (params) =>
    apiClient.get("/hr/analytics/attendance", { params }).then(r => r.data),

  getPerformanceAnalytics: (params) =>
    apiClient.get("/hr/analytics/performance", { params }).then(r => r.data),
};
