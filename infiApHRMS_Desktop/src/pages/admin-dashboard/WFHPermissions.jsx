import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Globe,
  User,
  Users,
  Building2,
  Lock,
  Unlock,
  ChevronDown,
  RefreshCw,
  StickyNote,
  Pencil,
  Trash2,
  Home,
} from 'lucide-react';
import api from '../../utils/axios';

const LEVEL_CONFIG = {
  global: { icon: Globe, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', label: 'Global' },
  employee: { icon: User, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Employee' },
  team: { icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Team' },
  department: { icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Department' },
};

const WFHPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('global');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [granting, setGranting] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);

  const fetchData = async () => {
    try {
      const [permRes, empRes, teamRes, deptRes] = await Promise.all([
        api.get('/wfh/permissions'),
        api.get('/admin-dashboard/staff-directory'),
        api.get('/admin-dashboard/teams'),
        api.get('/admin-dashboard/departments'),
      ]);
      setPermissions(permRes.data?.data || []);
      setEmployees(empRes.data?.data || []);
      const teamData = teamRes.data?.data || {};
      setTeams(teamData.departments ? teamData.departments.flatMap(d => d.teams || []) : []);
      setDepartments(deptRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load WFH data:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleGrant = async () => {
    if (selectedLevel === 'employee' && !selectedEmployeeId) {
      alert('Please select an employee.');
      return;
    }
    if (selectedLevel === 'team' && !selectedTeamId) {
      alert('Please select a team.');
      return;
    }
    if (selectedLevel === 'department' && !selectedDepartmentId) {
      alert('Please select a department.');
      return;
    }

    setGranting(true);
    try {
      if (editingPermission) {
        await api.put(`/wfh/permissions/${editingPermission.id}`, {
          level: selectedLevel,
          employeeId: selectedLevel === 'employee' ? selectedEmployeeId : undefined,
          teamId: selectedLevel === 'team' ? selectedTeamId : undefined,
          departmentId: selectedLevel === 'department' ? selectedDepartmentId : undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await api.post('/wfh/permissions', {
          level: selectedLevel,
          employeeId: selectedLevel === 'employee' ? selectedEmployeeId : undefined,
          teamId: selectedLevel === 'team' ? selectedTeamId : undefined,
          departmentId: selectedLevel === 'department' ? selectedDepartmentId : undefined,
          notes: notes.trim() || undefined,
        });
      }
      setShowGrantModal(false);
      resetForm();
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save permission.');
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this WFH permission?')) return;
    try {
      await api.patch(`/wfh/permissions/${id}/revoke`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke permission.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently DELETE this WFH permission? This action cannot be undone.')) return;
    try {
      await api.delete(`/wfh/permissions/${id}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete permission.');
    }
  };

  const resetForm = () => {
    setSelectedLevel('global');
    setSelectedEmployeeId('');
    setSelectedTeamId('');
    setSelectedDepartmentId('');
    setNotes('');
    setEditingPermission(null);
  };

  const filteredPermissions = useMemo(() => {
    let data = [...permissions];
    if (filter === 'active') data = data.filter(p => p.isActive);
    if (filter === 'revoked') data = data.filter(p => !p.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.level.toLowerCase().includes(q) ||
        p.employee?.name?.toLowerCase().includes(q) ||
        p.team?.name?.toLowerCase().includes(q) ||
        p.department?.name?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [permissions, filter, search]);

  const activeCount = permissions.filter(p => p.isActive).length;
  const revokedCount = permissions.filter(p => !p.isActive).length;

  const openEditModal = (p) => {
    setEditingPermission(p);
    setSelectedLevel(p.level);
    setSelectedEmployeeId(p.employee?.id || '');
    setSelectedTeamId(p.team?.id || '');
    setSelectedDepartmentId(p.department?.id || '');
    setNotes(p.notes || '');
    setShowGrantModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">WFH Access Control</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Grant, revoke and manage work-from-home permissions</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setRefreshing(true); fetchData().then(() => setRefreshing(false)); }}
            className="flex items-center gap-2 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 text-xs font-black uppercase tracking-widest shadow-sm"
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => { resetForm(); setShowGrantModal(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-1 transition-all active:scale-95 text-xs font-black uppercase tracking-widest"
          >
            <Plus size={18} strokeWidth={3} />
            Grant Permission
          </button>
        </div>
      </div>

      {/* Stats */}
      <section className="px-2 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Permissions', value: String(permissions.length), icon: ShieldCheck, color: 'text-slate-800', bg: 'bg-white' },
            { label: 'Active', value: String(activeCount), icon: Unlock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Revoked', value: String(revokedCount), icon: Lock, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat, idx) => (
            <div key={idx} className={`rounded-3xl border border-slate-100 ${stat.bg} p-6 shadow-sm flex items-center justify-between`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <stat.icon size={24} className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2 mb-6">
        <div className="flex items-center gap-2">
          {['all', 'active', 'revoked'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative group w-full md:w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Level</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Target</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Granted By</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Home size={28} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-1">No permissions found</p>
                    <p className="text-xs text-slate-400">Grant a new WFH permission to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((p) => {
                  const config = LEVEL_CONFIG[p.level] || LEVEL_CONFIG.global;
                  const Icon = config.icon;
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center`}>
                            <Icon size={18} className={config.color} />
                          </div>
                          <span className="text-sm font-bold text-slate-800 capitalize">{config.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.level === 'global' && <span className="text-sm text-slate-500">— All Employees —</span>}
                        {p.level === 'employee' && p.employee && (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{p.employee.name}</span>
                            <span className="text-xs text-slate-400">{p.employee.email}</span>
                          </div>
                        )}
                        {p.level === 'team' && p.team && (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{p.team.name}</span>
                          </div>
                        )}
                        {p.level === 'department' && p.department && (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{p.department.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                          p.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {p.isActive ? <Unlock size={12} /> : <Lock size={12} />}
                          {p.isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-600">{p.grantedBy?.name || 'Admin'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-400">{new Date(p.grantedAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-colors"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          {p.isActive ? (
                            <button
                              onClick={() => handleRevoke(p.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-colors"
                            >
                              <Lock size={12} />
                              Revoke
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRevoke(p.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                            >
                              <Unlock size={12} />
                              Re-grant
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant/Edit Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {editingPermission ? 'Edit WFH Permission' : 'Grant WFH Permission'}
              </h2>
              <button onClick={() => { setShowGrantModal(false); resetForm(); }} className="text-slate-300 hover:text-slate-600 transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Level Selector */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Permission Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(LEVEL_CONFIG).map(([key, conf]) => {
                    const Icon = conf.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedLevel(key)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                          selectedLevel === key
                            ? `${conf.bg} ${conf.color} ${conf.border} shadow-sm`
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={16} />
                        {conf.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Employee Selector */}
              {selectedLevel === 'employee' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Select Employee</label>
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-2 max-h-[200px] overflow-y-auto">
                    {employees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => setSelectedEmployeeId(emp.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all ${
                          selectedEmployeeId === emp.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          {emp.staffProfile ? (
                            <img src={emp.staffProfile} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase">
                              {(emp.staffName || 'U').charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-bold text-slate-800 block">{emp.staffName}</span>
                            <span className="text-xs text-slate-400">
                              {emp.contactInfo?.email || '—'} · {emp.staffDepartment || '—'} · {emp.staffJobRole || '—'}
                            </span>
                          </div>
                        </div>
                        {selectedEmployeeId === emp.id && <ShieldCheck size={18} className="text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Selector */}
              {selectedLevel === 'team' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Select Team</label>
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-2 max-h-[200px] overflow-y-auto">
                    {teams.map((t) => (
                      <button
                        key={t._id}
                        onClick={() => setSelectedTeamId(t._id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all ${
                          selectedTeamId === t._id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-white'
                        }`}
                      >
                        <span className="text-sm font-bold text-slate-800">{t.name}</span>
                        {selectedTeamId === t._id && <ShieldCheck size={18} className="text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Department Selector */}
              {selectedLevel === 'department' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Select Department</label>
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-2 max-h-[200px] overflow-y-auto">
                    {departments.map((d) => (
                      <button
                        key={d._id}
                        onClick={() => setSelectedDepartmentId(d._id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all ${
                          selectedDepartmentId === d._id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-white'
                        }`}
                      >
                        <span className="text-sm font-bold text-slate-800">{d.name}</span>
                        {selectedDepartmentId === d._id && <ShieldCheck size={18} className="text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note about this permission..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => { setShowGrantModal(false); resetForm(); }}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGrant}
                disabled={granting}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {granting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShieldCheck size={16} />
                )}
                {editingPermission ? 'Save Changes' : 'Grant Permission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WFHPermissions;
