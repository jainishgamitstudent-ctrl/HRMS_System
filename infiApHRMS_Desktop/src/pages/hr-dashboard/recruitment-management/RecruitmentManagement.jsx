import React, { useEffect, useState } from 'react';
import {
  Download,
  Calendar,
  AlertCircle,
  Clock,
  Search,
  BellRing,
  ArrowRight,
  TrendingUp,
  X,
  LayoutDashboard,
  UserPlus,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getCandidateTracking, getRecruitmentJobs, createCandidate } from '../../../services/hrApi';

const formatDate = (value, fallback = 'Pending') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getCandidateStatus = (candidate) => (
  candidate.status ||
  candidate.stage ||
  candidate.applicationStatus ||
  candidate.interviewStatus ||
  'Applied'
);

const hasInterviewSchedule = (candidate) => {
  const schedule = candidate.interview || candidate.interviewSchedule || candidate.nextInterview || {};
  return Boolean(
    schedule.dateTime ||
    schedule.scheduledAt ||
    schedule.date ||
    candidate.interviewDate ||
    candidate.scheduledAt
  );
};

const normalizeCandidateAction = (candidate, index) => {
  const schedule = candidate.interview || candidate.interviewSchedule || candidate.nextInterview || {};
  const status = getCandidateStatus(candidate);
  const interviewDate = schedule.dateTime || schedule.scheduledAt || schedule.date || candidate.interviewDate || candidate.scheduledAt;
  const isSelected = ['selected', 'hired', 'offer', 'offered'].includes(String(status).toLowerCase());
  const scheduled = hasInterviewSchedule(candidate);

  return {
    id: candidate.id || candidate.candidateId || candidate._id || candidate.code || `CAN-${index + 1}`,
    title: candidate.name || candidate.fullName || candidate.candidateName || `Candidate ${index + 1}`,
    role: candidate.role || candidate.jobTitle || candidate.position || 'Role Pending',
    department: candidate.department || candidate.dept || candidate.team || 'Recruitment',
    date: formatDate(interviewDate || candidate.appliedAt || candidate.appliedDate || candidate.createdAt, scheduled ? 'Scheduled' : 'Applied'),
    category: scheduled ? (schedule.stage || candidate.stage || 'Interview Scheduled') : 'Candidate Application',
    status,
    selected: isSelected,
    scheduled,
    interviewer: schedule.interviewer || schedule.interviewerName || candidate.interviewer || 'Interviewer Pending',
    path: scheduled ? '/recruitment/interviews' : '/recruitment/applications',
    icon: isSelected ? ShieldCheck : scheduled ? Calendar : UserPlus,
    color: isSelected ? 'text-emerald-600' : scheduled ? 'text-indigo-600' : 'text-primary-600',
    bg: isSelected ? 'bg-emerald-50' : scheduled ? 'bg-indigo-50' : 'bg-primary-50'
  };
};

