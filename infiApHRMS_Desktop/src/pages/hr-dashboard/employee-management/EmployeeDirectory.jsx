import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  MoreHorizontal,
  Mail,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BellRing,
  Edit3,
  MoreVertical,
  User,
  Activity,
  TrendingUp,
  Filter,
  ArrowRight,
  FileText,
  Loader2,
  Trash2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Cell,
  Tooltip as RechartsTooltip
} from 'recharts';
import { useEmployeeContext } from '../../../context/EmployeeContext';
import { useAdminDashboard } from '../../../context/AdminDashboardContext';

const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { employees = [], loading, fetchEmployees, deleteEmployee, pagination } = useEmployeeContext();
  const { departments = [], fetchDepartments } = useAdminDashboard();

  // Load departments once if empty. Employees are auto-fetched by EmployeeContext.
  useEffect(() => {
    if ((!departments || departments.length === 0) && typeof fetchDepartments === 'function') {
      fetchDepartments();
    }
  }, [departments, fetchDepartments]);

  // Determine correct paths based on route context
  const basePath = isAdminRoute ? '/admin' : '';

  // --- STATE MANAGEMENT ---
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionId, setActiveActionId] = useState(null);
  const [filters, setFilters] = useState({
    department: 'All Departments',
    roleType: 'All Roles',
    status: 'All Status',
    joiningDate: ''
  });

  // Generate dynamic department stats for the chart
  const deptData = useMemo(() => {
    const counts = {};
    (employees || []).forEach(emp => {
      const dept = emp.department || 'Other';
      counts[dept] = (counts[dept] || 0) + 1;
    });

    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e'];
    
    return Object.keys(counts).map((name, index) => ({
      name: name.length > 6 ? name.substring(0, 5) + '..' : name,
      fullName: name,
      value: counts[name],
      color: colors[index % colors.length]
    }));
  }, [employees]);

  // --- FILTER LOGIC ---
  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    return (employees || []).filter(emp => {
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
  }, [searchQuery, filters, employees]);

  // --- HANDLERS ---
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete employee "${name}"? This will permanently remove all their data.`)) {
      try {
        const result = await deleteEmployee(id);
        if (result.success) {
          showNotification(`Employee ${name} deleted successfully.`);
        } else {
          showNotification(result.error || "Failed to delete employee.");
        }
      } catch (err) {
        showNotification("An error occurred during deletion.");
      }
    }
  };

  const handleExport = () => {
    if (!filteredEmployees || filteredEmployees.length === 0) {
      showNotification("No employee data to export.");
      return;
    }

    // CSV Headers
    const headers = ["ID", "Name", "Email", "Phone", "Department", "Role", "Status", "Joining Date"];
    
    // CSV Rows
    const rows = filteredEmployees.map(emp => [
      emp.employeeId || emp.id || "",
      emp.name || "N/A",
      emp.email || "N/A",
      emp.phone || "N/A",
      emp.department || "General",
      emp.role || "Employee",
      emp.status || "Active",
      emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : "N/A"
    ]);

    // Combine into CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Employee_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("Employee data exported to CSV successfully.");
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination?.pages && newPage > pagination.pages)) return;
    setCurrentPage(newPage);
    fetchEmployees({ page: newPage, limit: pagination?.limit || 50 });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden">

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-xl">
          <BellRing size={20} className="text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">Employee Directory</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Manage Your Team Members</p>
        </div>
        <div className="flex items-center gap-3 self-start lg:self-center">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Export
          </button>
          <button
            onClick={() => navigate(`${basePath}/employees/add`)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden min-h-0" onClick={() => setActiveActionId(null)}>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6">
           <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-semibold text-slate-800">Department Stats</h3>
                 <TrendingUp size={18} className="text-indigo-500" />
              </div>
              <div className="h-32 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={deptData}>
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                         {deptData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                      </Bar>
                   </BarChart>
                 </ResponsiveContainer>
              </div>
               <div className="mt-6 flex items-end justify-between">
                  <div>
                     <p className="text-xs text-slate-500 mb-1">Total Employees</p>
                     <p className="text-2xl font-semibold text-slate-800">{employees.length}</p>
                  </div>
               </div>
           </div>
        </div>

        {/* Main Table */}
        <div className="lg:col-span-3 flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl overflow-hidden">
           
           {/* Toolbar */}
           <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                 <div className="relative w-full lg:w-64">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Search employees..." 
                     className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 transition-all"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                       <Filter size={14} className="text-slate-400" />
                       <select 
                         className="text-sm text-slate-600 outline-none bg-transparent cursor-pointer"
                         value={filters.department}
                         onChange={(e) => handleFilterChange('department', e.target.value)}
                       >
                          <option>All Departments</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                          ))}
                       </select>
                    </div>
                 </div>
              </div>
           </div>

           {/* Table */}
           <div className="flex-1 overflow-x-auto no-scrollbar relative">
              <table className="w-full text-left border-collapse">
                 <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
                    <tr>
                       <th className="px-6 py-4 text-xs font-semibold text-slate-600">ID & Name</th>
                       <th className="px-6 py-4 text-xs font-semibold text-slate-600">Role</th>
                       <th className="px-6 py-4 text-xs font-semibold text-slate-600 text-center">Status</th>
                       <th className="px-6 py-4 text-xs font-semibold text-slate-600 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {loading && filteredEmployees.length === 0 ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={`skeleton-${i}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
                              <div className="flex flex-col gap-1.5">
                                <div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
                                <div className="h-3.5 w-32 bg-slate-200 rounded animate-pulse" />
                                <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" /></td>
                          <td className="px-6 py-4"><div className="h-5 w-14 bg-slate-200 rounded-full animate-pulse mx-auto" /></td>
                          <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse ml-auto" /></td>
                        </tr>
                      ))
                    ) : (
                      filteredEmployees.map((emp) => (
                         <tr key={emp.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                                     {emp.avatar ? (
                                        <img src={emp.avatar} alt="" className="w-full h-full object-cover" />
                                     ) : (
                                        <span className="text-sm font-semibold text-slate-500">{emp.name?.charAt(0)}</span>
                                     )}
                                  </div>
                                   <div className="flex flex-col">
                                      <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest border border-slate-200 mb-1">
                                         {emp.employeeId || 'EMP-NEW'}
                                      </span>
                                      <p className="text-sm font-semibold text-slate-900 leading-tight">{emp.name}</p>
                                      <p className="text-xs text-slate-500 leading-none">{emp.email}</p>
                                   </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <p className="text-sm font-medium text-slate-800">{emp.role}</p>
                               <p className="text-xs text-slate-500">{emp.department}</p>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center justify-center">
                                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                     emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                     {emp.status}
                                  </span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right relative">
                               <button
                                 onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === emp.id ? null : emp.id); }}
                                 className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                               >
                                  <MoreVertical size={18} />
                               </button>

                               {activeActionId === emp.id && (
                                  <div className="absolute right-6 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in zoom-in-95 fade-in duration-200">
                                     <button
                                       onClick={() => navigate(`${basePath}/employees/profile/${emp.id}`)}
                                       className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                     >
                                        <ExternalLink size={16} className="text-slate-400" />
                                        View Profile
                                     </button>
                                     <button
                                       onClick={() => navigate(`${basePath}/employees/edit/${emp.id}`)}
                                       className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                     >
                                        <Edit3 size={16} className="text-slate-400" />
                                        Edit
                                     </button>
                                     <button
                                       onClick={() => handleDelete(emp.id, emp.name)}
                                       className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                     >
                                        <Trash2 size={16} className="text-red-400" />
                                        Delete
                                     </button>
                                  </div>
                               )}
                            </td>
                         </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>

           {/* Footer */}
           <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <p className="text-sm text-slate-600">
                {loading ? 'Loading...' : `Showing ${filteredEmployees.length} of ${pagination?.total || filteredEmployees.length} employees`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600 px-2">
                  Page {currentPage} {pagination?.pages ? `of ${pagination.pages}` : ''}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={loading || (pagination?.pages && currentPage >= pagination.pages)}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDirectory;
