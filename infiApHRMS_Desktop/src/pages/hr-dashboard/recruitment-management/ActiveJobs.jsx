import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Building2,
    Briefcase, 
    ArrowLeft, 
    Plus, 
    Search, 
    MoreVertical,
    X,
    MapPin, 
    Users, 
    Calendar,
    ChevronRight,
    Target,
    Filter
} from 'lucide-react';
import { useJobContext } from '../../../context/JobContext';

const ActiveJobs = () => {
    const navigate = useNavigate();
    const { jobs, totals, deleteJob } = useJobContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleting, setIsDeleting] = useState(null);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to decommission this job requisition? This action is permanent.")) {
            setIsDeleting(id);
            try {
                await deleteJob(id);
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40 text-left">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-50 pb-10">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/recruitment')}
                        className="p-4 bg-white rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-soft group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Active Jobs</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Global Talent Distribution & Vacancy Hub</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group max-w-sm w-full lg:w-80">
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by title or dept..." 
                            className="w-full bg-white border border-slate-100 rounded-[20px] pl-16 pr-8 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all shadow-soft"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => navigate('/recruitment/post-job')}
                        className="px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-[20px] shadow-xl hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Post Job
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-[32px] border border-slate-50 shadow-soft flex items-center gap-6 group hover:border-indigo-600 transition-all">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Roles</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{totals.activeCount}</h3>
                    </div>
                </div>
                <div className="p-8 bg-white rounded-[32px] border border-slate-50 shadow-soft flex items-center gap-6 group hover:border-emerald-600 transition-all">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Applicants</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{totals.totalApplicants}</h3>
                    </div>
                </div>
                <div className="p-8 bg-slate-900 rounded-[32px] text-white flex items-center gap-6 shadow-2xl shadow-slate-200">
                    <div className="w-16 h-16 bg-white/10 rounded-[20px] flex items-center justify-center">
                        <Target size={28} className="text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hiring Speed</p>
                        <h3 className="text-2xl font-black tracking-tight">18 <span className="text-xs uppercase text-slate-500">Days Avg</span></h3>
                    </div>
                </div>
            </div>

            {/* Main Content: Job Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Listing ({filteredJobs.length} Positions)</h2>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-soft hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 group relative overflow-hidden">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                                
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-[24px] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                        <Briefcase size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors mb-2 uppercase">{job.title}</h3>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Building2 size={14} className="text-indigo-400" />
                                                {job.department}
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <MapPin size={14} className="text-orange-400" />
                                                {job.location}
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Calendar size={14} className="text-emerald-400" />
                                                Deadline: {job.deadline}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">{job.applicants}</span>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Applicants</span>
                                    </div>
                                    <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest 
                                        ${job.status === 'Active' ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-400'}`}>
                                        {job.status}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(job.id);
                                            }}
                                            disabled={isDeleting === job.id}
                                            className="p-4 bg-rose-50 text-rose-400 hover:bg-rose-600 hover:text-white rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                                            title="Delete Job"
                                        >
                                            {isDeleting === job.id ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <X size={20} />}
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/recruitment/active-jobs/${job.id}`)}
                                            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100 group-hover:shadow-indigo-100 active:scale-95"
                                            title="View Details"
                                        >
                                            <ChevronRight size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Blur */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}

                    {filteredJobs.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No matching roles found</h3>
                            <button onClick={() => setSearchQuery('')} className="mt-4 text-indigo-600 font-bold hover:underline">Clear search filters</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveJobs;
