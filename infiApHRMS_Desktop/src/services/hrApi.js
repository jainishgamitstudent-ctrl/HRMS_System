/**
 * HR API Service — Centralized API layer for all 53 HR endpoints.
 * Base path: /api/v1/hr (proxied via Vite to infiApBackend on port 3000)
 */
import api from '../utils/axios';

const HR_BASE = '/hr';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const get = (path, params) => api.get(`${HR_BASE}${path}`, { params });
const post = (path, data) => api.post(`${HR_BASE}${path}`, data);
const put = (path, data) => api.put(`${HR_BASE}${path}`, data);

// ─── 1. Dashboard & Profile ──────────────────────────────────────────────────
export const getDashboardSummary = () => get('/dashboard/summary');
export const getHrProfile = () => get('/profile');
export const updateProfile = async (employeeId, profileData, imageFile) => {
    // If no image file, send as JSON
    if (!imageFile) {
        const response = await api.put(`/hr/employees/${employeeId}`, profileData);
        return response.data;
    }

    // If image file exists, use FormData
    const formData = new FormData();

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

    Object.keys(profileData || {}).forEach((key) => {
        const value = profileData[key];
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    // Let browser set Content-Type with boundary automatically
    const response = await api.put(`/hr/employees/${employeeId}`, formData);
    return response.data;
};

// ─── 2. Employee Management ──────────────────────────────────────────────────
export const getEmployees = (params) => get('/employees', params);
export const createEmployee = (data) => post('/employees', data);
export const updateEmployee = (id, data) => {
  // Check if there's a file in the data
  const hasFile = data.profilePicture instanceof File || 
                  (data.profilePicture && data.profilePicture.uri);
  
  if (hasFile) {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`${HR_BASE}/employees/${id}`, formData);
  } else {
    // Use JSON for regular updates (no file) - use the /json route to bypass upload middleware
    // Remove profilePicture if it's not a file
    const { profilePicture, ...jsonData } = data;
    return api.put(`${HR_BASE}/employees/${id}/json`, jsonData);
  }
};
export const getEmployeeProfile = (id) => get(`/employees/${id}/profile`);
export const deleteEmployee = (id) => api.delete(`${HR_BASE}/employees/${id}`);

// ─── 3. Attendance ───────────────────────────────────────────────────────────
export const getAttendanceDailyOverview = (params) => get('/attendance/daily-overview', params);
export const getAttendanceRecords = (params) => get('/attendance/records', params);
export const getPunchRecords = (params) => get('/attendance/punch-records', params);
export const submitAttendanceCorrection = (data) => post('/attendance/correction/submit', data);
export const getAttendanceCorrectionRequests = (params) => get('/attendance/correction/requests', params);
export const reviewAttendanceCorrection = (data) => put('/attendance/correction/review', data);
export const getAttendanceNotifications = () => get('/attendance/notifications');
export const getAttendanceReports = (params) => get('/attendance/reports', params);
export const generateAttendanceReport = (data) => post('/attendance/generate-report', data);

// ─── 4. Leave Management ─────────────────────────────────────────────────────
export const getLeaveStats = () => get('/leaves/stats');
export const getPendingDetailedLeaves = (params) => get('/leaves/pending-detailed', params);
export const getLeaveApplications = (params) => get('/leaves/applications', params);
export const getTodayLeaves = (params) => get('/leaves/today', params);
export const getLeaveRequests = (params) => get('/leaves/requests', params);
export const approveLeave = (data) => put('/leaves/approve', data);
export const getLeaveHistory = (params) => get('/leaves/history', params);
export const generateLeaveReport = (data) => post('/leaves/generate-report', data);

// ─── 5. Recruitment ──────────────────────────────────────────────────────────
export const getCandidateTracking = (params) => get('/recruitment/candidates/tracking', params);
export const getCandidateReview = (params) => get('/recruitment/candidates/review', params);
export const getRecentCandidates = (params) => get('/recruitment/candidates/recent', params);
export const getCandidateProfile = (id) => get(`/recruitment/candidates/${id}/profile`);
export const scheduleCandidateInterview = (id, data) => put(`/recruitment/candidates/${id}/schedule-interview`, data);
export const shortlistCandidate = (id) => put(`/recruitment/candidates/${id}/shortlist`);
export const rejectCandidate = (id, data) => put(`/recruitment/candidates/${id}/reject`, data);
export const updateCandidateInterview = (id, data) => put(`/recruitment/candidates/${id}/interview`, data);
export const selectCandidate = (id) => put(`/recruitment/candidates/${id}/select`);
export const sendCandidateOffer = (id, data) => post(`/recruitment/candidates/${id}/offer`, data);
export const getRecruitmentJobs = (params) => get('/recruitment/jobs', params);
export const createRecruitmentJob = (data) => post('/recruitment/jobs', data);
export const updateRecruitmentJob = (id, data) => put(`/recruitment/jobs/${id}`, data);
export const deleteRecruitmentJob = (id) => del(`/recruitment/jobs/${id}`);
export const createCandidate = (data) => post('/recruitment/candidates', data);
export const updateCandidate = (id, data) => put(`/recruitment/candidates/${id}`, data);
export const deleteCandidate = (id) => del(`/recruitment/candidates/${id}`);
export const seedRecruitmentData = () => post('/recruitment/seed');

// ─── 6. Performance ──────────────────────────────────────────────────────────
export const getPerformanceDashboard = (params) => get('/performance/dashboard', params);
export const getPerformanceList = (params) => get('/performance/list', params);
export const getFeedbackStats = () => get('/performance/feedback/stats');
export const getRecentFeedback = (params) => get('/performance/feedback/recent', params);
export const getPerformanceReportSummary = (params) => get('/performance/report/summary', params);
export const getPerformanceReportTrends = (params) => get('/performance/report/trends', params);
export const generatePerformanceReport = (data) => post('/performance/report/generate', data);
export const submitPerformanceFeedback = (data) => post('/performance/feedback', data);

// ─── 7. Finance / Salary ─────────────────────────────────────────────────────
export const getSalaryList = (params) => get('/finance/salary-list', params);
export const getPayroll = (params) => get('/finance/payroll', params);
export const processSalary = (data) => post('/finance/salary/process', data);
export const getPayslip = (id) => get(`/finance/payslip/${id}`);

// ─── 8. Resignation ──────────────────────────────────────────────────────────
export const createResignation = (data) => post('/resignation', data);
export const getResignationRegister = (params) => get('/resignation/register', params);
export const updateExitProcess = (data) => put('/resignation/exit-process', data);

// ─── 9. Analytics ────────────────────────────────────────────────────────────
export const getAnalyticsReport = (params) => get('/analytics/report', params);
export const getAnalyticsAttendance = (params) => get('/analytics/attendance', params);
export const getAnalyticsPerformance = (params) => get('/analytics/performance', params);

export default {
    getDashboardSummary,
    getHrProfile,
    updateProfile,
    getEmployees,
    createEmployee,
    updateEmployee,
    getEmployeeProfile,
    deleteEmployee,
    getAttendanceDailyOverview,
    getAttendanceRecords,
    submitAttendanceCorrection,
    getAttendanceCorrectionRequests,
    reviewAttendanceCorrection,
    getAttendanceNotifications,
    getAttendanceReports,
    generateAttendanceReport,
    getLeaveStats,
    getPendingDetailedLeaves,
    getLeaveApplications,
    getTodayLeaves,
    getLeaveRequests,
    approveLeave,
    getLeaveHistory,
    generateLeaveReport,
    getCandidateTracking,
    getCandidateReview,
    getRecentCandidates,
    getCandidateProfile,
    scheduleCandidateInterview,
    shortlistCandidate,
    rejectCandidate,
    updateCandidateInterview,
    selectCandidate,
    sendCandidateOffer,
    getRecruitmentJobs,
    createRecruitmentJob,
    updateRecruitmentJob,
    deleteRecruitmentJob,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    seedRecruitmentData,
    getPerformanceDashboard,
    getPerformanceList,
    getFeedbackStats,
    getRecentFeedback,
    getPerformanceReportSummary,
    getPerformanceReportTrends,
    generatePerformanceReport,
    submitPerformanceFeedback,
    getSalaryList,
    getPayroll,
    processSalary,
    getPayslip,
    createResignation,
    getResignationRegister,
    updateExitProcess,
    getAnalyticsReport,
    getAnalyticsAttendance,
    getAnalyticsPerformance,
};
