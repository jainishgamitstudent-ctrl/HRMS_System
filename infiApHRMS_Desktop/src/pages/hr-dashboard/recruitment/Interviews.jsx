import React, { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    ArrowRight,
    User,
    MapPin,
    Briefcase,
    ChevronRight,
    Undo2,
    Video,
    Users,
    MessageSquare,
    LayoutDashboard,
    ClipboardList,
    Settings,
    Mail,
    Zap,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCandidateTracking } from '../../../services/hrApi';

const deriveInterviewStatus = (item) => {
    const tStatus = item.technicalInterview?.status;
    if (tStatus === 'Pending') return 'Upcoming';
    if (tStatus === 'Passed' || tStatus === 'Failed') return 'Completed';
    const cStatus = item.status;
    if (cStatus === 'Technical Interview') return 'Upcoming';
    if (cStatus === 'Selected' || cStatus === 'Hired' || cStatus === 'Rejected') return 'Completed';
    return 'Upcoming';
};

const mapInterviewType = (mode) => {
    if (mode === 'Online') return 'Video Call';
    if (mode === 'Offline') return 'On-site';
    if (mode === 'Phone') return 'Phone Call';
    return 'Video Call';
};

const Interviews = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [viewMode, setViewMode] = useState('List');
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);

    const [interviews, setInterviews] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const loadInterviews = async () => {
            try {
                const res = await getCandidateTracking();
                const payload = Array.isArray(res.data?.data) ? res.data.data : [];
                const mapped = payload.map((item, index) => {
                    const schedule = item.technicalInterview || {};
                    const dateVal = schedule.date || item.interviewDate;
                    const timeVal = schedule.time || '';
                    let dateTimeStr;
                    if (dateVal) {
                        const d = new Date(dateVal);
                        if (!isNaN(d.getTime())) {
                            const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            dateTimeStr = timeVal ? `${datePart} • ${timeVal}` : datePart;
                        } else {
                            dateTimeStr = timeVal ? `${String(dateVal)} • ${timeVal}` : String(dateVal);
                        }
                    } else {
                        dateTimeStr = timeVal || '—';
                    }
                    return {
                        id: item._id ? String(item._id) : `INT-${index + 1}`,
                        candidateId: item._id ? String(item._id) : `CAN-${index + 1}`,
                        candidate: item.applicantName || item.name || item.fullName || item.candidateName || `Candidate ${index + 1}`,
                        role: item.jobTitle || item.role || item.position || 'Role Pending',
                        stage: schedule.stage || item.stage || item.status || 'Interview',
                        dateTime: dateTimeStr,
                        interviewer: schedule.interviewer || schedule.interviewerName || item.interviewer || '—',
                        type: mapInterviewType(schedule.mode),
                        status: deriveInterviewStatus(item),
                        avatar: item.profileImage || item.avatar || item.profilePicture || null,
                        meetLink: schedule.meetingLink || '',
                        location: schedule.venue || '',
                        phoneNumber: schedule.phoneNumber || '',
                        assignedHRs: schedule.assignedHRs || []
                    };
                });

                if (isMounted) {
                    setInterviews(mapped);
                }
            } catch (err) {
                console.error('Failed to load interviews:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadInterviews();

        return () => {
            isMounted = false;
        };
    }, []);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredInterviews = interviews.filter(int => {
        const matchesSearch = int.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
            int.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' || int.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const upcomingCount = interviews.filter(i => i.status === 'Upcoming').length;
    const completedCount = interviews.filter(i => i.status === 'Completed').length;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden text-left">

            {/* Notification */}
            {notification && (
                <div className="fixed top-24 right-8 z-100 animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10">
                    <Zap size={20} className="text-primary-400" />
                    <span className="text-sm font-black uppercase tracking-widest">{notification}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/recruitment')}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1 active:scale-95"
                    >
                        <Undo2 size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Interview Pipeline</h1>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                <CalendarIcon size={12} />
                                {upcomingCount} Upcoming
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                <Clock size={12} />
                                {completedCount} Completed
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/recruitment/interviews/schedule')}
                        className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] active:scale-95 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Schedule Interview
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-10 py-6 bg-white border border-slate-100 rounded-[32px] shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-8">
                    {['Upcoming', 'Completed', 'All'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${activeTab === tab ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-800'}`}
                        >
                            {tab}
                            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full animate-in zoom-in-y"></div>}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative group max-w-sm w-full lg:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find candidate..."
                            className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-100 outline-none rounded-2xl pl-12 pr-4 py-3 text-xs font-black text-slate-600 transition-all shadow-sm uppercase tracking-tight"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-3 bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm active:scale-95">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Interviews Workspace */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 size={32} className="text-indigo-600 animate-spin" />
                    </div>
                )}
                {!loading && filteredInterviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <CalendarIcon size={48} className="mb-4 text-slate-300" />
                        <p className="text-sm font-black uppercase tracking-widest">No interviews found</p>
                    </div>
                )}
                {!loading && (
                <div className="grid grid-cols-1 gap-4">
                    {filteredInterviews.map((int) => (
                        <div key={int.id} className="card-soft bg-white p-6 border-slate-100 shadow-soft hover:shadow-xl transition-all group relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="relative">
                                    {int.avatar ? (
                                        <img src={int.avatar} className="w-14 h-14 rounded-[20px] object-cover shadow-lg border-2 border-white group-hover:scale-105 transition-transform" alt="" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-[20px] bg-slate-100 border-2 border-white flex items-center justify-center shadow-lg">
                                            <User size={24} className="text-slate-400" />
                                        </div>
                                    )}
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${int.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'} border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white`}>
                                        {int.status === 'Completed' ? <CheckCircle2 size={10} /> : <CalendarIcon size={10} />}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1 uppercase group-hover:text-indigo-600 transition-colors">{int.candidate}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{int.role}</p>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Interview Stage</p>
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={12} className="text-indigo-500" />
                                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{int.stage}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Date & Time</p>
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-emerald-500" />
                                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{int.dateTime}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 lg:items-end">
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Interviewer</p>
                                    <div className="flex items-center gap-2">
                                        <User size={12} className="text-orange-500" />
                                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{int.interviewer}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 relative z-10 shrink-0">
                                {int.status === 'Completed' ? (
                                    <button
                                        onClick={() => navigate(`/recruitment/interview/${int.candidateId || int.id}/feedback`)}
                                        className="px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 font-black rounded-xl hover:bg-emerald-100 transition-all uppercase tracking-widest text-[9px] flex items-center gap-2 active:scale-95"
                                    >
                                        <MessageSquare size={14} />
                                        View Feedback
                                    </button>
                                ) : (
                                    <>
                                        {int.type === 'Video Call' && int.meetLink ? (
                                            <button
                                                onClick={() => window.open(int.meetLink, '_blank')}
                                                className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-[9px] flex items-center gap-2 active:scale-95"
                                            >
                                                <Video size={14} />
                                                Join Link
                                            </button>
                                        ) : int.type === 'Phone Call' && int.phoneNumber ? (
                                            <button
                                                onClick={() => window.location.href = `tel:${int.phoneNumber}`}
                                                className="px-6 py-3 bg-orange-50 text-orange-600 border border-orange-100 font-black rounded-xl hover:bg-orange-100 transition-all uppercase tracking-widest text-[9px] flex items-center gap-2 active:scale-95"
                                            >
                                                <Phone size={14} />
                                                Call
                                            </button>
                                        ) : (
                                            <div className="px-6 py-3 bg-slate-50 text-slate-400 border border-slate-100 font-black rounded-xl uppercase tracking-widest text-[9px] flex items-center gap-2 cursor-default">
                                                <MapPin size={14} />
                                                {int.location || 'On-Site'}
                                            </div>
                                        )}
                                        <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-all active:scale-95 shadow-sm"><MoreHorizontal size={18} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                )}
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

export default Interviews;
