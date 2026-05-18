import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    Building2,
    Calendar,
    Users,
    Clock,
    Edit3,
    Trash2,
    Share2,
    ExternalLink
} from 'lucide-react';
import { useJobContext } from '../../../context/JobContext';

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { jobs, deleteJob } = useJobContext();

    const job = jobs.find(j => j.id === id);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            await deleteJob(id);
            navigate('/recruitment/active-jobs');
        }
    };

    if (!job) {
        return (
            <div className="max-w-7xl mx-auto pb-40 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="py-24 text-center">
                    <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Job Not Found</h3>
                    <p className="text-sm text-slate-400 mt-2">The job you are looking for does not exist or has been removed.</p>
                    <button
                        onClick={() => navigate('/recruitment/active-jobs')}
                        className="mt-6 px-6 py-3 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all"
                    >
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 pb-8">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/recruitment/active-jobs')}
                        className="p-4 bg-white rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-soft group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">{job.title}</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Job Details &amp; Overview</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDelete}
                        className="p-4 bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl transition-all active:scale-95"
                        title="Delete Job"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm active:scale-95">
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={() => navigate(`/recruitment/post-job?edit=${job.id}`)}
                        className="px-6 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-[20px] shadow-xl hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
                    >
                        <Edit3 size={18} strokeWidth={3} />
                        Edit Job
                    </button>
                </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-50 shadow-soft flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                        <Building2 size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                        <p className="text-sm font-bold text-slate-800">{job.department}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-50 shadow-soft flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                        <MapPin size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                        <p className="text-sm font-bold text-slate-800">{job.location}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-50 shadow-soft flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                        <Clock size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                        <p className="text-sm font-bold text-slate-800">{job.type}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-50 shadow-soft flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center">
                        <Calendar size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posted</p>
                        <p className="text-sm font-bold text-slate-800">{job.postedDate}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Description */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-soft">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Job Description</h3>
                        <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                            {job.description || 'No description provided for this role.'}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-soft">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Requirements</h3>
                        {job.requirements && job.requirements.length > 0 ? (
                            <ul className="space-y-3">
                                {job.requirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-500">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 shrink-0" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-400">No specific requirements listed.</p>
                        )}
                    </div>
                </div>

                {/* Right Column - Stats & Info */}
                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl shadow-slate-200">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">Application Stats</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Users size={18} className="text-indigo-400" />
                                    <span className="text-sm font-medium text-slate-300">Total Applicants</span>
                                </div>
                                <span className="text-2xl font-black">{job.applicants}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-emerald-400" />
                                    <span className="text-sm font-medium text-slate-300">Deadline</span>
                                </div>
                                <span className="text-sm font-bold">{job.deadline}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ExternalLink size={18} className="text-orange-400" />
                                    <span className="text-sm font-medium text-slate-300">Status</span>
                                </div>
                                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg ${job.status === 'Active' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-400'}`}>
                                    {job.status}
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <button
                                onClick={() => navigate('/recruitment/candidates')}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors"
                            >
                                View Applicants
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
