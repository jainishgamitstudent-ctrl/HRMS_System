import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Award, 
  GraduationCap, 
  MessageSquare, 
  CalendarPlus, 
  UserMinus, 
  Bookmark, 
  Share2, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCandidateProfile } from '../../../services/hrApi';

const CandidateProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [notification, setNotification] = useState(null);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const defaultCandidate = {
        name: 'Mark Wilson',
        role: 'Senior UI/UX Designer',
        status: 'SHORTLISTED',
        progress: 90,
        currentStage: 'TECHNICAL INTERVIEW STAGE',
        avatar: 'https://i.pravatar.cc/150?u=mark',
        contact: {
            email: 'mark.wilson@example.com',
            phone: '+1 (555) 012-3456',
            portfolio: 'wilson.designs.com'
        },
        summary: 'Senior UI/UX Designer with over 8 years of experience in creating user-centric digital products. Expert in building scalable design systems and leading cross-functional teams for high-growth SaaS companies.',
        experience: [
            { title: 'Senior UI Designer', company: 'TechFlow Systems', period: '2020 - Present' },
            { title: 'Product Designer', company: 'Brightly Creative', period: '2017 - 2020' }
        ],
        skills: ['Figma', 'Design Systems', 'React', 'UX Research', 'Leadership', 'Agile'],
        education: {
            degree: 'B.S. Interaction Design',
            school: 'University of Washington',
            period: '2013 - 2017'
        },
        appliedPosition: {
            title: 'Principal Product Designer',
            dept: 'Product & Engineering',
            appliedDate: 'Oct 12, 2023'
        }
    };

    const [candidate, setCandidate] = useState(defaultCandidate);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadCandidate = async () => {
            try {
                const res = await getCandidateProfile(id);
                const data = res.data?.data || {};

                const mapped = {
                    name: data.name || data.fullName || data.candidateName || defaultCandidate.name,
                    role: data.role || data.jobTitle || data.position || defaultCandidate.role,
                    status: (data.status || data.stage || defaultCandidate.status || '').toUpperCase(),
                    progress: Number(data.progress ?? data.pipelineProgress ?? defaultCandidate.progress),
                    currentStage: (data.currentStage || data.stage || defaultCandidate.currentStage || '').toUpperCase(),
                    avatar: data.avatar || data.profilePicture || defaultCandidate.avatar,
                    contact: {
                        email: data.email || data.contact?.email || defaultCandidate.contact.email,
                        phone: data.phone || data.contact?.phone || defaultCandidate.contact.phone,
                        portfolio: data.portfolio || data.contact?.portfolio || defaultCandidate.contact.portfolio
                    },
                    summary: data.summary || data.about || defaultCandidate.summary,
                    experience: Array.isArray(data.experience) ? data.experience : defaultCandidate.experience,
                    skills: Array.isArray(data.skills) ? data.skills : defaultCandidate.skills,
                    education: data.education || defaultCandidate.education,
                    appliedPosition: {
                        title: data.appliedPosition?.title || data.position || defaultCandidate.appliedPosition.title,
                        dept: data.appliedPosition?.dept || data.department || defaultCandidate.appliedPosition.dept,
                        appliedDate: data.appliedPosition?.appliedDate || data.appliedAt || defaultCandidate.appliedPosition.appliedDate
                    }
                };

                if (isMounted) {
                    setCandidate(mapped);
                }
            } catch (err) {
                // debug error removed
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadCandidate();

        return () => {
            isMounted = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-120px)] w-full text-slate-400 text-xs font-black uppercase tracking-widest">
                Loading candidate profile...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden text-left">
            
            {/* Notification */}
            {notification && (
                <div className="fixed top-24 right-8 z-100 animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10">
                    <CheckCircle2 size={20} className="text-primary-400" />
                    <span className="text-sm font-black uppercase tracking-widest leading-none">{notification}</span>
                </div>
            )}

            {/* Header Actions */}
            <div className="flex items-center justify-between shrink-0">
                <button 
                    onClick={() => navigate('/recruitment/applications')}
                    className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 text-slate-400 font-black text-[10px] uppercase rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Applications
                </button>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl transition-all shadow-sm active:scale-95">
                        <Share2 size={18} />
                    </button>
                    <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl transition-all shadow-sm active:scale-95">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex-1 flex flex-col xl:flex-row gap-8 min-h-0 overflow-hidden">
                
                {/* 1. Profile Sidebar */}
                <div className="xl:w-[400px] flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10 shrink-0">
                    
                    {/* Identity Card */}
                    <div className="card-soft bg-white p-10 border-slate-100 shadow-soft text-center group">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <img src={candidate.avatar} className="w-full h-full rounded-[40px] object-cover shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-500" alt="" />
                            <div className="absolute -bottom-2 right-0 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                                <CheckCircle2 size={14} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2 uppercase">{candidate.name}</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">{candidate.role}</p>
                        <span className="px-5 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl uppercase tracking-[0.2em]">{candidate.status}</span>
                    </div>

                    {/* Progress Widget */}
                    <div className="card-soft bg-slate-900 p-10 border-none text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <TrendingUp size={14} className="text-indigo-400" />
                                Recruitment Progress
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{candidate.currentStage}</p>
                                        <p className="text-xl font-black">{candidate.progress}%</p>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full animate-in slide-in-from-left duration-1000 shadow-glow shadow-indigo-500/50" style={{ width: `${candidate.progress}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map(s => (
                                        <div key={s} className={`flex-1 h-1 rounded-full ${s <= 3 ? 'bg-indigo-500' : 'bg-white/10'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                    </div>

                    {/* Contact Info */}
                    <div className="card-soft bg-white p-10 border-slate-100 shadow-soft space-y-8">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Contact Information</h3>
                        <div className="space-y-6">
                            {[
                                { icon: Mail, label: 'Email', value: candidate.contact.email, color: 'text-primary-500' },
                                { icon: Phone, label: 'Phone', value: candidate.contact.phone, color: 'text-emerald-500' },
                                { icon: Globe, label: 'Portfolio', value: candidate.contact.portfolio, color: 'text-indigo-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => showNotification(`Opening ${item.label}...`)}>
                                    <div className={`p-3 bg-slate-50 rounded-2xl ${item.color} group-hover:bg-white group-hover:shadow-soft transition-all`}><item.icon size={16} /></div>
                                    <div className="text-left">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-tight break-all">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* 2. Professional Details Workspace */}
                <div className="flex-1 flex flex-col gap-8 overflow-y-auto no-scrollbar pb-32">
                    
                    {/* Professional Summary */}
                    <div className="card-soft bg-white p-12 border-slate-100 shadow-soft relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Award size={16} className="text-primary-500" />
                                Professional Summary
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed uppercase tracking-wider">
                                {candidate.summary}
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                            <Briefcase size={200} />
                        </div>
                    </div>

                    {/* Dashboard Detail Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Applied For */}
                        <div className="card-soft bg-slate-50/50 p-10 border-slate-100 border shadow-sm">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-8">Applied Position</h3>
                            <div className="flex items-start gap-5">
                                <div className="p-5 bg-white rounded-[24px] shadow-soft text-primary-600">
                                    <ShieldCheck size={32} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2 uppercase">{candidate.appliedPosition.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4 leading-none">{candidate.appliedPosition.dept}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 w-fit px-3 py-1 rounded-lg">
                                        <Calendar size={12} />
                                        Applied {candidate.appliedPosition.appliedDate}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Experience Highlights */}
                        <div className="card-soft bg-white p-10 border-slate-100 shadow-soft">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-8">Experience Highlights</h3>
                            <div className="space-y-8 relative">
                                <div className="absolute left-[23px] top-2 bottom-2 w-px bg-slate-100 border-l border-dashed border-slate-200"></div>
                                {candidate.experience.map((exp, i) => (
                                    <div key={i} className="flex items-center gap-6 relative">
                                        <div className="w-12 h-12 bg-white border border-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-soft shrink-0 z-10">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{exp.title}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{exp.company} • {exp.period}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Skill Tags & Education */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="card-soft bg-white p-10 border-slate-100 shadow-soft">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-8">Skills Matrix</h3>
                            <div className="flex flex-wrap gap-3">
                                {candidate.skills.map(skill => (
                                    <span key={skill} className="px-5 py-2.5 bg-slate-50 text-slate-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                         </div>
                         <div className="card-soft bg-white p-10 border-slate-100 shadow-soft flex items-center gap-8">
                             <div className="p-6 bg-slate-900 text-white rounded-[32px] shadow-2xl">
                                <GraduationCap size={40} />
                             </div>
                             <div>
                                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2">Education Background</h3>
                                <h4 className="text-sm font-black text-primary-600 uppercase tracking-tight mb-1">{candidate.education.degree}</h4>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{candidate.education.school} • {candidate.education.period}</p>
                             </div>
                         </div>
                    </div>

                </div>

            </div>

            {/* Action Footer Bar */}
            <div className="absolute bottom-6 left-0 right-0 px-10 shrink-0 pointer-events-none">
                <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border border-white p-4 rounded-[40px] shadow-2xl flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-2 pl-4">
                        <button 
                            onClick={() => navigate('/recruitment/interviews')}
                            className="px-10 py-5 bg-indigo-600 text-white font-black rounded-[24px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-[11px] flex items-center gap-3 active:scale-95"
                        >
                            <CalendarPlus size={18} />
                            Schedule Interview
                        </button>
                    </div>
                    <div className="flex items-center gap-3 pr-2">
                         <button 
                            onClick={() => showNotification("Channeling secure message node...")}
                            className="px-8 py-5 bg-slate-100 text-slate-600 font-black rounded-[24px] hover:bg-slate-200 transition-all uppercase tracking-widest text-[11px] flex items-center gap-3 active:scale-95"
                         >
                            <MessageSquare size={18} />
                            Message
                         </button>
                         <button 
                            onClick={() => showNotification("Initiating rejection protocol...")}
                            className="p-5 bg-rose-50 text-rose-600 border border-rose-100 rounded-[24px] hover:bg-rose-100 transition-all active:scale-95"
                         >
                            <UserMinus size={20} />
                         </button>
                         <button 
                            onClick={() => showNotification("Saved to talent reserve.")}
                            className="p-5 bg-slate-900 text-white rounded-[24px] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                         >
                            <Bookmark size={20} />
                         </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CandidateProfile;
