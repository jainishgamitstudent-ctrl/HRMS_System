import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import { useAuth } from './context/AuthContext';
import { useNotifications } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/common/Toast';

// HR Dashboard Pages
import Dashboard from './pages/hr-dashboard/Dashboard';
import EmployeeDirectory from './pages/hr-dashboard/employee-management/EmployeeDirectory';
import AddEmployee from './pages/hr-dashboard/employee-management/AddEmployee';
import EditEmployee from './pages/hr-dashboard/employee-management/EditEmployee';
import EmployeeProfiles from './pages/hr-dashboard/employee-management/EmployeeProfiles';
import EmployeeProfilesHub from './pages/hr-dashboard/employee-management/EmployeeProfilesHub';
import MyProfile from './pages/hr-dashboard/profile-management/MyProfile';
import EditProfile from './pages/hr-dashboard/profile-management/EditProfile';
import AttendanceDashboard from './pages/hr-dashboard/attendance-management/AttendanceDashboard';
import CheckInRecords from './pages/hr-dashboard/attendance-management/CheckInRecords';
import MonthlyAttendance from './pages/hr-dashboard/attendance-management/MonthlyAttendance';
import AttendanceReports from './pages/hr-dashboard/attendance-management/AttendanceReports';
import DailyAttendanceAudit from './pages/hr-dashboard/attendance-management/reports/DailyAttendanceAudit';
import LateArrivalDiagnostic from './pages/hr-dashboard/attendance-management/reports/LateArrivalDiagnostic';
import CorrectionWorkflow from './pages/hr-dashboard/attendance-management/CorrectionWorkflow';
import LeaveManagement from './pages/hr-dashboard/leave-management/LeaveManagement';
import LeaveRequests from './pages/hr-dashboard/leave-management/LeaveRequests';
import LeaveApproval from './pages/hr-dashboard/leave-management/LeaveApproval';
import LeaveHistory from './pages/hr-dashboard/leave-management/LeaveHistory';
import EmployeeLeaveProfile from './pages/hr-dashboard/leave-management/EmployeeLeaveProfile';
import PendingApproval from './pages/hr-dashboard/leave-management/PendingApproval';
import { DepartmentProvider } from './context/DepartmentContext';
import PayrollManagement from './pages/hr-dashboard/payroll-management/PayrollManagement';
import PayrollOverview from './pages/hr-dashboard/payroll-management/PayrollOverview';
import SalaryProcessing from './pages/hr-dashboard/payroll-management/SalaryProcessing';
import PayslipManagement from './pages/hr-dashboard/payroll-management/PayslipManagement';
import RecruitmentManagement from './pages/hr-dashboard/recruitment-management/RecruitmentManagement';
import PostJob from './pages/hr-dashboard/recruitment-management/PostJob';
import ActiveJobs from './pages/hr-dashboard/recruitment-management/ActiveJobs';
import { JobProvider } from './context/JobContext';
import Candidates from './pages/hr-dashboard/recruitment/Candidates';
import Applications from './pages/hr-dashboard/recruitment/Applications';
import Interviews from './pages/hr-dashboard/recruitment/Interviews';
import InterviewFeedback from './pages/hr-dashboard/recruitment/InterviewFeedback';
import ScheduleInterview from './pages/hr-dashboard/recruitment/ScheduleInterview';
import CandidateProfile from './pages/hr-dashboard/recruitment/CandidateProfile';
import PerformanceManagement from './pages/hr-dashboard/performance-management/PerformanceManagement';
import MonthlyPerformance from './pages/hr-dashboard/performance-management/MonthlyPerformance';
import ManagerFeedback from './pages/hr-dashboard/performance-management/ManagerFeedback';
import PerformanceReports from './pages/hr-dashboard/performance-management/PerformanceReports';
import AnalyticsManagement from './pages/hr-dashboard/analytics-management/AnalyticsManagement';
import EmployeeReports from './pages/hr-dashboard/analytics-management/EmployeeReports';
import AttendanceAnalytics from './pages/hr-dashboard/analytics-management/AttendanceAnalytics';
import PerformanceInsights from './pages/hr-dashboard/analytics-management/PerformanceInsights';
import ResignationHub from './pages/hr-dashboard/resignation-management/ResignationHub';
import SubmitResignation from './pages/hr-dashboard/resignation-management/SubmitResignation';
import ResignationRequests from './pages/hr-dashboard/resignation-management/ResignationRequests';
import ExitProcess from './pages/hr-dashboard/resignation-management/ExitProcess';

