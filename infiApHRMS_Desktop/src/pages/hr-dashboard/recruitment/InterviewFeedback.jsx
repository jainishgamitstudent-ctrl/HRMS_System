import React, { useState } from 'react';
import { 
  Users, 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Briefcase,
  TrendingUp,
  Brain,
  Zap,
  Heart,
  Undo2,
  Check,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateCandidateInterview } from '../../../services/hrApi';

const InterviewFeedback = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [submitted, setSubmitted] = useState(false);
    const [ratings, setRatings] = useState({
        technical: 4,
        communication: 5,
        problemSolving: 3,
        culturalFit: 5
    });
    const [recommendation, setRecommendation] = useState('Select as option');
    const [isOpen, setIsOpen] = useState(false);
    const [strengths, setStrengths] = useState('');
    const [improvements, setImprovements] = useState('');

    const competencies = [
        { id: 'technical', label: 'Technical Skills', icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { id: 'communication', label: 'Communication', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'problemSolving', label: 'Problem Solving', icon: Brain, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'culturalFit', label: 'Cultural Fit', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    ];

    const toggleRating = (id, rating) => {
        setRatings(prev => ({ ...prev, [id]: rating }));
    };

    const handleSubmit = async () => {
        try {
            await updateCandidateInterview(id, {
                ratings,
                recommendation,
                strengths,
                improvements
            });
            setSubmitted(true);
        } catch (err) {
            // debug error removed
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col h-[calc(100vh-120px)] w-full items-center justify-center animate-in fade-in zoom-in-95 duration-700 relative text-left">
                <div className="max-w-xl w-full card-soft bg-white p-12 border-slate-100 shadow-2xl text-center relative overflow-hidden">
                    {/* Animated Background Blobs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-500 mb-8 border-4 border-white shadow-xl animate-bounce">
                            <CheckCircle2 size={48} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-6">Feedback Submitted Successfully!</h2>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.1em] leading-relaxed mb-10 max-w-sm mx-auto">
                            Your evaluation for <span className="text-indigo-600 font-black">Mark Wilson (Senior UI/UX Designer)</span> has been forensic-recorded and synchronized with the recruitment node.
                        </p>

                        <div className="w-full p-8 bg-slate-50 rounded-[32px] border border-slate-100 mb-10 text-left">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6 border-b border-slate-200 pb-3 flex items-center justify-between">
                                Summary of Evaluation
                                <span className="text-emerald-600">Verified • Node Secured</span>
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img src="https://i.pravatar.cc/150?u=mark" className="w-12 h-12 rounded-[18px] object-cover" alt="" />
                                    <div>
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Mark Wilson</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Job Candidate</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Recommendation</p>
                                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-lg">Strong Hire</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col w-full gap-4">
                            <button 
                                onClick={() => navigate('/recruitment')}
                                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-[11px] active:scale-95"
                            >
                                Back to Recruitment Dashboard
                            </button>
                            <button 
                                onClick={() => navigate('/recruitment/candidate/CAN-9021')}
                                className="w-full py-5 bg-white border border-slate-200 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px] active:scale-95"
                            >
                                View Candidate Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden text-left">
            
            {/* Header / Sidebar Structure */}
            <div className="flex-1 flex flex-col xl:flex-row gap-8 min-h-0 overflow-hidden">
                
                {/* 1. Evaluation Form (Main) */}
                <div className="flex-1 flex flex-col gap-8 overflow-y-auto no-scrollbar pb-32">
                    
                    {/* Identity Banner */}
                    <div className="card-soft bg-white p-10 border-slate-100 shadow-soft flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <img src="https://i.pravatar.cc/150?u=mark" className="w-16 h-16 rounded-[24px] object-cover" alt="" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 border-4 border-white rounded-full flex items-center justify-center">
                                    <TrendingUp size={12} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">Mark Wilson</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                    Senior UI/UX Designer
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    Oct 24, 2023 • 10:30 AM
                                </p>
                            </div>
                        </div>
                        <span className="px-5 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-indigo-100 flex items-center gap-2">
                            <ShieldCheck size={14} />
                            IN REVIEW
                        </span>
                    </div>

                    {/* Competency Grating */}
                    <div className="card-soft bg-white p-12 border-slate-100 shadow-soft">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-10 border-b border-slate-50 pb-4">Core Competencies</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {competencies.map((comp) => (
                                <div key={comp.id} className="space-y-4 group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-2xl ${comp.bg} ${comp.color} group-hover:scale-110 transition-all shadow-sm`}>
                                            <comp.icon size={18} />
                                        </div>
                                        <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{comp.label}</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star} 
                                                onClick={() => toggleRating(comp.id, star)}
                                                className={`transition-all hover:scale-125 active:scale-95 ${star <= ratings[comp.id] ? 'text-orange-400 drop-shadow-sm' : 'text-slate-200'}`}
                                            >
                                                <Star size={24} fill={star <= ratings[comp.id] ? "currentColor" : "none"} strokeWidth={1.5} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Assessment */}
                    <div className="card-soft bg-white p-12 border-slate-100 shadow-soft space-y-10">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-4">Detailed Assessment</h3>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Strengths</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl text-xs font-medium text-slate-600 focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300 min-h-[120px]"
                                    placeholder="What stood out about this candidate?"
                                    value={strengths}
                                    onChange={(e) => setStrengths(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Areas for Improvement</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl text-xs font-medium text-slate-600 focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300 min-h-[120px]"
                                    placeholder="Any red flags or growth opportunities?"
                                    value={improvements}
                                    onChange={(e) => setImprovements(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                </div>

                {/* 2. Decision Sidebar */}
                <div className="xl:w-96 flex flex-col gap-8 shrink-0">
                    <div className="card-soft bg-slate-900 p-10 border-none text-white overflow-hidden relative group">
                        <div className="relative z-10 space-y-10">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Final Recommendation</h3>
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsOpen(!isOpen)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-left flex items-center justify-between hover:bg-white/10 transition-all active:scale-[0.98]"
                                    >
                                        {recommendation}
                                        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                            {['Hire Immediately', 'Strong Hire', 'Qualified', 'Waitlist', 'Do Not Hire'].map((opt) => (
                                                <button 
                                                    key={opt}
                                                    onClick={() => { setRecommendation(opt); setIsOpen(false); }}
                                                    className="w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-none"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={handleSubmit}
                                className="w-full py-5 bg-indigo-500 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 active:scale-95"
                            >
                                <Check size={18} />
                                Submit Feedback
                            </button>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    </div>

                    <div className="card-soft bg-white p-10 border-slate-100 shadow-soft">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6">Evaluation Policy</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            Ensure all feedback is constructive and aligned with the departmental skill matrix and global hiring protocols.
                        </p>
                    </div>

                    <button 
                        onClick={() => navigate('/recruitment/applications')}
                        className="w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 active:scale-95 mt-auto"
                    >
                        <Undo2 size={14} />
                        Cancel Assessment
                    </button>
                </div>

            </div>

            {/* Sticky Mobile Nav (Visible on Desktop footer style) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 px-10 py-4 rounded-[32px] shadow-2xl flex items-center gap-10 border border-white/10 shrink-0 z-40">
                {[
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/recruitment' },
                    { icon: Users, label: 'Candidates', path: '/recruitment/candidates' },
                    { icon: ChevronRight, label: 'Interviews', active: true },
                ].map((item, i) => (
                    <button 
                        key={i} 
                        onClick={() => item.path && navigate(item.path)}
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

export default InterviewFeedback;
