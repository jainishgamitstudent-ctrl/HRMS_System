import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  LayoutGrid,
  Plus,
  Search,
  ChevronRight,
  Trash2,
  Edit2,
  Bell,
  AlertCircle,
  X,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { useAdminDashboard } from '../../context/AdminDashboardContext';
import { useAuth } from '../../context/AuthContext';

const DepartmentCard = ({ dept, role, fetchDepartments, deleteDepartment, requestDepartmentDelete, openMenuId, setOpenMenuId, navigate }) => {
  const normalizedRole = (role || '').toString().toLowerCase();
  const isAdmin = ['admin', 'superadmin'].includes(normalizedRole);
  const canEdit = isAdmin || normalizedRole === 'hr';
  const canDelete = isAdmin || normalizedRole === 'hr';
  const canViewTeams = isAdmin || normalizedRole === 'hr';

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the ${dept.name} department? This action cannot be undone.`)) return;

    if (isAdmin) {
      const result = await deleteDepartment(dept.id);
      if (result.success) {
        fetchDepartments();
      } else {
        alert(result.error || 'Failed to delete department');
      }
    } else {
      const result = await requestDepartmentDelete(dept.id);
      if (result.success) {
        alert(`Deletion request for ${dept.name} submitted for admin approval.`);
      } else {
        alert(result.error || 'Failed to request department deletion');
      }
    }
  };

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const editRoute = isAdminRoute ? `/admin/department-management/edit/${dept.id}` : `/departments/edit/${dept.id}`;
  const specificTeamRoute = isAdminRoute
    ? `/admin/department-management/teams/view/${dept.id || dept._id}`
    : `/departments/teams/view/${dept.id || dept._id}`;

  return (
    <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-100/50 group relative flex flex-col h-full min-h-[360px]">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors duration-500"></div>

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-100 transition-all duration-500 shadow-sm truncate max-w-[120px]">
          {dept.departmentCode || dept.sub || 'DEP-NEW'}
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(editRoute)}
              className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 transition-all duration-300 group/edit"
              title="Edit Department"
            >
              <Edit2 size={14} className="group-hover/edit:scale-110 transition-transform" />
            </button>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 border border-slate-100 hover:border-red-100 transition-all duration-300 group/del"
                title={isAdmin ? 'Delete Department' : 'Request Department Deletion'}
              >
                <Trash2 size={14} className="group-hover/del:scale-110 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="relative z-10 flex-1 min-w-0">
        <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors leading-tight mb-2 uppercase truncate" title={dept.name}>{dept.name}</h3>
        <div className="flex items-center gap-2 text-slate-400 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest shrink-0">Head:</span>
            <p className="text-[11px] font-bold text-slate-500 truncate" title={dept.head}>{dept.head}</p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3 mt-8 mb-8">
        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-500">
          <span className="block text-xl font-black text-slate-800 leading-none mb-1.5">{dept.teams}</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block truncate">Total Teams</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-500">
          <span className="block text-xl font-black text-slate-800 leading-none mb-1.5">{dept.employees}</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block truncate">Active Staff</span>
        </div>
      </div>

      {canViewTeams && (
        <button
          onClick={() => navigate(specificTeamRoute)}
          className="relative z-10 w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-100 group-hover:shadow-indigo-200 group-hover:bg-indigo-600 transition-all duration-500 text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95"
        >
          View Teams
          <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
};

const Departments = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const {
    departments,
    summary,
    fetchDepartments,
    loading,
    deleteDepartment,
    requestDepartmentDelete,
    fetchDepartmentDeletionRequests,
    approveDepartmentDeletion,
    rejectDepartmentDeletion
  } = useAdminDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const normalizedRole = (role || '').toString().toLowerCase();
  const isAdmin = ['admin', 'superadmin'].includes(normalizedRole);

  const filteredDepartments = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return departments.filter(dept => 
      (dept.name || '').toLowerCase().includes(query) ||
      (dept.head || '').toLowerCase().includes(query) ||
      (dept.departmentCode || '').toLowerCase().includes(query) ||
      (dept.sub || '').toLowerCase().includes(query)
    );
  }, [departments, searchQuery]);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const teamRoute = isAdminRoute ? '/admin/department-management/teams' : '/departments/teams';
  const createDepartmentRoute = isAdminRoute ? '/admin/department-management/create' : '/departments/create';

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPendingRequests = async () => {
    if (!isAdmin) return;
    setRequestsLoading(true);
    try {
      const result = await fetchDepartmentDeletionRequests();
      if (result.success) {
        setPendingRequests(result.data);
      }
    } catch (e) {
      console.warn('Failed to load pending requests', e);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
    const interval = setInterval(() => {
      loadPendingRequests();
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleApprove = async (requestId) => {
    const result = await approveDepartmentDeletion(requestId);
    if (result.success) {
      await loadPendingRequests();
      await fetchDepartments();
    }
  };

  const handleReject = async (requestId) => {
    const result = await rejectDepartmentDeletion(requestId);
    if (result.success) {
      await loadPendingRequests();
    }
  };

  const overviewStats = useMemo(() => ([
    { label: 'Departments', value: String(departments.length), icon: Building2 },
    {
      label: 'Teams',
      value: String(
        Number(summary?.teams) ||
        departments.reduce((count, department) => count + (Number(department.teams) || 0), 0)
      ),
      icon: LayoutGrid
    },
    {
      label: 'Employees',
      value: String(
        Number(summary?.totalEmployees || summary?.employees) ||
        departments.reduce((count, department) => count + (Number(department.employees) || 0), 0)
      ),
      icon: Users
    },
  ]), [departments, summary]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">Departments</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Live company structure</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredDepartments.length > 0) {
                  navigate(teamRoute);
                }
              }}
              className="bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all w-[300px] shadow-soft"
            />
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowRequestsModal(true)}
              className="relative flex items-center gap-2 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all text-xs font-black uppercase tracking-widest text-slate-600"
            >
              <Bell size={16} className="text-indigo-500" />
              Approvals
              {pendingRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => navigate(createDepartmentRoute)}
            style={{ background: 'linear-gradient(135deg, #4E63F0, #6855E8)' }}
            className="flex items-center gap-3 px-7 py-3.5 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 text-xs font-black uppercase tracking-widest active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Create Department
          </button>
        </div>
      </div>

      <section className="px-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overviewStats.map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <stat.icon size={18} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-2 pb-4 relative">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active departments</label>
          <button 
            onClick={() => navigate(teamRoute)}
            className="text-[10px] font-black text-indigo-600 hover:underline transition-all uppercase tracking-widest"
          >
            Manage Teams
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-sm font-bold text-slate-500">Loading live departments...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDepartments.map((dept, idx) => (
              <DepartmentCard
                key={idx}
                dept={dept}
                role={role}
                fetchDepartments={fetchDepartments}
                deleteDepartment={deleteDepartment}
                requestDepartmentDelete={requestDepartmentDelete}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                navigate={navigate}
              />
            ))}

          {!searchQuery && (
            <div
              onClick={() => navigate(createDepartmentRoute)}
              className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-5 flex flex-col items-center justify-center group hover:border-slate-900 hover:bg-slate-50 transition-all duration-300 cursor-pointer min-h-[180px]"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-slate-900 group-hover:text-white transition-all">
                <Plus size={24} className="text-slate-300 group-hover:text-white" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-colors">Add department</p>
            </div>
          )}
          
          {searchQuery && filteredDepartments.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 border-dashed">
               <Search size={40} className="text-slate-200 mb-4" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No departments found matching "{searchQuery}"</p>
               <button 
                 onClick={() => setSearchQuery('')}
                 className="mt-4 text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest"
               >
                 Clear Search
               </button>
            </div>
          )}
        </div>
        )}

        {/* Floating Minimal CTA */}
        <button
            onClick={() => navigate(createDepartmentRoute)}
          className="fixed bottom-12 right-12 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center group z-40"
        >
          <Plus size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </section>

      {/* Admin Approval Modal */}
      {showRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Pending Deletion Requests</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review and approve department removals</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestsModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {requestsLoading ? (
                <div className="text-center py-12 text-sm font-bold text-slate-400">Loading requests...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CheckCircle size={40} className="text-emerald-400 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">No pending deletion requests</p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req._id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle size={14} className="text-amber-500 shrink-0" />
                        <span className="text-sm font-black text-slate-800 truncate">{req.departmentName}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 truncate">
                        Requested by {req.requesterName || req.requestedBy?.name || 'Unknown'}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {req.departmentId?.numberOfTeams || 0} teams
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReject(req._id)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(req._id)}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