// Company Admin Pages
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import AdminDepartments from './pages/admin-dashboard/Departments';
import CreateDepartment from './pages/admin-dashboard/department-management/CreateDepartment';
import ManageTeams from './pages/admin-dashboard/department-management/ManageTeams';
import CreateTeam from './pages/admin-dashboard/department-management/CreateTeam';
import EditTeam from './pages/admin-dashboard/department-management/EditTeam';
import ViewTeams from './pages/admin-dashboard/department-management/ViewTeams';
import AdminProfileView from './pages/admin-dashboard/profile-management/AdminProfileView';
import AdminProfileEdit from './pages/admin-dashboard/profile-management/AdminProfileEdit';
import ProfileSettings from './pages/admin-dashboard/profile-management/ProfileSettings';
import AccountDetails from './pages/admin-dashboard/profile-management/AccountDetails';
import ChangePassword from './pages/admin-dashboard/profile-management/ChangePassword';
import SalaryStructure from './pages/admin-dashboard/payroll-management/SalaryStructure';
import PayslipGeneration from './pages/admin-dashboard/payroll-management/PayslipGeneration';
import FinanceReports from './pages/admin-dashboard/payroll-management/FinanceReports';
import RecruitmentHub from './pages/admin-dashboard/recruitment-control/RecruitmentHub';
import RecruitmentAnalytics from './pages/admin-dashboard/recruitment-control/RecruitmentAnalytics';
import SecureDocument from './pages/admin-dashboard/payroll-management/SecureDocument';
import LinkExpired from './pages/admin-dashboard/payroll-management/LinkExpired';
import SharingSecurity from './pages/admin-dashboard/payroll-management/SharingSecurity';
import CandidateTracking from './pages/admin-dashboard/recruitment-control/CandidateTracking';
import InterviewManagement from './pages/admin-dashboard/recruitment-control/InterviewManagement';
import CreateJob from './pages/admin-dashboard/recruitment-control/CreateJob';
import CompanyPolicies from './pages/admin-dashboard/policies/CompanyPolicies';
import SystemSettings from './pages/admin-dashboard/settings/SystemSettings';
import AdminPreferences from './pages/admin-dashboard/settings/AdminPreferences';
import WFHPermissions from './pages/admin-dashboard/WFHPermissions';

// Main Admin (Super Admin) Pages
import MainDashboard from './pages/main-admin/MainDashboard';
import CompanySetup from './pages/main-admin/CompanySetup';
import CompanyDetails from './pages/main-admin/CompanyDetails';
import CompanySuccess from './pages/main-admin/CompanySuccess';
import UserManagement from './pages/main-admin/UserManagement';
import PlatformConfig from './pages/main-admin/PlatformConfig';
import SystemIntegrations from './pages/main-admin/SystemIntegrations';
import GlobalReports from './pages/main-admin/GlobalReports';
import SystemMonitoring from './pages/main-admin/SystemMonitoring';

// Auth
import SplashScreen from './pages/auth/SplashScreen';
import Login from './pages/auth/Login';
import TwoFactor from './pages/auth/TwoFactor';
import ResetPassword from './pages/auth/ResetPassword';
import ConfirmResetPassword from './pages/auth/ConfirmResetPassword';
import Success from './pages/auth/Success';
import { AlertCircle, ShieldAlert } from 'lucide-react';

import { EmployeeProvider } from './context/EmployeeContext';
import { PolicyProvider } from './context/PolicyContext';
import { AdminDashboardProvider } from './context/AdminDashboardContext';

// Placeholder components for Settings
const Placeholder = ({ title }) => (
  <div className="card-soft p-12 text-center mt-20">
    <div className="w-20 h-20 bg-slate-50 rounded-4xl flex items-center justify-center text-slate-300 mx-auto mb-8 shadow-inner border border-slate-100">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
    <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">{title} Module</h2>
    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Final Optimization In Progress</p>
  </div>
);

import ScrollToTop from './components/common/ScrollToTop';

const normalizeRole = (role) => {
  const normalized = (role || '').toLowerCase();

  if (normalized === 'main admin') return 'Main Admin';
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'hr') return 'HR';
  if (normalized === 'employee') return 'Employee';

  return null;
};

const getDashboardPathByRole = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'Main Admin') return '/main-admin/dashboard';
  if (normalizedRole === 'Admin') return '/admin/dashboard';
  if (normalizedRole === 'HR') return '/dashboard';
  if (normalizedRole === 'Employee') return '/employee/dashboard';

  return '/login';
};

const RootRedirect = () => {
  const { role, loading } = useAuth();
  
  if (loading) return null; // or a loading spinner
  
  if (!role) return <Navigate to="/login" replace />;
  
  return <Navigate to={getDashboardPathByRole(role)} replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { role, loading } = useAuth();
  
  if (loading) return null;

  if (role) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  return children;
};

