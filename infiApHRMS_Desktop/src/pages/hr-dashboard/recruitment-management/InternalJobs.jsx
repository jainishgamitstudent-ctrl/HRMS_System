import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Briefcase, 
    Search, 
    MapPin, 
    Clock, 
    DollarSign, 
    ChevronRight, 
    CheckCircle2, 
    Building2, 
    Layers, 
    UserCheck,
    Send,
    X,
    Sparkles,
    Calendar,
    ArrowLeft
} from 'lucide-react';
import { useJobContext } from '../../../context/JobContext';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';

const InternalJobs = () => {
    const { jobs, loading } = useJobContext();
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    // Filters and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [selectedType, setSelectedType] = useState('All');

    // Detail modal and application form states
    const [selectedJob, setSelectedJob] = useState(null);
    const [applyJob, setApplyJob] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [appliedJobs, setAppliedJobs] = useState([]);
    
    const [applicationForm, setApplicationForm] = useState({
        coverLetter: '',
        yearsInCompany: '1-2 years',
        managerApproved: true
    });

    // Extract unique departments for filter dropdown
    const departments = useMemo(() => {
        const list = new Set(jobs.map(j => j.department));
        return ['All', ...Array.from(list)];
    }, [jobs]);

    // Extract unique types for filter dropdown
    const jobTypes = ['All', 'Full-time', 'Contract', 'Freelance', 'Remote'];

    // Filter jobs
    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesDept = selectedDepartment === 'All' || job.department === selectedDepartment;
            const matchesType = selectedType === 'All' || job.type === selectedType;
            const matchesStatus = job.status === 'Active' || job.status === 'Open';

            return matchesSearch && matchesDept && matchesType && matchesStatus;
        });
    }, [jobs, searchQuery, selectedDepartment, selectedType]);

    // Handle Application Submit
    const handleApplySubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate network request
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setAppliedJobs(prev => [...prev, applyJob.id]);
            addNotification({
                title: 'Application Submitted!',
                message: `Your internal application for ${applyJob.title} has been logged.`,
                type: 'success'
            });

            // Close modals
            setApplyJob(null);
            setSelectedJob(null);
            
            // Reset form
            setApplicationForm({
                coverLetter: '',
                yearsInCompany: '1-2 years',
                managerApproved: true
            });
        } catch (err) {
            addNotification({
                title: 'Application Failed',
                message: 'Could not log application. Please try again.',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1440px] mx-auto pb-40 animate-in fade-in duration-700 text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all shadow-soft group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">Internal Job Board</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Explore open roles and grow your career within the enterprise</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100/50 rounded-2xl text-indigo-700 shadow-soft">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{filteredJobs.length} Live Positions</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4 group hover:border-indigo-100 transition-all">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100/50 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <Briefcase size={20} className="text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Career Paths</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{jobs.length} Active Positions</h3>
                    </div>
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4 group hover:border-emerald-100 transition-all">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100/50 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                        <UserCheck size={20} className="text-emerald-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Applications logged</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{appliedJobs.length} Filed Internally</h3>
                    </div>
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4 group hover:border-amber-100 transition-all col-span-1 sm:col-span-2 lg:col-span-1">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100/50 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                        <Building2 size={20} className="text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Department nodes</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{departments.length - 1} Operating Divisions</h3>
                    </div>
                </div>
            </div>

            {/* Main Job Section */}
            <div className="space-y-6">
                {/* Search & Filters */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Field */}
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by role, division or location..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Dropdown Filters */}
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Division:</span>
                            <select
                                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-600"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type:</span>
                            <select
                                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-600"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                {jobTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Job Postings Grid */}
                {loading ? (
                    <div className="p-20 text-center space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Job Registries...</p>
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => {
                            const isApplied = appliedJobs.includes(job.id);
                            return (
                                <div 
                                    key={job.id} 
                                    className="bg-white rounded-3xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col justify-between group relative overflow-hidden"
                                >
                                    {/* Division Tag Top Right */}
                                    <span className="absolute top-0 right-0 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl">
                                        {job.department}
                                    </span>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Vacancy</p>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1 group-hover:text-indigo-600 transition-colors">
                                                {job.title}
                                            </h3>
                                        </div>

                                        {/* Core Logistics */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <MapPin size={14} className="text-slate-400" />
                                                <span className="text-xs font-medium">{job.location || 'Remote'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <DollarSign size={14} className="text-slate-400" />
                                                <span className="text-xs font-medium">{job.salary || 'Competitive'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <Clock size={14} className="text-slate-400" />
                                                <span className="text-xs font-medium">{job.type} • {job.experience}</span>
                                            </div>
                                        </div>

                                        {/* Skill Tags */}
                                        {job.skills && job.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-2">
                                                {job.skills.slice(0, 3).map(skill => (
                                                    <span key={skill} className="bg-slate-50 border border-slate-100/50 text-slate-500 text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.skills.length > 3 && (
                                                    <span className="bg-slate-50 text-slate-400 text-[8px] font-black uppercase px-2 py-1 rounded-md">
                                                        +{job.skills.length - 3} More
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action button */}
                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                                        <button
                                            onClick={() => setSelectedJob(job)}
                                            className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                                        >
                                            View Specifications
                                            <ChevronRight size={14} />
                                        </button>

                                        {isApplied ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-4 py-2.5 rounded-xl">
                                                <CheckCircle2 size={12} strokeWidth={3} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Filed</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setApplyJob(job)}
                                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95 shrink-0"
                                            >
                                                Apply
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Briefcase size={40} className="text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">No Vacancies Listed</h3>
                        <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">No job postings matched your current search filters.</p>
                    </div>
                )}
            </div>

            {/* 1. View Specifications Modal (Drawer) */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedJob(null)} />
                    <div className="relative bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                                    <Briefcase size={20} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">Specifications</h3>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Internal Registry Node</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="space-y-2">
                                <span className="bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md">
                                    {selectedJob.department}
                                </span>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
                                    {selectedJob.title}
                                </h2>
                            </div>

                            {/* Info Table */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-6 border border-slate-100/50">
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Division</p>
                                    <p className="text-xs font-bold text-slate-700 mt-1">{selectedJob.department}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                    <p className="text-xs font-bold text-slate-700 mt-1">{selectedJob.location || 'Remote'}</p>
                                </div>
                                <div className="mt-4">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Compensation</p>
                                    <p className="text-xs font-bold text-slate-700 mt-1">{selectedJob.salary || 'Competitive'}</p>
                                </div>
                                <div className="mt-4">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Work Type</p>
                                    <p className="text-xs font-bold text-slate-700 mt-1">{selectedJob.type} • {selectedJob.experience}</p>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Description</h4>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                    {selectedJob.description || 'No detailed description listed. Reach out to hiring manager for full details.'}
                                </p>
                            </div>

                            {/* Skills required */}
                            {selectedJob.skills && selectedJob.skills.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Skills & Stack</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJob.skills.map(skill => (
                                            <span key={skill} className="bg-slate-100 border border-slate-200/50 text-slate-600 text-[10px] font-bold px-4 py-2 rounded-xl">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-8 border-t border-slate-50 flex items-center justify-between gap-4">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Posted on: {selectedJob.postedDate}</span>
                            {appliedJobs.includes(selectedJob.id) ? (
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 px-6 py-3.5 rounded-2xl">
                                    <CheckCircle2 size={16} strokeWidth={3} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Application Filed</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setApplyJob(selectedJob)}
                                    className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Send size={14} />
                                    Apply For This Role
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Application Form Modal */}
            {applyJob && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setApplyJob(null)} />
                    <div className="relative bg-white w-full max-w-lg rounded-[32px] border border-slate-100 shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                                    <Send size={24} className="text-indigo-600 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1.5 uppercase">Apply Internally</h3>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Internal Mobility Registry</p>
                                </div>
                            </div>
                            <button onClick={() => setApplyJob(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleApplySubmit} className="space-y-6">
                            {/* Role Summary */}
                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex justify-between items-center">
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Position applied for</p>
                                    <h4 className="text-base font-black text-slate-900 mt-1">{applyJob.title}</h4>
                                </div>
                                <span className="bg-white border border-indigo-100 text-indigo-600 text-[8px] font-black uppercase px-3 py-1.5 rounded-lg shadow-sm">
                                    {applyJob.department}
                                </span>
                            </div>

                            {/* Tenure dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenure in current company</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all text-slate-700"
                                    value={applicationForm.yearsInCompany}
                                    onChange={(e) => setApplicationForm({...applicationForm, yearsInCompany: e.target.value})}
                                >
                                    <option>Less than 1 year</option>
                                    <option>1-2 years</option>
                                    <option>3+ years</option>
                                </select>
                            </div>

                            {/* cover letter */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Why do you want to transfer to this role?</label>
                                <textarea
                                    required
                                    placeholder="Write a brief description of your internal transition interest..."
                                    rows={4}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all resize-none leading-relaxed"
                                    value={applicationForm.coverLetter}
                                    onChange={(e) => setApplicationForm({...applicationForm, coverLetter: e.target.value})}
                                />
                            </div>

                            {/* checkbox for approval */}
                            <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-100/50 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="approvedCheck"
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                                    checked={applicationForm.managerApproved}
                                    onChange={(e) => setApplicationForm({...applicationForm, managerApproved: e.target.checked})}
                                />
                                <label htmlFor="approvedCheck" className="text-[10px] text-slate-500 font-bold leading-normal select-none cursor-pointer">
                                    I confirm that I have informed my current line manager about applying for this internal transfer, and understand it is subject to standard transition policies.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !applicationForm.managerApproved}
                                className="w-full py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.25em] rounded-2xl shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                            >
                                {isSubmitting ? 'Logging Application...' : 'File Application Registry'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InternalJobs;
