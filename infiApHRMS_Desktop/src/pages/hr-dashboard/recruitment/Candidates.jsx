import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Download, 
  MoreHorizontal, 
  User, 
  Mail, 
  TrendingUp, 
  Briefcase, 
  Calendar, 
  Star,
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCandidateTracking, shortlistCandidate } from '../../../services/hrApi';
import AddCandidateModal from './AddCandidateModal';

const Candidates = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const loadCandidates = async () => {
        setLoading(true);
        try {
            const res = await getCandidateTracking();
            const payload = Array.isArray(res.data?.data) ? res.data.data : [];
            const mapped = payload.map((item, index) => ({
                id: item.id || item.candidateId || item._id || item.code || `CAN-${index + 1}`,
                name: item.applicantName || item.name || 'Anonymous',
                role: item.jobTitle || 'Role Pending',
                experience: `${item.yearsOfExperience || 0} YRS`,
                stage: item.status || 'Applied',
                rating: item.rating || 0,
                source: item.source || 'Direct',
                avatar: item.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.applicantName || 'C')}&background=random`
            }));
            setCandidates(mapped);
        } catch (err) {
            console.error("Failed to load candidates:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCandidates();
    }, []);

    const handleShortlist = async (id) => {
        try {
            await shortlistCandidate(id);
            setCandidates(prev => prev.map(c => c.id === id ? { ...c, stage: 'Shortlisted' } : c));
            showNotification("Candidate Shortlisted");
        } catch (err) {
            showNotification("Failed to shortlist candidate");
        }
    };

    const filteredCandidates = candidates.filter(can => {
        const matchesSearch = can.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            can.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' || can.stage === activeTab;
        return matchesSearch && matchesTab;
    });


    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden text-left">
            
            {notification && (
                <div className="fixed top-4 right-4 z-[201] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                    {notification}
                </div>
            )}

            <AddCandidateModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onRefresh={loadCandidates} 
            />

            {/* Header / Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Candidate Directory</h1>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            <Users size={12} />
                            {candidates.length} Global Profiles
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            <Clock size={12} />
                            24 New This Week
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] active:scale-95 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Ingest Candidate
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-10 py-6 bg-white border border-slate-100 rounded-[32px] shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-8">
                    {['All', 'Applied', 'Shortlisted', 'Technical Interview', 'Selected'].map(tab => (
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
                            placeholder="Find profile..."
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

            {/* Table Area */}
            <div className="flex-1 bg-white border border-slate-100 rounded-[40px] shadow-soft overflow-hidden flex flex-col">
                
                {/* Table */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Pipeline...</p>
                        </div>
                    ) : filteredCandidates.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-6 p-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[32px] flex items-center justify-center">
                                <Users size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">No Profiles Found</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto">The pipeline is currently clear. Add a candidate or adjust your filters to view talent nodes.</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                            >
                                Ingest First Candidate
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Profile</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied Role</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Stage</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acq. Source</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Node Logic</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCandidates.map((c) => (
                                    <tr key={c.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img src={c.avatar} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{c.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.id} • {c.experience}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={14} className="text-indigo-400" />
                                                <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{c.role}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-4 py-1.5 text-[9px] font-black rounded-xl uppercase tracking-widest border ${
                                                c.stage === 'Selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                c.stage === 'Technical Interview' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                                c.stage === 'Shortlisted' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                                {c.stage}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Star size={12} className="text-orange-400 fill-orange-400" />
                                                    <span className="text-[11px] font-black text-slate-800">{c.rating}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{c.source}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShortlist(c.id);
                                                    }}
                                                    title="Shortlist Candidate"
                                                    disabled={c.stage !== 'Applied'}
                                                    className={`p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm active:scale-95 disabled:opacity-30`}
                                                >
                                                    <ArrowUpRight size={18} />
                                                </button>
                                                <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-xl shadow-sm active:scale-95">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Logic */}
                <div className="px-10 py-5 bg-slate-900 border-t border-white/5 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow shadow-emerald-500/50"></div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Recruit Pipeline Synchronized: 100% Secure</p>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Database Version: tal.v4.0.2</p>
                </div>

            </div>

        </div>
    );
};

export default Candidates;
