import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import { useAuth } from './context/AuthContext';
import { useNotifications } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/common/Toast';

import { DepartmentProvider } from './context/DepartmentContext';
import { JobProvider } from './context/JobContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { PolicyProvider } from './context/PolicyContext';
import { AdminDashboardProvider } from './context/AdminDashboardContext';

import { AlertCircle, ShieldAlert } from 'lucide-react';

// Eagerly load only critical auth + layout components
import SplashScreen from './pages/auth/SplashScreen';
import Login from './pages/auth/Login';

// Lazy load all HR Dashboard Pages
const EmployeeDirectory = lazy(() => import('./pages/hr-dashboard/employee-management/EmployeeDirectory'));
const AddEmployee = lazy(() => import('./pages/hr-dashboard/employee-management/AddEmployee'));
const EditEmployee = lazy(() => import('./pages/hr-dashboard/employee-management/EditEmployee'));
const EmployeeProfiles = lazy(() => import('./pages/hr-dashboard/employee-management/EmployeeProfiles'));
const EmployeeProfilesHub = lazy(() => import('./pages/hr-dashboard/employee-management/EmployeeProfilesHub'));
const NewHiresManagement = lazy(() => import('./pages/hr-dashboard/employee-management/NewHiresManagement'));
const MyProfile = lazy(() => import('./pages/hr-dashboard/profile-management/MyProfile'));
const EditProfile = lazy(() => import('./pages/hr-dashboard/profile-management/EditProfile'));
const AttendanceDashboard = lazy(() => import('./pages/hr-dashboard/attendance-management/AttendanceDashboard'));
const CheckInRecords = lazy(() => import('./pages/hr-dashboard/attendance-management/CheckInRecords'));
const MonthlyAttendance = lazy(() => import('./pages/hr-dashboard/attendance-management/MonthlyAttendance'));

const DailyAttendanceAudit = lazy(() => import('./pages/hr-dashboard/attendance-management/reports/DailyAttendanceAudit'));
const LateArrivalDiagnostic = lazy(() => import('./pages/hr-dashboard/attendance-management/reports/LateArrivalDiagnostic'));
const CorrectionWorkflow = lazy(() => import('./pages/hr-dashboard/attendance-management/CorrectionWorkflow'));
const LeaveManagement = lazy(() => import('./pages/hr-dashboard/leave-management/LeaveManagement'));
const LeaveRequests = lazy(() => import('./pages/hr-dashboard/leave-management/LeaveRequests'));
const LeaveApproval = lazy(() => import('./pages/hr-dashboard/leave-management/LeaveApproval'));
const LeaveHistory = lazy(() => import('./pages/hr-dashboard/leave-management/LeaveHistory'));
const EmployeeLeaveProfile = lazy(() => import('./pages/hr-dashboard/leave-management/EmployeeLeaveProfile'));
const PendingApproval = lazy(() => import('./pages/hr-dashboard/leave-management/PendingApproval'));
const PayrollManagement = lazy(() => import('./pages/hr-dashboard/payroll-management/PayrollManagement'));
const PayrollOverview = lazy(() => import('./pages/hr-dashboard/payroll-management/PayrollOverview'));
const SalaryProcessing = lazy(() => import('./pages/hr-dashboard/payroll-management/SalaryProcessing'));
const PayslipManagement = lazy(() => import('./pages/hr-dashboard/payroll-management/PayslipManagement'));
const RecruitmentManagement = lazy(() => import('./pages/hr-dashboard/recruitment-management/RecruitmentManagement'));
const PostJob = lazy(() => import('./pages/hr-dashboard/recruitment-management/PostJob'));
const ActiveJobs = lazy(() => import('./pages/hr-dashboard/recruitment-management/ActiveJobs'));
const JobDetail = lazy(() => import('./pages/hr-dashboard/recruitment-management/JobDetail'));
const InternalJobs = lazy(() => import('./pages/hr-dashboard/recruitment-management/InternalJobs'));
const Candidates = lazy(() => import('./pages/hr-dashboard/recruitment/Candidates'));
const Applications = lazy(() => import('./pages/hr-dashboard/recruitment/Applications'));
const Interviews = lazy(() => import('./pages/hr-dashboard/recruitment/Interviews'));
const InterviewFeedback = lazy(() => import('./pages/hr-dashboard/recruitment/InterviewFeedback'));
const ScheduleInterview = lazy(() => import('./pages/hr-dashboard/recruitment/ScheduleInterview'));
const CandidateProfile = lazy(() => import('./pages/hr-dashboard/recruitment/CandidateProfile'));
const PerformanceManagement = lazy(() => import('./pages/hr-dashboard/performance-management/PerformanceManagement'));
const MonthlyPerformance = lazy(() => import('./pages/hr-dashboard/performance-management/MonthlyPerformance'));
const ManagerFeedback = lazy(() => import('./pages/hr-dashboard/performance-management/ManagerFeedback'));
const PerformanceReports = lazy(() => import('./pages/hr-dashboard/performance-management/PerformanceReports'));
const AnalyticsManagement = lazy(() => import('./pages/hr-dashboard/analytics-management/AnalyticsManagement'));
const EmployeeReports = lazy(() => import('./pages/hr-dashboard/analytics-management/EmployeeReports'));
const AttendanceAnalytics = lazy(() => import('./pages/hr-dashboard/analytics-management/AttendanceAnalytics'));
const PerformanceInsights = lazy(() => import('./pages/hr-dashboard/analytics-management/PerformanceInsights'));
const ResignationHub = lazy(() => import('./pages/hr-dashboard/resignation-management/ResignationHub'));
const SubmitResignation = lazy(() => import('./pages/hr-dashboard/resignation-management/SubmitResignation'));
const ResignationRequests = lazy(() => import('./pages/hr-dashboard/resignation-management/ResignationRequests'));

