import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminDashboard } from '../../context/AdminDashboardContext';
import { getEmployees, processSalary } from '../../services/hrApi';
import {
   Building2,
   Users,
   Briefcase,
   ChevronRight,
   Activity,
   ArrowRight,
   CalendarDays,
   ClipboardList,
   Clock3,
   Sparkles,
   BarChart3,
   Layers,
   Wallet,
   X,
   Check,
   DoorOpen,
   Settings,
   CreditCard,
   ShieldCheck
} from 'lucide-react';

const MONTHS = [
   { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
   { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
   { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
   { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

const formatCurrency = (value) => {
   const num = Number(value || 0);
   if (Number.isNaN(num)) return '₹0';
   return `₹${num.toLocaleString('en-IN')}`;
};

const AdminDashboard = () => {
   const navigate = useNavigate();
    const { user } = useAuth();
   const { summary, insights, departments, teams, jobs, staffDirectory, pendingLeaves, activities, loading } = useAdminDashboard();

   // Salary assignment state
   const [assignModalOpen, setAssignModalOpen] = useState(false);
   const [employeeList, setEmployeeList] = useState([]);
   const [selectedEmployee, setSelectedEmployee] = useState(null);
   const [assignForm, setAssignForm] = useState({
      employeeId: '',
      basicSalary: '',
      deductions: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
   });
   const [processingId, setProcessingId] = useState(null);
   const [notification, setNotification] = useState(null);

   const showNotification = (msg) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 3000);
   };

   const openAssignModal = async () => {
      try {
         const empRes = await getEmployees();
         const employees = empRes?.data?.data || empRes?.data || [];
         // Filter out admins - only show employees
         const filteredEmployees = employees.filter(emp =>
            emp.role !== 'admin' && emp.role !== 'main_admin' && emp.role !== 'superadmin'
         );
         setEmployeeList(filteredEmployees);
         setAssignForm({
            employeeId: '',
            basicSalary: '',
            deductions: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
         });
         setSelectedEmployee(null);
         setAssignModalOpen(true);
      } catch (err) {
         // debug error removed
         showNotification('Failed to load employees');
      }
   };

   const closeAssignModal = () => {
      setAssignModalOpen(false);
      setSelectedEmployee(null);
   };

   const handleEmployeeSelect = (e) => {
      const empId = e.target.value;
      const emp = employeeList.find(em => em._id === empId);
      setSelectedEmployee(emp);
      setAssignForm(prev => ({ ...prev, employeeId: empId }));
   };

   const handleAssignSalary = async (e) => {
      e.preventDefault();
      if (!selectedEmployee) return;
      setProcessingId(selectedEmployee._id);
      try {
         const monthLabel = MONTHS.find((m) => m.value === Number(assignForm.month))?.label || 'January';
         const payload = {
            userId: selectedEmployee._id,
            basicSalary: Number(assignForm.basicSalary),
            bonus: 0,
            deductions: Number(assignForm.deductions),
            month: monthLabel,
            year: Number(assignForm.year),
            status: 'Pending'
         };
         await processSalary(payload);
         showNotification(`Salary assigned to ${selectedEmployee.name}`);
         closeAssignModal();
      } catch (err) {
         // debug error removed
         const msg = err?.response?.data?.message || err?.message || 'Failed to assign salary';
         showNotification(msg);
      } finally {
         setProcessingId(null);
      }
   };

   const stats = useMemo(() => [
      {
         label: 'Departments',
         value: String(departments.length > 0 ? departments.length : summary.totalDepartments),
         icon: Building2,
         helper: 'Live departments'
      },
      {
         label: 'Employees',
         value: String(staffDirectory.length > 0 ? staffDirectory.length : summary.totalEmployees),
         icon: Users,
         helper: 'Live employee directory'
      },
      {
         label: 'Pending Leaves',
         value: String(insights?.pendingLeaves || pendingLeaves.length || 0),
         icon: CalendarDays,
         helper: 'Awaiting review'
      },
      {
         label: 'New Hires',
         value: String(insights?.newHires || 0),
         icon: Sparkles,
         helper: 'This month'
      },
      {
         label: 'Resignation Nodes',
         value: String(summary.resignations || 0),
         icon: DoorOpen,
         helper: 'Active exit register'
      },
      {
         label: 'Monthly Payroll',
         value: formatCurrency(insights?.monthlyPayroll || 0),
         icon: BarChart3,
         helper: 'Current month spend'
      }
   ], [departments.length, staffDirectory.length, jobs, summary.totalDepartments, summary.totalEmployees, summary.activeJobs, summary.resignations, insights]);

   const recentDepartments = departments.slice(0, 4);
   const recentJobs = jobs.slice(0, 4);
   const recentActivity = activities.slice(0, 5);
   const quickActions = [
      { label: 'Departments', path: '/admin/departments' },
      { label: 'Payroll', path: '/admin/payroll-management' },
      { label: 'Settings', path: '/admin/settings' }
   ];

   const payrollItems = [
      { id: 1, name: 'Monthly Payroll', sub: 'Salary Processing', icon: Wallet, path: '/admin/payroll-management' },
      { id: 2, name: 'Salary Slips', sub: 'Generate & Share', icon: CreditCard, path: '/admin/payroll-management' }
   ];

   const settingItems = [
      { id: 1, name: 'Profile Management', sub: 'User Access Control', icon: Users, path: '/admin/profile-management' },
      { id: 2, name: 'System Security', sub: 'WFH & Permissions', icon: ShieldCheck, path: '/admin/wfh-permissions' }
   ];

   return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-20">
         {/* Notification */}
         {notification && (
            <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg">
               <Check size={16} className="text-emerald-400" />
               <span className="text-sm">{notification}</span>
            </div>
         )}

         {/* Assign Salary Modal */}
         {assignModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
               <div className="absolute inset-0 bg-black/40" onClick={closeAssignModal} />
               <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                           <Wallet size={20} className="text-indigo-600" />
                        </div>
                        <div>
                           <h3 className="text-base font-semibold text-slate-800">Assign Salary</h3>
                           <p className="text-xs text-slate-400">Set salary for employee</p>
                        </div>
                     </div>
                     <button onClick={closeAssignModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={18} />
                     </button>
                  </div>
                  <form onSubmit={handleAssignSalary} className="space-y-4">
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Select Employee</label>
                        <select
                           className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors bg-white"
                           value={assignForm.employeeId}
                           onChange={handleEmployeeSelect}
                           required
                        >
                           <option value="">Choose employee...</option>
                           {employeeList.map((emp) => (
                              <option key={emp._id} value={emp._id}>
                                 {emp.name} ({emp.employeeId || emp.designation || 'Employee'})
                              </option>
                           ))}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-medium text-slate-500 mb-1">Month</label>
                           <select
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors bg-white"
                              value={assignForm.month}
                              onChange={(e) => setAssignForm((prev) => ({ ...prev, month: Number(e.target.value) }))}
                              required
                           >
                              {MONTHS.map((m) => (
                                 <option key={m.value} value={m.value}>{m.label}</option>
                              ))}
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
                           <input
                              type="number" min={2000} max={2100}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors"
                              value={assignForm.year}
                              onChange={(e) => setAssignForm((prev) => ({ ...prev, year: e.target.value }))}
                              required
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Basic Salary (₹)</label>
                        <input
                           type="number" min={0}
                           placeholder="e.g. 50000"
                           className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors"
                           value={assignForm.basicSalary}
                           onChange={(e) => setAssignForm((prev) => ({ ...prev, basicSalary: e.target.value }))}
                           required
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Deductions (₹)</label>
                        <input
                           type="number" min={0}
                           placeholder="e.g. 5000"
                           className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors"
                           value={assignForm.deductions}
                           onChange={(e) => setAssignForm((prev) => ({ ...prev, deductions: e.target.value }))}
                           required
                        />
                     </div>
                     <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400 mb-0.5">Net Salary</p>
                        <p className="text-lg font-bold text-slate-800">
                           {formatCurrency((Number(assignForm.basicSalary) || 0) - (Number(assignForm.deductions) || 0))}
                        </p>
                     </div>
                     <button
                        type="submit"
                        disabled={processingId || !selectedEmployee}
                        className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                     >
                        {processingId ? 'Saving...' : 'Assign Salary'}
                     </button>
                  </form>
               </div>
            </div>
         )}

         <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">Admin Dashboard</h1>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Live operational data from the admin service</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Connected</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-4 text-slate-400">
                  <Activity size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Overview</span>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats.map((stat) => (
                     <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-slate-200 hover:bg-white transition-all group cursor-default">
                        <stat.icon size={16} className="text-slate-400 mb-3 group-hover:text-indigo-500 transition-colors" />
                        <p className="text-xl font-black text-slate-900 leading-none mb-1">{stat.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                        <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-slate-300">{stat.helper}</p>
                     </div>
                  ))}
                  {/* Salary Assignment Card */}
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 col-span-2 md:col-span-1 flex flex-col justify-between">
                     <div>
                        <Wallet size={16} className="text-indigo-500 mb-3" />
                        <p className="text-base font-black text-slate-900 leading-none mb-1">Assign Salary</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Set payroll</p>
                     </div>
                     <button
                        onClick={openAssignModal}
                        className="mt-4 w-full py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors"
                     >
                        Assign
                     </button>
                  </div>
               </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
               <div className="flex items-center justify-between mb-6">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Snapshot</p>
                     <h2 className="text-lg font-black text-slate-900 mt-1">Current Month</h2>
                  </div>
                  <Layers size={18} className="text-slate-300" />
               </div>

               <div className="space-y-3 text-sm text-slate-600 font-medium flex-1">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                     <span className="text-xs">Monthly payroll</span>
                     <span className="font-black text-slate-900">{formatCurrency(insights?.monthlyPayroll || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                     <span className="text-xs">Teams</span>
                     <span className="font-black text-slate-900">{String(teams.length || summary.teams || 0).padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                     <span className="text-xs">Prepared by</span>
                     <span className="font-black text-slate-900 truncate max-w-[100px]">{user?.name || 'Admin'}</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Departments</h3>
                  <button onClick={() => navigate('/admin/departments')} className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:underline">View all</button>
               </div>
               <div className="space-y-2">
                  {recentDepartments.length > 0 ? recentDepartments.map((department) => (
                     <div key={department.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 hover:bg-white transition-colors cursor-pointer" onClick={() => navigate('/admin/departments')}>
                        <p className="text-sm font-black text-slate-900">{department.name}</p>
                        <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{department.head}</p>
                        <div className="mt-2.5 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                           <span>{department.teams} teams</span>
                           <span>{department.employees} members</span>
                        </div>
                     </div>
                  )) : (
                     <p className="text-xs text-slate-400 p-4 text-center border border-dashed rounded-xl">No departments loaded.</p>
                  )}
               </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Payroll</h3>
                  <button onClick={() => navigate('/admin/payroll-management')} className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:underline">View all</button>
               </div>
               <div className="space-y-2">
                  {payrollItems.map((item) => (
                     <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 hover:bg-white transition-colors cursor-pointer group" onClick={() => navigate(item.path)}>
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-white border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                              <item.icon size={14} className="text-slate-400 group-hover:text-indigo-600" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900">{item.name}</p>
                              <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{item.sub}</p>
                           </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-end">
                           <ArrowRight size={10} className="text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Settings</h3>
                  <button onClick={() => navigate('/admin/settings')} className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:underline">View all</button>
               </div>
               <div className="space-y-2">
                  {settingItems.map((item) => (
                     <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 hover:bg-white transition-colors cursor-pointer group" onClick={() => navigate(item.path)}>
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-white border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                              <item.icon size={14} className="text-slate-400 group-hover:text-indigo-600" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900">{item.name}</p>
                              <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{item.sub}</p>
                           </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-end">
                           <ArrowRight size={10} className="text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

export default AdminDashboard;