const RecruitmentManagement = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [pipelineData, setPipelineData] = useState([
    { name: 'Applied', value: 0 },
    { name: 'Screening', value: 0 },
    { name: 'Technical', value: 0 },
    { name: 'Leadership', value: 0 },
    { name: 'Offer', value: 0 }
  ]);
  const [applicantTotal, setApplicantTotal] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [currentActions, setCurrentActions] = useState([]);
  const [interviewTotal, setInterviewTotal] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [unscheduledTotal, setUnscheduledTotal] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    interviewer: '',
    status: 'Applied',
    interviewDate: '',
  });
  const [adding, setAdding] = useState(false);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;

    const loadPipeline = async () => {
      try {
        const [candidateRes, jobRes] = await Promise.all([
          getCandidateTracking(),
          getRecruitmentJobs()
        ]);

        const candidates = Array.isArray(candidateRes.data?.data) ? candidateRes.data.data : [];
        const jobsData = Array.isArray(jobRes.data?.data) ? jobRes.data.data : [];
        setJobs(jobsData);

        const stageCounts = candidates.reduce((acc, item) => {
          const stage = getCandidateStatus(item);
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {});

        const mapped = Object.entries(stageCounts).map(([name, value]) => ({ name, value }));
        const actions = candidates.map(normalizeCandidateAction);
        const scheduledCount = actions.filter((c) => c.scheduled).length;
        const selectedCount = actions.filter((c) => c.selected).length;

        if (isMounted) {
          if (mapped.length) setPipelineData(mapped);
          setApplicantTotal(candidates.length);
          setInterviewTotal(scheduledCount);
          setSelectedTotal(selectedCount);
          setUnscheduledTotal(Math.max(candidates.length - scheduledCount - selectedCount, 0));
          setCurrentActions(actions);
        }
      } catch (err) {
        // debug error removed
      }
    };

    loadPipeline();
    return () => { isMounted = false; };
  }, []);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      showNotification('Candidate name is required.');
      return;
    }
    try {
      setAdding(true);
      const payload = {
        applicantName: addForm.name,
        email: addForm.email || undefined,
        jobTitle: addForm.role,
        location: addForm.department || undefined,
        status: addForm.status,
        technicalInterview: addForm.interviewDate || addForm.interviewer
          ? {
              date: addForm.interviewDate || undefined,
              interviewer: addForm.interviewer || undefined,
            }
          : undefined,
      };
      await createCandidate(payload);
      showNotification('Candidate added successfully.');
      setAddForm({ name: '', email: '', role: '', department: '', interviewer: '', status: 'Applied', interviewDate: '' });
      setShowAddModal(false);
      // refresh list
      const [candidateRes, jobRes] = await Promise.all([
        getCandidateTracking(),
        getRecruitmentJobs()
      ]);
      const candidates = Array.isArray(candidateRes.data?.data) ? candidateRes.data.data : [];
      const jobsData = Array.isArray(jobRes.data?.data) ? jobRes.data.data : [];
      setJobs(jobsData);
      const stageCounts = candidates.reduce((acc, item) => {
        const stage = getCandidateStatus(item);
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {});
      const mapped = Object.entries(stageCounts).map(([name, value]) => ({ name, value }));
      const actions = candidates.map(normalizeCandidateAction);
      const scheduledCount = actions.filter((c) => c.scheduled).length;
      const selectedCount = actions.filter((c) => c.selected).length;
      if (mapped.length) setPipelineData(mapped);
      setApplicantTotal(candidates.length);
      setInterviewTotal(scheduledCount);
      setSelectedTotal(selectedCount);
      setUnscheduledTotal(Math.max(candidates.length - scheduledCount - selectedCount, 0));
      setCurrentActions(actions);
    } catch (err) {
      showNotification(err?.response?.data?.message || 'Failed to add candidate.');
    } finally {
      setAdding(false);
    }
  };

  const handleExportCandidate = (act) => {
    const headers = ["Candidate Name", "Role", "Department", "Interviewer", "Status", "Date"];
    const row = [act.title, act.role, act.department, act.interviewer, act.status, act.date];

    const csvContent = [
      headers.join(","),
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Candidate_${act.title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${act.title}'s data.`);
  };

  const handleExportAll = () => {
    if (!filteredActions.length) {
      showNotification("No recruitment data to export.");
      return;
    }

    const headers = ["Candidate Name", "Role", "Department", "Interviewer", "Status", "Date"];
    const rows = filteredActions.map(act => [
      act.title,
      act.role,
      act.department,
      act.interviewer,
      act.status,
      act.date
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Recruitment_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Recruitment data exported successfully.");
  };

  const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b'];

  const tabs = ['Active', 'Review', 'History', 'Archives'];

  const stats = [
    { label: 'Scheduled Interviews', value: interviewTotal, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Selected Candidates', value: selectedTotal, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Unscheduled Interviews', value: unscheduledTotal, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const filteredActions = currentActions.filter((a) => {
    const query = searchQuery.toLowerCase();
    const tab = activeTab.toLowerCase();
    const status = String(a.status).toLowerCase();
    const matchesSearch = [a.title, a.role, a.department, a.interviewer, a.status].some(
      (field) => String(field).toLowerCase().includes(query)
    );
    const matchesTab =
      tab === 'active' ? !['rejected', 'archived'].includes(status) :
      tab === 'review' ? a.scheduled || ['shortlisted', 'interview', 'interview scheduled'].some((key) => status.includes(key)) :
      tab === 'history' ? a.selected || ['rejected', 'hired', 'selected', 'offer'].some((key) => status.includes(key)) :
      tab === 'archives' ? status.includes('archived') :
      true;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-6 pt-4 overflow-hidden">


      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg">
          <BellRing size={16} className="text-primary-400" />
          <span className="text-sm">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recruitment</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage candidates, interviews, and hiring pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportAll}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
          >
            <Download size={16} className="text-slate-400" />
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-800 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <UserPlus size={16} className="text-indigo-600" />
            Add Candidate
          </button>
          <button
            onClick={() => navigate('/recruitment/post-job')}
            className="px-6 py-2.5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-2xl shadow-indigo-100 active:scale-95"
          >
            <Briefcase size={16} />
            Post New Job
          </button>
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 m-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Candidate</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white border border-slate-200 focus:border-primary-300 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white border border-slate-200 focus:border-primary-300 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors"
                  placeholder="e.g. jane@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                  <input
                    type="text"
                    value={addForm.role}
                    onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full bg-white border border-slate-200 focus:border-primary-300 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors"
                    placeholder="e.g. Frontend Dev"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
                  <input
                    type="text"
                    value={addForm.department}
                    onChange={(e) => setAddForm((f) => ({ ...f, department: e.target.value }))}
                    className="w-full bg-white border border-slate-200 focus:border-primary-300 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors"
                    placeholder="e.g. Engineering"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Interviewer</label>
                  <input
                    type="text"
                    value={addForm.interviewer}
                    onChange={(e) => setAddForm((f) => ({ ...f, interviewer: e.target.value }))}
                    className="w-full bg-white border border-slate-200 focus:border-primary-300 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors"
                    placeholder="e.g. John Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full bg-white border border-slate-200 focus:border-primary-300 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors"
                  >
                    <option>Applied</option>
                    <option>Shortlisted</option>
                    <option>Technical Interview</option>
                    <option>Selected</option>
                    <option>Hired</option>
                    <option>Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Interview Date</label>
                <input
                  type="datetime-local"
                  value={addForm.interviewDate}
                  onChange={(e) => setAddForm((f) => ({ ...f, interviewDate: e.target.value }))}
                  className="w-full bg-white border border-slate-200 focus:border-primary-300 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {adding ? 'Saving...' : 'Save Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 overflow-hidden min-h-0">

        {/* Sidebar Stats */}
        <div className="xl:col-span-1 flex flex-col gap-4 overflow-y-auto pb-4">

          {/* Pipeline Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Pipeline</h3>
              <TrendingUp size={16} className="text-indigo-500" />
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Active Applicants</p>
                <p className="text-2xl font-bold text-slate-800">{applicantTotal}</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded">94% eff</span>
            </div>
          </div>

          {/* Stat Cards */}
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3 hover:border-slate-200 transition-colors cursor-pointer">
              <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}

          {/* Alert Card */}
          <div className="bg-slate-900 p-5 rounded-xl text-white mt-auto">
            <AlertCircle className="mb-2 text-indigo-400" size={20} />
            <h4 className="text-sm font-semibold mb-1">Hiring Alert</h4>
            <p className="text-xs text-slate-400 mb-3">{unscheduledTotal} candidates need scheduling or review.</p>
            <button onClick={() => navigate('/recruitment/applications')} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
              Review Pipeline
            </button>
          </div>
        </div>

        {/* Main Table Area */}
        <div className="xl:col-span-3 flex flex-col min-h-0 bg-white border border-slate-100 rounded-xl overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative max-w-sm w-full sm:w-56">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidates, roles..."
                className="w-full bg-white border border-slate-200 focus:border-primary-300 outline-none rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-700 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto no-scrollbar relative">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-xs font-medium text-slate-400">Candidate</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">Interview Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">Stage</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredActions.map((act, idx) => (
                  <tr key={`${activeTab}-${idx}`} onClick={() => navigate(act.path)} className="group hover:bg-slate-50/60 transition-colors cursor-pointer">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${act.bg} ${act.color}`}>
                          {act.icon ? <act.icon size={18} /> : <div className="w-4 h-4 bg-slate-200 rounded-full" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 group-hover:text-primary-600 transition-colors">{act.title}</p>
                          <p className="text-xs text-slate-400">{act.role} &middot; {act.interviewer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={13} className="text-slate-400" />
                        {act.date}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        act.selected
                          ? 'bg-emerald-50 text-emerald-600'
                          : act.status === 'Priority' || act.status === 'Required'
                            ? 'bg-orange-50 text-orange-600'
                            : act.status === 'Live'
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'bg-slate-100 text-slate-600'
                      }`}>
                        {act.selected ? 'Selected' : act.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleExportCandidate(act); }} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                          <Download size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-slate-900 border-t border-white/5 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <p className="text-xs text-slate-400">Recruitment system active</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-slate-500">Total Vacancies: {jobs.length}</p>
              <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
                Sync
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RecruitmentManagement;