// Lazy load Company Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin-dashboard/AdminDashboard'));
const AdminDepartments = lazy(() => import('./pages/admin-dashboard/Departments'));
const CreateDepartment = lazy(() => import('./pages/admin-dashboard/department-management/CreateDepartment'));
const ManageTeams = lazy(() => import('./pages/admin-dashboard/department-management/ManageTeams'));
const CreateTeam = lazy(() => import('./pages/admin-dashboard/department-management/CreateTeam'));
const EditTeam = lazy(() => import('./pages/admin-dashboard/department-management/EditTeam'));
const ViewTeams = lazy(() => import('./pages/admin-dashboard/department-management/ViewTeams'));
const AdminProfileView = lazy(() => import('./pages/admin-dashboard/profile-management/AdminProfileView'));
const AdminProfileEdit = lazy(() => import('./pages/admin-dashboard/profile-management/AdminProfileEdit'));
const ProfileSettings = lazy(() => import('./pages/admin-dashboard/profile-management/ProfileSettings'));
const AccountDetails = lazy(() => import('./pages/admin-dashboard/profile-management/AccountDetails'));
const ChangePassword = lazy(() => import('./pages/admin-dashboard/profile-management/ChangePassword'));
const SalaryStructure = lazy(() => import('./pages/admin-dashboard/payroll-management/SalaryStructure'));
const PayslipGeneration = lazy(() => import('./pages/admin-dashboard/payroll-management/PayslipGeneration'));
const FinanceReports = lazy(() => import('./pages/admin-dashboard/payroll-management/FinanceReports'));
const RecruitmentHub = lazy(() => import('./pages/admin-dashboard/recruitment-control/RecruitmentHub'));
const RecruitmentAnalytics = lazy(() => import('./pages/admin-dashboard/recruitment-control/RecruitmentAnalytics'));
const SecureDocument = lazy(() => import('./pages/admin-dashboard/payroll-management/SecureDocument'));
const LinkExpired = lazy(() => import('./pages/admin-dashboard/payroll-management/LinkExpired'));
const SharingSecurity = lazy(() => import('./pages/admin-dashboard/payroll-management/SharingSecurity'));
const CandidateTracking = lazy(() => import('./pages/admin-dashboard/recruitment-control/CandidateTracking'));
const InterviewManagement = lazy(() => import('./pages/admin-dashboard/recruitment-control/InterviewManagement'));
const CreateJob = lazy(() => import('./pages/admin-dashboard/recruitment-control/CreateJob'));
const EditJob = lazy(() => import('./pages/admin-dashboard/recruitment-control/EditJob'));
const CompanyPolicies = lazy(() => import('./pages/admin-dashboard/policies/CompanyPolicies'));
const SystemSettings = lazy(() => import('./pages/admin-dashboard/settings/SystemSettings'));
const AdminPreferences = lazy(() => import('./pages/admin-dashboard/settings/AdminPreferences'));
const WFHPermissions = lazy(() => import('./pages/admin-dashboard/WFHPermissions'));

