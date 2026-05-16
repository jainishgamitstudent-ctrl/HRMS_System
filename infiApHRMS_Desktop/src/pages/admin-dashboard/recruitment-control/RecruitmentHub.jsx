import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  MoreVertical,
  Search,
  ArrowRight,
  Edit2,
  Trash2
} from 'lucide-react';
import { useAdminDashboard } from '../../../context/AdminDashboardContext';

const RecruitmentHub = () => {
  const navigate = useNavigate();
  const { jobs, fetchJobs, loading, summary, deleteTeam } = useAdminDashboard();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(j =>
      (j.title || '').toLowerCase().includes(q) ||
      (j.department || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  const stats = useMemo(() => [
    { label: 'Open Jobs', value: String(jobs.filter(j => j.status === 'Active' || j.status === 'Open').length), icon: Briefcase },
    { label: 'Applicants', value: String(jobs.reduce((acc, j) => acc + (j.applicants || 0), 0)), icon: Users },
    { label: 'Interviews', value: String(summary?.interviews || 0), icon: CheckCircle2 },
    { label: 'Filled Roles', value: String(jobs.filter(j => j.status === 'Filled').length), icon: Calendar },
  ], [jobs, summary]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">Recruitment</h1>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Live requisitions and applicant flow</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs..." 
              className="bg-white border border-slate-100 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all w-[240px] shadow-sm"
            />
          </div>
          <button
            onClick={() => navigate('/admin/recruitment-control/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
          >
            <Plus size={16} strokeWidth={2.5} />
            Post Job
          </button>
        </div>
      </div>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                <stat.icon size={18} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Jobs */}
      <section className="relative">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Active Job Postings</h2>
            <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{jobs.length} live</span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading jobs...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
              <Briefcase size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {searchQuery ? 'No jobs match your search' : 'No live roles yet'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {searchQuery ? 'Try a different keyword.' : 'Create a job posting to populate this view with active recruitment data.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => navigate('/admin/recruitment-control/create')}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                Post First Job
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg group relative flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight mb-0.5 group-hover:text-indigo-600 transition-colors uppercase leading-tight">{job.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{job.department} · {job.location || 'Remote'}</p>
                  </div>
                  <span className={`shrink-0 ml-2 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    job.status === 'Active' || job.status === 'Open'
                      ? 'bg-emerald-50 text-emerald-600'
                      : job.status === 'Filled'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-slate-50 text-slate-500'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 py-3 border-y border-slate-50 mb-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users size={12} />
                    <span className="text-[10px] font-bold">{job.applicants} applicants</span>
                  </div>
                  {job.type && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Briefcase size={12} />
                      <span className="text-[10px] font-bold">{job.type}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <button 
                    onClick={() => navigate('/admin/recruitment-control/tracking')}
                    className="flex-1 py-2.5 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                  >
                    Applicants
                  </button>
                  <button 
                    onClick={() => navigate(`/admin/recruitment-control/edit/${job.id}`)}
                    className="p-2.5 border border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900 rounded-xl transition-all"
                    title="Edit Job"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={() => navigate('/admin/recruitment-control/create')}
          className="fixed bottom-10 right-10 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center z-40 shadow-indigo-200"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </section>
    </div>
  );
};

export default RecruitmentHub;
