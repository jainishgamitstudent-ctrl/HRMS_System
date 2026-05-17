import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Edit3,
  Trash2,
  BellRing,
  Sparkles,
  Users,
  Activity,
  Briefcase,
  CheckCircle,
  CalendarDays
} from 'lucide-react';
import { useEmployeeContext } from '../../../context/EmployeeContext';
import { useAdminDashboard } from '../../../context/AdminDashboardContext';

const NewHiresManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { employees = [], loading, fetchEmployees, deleteEmployee, updateEmployee } = useEmployeeContext();
  const { departments = [], fetchDepartments, silentRefreshAll } = useAdminDashboard();

  useEffect(() => {
    if ((!departments || departments.length === 0) && typeof fetchDepartments === 'function') {
      fetchDepartments();
    }
    // Fetch employees if not loaded
    if (employees.length === 0 && fetchEmployees) {
      fetchEmployees({ limit: 100 });
    }
  }, [departments, fetchDepartments, employees.length, fetchEmployees]);

  const basePath = isAdminRoute ? '/admin' : '';

  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionId, setActiveActionId] = useState(null);
  const [dateFilter, setDateFilter] = useState('All Time');
  const [filters, setFilters] = useState({
    department: 'All Departments',
    status: 'All Status'
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Extract new hires (last 30 days OR status is onboarding)
  const newHires = useMemo(() => {
    return (employees || []).filter(emp => {
      const isOnboarding = emp.status === 'New Hire' || emp.status === 'Onboarding' || emp.status === 'Pending';
      const dateStr = emp.joiningDate || emp.createdAt;
      
      if (!dateStr) return isOnboarding;

      const date = new Date(dateStr);
      const now = new Date();
      let isWithinFilter = false;

      // Default threshold is 7 days if dateFilter is All Time, else dynamic days limit
      const limitDays = dateFilter === 'Today' ? 1 : dateFilter === 'This Week' ? 7 : dateFilter === 'This Month' ? 30 : 7;
      const thresholdDate = new Date();
      thresholdDate.setDate(now.getDate() - limitDays);
      isWithinFilter = date >= thresholdDate;
      
      return isOnboarding || isWithinFilter;
    }).sort((a, b) => {
      const dateA = new Date(a.joiningDate || a.createdAt || 0);
      const dateB = new Date(b.joiningDate || b.createdAt || 0);
      return dateB - dateA;
    });
  }, [employees, dateFilter]);

  const filteredNewHires = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    return newHires.filter(emp => {
      const name = (emp.name || '').toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const dept = (emp.department || '').toLowerCase();
      const role = (emp.role || '').toLowerCase();

      const matchesSearch = !query || 
        name.includes(query) || 
        email.includes(query) ||
        dept.includes(query) ||
        role.includes(query) ||
        (emp.employeeId || '').toLowerCase().includes(query);

      const matchesDept = filters.department === 'All Departments' || emp.department === filters.department;
      const matchesStatus = filters.status === 'All Status' || emp.status === filters.status;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [searchQuery, filters, newHires]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete new hire "${name}"?`)) {
      try {
        const result = await deleteEmployee(id);
        if (result.success) {
          showNotification(`New hire ${name} deleted successfully.`);
          if (typeof silentRefreshAll === 'function') {
            silentRefreshAll();
          }
        } else {
          showNotification(result.error || "Failed to delete new hire.");
        }
      } catch (err) {
        showNotification("An error occurred during deletion.");
      }
    }
  };

  const handleCompleteOnboarding = async (id, name) => {
    try {
      const result = await updateEmployee(id, { status: 'Active' });
      if (result.success) {
        showNotification(`${name} has completed onboarding and is now Active.`);
        setActiveActionId(null);
        if (typeof silentRefreshAll === 'function') {
          silentRefreshAll();
        }
      } else {
        showNotification(result.error || "Failed to update status.");
      }
    } catch (err) {
      showNotification("Error completing onboarding.");
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden px-4 md:px-8">
      {notification && (
        <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-xl">
          <BellRing size={20} className="text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Sparkles size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">New Hires</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Manage recently joined employees</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start lg:self-center">
          <button
            onClick={() => navigate(`${basePath}/employees/add`)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Hire
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
           <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Users size={20} className="text-indigo-600" />
           </div>
           <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{newHires.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total New Hires</p>
           </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
           <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Activity size={20} className="text-emerald-600" />
           </div>
           <div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                 {newHires.filter(h => h.status === 'Active').length}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Active Profiles</p>
           </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
           <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Briefcase size={20} className="text-amber-600" />
           </div>
           <div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                 {newHires.filter(h => h.status !== 'Active').length}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Pending / Onboarding</p>
           </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" onClick={() => setActiveActionId(null)}>
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search new hires..." 
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                <CalendarDays size={14} className="text-slate-400" />
                <select 
                  className="text-sm text-slate-600 outline-none bg-transparent cursor-pointer font-medium"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                   <option value="All Time">All Recent</option>
                   <option value="Today">Joined Today</option>
                   <option value="This Week">Joined This Week</option>
                   <option value="This Month">Joined This Month</option>
                </select>
             </div>
             <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select 
                  className="text-sm text-slate-600 outline-none bg-transparent cursor-pointer font-medium"
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                >
                   <option>All Departments</option>
                   {departments.map(dept => (
                     <option key={dept.id} value={dept.name}>{dept.name}</option>
                   ))}
                </select>
             </div>
             <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                <select 
                  className="text-sm text-slate-600 outline-none bg-transparent cursor-pointer font-medium"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                   <option>All Status</option>
                   <option value="Active">Active</option>
                   <option value="Pending">Pending</option>
                   <option value="Onboarding">Onboarding</option>
                </select>
             </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto no-scrollbar relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
               <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Employee Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Role & Dept</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Joining Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {loading && newHires.length === 0 ? (
                 Array.from({ length: 4 }).map((_, i) => (
                   <tr key={`skeleton-${i}`}>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
                         <div className="flex flex-col gap-1.5">
                           <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
                           <div className="h-2.5 w-24 bg-slate-200 rounded animate-pulse" />
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></td>
                     <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></td>
                     <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse mx-auto" /></td>
                     <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse ml-auto" /></td>
                   </tr>
                 ))
               ) : filteredNewHires.length > 0 ? (
                 filteredNewHires.map((emp) => (
                    <tr key={emp.id || emp._id} className="group hover:bg-slate-50/80 transition-colors">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                                {emp.avatar || emp.profileImage ? (
                                   <img src={emp.avatar || emp.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                   <span className="text-sm font-black text-indigo-600">{emp.name?.charAt(0)}</span>
                                )}
                             </div>
                              <div className="flex flex-col">
                                 <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200 bg-white mb-1 shadow-sm">
                                    {emp.employeeId || 'EMP-NEW'}
                                 </span>
                                 <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                                 <p className="text-xs text-slate-500 font-medium">{emp.email}</p>
                              </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{emp.role || emp.designation || 'Employee'}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{emp.department || 'General'}</p>
                       </td>
                       <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">
                             {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently Joined'}
                          </p>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                             <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                                emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                (emp.status === 'Pending' || emp.status === 'On Leave') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-indigo-50 text-indigo-700 border-indigo-200'
                             }`}>
                                {emp.status || 'Onboarding'}
                             </span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === (emp.id || emp._id) ? null : (emp.id || emp._id)); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                          >
                             <MoreVertical size={18} />
                          </button>

                          {activeActionId === (emp.id || emp._id) && (
                             <div className="absolute right-6 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in zoom-in-95 fade-in duration-200">
                                <button
                                  onClick={() => navigate(`${basePath}/employees/profile/${emp.id || emp._id}`)}
                                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium transition-colors"
                                >
                                   <ExternalLink size={16} className="text-slate-400" />
                                   View Complete Details
                                </button>
                                <button
                                  onClick={() => navigate(`${basePath}/employees/edit/${emp.id || emp._id}`)}
                                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium transition-colors"
                                >
                                   <Edit3 size={16} className="text-slate-400" />
                                   Edit Hire Details
                                </button>
                                {(emp.status === 'New Hire' || emp.status === 'Onboarding' || emp.status === 'Pending') && (
                                  <button
                                    onClick={() => handleCompleteOnboarding(emp.id || emp._id, emp.name)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-3 font-medium transition-colors"
                                  >
                                     <CheckCircle size={16} className="text-emerald-500" />
                                     Complete Onboarding
                                  </button>
                                )}
                                <div className="h-px bg-slate-100 my-1 mx-4"></div>
                                <button
                                  onClick={() => handleDelete(emp.id || emp._id, emp.name)}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors"
                                >
                                   <Trash2 size={16} className="text-red-400" />
                                   Delete Record
                                </button>
                             </div>
                          )}
                       </td>
                    </tr>
                 ))
               ) : (
                 <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                       <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Users size={24} className="text-slate-300" />
                       </div>
                       <h3 className="text-sm font-black text-slate-800 mb-1">No New Hires Found</h3>
                       <p className="text-xs text-slate-500 max-w-sm mx-auto">There are no recent employees matching your search criteria. Try adjusting your filters or adding a new hire.</p>
                       <button
                         onClick={() => navigate(`${basePath}/employees/add`)}
                         className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-black uppercase tracking-widest rounded-lg transition-colors border border-indigo-200"
                       >
                          Add New Hire
                       </button>
                    </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
           <p className="text-sm text-slate-600 font-medium">
             {loading ? 'Loading records...' : `Showing ${filteredNewHires.length} newly hired employees`}
           </p>
        </div>
      </div>
    </div>
  );
};

export default NewHiresManagement;
