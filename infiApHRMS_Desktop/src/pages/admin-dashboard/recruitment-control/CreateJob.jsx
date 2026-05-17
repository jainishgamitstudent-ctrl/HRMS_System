import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    X, 
    MapPin, 
    Calendar, 
    Rocket, 
    Save, 
    ChevronDown,
    DollarSign,
    CheckCircle2
} from 'lucide-react';
import { useJobContext } from '../../../context/JobContext';
import { useNotifications } from '../../../context/NotificationContext';

const CreateJob = () => {
    const navigate = useNavigate();
    const { addJob } = useJobContext();
    const { addNotification } = useNotifications();
    const [skills, setSkills] = useState(['React', 'Node.js', 'Tailwind CSS']);
    const [skillInput, setSkillInput] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        department: 'Engineering',
        type: 'Full-time',
        experience: 'Mid (3-5 years)',
        salary: '',
        location: '',
        deadline: '',
        description: ''
    });

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            if (!skills.includes(skillInput.trim())) {
                setSkills([...skills, skillInput.trim()]);
            }
            setSkillInput('');
            e.preventDefault();
        }
    };

    const removeSkill = (skill) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addJob({
            ...formData,
            skills
        });
        addNotification({
            title: 'Job Posting Live',
            message: `The position "${formData.title}" is now active in ${formData.department} division.`,
            type: 'success'
        });
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            navigate('/admin/recruitment-control');
        }, 3000);
    };

    return (
        <div className="max-w-[1200px] mx-auto pb-40 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-50 pb-12">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/admin/recruitment-control')}
                        className="p-4 bg-white rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-soft group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Create Job Posting</h1>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Fill in the details to post a new job opening</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-10">
                        {/* Section 1: Core Identification */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Basic Information</h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Job Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-medium placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Department</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none"
                                            value={formData.department}
                                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        >
                                            <option>Engineering</option>
                                            <option>Design</option>
                                            <option>Marketing</option>
                                            <option>Sales</option>
                                            <option>Operations</option>
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Employment Type</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none"
                                            value={formData.type}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option>Full-time</option>
                                            <option>Contract</option>
                                            <option>Freelance</option>
                                            <option>Remote</option>
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Experience Level</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none"
                                            value={formData.experience}
                                            onChange={(e) => setFormData({...formData, experience: e.target.value})}
                                        >
                                            <option>Entry (0-2 years)</option>
                                            <option>Mid (3-5 years)</option>
                                            <option>Senior (6+ years)</option>
                                            <option>Lead / Principal</option>
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Compensation & Logistics */}
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Salary & Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Annual Salary Range</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="e.g. $120k - $160k"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                            value={formData.salary}
                                            onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Work Location</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="City, Country or Remote"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Skills & Description */}
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Requirements</h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Required Skills</label>
                                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 flex flex-wrap gap-2">
                                    {skills.map(skill => (
                                        <span key={skill} className="bg-white border border-slate-100 text-slate-600 text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:border-indigo-200 transition-all shadow-sm">
                                            {skill}
                                            <X 
                                                size={12} 
                                                className="cursor-pointer text-slate-400 hover:text-rose-500 transition-colors" 
                                                onClick={() => removeSkill(skill)}
                                            />
                                        </span>
                                    ))}
                                    <input 
                                        type="text"
                                        placeholder="Add skill..."
                                        className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-600 placeholder:text-slate-300 py-2 min-w-[120px]"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleAddSkill}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Job Description</label>
                                <textarea 
                                    placeholder="Outline the responsibilities, requirements, and tech stack..."
                                    rows={6}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-8 py-6 text-sm font-medium placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none leading-relaxed"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Configuration */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm sticky top-12 space-y-8">
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6">Actions</h4>
                            <div className="space-y-4">
                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <Rocket size={18} />
                                    Post Job
                                </button>
                                <button 
                                    type="button"
                                    className="w-full py-4 border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <Save size={18} />
                                    Save Draft
                                </button>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar size={16} className="text-indigo-500" />
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Deadline</h4>
                            </div>
                            <input 
                                type="date" 
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                value={formData.deadline}
                                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </form>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500"></div>
                    <div className="relative bg-white rounded-3xl p-12 md:p-16 shadow-2xl max-w-xl w-full animate-in zoom-in-95 fade-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-50">
                            <CheckCircle2 size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-4">Job Posted Successfully</h2>
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-10">The job opening is now live and visible to candidates.</p>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <button 
                                onClick={() => navigate('/admin/recruitment-control')}
                                className="w-full py-4 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                            >
                                Return to Recruitment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateJob;
