import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminDashboard } from '../../../context/AdminDashboardContext';
import { useEmployeeContext } from '../../../context/EmployeeContext';
import { 
  Users, 
  Search, 
  Plus, 
  ChevronRight, 
  ArrowLeft,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  LayoutGrid,
  Bell
} from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';

const ManageTeams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const { teams, fetchTeams, updateTeam, deleteTeam } = useAdminDashboard();
  const { employees, fetchEmployees } = useEmployeeContext();
  const [activeTab, setActiveTab] = useState('All Teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTeamDetails, setActiveTeamDetails] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [savingMember, setSavingMember] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!employees || employees.length === 0) {
      fetchEmployees?.({ limit: 1000 }); // Increase limit for enterprise scale
    }
  }, [employees, fetchEmployees]);

  // Handle direct team selection from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const teamId = params.get('team');
    if (teamId && teams.length > 0) {
      const team = teams.find(t => t.id === teamId || t._id === teamId);
      if (team) openTeamDetails(team);
    }
  }, [location.search, teams]);

  const employeeOptions = useMemo(() => {
    const query = employeeSearch.toLowerCase().trim();
    const list = (employees || [])
      .filter((employee) => employee.id && !(activeTeamDetails?.memberIds || []).includes(employee.id));
    
    if (!query) return list.slice(0, 10); // Show top 10 if no search
    
    return list.filter(emp => 
      (emp.name || '').toLowerCase().includes(query) || 
      (emp.employeeId || '').toLowerCase().includes(query)
    ).slice(0, 20); // Limit results for performance
  }, [employees, employeeSearch, activeTeamDetails]);

  const tabs = useMemo(() => {
    const uniqueTypes = Array.from(new Set(teams.map(t => t.type || 'General')));
    const baseTabs = ['All Teams'];
    uniqueTypes.forEach(type => {
      if (!baseTabs.includes(type)) baseTabs.push(type);
    });
    // Ensure standard tabs exist even if empty
    ['Development', 'QA & Testing', 'Design'].forEach(type => {
      if (!baseTabs.includes(type)) baseTabs.push(type);
    });
    return baseTabs;
  }, [teams]);

  const filteredTeams = useMemo(() => {
    let result = teams;
    const query = searchQuery.toLowerCase().trim();

    if (query) {
      // If searching, search across ALL teams
      result = result.filter(t => 
        (t.name || '').toLowerCase().includes(query) || 
        (t.lead || '').toLowerCase().includes(query) ||
        (t.departmentName || '').toLowerCase().includes(query)
      );
    } else {
      // Otherwise filter by tab
      result = activeTab === 'All Teams' 
        ? teams 
        : teams.filter(t => (t.type || 'General').toLowerCase() === activeTab.toLowerCase());
    }
    
    return result;
  }, [teams, activeTab, searchQuery]);

  const openTeamDetails = (team) => {
    setActiveTeamDetails(team);
    setSelectedMemberId('');
    setMemberError('');
  };

  const handleAddMember = async () => {
    if (!activeTeamDetails?.id || !selectedMemberId) return;

    const existingMemberIds = new Set(activeTeamDetails.memberIds || []);
    if (existingMemberIds.has(selectedMemberId)) {
      setMemberError('This employee is already in the team.');
      return;
    }

    setSavingMember(true);
    setMemberError('');

    const nextMemberIds = [...existingMemberIds, selectedMemberId];
    const result = await updateTeam(activeTeamDetails.id, { members: nextMemberIds });

    setSavingMember(false);

    if (!result?.success) {
      setMemberError(result?.error || 'Failed to add employee to team.');
      return;
    }

    const refreshed = result.data;
    setActiveTeamDetails((prev) => prev ? { ...prev, ...refreshed } : prev);
    setSelectedMemberId('');
    fetchTeams();
  };

  const handleRemoveMember = async (memberId) => {
    if (!activeTeamDetails?.id || !window.confirm('Are you sure you want to remove this member from the team?')) return;

    const nextMemberIds = (activeTeamDetails.memberIds || []).filter(id => id !== memberId);
    setSavingMember(true);

    const result = await updateTeam(activeTeamDetails.id, { members: nextMemberIds });
    setSavingMember(false);

    if (!result?.success) {
      setMemberError(result?.error || 'Failed to remove member.');
      return;
    }

    const refreshed = result.data;
    setActiveTeamDetails((prev) => prev ? { ...prev, ...refreshed } : prev);
    fetchTeams();
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to delete "${teamName}"?`)) return;
    
    const result = await deleteTeam(teamId);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      
      {/* Dynamic Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
         <div className="flex items-center gap-6">
            <button
               onClick={() => navigate(location.pathname.startsWith('/admin') ? '/admin/department-management' : '/departments')}
               className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
            >
               <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">
            Team Management Hub
               </h1>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">
            Global Talent Inventory & Identity Portfolio Nodes
               </p>
            </div>
         </div>
         <div className="flex items-center gap-4 relative group max-w-sm w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <input
               type="text"
               placeholder="Search teams or leads..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && filteredTeams.length > 0) {
                   openTeamDetails(filteredTeams[0]);
                 }
               }}
               className="w-full bg-white border border-slate-100 hover:border-slate-200 focus:border-indigo-500 outline-none rounded-xl pl-11 pr-4 py-3 text-xs font-black text-slate-600 transition-all shadow-sm uppercase tracking-tight"
            />
         </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${activeTab === tab 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1' 
                : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            {tab}
          </button>
        ))}
        <button className="ml-auto flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
          <Filter size={14} />
          Advanced Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTeams.map((team, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors mb-0.5 truncate">{team.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 italic truncate">Lead: {team.lead}</p>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-2">
                  <button 
                    onClick={() => navigate(role === 'HR' ? `/departments/teams/edit/${team.id}` : `/admin/department-management/teams/edit/${team.id}`)}
                    className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    title="Edit Team"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Delete Team"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 px-3 py-2 bg-indigo-50/50 rounded-xl flex items-center gap-2 border border-indigo-100/50">
                  <Users size={12} className="text-indigo-600" />
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-none">{team.members}</h4>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Members</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => openTeamDetails(team)}
                className="w-full py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                View Details
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        ))}

        {filteredTeams.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 border-dashed">
             <LayoutGrid size={40} className="text-slate-200 mb-4" />
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No teams found matching your criteria</p>
             <button 
               onClick={() => { setSearchQuery(''); setActiveTab('All Teams'); }}
               className="mt-4 text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest"
             >
               Reset Filters
             </button>
          </div>
        )}
      </div>

      {/* Floating CTA */}
      <button 
        onClick={() => navigate(role === 'HR' ? '/departments/teams/create' : '/admin/department-management/teams/create')}
        className="fixed bottom-12 right-12 flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-full shadow-2xl hover:shadow-indigo-200 hover:-translate-y-2 transition-all active:scale-95 group z-40"
      >
        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
          <Plus size={20} strokeWidth={3} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Create Team</span>
      </button>

      {/* Team Details Modal */}
      {activeTeamDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                   <h2 className="text-2xl font-black text-slate-800">{activeTeamDetails.name}</h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{activeTeamDetails.departmentName || 'General'} Department</p>
                </div>
                <button 
                  onClick={() => setActiveTeamDetails(null)}
                  className="w-10 h-10 bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all"
                >
                   <ArrowLeft size={18} className="rotate-45" />
                </button>
             </div>
             <div className="p-8 overflow-y-auto flex-1 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-indigo-50 rounded-[24px]">
                      <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block mb-2">Team Lead</label>
                      <p className="text-lg font-black text-indigo-900">{activeTeamDetails.lead}</p>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-[24px]">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Total Members</label>
                      <p className="text-lg font-black text-slate-800">{activeTeamDetails.members}</p>
                   </div>
                </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2 px-1">Find employee by name or ID</label>
                    <div className="flex flex-col md:flex-row gap-3 relative">
                      <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Search size={14} />
                        </div>
                        <input
                          type="text"
                          placeholder="Search for employees..."
                          value={employeeSearch}
                          onChange={(e) => {
                            setEmployeeSearch(e.target.value);
                            setShowSearchDropdown(true);
                          }}
                          onFocus={() => setShowSearchDropdown(true)}
                          className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
                        />
                        
                        {showSearchDropdown && employeeSearch.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="max-h-[250px] overflow-y-auto no-scrollbar">
                              {employeeOptions.length > 0 ? employeeOptions.map((employee) => (
                                <button
                                  key={employee.id}
                                  onClick={() => {
                                    setSelectedMemberId(employee.id);
                                    setEmployeeSearch(`${employee.name} (${employee.employeeId || 'ID Pending'})`);
                                    setShowSearchDropdown(false);
                                  }}
                                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                                >
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">{employee.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{employee.employeeId || 'ID Pending'} • {employee.department || 'General'}</p>
                                  </div>
                                  <Plus size={14} className="text-indigo-500" />
                                </button>
                              )) : (
                                <div className="p-6 text-center">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching employees found</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          await handleAddMember();
                          setEmployeeSearch('');
                        }}
                        disabled={!selectedMemberId || savingMember}
                        className="px-8 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                      >
                        {savingMember ? 'Adding...' : 'Add to Roster'}
                      </button>
                    </div>
                    {memberError && (
                      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-red-500 px-1">{memberError}</p>
                    )}
                  </div>
                
                 <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Team Directory</label>
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{activeTeamDetails.keyMembers?.length || 0} Members</span>
                    </div>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
                      {activeTeamDetails.keyMembers?.length > 0 ? activeTeamDetails.keyMembers.map((member, midx) => (
                         <div key={midx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100/30 transition-all group/memberitem">
                            <div className="flex items-center gap-4">
                               <img 
                                 src={member.img} 
                                 alt={member.name} 
                                 className="w-10 h-10 rounded-xl border border-slate-100 shadow-sm object-cover"
                                 onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'U')}&background=random&color=fff`; }}
                               />
                               <div>
                                  <p className="text-sm font-bold text-slate-800 leading-tight">{member.name}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{member.employeeId || member.role}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">{member.status || 'Active'}</span>
                               <button 
                                 onClick={() => handleRemoveMember(member.id || member._id)}
                                 className="p-2.5 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover/memberitem:opacity-100"
                                 title="Remove Member"
                               >
                                  <Trash2 size={14} />
                               </button>
                            </div>
                         </div>
                      )) : (
                         <div className="flex flex-col items-center justify-center p-10 bg-slate-50 border border-slate-100 border-dashed rounded-3xl text-center">
                            <Users size={32} className="text-slate-300 mb-3" />
                            <p className="text-lg text-slate-700 font-black mb-1">0 Team Members</p>
                            <p className="text-xs text-slate-400 font-bold mb-6 max-w-[250px]">Start adding employees to build this operational unit.</p>
                         </div>
                      )}
                    </div>
                 </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageTeams;
