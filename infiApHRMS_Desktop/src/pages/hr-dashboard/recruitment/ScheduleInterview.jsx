import React, { useEffect, useState } from 'react';
import { 
  Undo2, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Users, 
  MapPin, 
  Briefcase, 
  Video, 
  Phone,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  ClipboardList,
  Settings,
  Mail,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCandidateTracking, scheduleCandidateInterview } from '../../../services/hrApi';

const ScheduleInterview = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        candidate: '',
        candidateId: '',
        role: 'Senior UI/UX Designer',
        type: 'Video Call',
        stage: 'Technical Round',
        interviewer: '',
        date: '',
        time: ''
    });

    const [dropdowns, setDropdowns] = useState({
        candidate: false,
        type: false,
        stage: false,
        interviewer: false
    });

    const defaultCandidates = [
        { id: 'CAN-9021', name: 'Mark Wilson', role: 'Senior UI/UX Designer' },
        { id: 'CAN-9022', name: 'Alex Rivers', role: 'Senior Software Engineer' },
        { id: 'CAN-9023', name: 'Elena Rodriguez', role: 'HR Manager' },
        { id: 'CAN-9024', name: 'Sarah Chen', role: 'Product Designer' }
    ];
    const [candidates, setCandidates] = useState(defaultCandidates);
    const interviewers = ['Sarah Green', 'David Chen', 'Michael Scott', 'Pam Beesly'];
    const stages = ['Screening', 'Technical Round', 'System Design', 'Culture Fit', 'HR Round'];
    const types = ['Video Call', 'On-site', 'Phone Call'];

    useEffect(() => {
        let isMounted = true;

        const loadCandidates = async () => {
            try {
                const res = await getCandidateTracking();
                const payload = Array.isArray(res.data?.data) ? res.data.data : [];
                const mapped = payload.map((item, index) => ({
                    id: item.id || item.candidateId || item._id || item.code || `CAN-${index + 1}`,
                    name: item.name || item.fullName || item.candidateName || `Candidate ${index + 1}`,
                    role: item.role || item.jobTitle || item.position || 'Role Pending'
                }));
                if (isMounted && mapped.length) {
                    setCandidates(mapped);
                }
            } catch (err) {
                // debug error removed
            }
        };

        loadCandidates();

        return () => {
            isMounted = false;
        };
    }, []);

    const toggleDropdown = (field) => {
        setDropdowns(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const selectOption = (field, value) => {
        if (field === 'candidate') {
            const selected = candidates.find((item) => item.name === value);
            setFormData((prev) => ({
                ...prev,
                candidate: value,
                candidateId: selected?.id || '',
                role: selected?.role || prev.role
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        setDropdowns(prev => ({ ...prev, [field]: false }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.candidateId) {
                await scheduleCandidateInterview(formData.candidateId, {
                    role: formData.role,
                    type: formData.type,
                    stage: formData.stage,
                    interviewer: formData.interviewer,
                    date: formData.date,
                    time: formData.time
                });
            }
            setSubmitted(true);
        } catch (err) {
            // debug error removed
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col h-[calc(100vh-120px)] w-full items-center justify-center animate-in fade-in zoom-in-95 duration-700 text-left">
                <div className="max-w-xl w-full card-soft bg-white p-12 border-slate-100 shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-500 mb-8 border-4 border-white shadow-xl animate-bounce">
                            <CalendarIcon size={48} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-6">Interview Scheduled!</h2>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest leading-relaxed mb-10 max-w-sm mx-auto">
                            The interview node for <span className="text-indigo-600 font-black">{formData.candidate || 'the candidate'}</span> has been successfully initialized and invitations have been dispatched.
                        </p>
                        <div className="flex flex-col w-full gap-4">
                            <button 
                                onClick={() => navigate('/recruitment/interviews')}
                                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-[11px] active:scale-95"
                            >
                                View Pipeline
                            </button>
                            <button 
                                onClick={() => setSubmitted(false)}
                                className="w-full py-5 bg-white border border-slate-200 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px] active:scale-95"
                            >
                                Schedule Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden text-left">
            
            {/* Header */}
            <div className="flex items-center gap-6 shrink-0">
                <button 
                    onClick={() => navigate('/recruitment/interviews')}
                    className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1 active:scale-95"
                >
                    <Undo2 size={20} />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Initialize Interview Node</h1>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 leading-none">Configure candidate acquisition protocols</p>
                </div>
            </div>

            {/* Form Workspace */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Column: Candidate & Stage */}
                    <div className="space-y-8">
                        <div className="card-soft bg-white p-10 border-slate-100 shadow-soft space-y-8">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Candidate Information</h3>
                            
                            {/* Candidate Select */}
                            <div className="space-y-3 relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Candidate</label>
                                <button 
                                    type="button"
                                    onClick={() => toggleDropdown('candidate')}
                                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-tight text-left flex items-center justify-between hover:bg-slate-100 transition-all"
                                >
                                    {formData.candidate || 'Select from pipeline...'}
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${dropdowns.candidate ? 'rotate-180' : ''}`} />
                                </button>
                                {dropdowns.candidate && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        {candidates.map(c => (
                                            <button 
                                                key={c.id} type="button" 
                                                onClick={() => selectOption('candidate', c.name)}
                                                className="w-full p-4 text-left text-xs font-black text-slate-600 hover:bg-slate-50 border-b border-slate-50 last:border-none transition-colors uppercase"
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Job Role (Fixed for demo) */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied Role</label>
                                <div className="w-full bg-slate-50/50 border border-slate-50 p-5 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-tight flex items-center gap-3">
                                    <Briefcase size={16} className="text-indigo-300" />
                                    {formData.role}
                                </div>
                            </div>

                            {/* Interview Stage */}
                            <div className="space-y-3 relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interview Stage</label>
                                <button 
                                    type="button"
                                    onClick={() => toggleDropdown('stage')}
                                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-tight text-left flex items-center justify-between hover:bg-slate-100 transition-all"
                                >
                                    {formData.stage}
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${dropdowns.stage ? 'rotate-180' : ''}`} />
                                </button>
                                {dropdowns.stage && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        {stages.map(s => (
                                            <button 
                                                key={s} type="button" 
                                                onClick={() => selectOption('stage', s)}
                                                className="w-full p-4 text-left text-xs font-black text-slate-600 hover:bg-slate-50 border-b border-slate-50 last:border-none transition-colors uppercase"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Time & Interviewer */}
                    <div className="space-y-8">
                        <div className="card-soft bg-white p-10 border-slate-100 shadow-soft space-y-8">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Schedule Details</h3>
                            
                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interview Date</label>
                                    <div className="relative">
                                        <CalendarIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input 
                                            type="date" 
                                            required
                                            className="w-full bg-slate-50 border border-slate-100 pl-14 pr-5 py-5 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-tight outline-none focus:border-indigo-100 transition-all"
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input 
                                            type="time" 
                                            required
                                            className="w-full bg-slate-50 border border-slate-100 pl-14 pr-5 py-5 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-tight outline-none focus:border-indigo-100 transition-all"
                                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Interview Type Cards */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Protocol</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'Video Call', icon: Video, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                                        { id: 'On-site', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                        { id: 'Phone Call', icon: Phone, color: 'text-orange-500', bg: 'bg-orange-50' },
                                    ].map(t => (
                                        <button 
                                            key={t.id}
                                            type="button"
                                            onClick={() => selectOption('type', t.id)}
                                            className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 active:scale-95 ${formData.type === t.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-100'}`}
                                        >
                                            <t.icon size={24} className={formData.type === t.id ? 'text-indigo-400' : t.color} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{t.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Interviewer Select */}
                            <div className="space-y-3 relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Interviewer</label>
                                <button 
                                    type="button"
                                    onClick={() => toggleDropdown('interviewer')}
                                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-tight text-left flex items-center justify-between hover:bg-slate-100 transition-all"
                                >
                                    {formData.interviewer || 'Assign from team...'}
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${dropdowns.interviewer ? 'rotate-180' : ''}`} />
                                </button>
                                {dropdowns.interviewer && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        {interviewers.map(i => (
                                            <button 
                                                key={i} type="button" 
                                                onClick={() => selectOption('interviewer', i)}
                                                className="w-full p-4 text-left text-xs font-black text-slate-600 hover:bg-slate-50 border-b border-slate-50 last:border-none transition-colors uppercase"
                                            >
                                                {i}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-6 bg-slate-900 text-white font-black rounded-[32px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            <CalendarIcon size={18} className="group-hover:rotate-12 transition-transform" />
                            Confirm Schedule
                        </button>
                    </div>
                </form>
            </div>

            {/* Desktop Navigation Footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 px-10 py-4 rounded-[32px] shadow-2xl flex items-center gap-10 border border-white/10 shrink-0">
                {[
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/recruitment' },
                    { icon: Users, label: 'Candidates', path: '/recruitment/candidates' },
                    { icon: ClipboardList, label: 'Applications', path: '/recruitment/applications' },
                    { icon: CalendarIcon, label: 'Interviews', path: '/recruitment/interviews', active: true },
                ].map((item, i) => (
                    <button 
                        key={i} 
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center gap-1 transition-all ${item.active ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-white hover:scale-105'}`}
                    >
                        <item.icon size={18} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ScheduleInterview;