// Simple Unauthorized Component
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
    <div className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-soft border border-slate-100">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-100">
        <ShieldAlert size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight uppercase">Access Denied</h2>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">You do not have permission to view this section</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] shadow-xl hover:-translate-y-1 transition-all"
      >
        Return to Safety
      </button>
    </div>
  </div>
);

// Simple Not Found Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
    <div className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-soft border border-slate-100">
      <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight uppercase">404 - Not Found</h2>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">The coordinate you requested does not exist</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] shadow-xl hover:-translate-y-1 transition-all"
      >
        Back to Nexus
      </button>
    </div>
  </div>
);


function AppContent() {
  const { toasts, removeToast } = useNotifications();

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Router>
      <ScrollToTop />
      <EmployeeProvider>
        <DepartmentProvider>
          <JobProvider>
          <PolicyProvider>
            <AdminDashboardProvider>
            <Routes>
              {/* 1. Cinematic Auth Flow */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path="/2fa" element={<TwoFactor />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/confirm-reset" element={<ConfirmResetPassword />} />
              <Route path="/auth-success" element={<Success />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* 2. Management Portal (Company Level) */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/department-management" element={<AdminDepartments />} />
                      <Route path="/departments" element={<AdminDepartments />} />

                      {/* Department  */}
                      <Route path="/department-management/create" element={<CreateDepartment />} />
                      <Route path="/department-management/edit/:id" element={<CreateDepartment />} />
                      <Route path="/department-management/teams" element={<ManageTeams />} />
                      <Route path="/department-management/teams/view/:departmentId" element={<ViewTeams />} />
                      <Route path="/department-management/teams/create" element={<CreateTeam />} />
                      <Route path="/department-management/teams/edit/:id" element={<EditTeam />} />

                      {/* Employees */}
                      <Route path="employees" element={<EmployeeDirectory />} />
                      {/* Admin Profile */}
                      <Route path="profile" element={<AdminProfileView />} />
                      <Route path="profile/edit" element={<AdminProfileEdit />} />
                      <Route path="employees/add" element={<AddEmployee />} />
                      <Route path="employees/profile/:id" element={<EmployeeProfiles />} />
                      <Route path="employees/edit/:id" element={<EditEmployee />} />

                      {/* Payroll */}
                      <Route path="/payroll-management" element={<PayrollManagement />} />
                      <Route path="/payroll-management/structure" element={<SalaryStructure />} />
                      <Route path="/payroll-management/generate" element={<PayslipGeneration />} />
                      <Route path="/payroll-management/reports" element={<FinanceReports />} />
                      <Route path="/payroll-management/secure-sharing" element={<SecureDocument />} />
                      <Route path="/payroll-management/expired" element={<LinkExpired />} />
                      <Route path="/payroll-management/verify" element={<SharingSecurity />} />

                      <Route path="/policies" element={<CompanyPolicies />} />
                      <Route path="/settings" element={<SystemSettings />} />
                      
                      {/* Independent Profile & Account Routes */}
                      <Route path="/profile-settings" element={<ProfileSettings />} />
                      <Route path="/account-details" element={<AccountDetails />} />

                      <Route path="/preferences" element={<AdminPreferences />} />

                      {/* WFH Access Control */}
                      <Route path="/wfh-access" element={<WFHPermissions />} />

                      {/* Resignation Control */}
                      <Route path="/resignation" element={<ResignationHub />} />
                      <Route path="/resignation/requests" element={<ResignationRequests />} />
                      <Route path="/resignation/exit" element={<ExitProcess />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* 4. Main Institutional Portal (Super Portal) */}
              <Route path="/main-admin/*" element={
                <ProtectedRoute allowedRoles={['Main Admin']}>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<MainDashboard />} />
                      <Route path="/dashboard" element={<MainDashboard />} />
                      <Route path="/company-setup" element={<CompanySetup />} />
                      <Route path="/company/:id" element={<CompanyDetails />} />
                      <Route path="/success" element={<CompanySuccess />} />
                      <Route path="/user-management" element={<UserManagement />} />
                      <Route path="/platform-config" element={<PlatformConfig />} />
                      <Route path="/integrations" element={<SystemIntegrations />} />
                      <Route path="/reports" element={<GlobalReports />} />
                      <Route path="/monitoring" element={<SystemMonitoring />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* 3. Employee Self-Service Portal */}
              <Route path="/employee/*" element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<MyProfile />} />
                      <Route path="/dashboard" element={<MyProfile />} />
                      <Route path="/profile" element={<MyProfile />} />
                      <Route path="/profile/edit" element={<EditProfile />} />
                      <Route path="/resignation/submit" element={<SubmitResignation />} />
                      <Route path="/leave" element={<LeaveManagement />} />
                      <Route path="/leave/requests" element={<LeaveRequests />} />
                      <Route path="/leave/history" element={<LeaveHistory />} />
                      <Route path="/attendance" element={<AttendanceDashboard />} />
                      <Route path="/attendance/records" element={<CheckInRecords />} />
                      <Route path="/payroll" element={<PayrollManagement />} />
                      <Route path="/payroll/payslips" element={<PayslipManagement />} />
                      <Route path="/performance" element={<PerformanceManagement />} />
                      <Route path="/performance/monthly" element={<MonthlyPerformance />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* 4. HR Dashboard Environment (Existing) */}
              <Route path="/*" element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/employees" element={<EmployeeDirectory />} />
                      <Route path="/employees/add" element={<AddEmployee />} />
                      <Route path="/employees/profiles" element={<EmployeeProfilesHub />} />
                      <Route path="/employees/edit/:id" element={<EditEmployee />} />
                      <Route path="/employees/profile/:id" element={<EmployeeProfiles />} />
                      <Route path="/profile" element={<MyProfile />} />
                      <Route path="/profile/edit" element={<EditProfile />} />

                      {/* Departments — HR can view & create, Admin full access */}
                      <Route path="/departments" element={<AdminDepartments />} />
                      <Route path="/departments/create" element={<CreateDepartment />} />
                      <Route path="/departments/edit/:id" element={<CreateDepartment />} />
                      <Route path="/departments/teams" element={<ManageTeams />} />
                      <Route path="/departments/teams/view/:departmentId" element={<ViewTeams />} />
                      <Route path="/departments/teams/create" element={<CreateTeam />} />
                      <Route path="/departments/teams/edit/:id" element={<EditTeam />} />

                      <Route path="/attendance" element={<AttendanceDashboard />} />
                      <Route path="/attendance/records" element={<CheckInRecords />} />
                      <Route path="/attendance/monthly" element={<MonthlyAttendance />} />
                      <Route path="/attendance-reports" element={<AttendanceReports />} />
                      <Route path="/attendance-reports/daily" element={<DailyAttendanceAudit />} />
                      <Route path="/attendance-reports/late" element={<LateArrivalDiagnostic />} />
                      <Route path="/attendance-correction" element={<CorrectionWorkflow />} />

                      <Route path="/leave" element={<LeaveManagement />} />
                      <Route path="/leave/requests" element={<LeaveRequests />} />
                      <Route path="/leave/approval" element={<LeaveApproval />} />
                      <Route path="/leave/pending-approval" element={<PendingApproval />} />
                      <Route path="/leave/history" element={<LeaveHistory />} />
                      <Route path="/leave/profile/:id" element={<EmployeeLeaveProfile />} />

                      <Route path="/recruitment" element={<RecruitmentManagement />} />
                      <Route path="/recruitment/post-job" element={<PostJob />} />
                      <Route path="/recruitment/active-jobs" element={<ActiveJobs />} />
                      <Route path="/recruitment/candidates" element={<Candidates />} />
                      <Route path="/recruitment/applications" element={<Applications />} />
                      <Route path="/recruitment/interviews" element={<Interviews />} />
                      <Route path="/recruitment/interviews/schedule" element={<ScheduleInterview />} />
                      <Route path="/recruitment/interviews/id/feedback" element={<InterviewFeedback />} />
                      <Route path="/recruitment/candidate/:id" element={<CandidateProfile />} />

                      <Route path="/payroll" element={<PayrollManagement />} />
                      <Route path="/payroll/overview" element={<PayrollOverview />} />
                      <Route path="/payroll/salary" element={<SalaryProcessing />} />
                      <Route path="/payroll/payslips" element={<PayslipManagement />} />

                      <Route path="/performance" element={<PerformanceManagement />} />
                      <Route path="/performance/monthly" element={<MonthlyPerformance />} />
                      <Route path="/performance/feedback" element={<ManagerFeedback />} />
                      <Route path="/performance/reports" element={<PerformanceReports />} />

                      <Route path="/analytics" element={<AnalyticsManagement />} />
                      <Route path="/analytics/employees" element={<EmployeeReports />} />
                      <Route path="/analytics/attendance" element={<AttendanceAnalytics />} />
                      <Route path="/analytics/performance" element={<PerformanceInsights />} />

                      <Route path="/resignation" element={<ResignationHub />} />
                      <Route path="/resignation/submit" element={<SubmitResignation />} />
                      <Route path="/resignation/requests" element={<ResignationRequests />} />
                      <Route path="/resignation/exit" element={<ExitProcess />} />

                      {/* WFH Access Control */}
                      <Route path="/wfh-access" element={<WFHPermissions />} />

                      <Route path="/settings" element={<Placeholder title="Settings" />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* 5. Fallback Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </AdminDashboardProvider>
            </PolicyProvider>
          </JobProvider>
        </DepartmentProvider>
      </EmployeeProvider>
    </Router>
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
