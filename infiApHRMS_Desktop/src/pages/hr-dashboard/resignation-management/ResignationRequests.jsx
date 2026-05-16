import React, { useState, useEffect } from 'react';
import { 
  Undo2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  ChevronRight,
  ShieldAlert,
  Clock,
  Briefcase,
  AlertCircle,
  FileSignature,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getResignationRegister, updateExitProcess } from '../../../services/hrApi';

const ResignationRequests = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const baseRoute = role === 'HR' ? '' : '/admin';
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState(null);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getResignationRegister();
            const data = res.data?.data || [];
            const formatted = data.map(req => ({
                id: req._id || req.id,
                name: req.employee?.name || req.name || 'Unknown',
                dept: req.employee?.department || req.dept || 'General',
                role: req.employee?.role || req.role || 'Employee',
                noticeDate: req.noticeDate?.slice(0, 10) || 'N/A',
                lastDay: req.lastWorkingDay?.slice(0, 10) || 'N/A',
                status: req.status || 'Pending',
                risk: req.riskLevel || 'Low'
            }));
            setRequests(formatted);
        } catch (err) {
            // debug error removed
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAction = async (id, action) => {
        try {
            await updateExitProcess({ id, status: action });
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
            showNotification(`${action} resignation protocol for ${id}...`);
            
            // Wait for notification to be visible, then navigate back
            setTimeout(() => {
                navigate(`${baseRoute}/resignation`);
            }, 1500);
        } catch (err) {
            showNotification(`Failed to update: ${id}`);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 text-left pb-20">
            
            {/* Notification */}
            {notification && (
                <div className="fixed top-24 right-8 z-100 animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 text-left">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <span className="text-sm font-black uppercase tracking-widest text-left">{notification}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 text-left">
                <div className="flex items-center gap-6 text-left">
                    <button 
                        onClick={() => navigate(`${baseRoute}/resignation`)}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1 active:scale-95 text-left"
                    >
                        <Undo2 size={20} />
                    </button>
                    <div className="text-left">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2 text-left underline decoration-primary-300 underline-offset-8">Resignation Requests</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4 text-left">Queue Management & Compliance Verification Portal</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 text-left">
                    <div className="flex items-center gap-2 px-6 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-left">
                        <ShieldAlert size={18} className="text-rose-500" />
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest text-left">3 Critical Nodes Identified</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                {[
                    { label: 'Pending', value: String(requests.filter(r => r.status === 'Pending').length).padStart(2,'0'), color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Approved', value: String(requests.filter(r => r.status === 'Approved').length).padStart(2,'0'), color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Under Review', value: String(requests.filter(r => r.status === 'Under Review').length).padStart(2,'0'), color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Total', value: String(requests.length).padStart(2,'0'), color: 'text-primary-500', bg: 'bg-primary-50' },
                ].map((stat, i) => (
                    <div key={i} className={`card-soft p-10 flex flex-col items-center justify-center text-center ${stat.bg} border-none shadow-none text-left`}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-left opacity-60 text-slate-800">{stat.label}</p>
                        <p className={`text-5xl font-black tracking-tighter text-left ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Request Hub */}
            <div className="flex-1 bg-white border border-slate-100 rounded-[44px] shadow-soft overflow-hidden flex flex-col min-h-[600px] text-left">
                
                {/* Toolbar */}
                <div className="px-10 py-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/20 text-left">
                    <div className="text-left">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest text-left">Active Request Queue</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">Reviewing current exit notifications</p>
                    </div>
                    <div className="flex items-center gap-4 text-left">
                        <div className="relative group lg:w-72 text-left">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                type="text" 
                                placeholder="Search repository..." 
                                className="w-full bg-white border border-slate-100 outline-none rounded-2xl pl-12 pr-4 py-3 text-xs font-black text-slate-600 transition-all shadow-sm uppercase tracking-tight text-left"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-slate-800 shadow-sm transition-all text-left">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Card Repository */}
                <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 xl:grid-cols-2 gap-8 no-scrollbar text-left">
                    {requests.map((req) => (
                        <div key={req.id} className="card-soft bg-white p-10 border-slate-100 hover:border-primary-100 shadow-soft transition-all group flex flex-col text-left">
                            <div className="flex items-center justify-between mb-10 text-left">
                                <div className="flex items-center gap-5 text-left">
                                    <div className="w-16 h-16 rounded-[24px] bg-slate-900 text-white flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform text-left">
                                        {req.name.split(' ').map(n=>n[0]).join('')}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] text-primary-600 font-black uppercase tracking-[0.2em] mb-1 text-left">{req.id}</p>
                                        <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none text-left">{req.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 text-left">{req.role} • {req.dept}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                        req.risk === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                        req.risk === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>Risk: {req.risk}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[28px] border border-slate-50 mb-10 text-left">
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-left">Notice Date</p>
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-tight text-left">
                                        <Clock size={14} className="text-slate-300" />
                                        {req.noticeDate}
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-left">Last Working Day</p>
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-tight text-left">
                                        <Calendar size={14} className="text-primary-400" />
                                        {req.lastDay}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center gap-4 text-left">
                                <button 
                                    onClick={() => handleAction(req.id, 'Approved')}
                                    className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest text-[10px] active:scale-95 text-center"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleAction(req.id, 'Rejected')}
                                    className="flex-1 py-4 bg-white border border-rose-100 text-rose-600 font-black rounded-2xl hover:bg-rose-50 transition-all uppercase tracking-widest text-[10px] active:scale-95 text-center"
                                >
                                    Reject
                                </button>
                                <button className="p-4 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-2xl transition-all hover:scale-110 active:scale-95 text-center">
                                    <Eye size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Portal */}
                <div className="px-10 py-6 bg-slate-900 border-t border-white/5 flex items-center justify-between text-white shrink-0 text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-left">Synchronization Status: Live Repository Node 42</p>
                    <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left">Refresh Queue</button>
                </div>
            </div>

        </div>
    );
};

export default ResignationRequests;