// Lazy load Main Admin Pages
const MainDashboard = lazy(() => import('./pages/main-admin/MainDashboard'));
const CompanySetup = lazy(() => import('./pages/main-admin/CompanySetup'));
const CompanyDetails = lazy(() => import('./pages/main-admin/CompanyDetails'));
const CompanySuccess = lazy(() => import('./pages/main-admin/CompanySuccess'));
const UserManagement = lazy(() => import('./pages/main-admin/UserManagement'));
const PlatformConfig = lazy(() => import('./pages/main-admin/PlatformConfig'));
const SystemIntegrations = lazy(() => import('./pages/main-admin/SystemIntegrations'));
const GlobalReports = lazy(() => import('./pages/main-admin/GlobalReports'));
const SystemMonitoring = lazy(() => import('./pages/main-admin/SystemMonitoring'));

// Lazy load Auth Pages (non-critical)
const TwoFactor = lazy(() => import('./pages/auth/TwoFactor'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const ConfirmResetPassword = lazy(() => import('./pages/auth/ConfirmResetPassword'));
const Success = lazy(() => import('./pages/auth/Success'));

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

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin"></div>
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
            <Suspense fallback={<PageLoader />}>
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
                    <Suspense fallback={<PageLoader />}>
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
                      <Route path="profile/change-password" element={<ChangePassword />} />
                      <Route path="employees/add" element={<AddEmployee />} />
                      <Route path="employees/profile/:id" element={<EmployeeProfiles />} />
                      <Route path="employees/edit/:id" element={<EditEmployee />} />
                      <Route path="new-hires" element={<NewHiresManagement />} />

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

                      {/* Recruitment Control */}
                      <Route path="recruitment-control" element={<RecruitmentHub />} />
                      <Route path="recruitment-control/hub" element={<RecruitmentHub />} />
                      <Route path="recruitment-control/create" element={<CreateJob />} />
                      <Route path="recruitment-control/edit/:id" element={<EditJob />} />
                      <Route path="recruitment-control/tracking" element={<CandidateTracking />} />
                      <Route path="recruitment-control/interviews" element={<InterviewManagement />} />
                      <Route path="recruitment-control/analytics" element={<RecruitmentAnalytics />} />
                      
                      {/* Independent Profile & Account Routes */}
                      <Route path="/profile-settings" element={<ProfileSettings />} />
                      <Route path="/account-details" element={<AccountDetails />} />

                      <Route path="/preferences" element={<AdminPreferences />} />

                      {/* WFH Access Control */}
                      <Route path="/wfh-access" element={<WFHPermissions />} />

                      {/* Resignation Control */}
                      <Route path="/resignation" element={<ResignationHub />} />
                      <Route path="/resignation/requests" element={<ResignationRequests />} />
                    </Routes>
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* 4. Main Institutional Portal (Super Portal) */}
              <Route path="/main-admin/*" element={
                <ProtectedRoute allowedRoles={['Main Admin']}>
                  <AdminLayout>
                    <Suspense fallback={<PageLoader />}>
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
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* 3. Employee Self-Service Portal */}
              <Route path="/employee/*" element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <DashboardLayout>
                    <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<MyProfile />} />
                      <Route path="/dashboard" element={<MyProfile />} />
                      <Route path="/profile" element={<MyProfile />} />
                      <Route path="/profile/edit" element={<EditProfile />} />
                      <Route path="/profile/change-password" element={<ChangePassword />} />
                      <Route path="/jobs" element={<InternalJobs />} />
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
                    </Suspense>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* 4. HR Dashboard Environment (Existing) */}
              <Route path="/*" element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <DashboardLayout>
                    <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/employees" element={<EmployeeDirectory />} />
                      <Route path="/employees/add" element={<AddEmployee />} />
                      <Route path="/employees/profiles" element={<EmployeeProfilesHub />} />
                      <Route path="/employees/edit/:id" element={<EditEmployee />} />
                      <Route path="/employees/profile/:id" element={<EmployeeProfiles />} />
                      <Route path="/new-hires" element={<NewHiresManagement />} />
                      <Route path="/profile" element={<MyProfile />} />
                      <Route path="/profile/edit" element={<EditProfile />} />
                      <Route path="/profile/change-password" element={<ChangePassword />} />
                      <Route path="/jobs" element={<InternalJobs />} />

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
                      <Route path="/recruitment/active-jobs/:id" element={<JobDetail />} />
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

                      {/* WFH Access Control */}
                      <Route path="/wfh-access" element={<WFHPermissions />} />

                      <Route path="/settings" element={<Placeholder title="Settings" />} />
                    </Routes>
                    </Suspense>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* 5. Fallback Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
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
