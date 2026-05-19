import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
   Search,
   User,
   Mail,
   Calendar,
   BadgeCheck,
   Loader2
} from 'lucide-react';
import { useEmployeeContext } from '../../../context/EmployeeContext';
import { useAuth } from '../../../context/AuthContext';

const nameToColor = (name = '') => {
   const colors = [
      ['#6366f1', '#e0e7ff'],
      ['#8b5cf6', '#ede9fe'],
      ['#0ea5e9', '#e0f2fe'],
      ['#10b981', '#d1fae5'],
      ['#f59e0b', '#fef3c7'],
      ['#ef4444', '#fee2e2'],
      ['#ec4899', '#fce7f3'],
      ['#14b8a6', '#ccfbf1'],
   ];
   let hash = 0;
   for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
   return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = '') =>
   name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

const formatDate = (dateStr) => {
   if (!dateStr) return null;
   try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
   } catch { return null; }
};

const getSystemRoleBadgeStyle = (systemRole) => {
  const role = (systemRole || '').toLowerCase();
  if (role === 'admin' || role === 'superadmin') return 'bg-rose-100 text-rose-700 border-rose-200';
  if (role === 'hr') return 'bg-violet-100 text-violet-700 border-violet-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const formatSystemRole = (systemRole) => {
  const role = (systemRole || '').toLowerCase();
  if (role === 'admin' || role === 'superadmin') return 'Admin';
  if (role === 'hr') return 'HR';
  return 'Employee';
};

const EmployeeProfilesHub = () => {
   const navigate = useNavigate();
   const { user } = useAuth();
   const { employees, loading } = useEmployeeContext();
   const [searchQuery, setSearchQuery] = useState('');
   const [imgErrors, setImgErrors] = useState({});

   const filteredEmployees = employees.filter(emp => {
      // Filter out strict new hires / onboarding employees so they only show in New Hires module
      const isOnboarding = emp.status === 'New Hire' || emp.status === 'Onboarding' || emp.status === 'Pending';
      const dateStr = emp.joiningDate || emp.createdAt;
      
      let isStrictNewHire = false;
      if (isOnboarding) {
        isStrictNewHire = true;
      } else if (dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        isStrictNewHire = date >= sevenDaysAgo && (emp.status === 'New Hire' || emp.status === 'Onboarding' || emp.status === 'Pending');
      }

      if (isStrictNewHire) return false;

      // Management Hub: hide regular employees; show only HR, Admin, and own profile
      const sysRole = (emp.systemRole || '').toLowerCase();
      const isRegularEmployee = sysRole === 'employee';
      const isOwnProfile = user?._id === emp._id || user?.id === emp.id;
      if (isRegularEmployee && !isOwnProfile) return false;

      return emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase());
   });

   return (
      <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-4 p-4">

         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div>
               <h1 className="text-2xl font-bold text-slate-800">Employee Profiles</h1>
               <p className="text-sm text-slate-500">Manage and view all employee profiles</p>
            </div>
            <div className="relative w-full sm:w-64">
               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
         </div>

         {/* Table Container */}
         <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-200">
            {loading ? (
               <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader2 size={36} className="text-indigo-500 animate-spin" />
                  <p className="text-sm text-slate-400">Loading employees...</p>
               </div>
            ) : filteredEmployees.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <User size={48} className="text-slate-200" />
                  <p className="text-sm text-slate-400">No employees found</p>
               </div>
            ) : (
               <table className="w-full min-w-[800px]">
                  <thead className="sticky top-0 bg-slate-50">
                     <tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Department</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Role</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Contact</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Joined</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredEmployees.map((emp) => {
                        const [textColor, bannerBg] = nameToColor(emp.name || '');
                        const initials = getInitials(emp.name || '');
                        const hasImage = emp.avatar && !imgErrors[emp.id];
                        const joinedDate = formatDate(emp.joiningDate);

                        return (
                           <tr
                              key={emp.id}
                              onClick={() => navigate(`/employees/profile/${emp.id}`)}
                              className="border-b border-slate-100 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                           >
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-3">
                                    <div
                                       className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
                                       style={{ backgroundColor: hasImage ? 'white' : bannerBg }}
                                    >
                                       {hasImage ? (
                                          <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                                       ) : (
                                          <span className="text-sm font-bold" style={{ color: textColor }}>{initials}</span>
                                       )}
                                    </div>
                                    <span className="text-sm font-medium text-slate-800">{emp.name}</span>
                                 </div>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                 <span className="text-xs px-2 py-1 bg-slate-100 rounded-md text-slate-600">{emp.department || '-'}</span>
                              </td>
                              <td className="px-4 py-3 hidden lg:table-cell">
                                 <span className="text-xs px-2 py-1 rounded-md" style={{ color: textColor, backgroundColor: bannerBg }}>{emp.role || '-'}</span>
                                 <div className="flex items-center gap-1 mt-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getSystemRoleBadgeStyle(emp.systemRole)}`}>
                                       {formatSystemRole(emp.systemRole)}
                                    </span>
                                    {(user?._id === emp._id || user?.id === emp.id) && (
                                       <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold bg-amber-100 text-amber-700 border-amber-200">You</span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                 <div className="text-xs text-slate-500">{emp.email || '-'}</div>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                 <span className="text-xs text-slate-500">{joinedDate || '-'}</span>
                              </td>
                              <td className="px-4 py-3">
                                 <span className={`text-xs font-medium ${emp.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {emp.status || 'Active'}
                                 </span>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            )}
         </div>

         {/* Footer */}
         <div className="flex items-center justify-between text-sm text-slate-500 px-2">
            <span>Showing {filteredEmployees.length} of {employees.length} employees</span>
            <div className="flex items-center gap-2">
               <BadgeCheck size={14} className="text-emerald-500" />
               <span>Live</span>
            </div>
         </div>

      </div>
   );
};

export default EmployeeProfilesHub;