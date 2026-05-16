import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminDashboard } from '../../../context/AdminDashboardContext';
import { 
  Users, 
  Search, 
  ArrowLeft,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  Activity,
  Plus,
  Edit2,
  Trash2,
  Filter
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const ViewTeams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { departmentId } = useParams();
  const { departments, teams, fetchTeams, fetchDepartments, loading, deleteTeam } = useAdminDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchTeams();
    if (departments.length === 0) fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const department = useMemo(() => {
    return departments.find(d => String(d.id) === String(departmentId)) || null;
  }, [departments, departmentId]);

  const departmentTeams = useMemo(() => {
    return teams.filter(t => {
        const teamDeptId = String(t.departmentId || '').toLowerCase();
        const urlDeptId = String(departmentId || '').toLowerCase();
        const teamDeptName = String(t.departmentName || '').toLowerCase();
        const currentDeptName = String(department?.name || '').toLowerCase();

        return teamDeptId === urlDeptId || 
               (currentDeptName && teamDeptName === currentDeptName);
    });
  }, [teams, departmentId, department]);

  const filteredTeams = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      return departmentTeams.filter(t => 
        (t.name || '').toLowerCase().includes(query) || 
        (t.lead || '').toLowerCase().includes(query)
      );
    }
    return departmentTeams;
  }, [departmentTeams, searchQuery]);

  const handleDelete = async (teamId, teamName) => {
    if (window.confirm(`Are you sure you want to delete "${teamName}"? This action cannot be undone.`)) {
      const result = await deleteTeam(teamId);
      if (result.success) {
        fetchTeams();
      } else {
        alert(result.error || 'Failed to delete team');
      }
    }
  };

  const createTeamRoute = isAdminRoute 
    ? `/admin/department-management/teams/create?dept=${departmentId}` 
    : `/departments/teams/create?dept=${departmentId}`;

  const editTeamRoute = (teamId) => isAdminRoute 
    ? `/admin/department-management/teams/edit/${teamId}` 
    : `/departments/teams/edit/${teamId}`;

  if (loading && departments.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Department Data...</p>
          </div>
      );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative text-left">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 shrink-0 px-2">
         <div className="flex items-center gap-6">
            <button
               onClick={() => navigate(isAdminRoute ? '/admin/department-management' : '/departments')}
               className="w-14 h-14 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm group"
            >
               <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
                     {department?.sub || 'DEPT NODE'}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               </div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  {department?.name || 'Department'} <span className="text-indigo-600">Teams</span>
               </h1>
            </div>
         </div>

         <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative group w-full sm:w-[300px]">
               <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
               <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-100 hover:border-slate-200 focus:border-indigo-500 outline-none rounded-[20px] pl-14 pr-6 py-4 text-xs font-black text-slate-600 transition-all shadow-soft uppercase tracking-tight placeholder:text-slate-200"
               />
            </div>
            <button 
                onClick={() => navigate(createTeamRoute)}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all active:scale-95 group"
            >
                <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
                Add Team
            </button>
         </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
          {[
              { label: 'Active Teams', value: departmentTeams.length, icon: LayoutGrid, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Total Members', value: departmentTeams.reduce((acc, t) => acc + (t.members || 0), 0), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Department Head', value: department?.head || 'Unassigned', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' }
          ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                      <stat.icon size={20} />
                  </div>
                  <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
                  </div>
              </div>
          ))}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
        {filteredTeams.map((team, idx) => (
          <div key={idx} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 flex flex-col relative">
            <div className="p-8 flex-1 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-wider border border-indigo-100 shadow-sm">
                      {team.teamCode || 'TM-NEW'}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors truncate uppercase" title={team.name}>{team.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Lead: <span className="text-slate-600">{team.lead}</span></p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                        onClick={() => navigate(editTeamRoute(team.id))}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 transition-all"
                        title="Edit Team"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={() => handleDelete(team.id, team.name)}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 border border-slate-100 hover:border-red-100 transition-all"
                        title="Delete Team"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-y border-slate-50 mb-6">
                  <div>
                    <p className="text-lg font-black text-slate-900 leading-none">{team.members || 0}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Members</p>
                  </div>
                  <button 
                    onClick={() => navigate(isAdminRoute ? `/admin/department-management/teams?team=${team.id}` : `/departments/teams?team=${team.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
                  >
                    <Users size={12} />
                    Manage Members
                  </button>
              </div>

              <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Team Roster</p>
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">List View</p>
                  </div>
                  
                  <div className="max-h-[200px] overflow-y-auto pr-2 no-scrollbar space-y-2">
                    {team.keyMembers?.map((member, midx) => (
                      <div key={midx} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-sm transition-all group/member">
                          <div className="flex items-center gap-3">
                              <img 
                                  src={member.img} 
                                  alt={member.name} 
                                  className="w-7 h-7 rounded-lg border border-white shadow-sm object-cover"
                                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'U')}&background=random&color=fff`; }}
                              />
                              <div className="min-w-0">
                                  <p className="text-[11px] font-black text-slate-800 truncate leading-tight">{member.name}</p>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{member.employeeId || member.role}</p>
                              </div>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      </div>
                    ))}
                    {(!team.keyMembers || team.keyMembers.length === 0) && (
                      <p className="text-[10px] font-bold text-slate-400 text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">No members assigned yet</p>
                    )}
                  </div>
              </div>
            </div>
            
            <button className="w-full py-5 bg-slate-50 text-slate-400 font-black text-[9px] uppercase tracking-[0.3em] group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center gap-3 border-t border-slate-50">
               Audit Team Performance
               <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Background Accent */}
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-50/20 rounded-full blur-3xl -mb-12 -mr-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}

        {/* Add Team Placeholder */}
        <div 
            onClick={() => navigate(createTeamRoute)}
            className="rounded-[32px] border-2 border-dashed border-slate-100 bg-white p-8 flex flex-col items-center justify-center group hover:border-slate-900 hover:bg-slate-50 transition-all duration-500 cursor-pointer min-h-[300px]"
        >
            <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
                <Plus size={32} className="text-slate-300 group-hover:text-white" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-colors">Add New Team</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-2 text-center">Establish a new operational unit</p>
        </div>

        {filteredTeams.length === 0 && searchQuery && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[40px] border border-slate-100 border-dashed shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                <LayoutGrid size={40} />
             </div>
             <p className="text-lg font-black text-slate-800 uppercase tracking-tight">No teams identified</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Zero records matching your current filter parameters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTeams;

