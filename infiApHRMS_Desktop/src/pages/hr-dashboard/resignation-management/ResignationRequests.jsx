import React, { useState, useEffect } from 'react';
import { 
  Undo2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  X,
  Eye, 
  ChevronRight,
  ShieldAlert,
  Clock,
  Briefcase,
  AlertCircle,
  FileSignature,
  Calendar,
  Mail,
  User,
  MessageSquare,
  ArrowRightCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getResignationRegister, updateExitProcess, redirectResignationToAdmin } from '../../../services/hrApi';

const ResignationRequests = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const baseRoute = role === 'HR' ? '' : '/admin';
    const isHR = role === 'HR';
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState(null);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const formatDate = (value) => {
        if (!value) return 'N/A';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getPayloadArray = (response) => {
        const payload = response?.data?.data ?? response?.data ?? [];
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload.requests)) return payload.requests;
        if (Array.isArray(payload.resignations)) return payload.resignations;
        return [];
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getResignationRegister();
            const data = getPayloadArray(res);
            const formatted = data.map(req => ({
                id: req._id || req.id,
                name: req.employeeName || req.userId?.name || req.name || 'Unknown',
                email: req.employeeEmail || req.userId?.email || '—',
                employeeId: req.employeeId || req.userId?.employeeId || '—',
                dept: req.department || req.userId?.department || req.dept || 'General',
                role: req.designation || req.role || 'Employee',
                reason: req.reason || 'No reason provided',
                noticeDate: formatDate(req.createdAt),
                lastDay: formatDate(req.lastWorkingDate),
                noticePeriodDays: req.noticePeriodDays || 30,
                originalStatus: req.status,
                status: req.redirectedToAdmin ? 'Redirected to Admin' : (req.status || 'Submitted'),
                risk: req.riskLevel || 'Low',
                actionedBy: req.actionedBy || null,
                processedAt: req.processedAt || null,
                managerRemarks: req.managerRemarks || null,
                redirectedToAdmin: req.redirectedToAdmin || false,
                profileImage: req.userId?.profileImage || req.profileImage || null,
                redirectedByName: req.redirectedBy?.name || null
            }));
            setRequests(formatted);
        } catch (err) {
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

    const isFinalized = (status) => ['Approved', 'Rejected'].includes(status);

    const handleAction = async (id, action) => {
        const req = requests.find(r => r.id === id);
        if (req && isFinalized(req.status)) {
            showNotification(`This resignation has already been ${req.status.toLowerCase()}.`);
            return;
        }
        try {
            await updateExitProcess({ resignationId: id, status: action });
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
            showNotification(`${action} resignation protocol for ${id}...`);
            setTimeout(() => {
                navigate(`${baseRoute}/resignation`);
            }, 1500);
        } catch (err) {
            showNotification(`Failed to update: ${id}`);
        }
    };

    const handleRedirectToAdmin = async (id) => {
        try {
            await redirectResignationToAdmin({ resignationId: id });
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Redirected to Admin', redirectedToAdmin: true } : r));
            showNotification(`Resignation ${id} redirected to admin successfully.`);
        } catch (err) {
            showNotification(`Failed to redirect resignation ${id}.`);
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
                    { label: 'Submitted', value: String(requests.filter(r => r.originalStatus === 'Submitted' && !r.redirectedToAdmin).length).padStart(2,'0'), color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Approved', value: String(requests.filter(r => r.originalStatus === 'Approved').length).padStart(2,'0'), color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Rejected', value: String(requests.filter(r => r.originalStatus === 'Rejected').length).padStart(2,'0'), color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Redirected', value: String(requests.filter(r => r.redirectedToAdmin).length).padStart(2,'0'), color: 'text-amber-500', bg: 'bg-amber-50' },
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
                {!selectedRequest && (
                <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 xl:grid-cols-2 gap-8 no-scrollbar text-left">
                    {loading && (
                        <div className="col-span-full flex items-center justify-center py-20 text-slate-400 text-xs font-black uppercase tracking-widest">
                            <Clock size={20} className="animate-spin mr-3" /> Loading requests...
                        </div>
                    )}
                    {!loading && requests.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                            <Briefcase size={40} className="mb-4 opacity-30" />
                            <p className="text-xs font-black uppercase tracking-widest">No resignation requests found</p>
                        </div>
                    )}
                    {requests.filter(req => {
                        const q = searchQuery.trim().toLowerCase();
                        if (!q) return true;
                        return (
                            req.name.toLowerCase().includes(q) ||
                            req.dept.toLowerCase().includes(q) ||
                            req.role.toLowerCase().includes(q) ||
                            req.status.toLowerCase().includes(q)
                        );
                    }).map((req) => {
                        const statusStyle =
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            req.status === 'Under Review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            req.status === 'Redirected to Admin' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-slate-50 text-slate-600 border-slate-100';
                        return (
                            <div
                                key={req.id}
                                onClick={() => setSelectedRequest(req)}
                                className="card-soft bg-white p-8 border border-slate-100 hover:border-primary-200 shadow-soft hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer text-left relative overflow-hidden"
                            >
                                {/* Top accent line by status */}
                                <div className={`absolute top-0 left-0 right-0 h-1 ${
                                    req.status === 'Approved' ? 'bg-emerald-400' :
                                    req.status === 'Rejected' ? 'bg-rose-400' :
                                    req.status === 'Under Review' ? 'bg-amber-400' :
                                    req.status === 'Redirected to Admin' ? 'bg-amber-400' :
                                    'bg-slate-300'
                                }`} />

                                <div className="flex items-center justify-between mb-6 text-left">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-14 h-14 rounded-[20px] bg-slate-900 text-white flex items-center justify-center text-[11px] font-black group-hover:scale-110 transition-transform text-left overflow-hidden">
                                            {req.profileImage ? (
                                                <img src={req.profileImage} alt={req.name} className="w-full h-full object-cover" />
                                            ) : (
                                                req.name.split(' ').map(n => n[0]).join('')
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] text-primary-600 font-black uppercase tracking-[0.2em] mb-1 text-left">{req.employeeId}</p>
                                            <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none text-left">{req.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 text-left">{req.role} • {req.dept}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${statusStyle}`}>
                                            {req.status}
                                        </span>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                            req.risk === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            req.risk === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            Risk: {req.risk}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-5 rounded-[24px] border border-slate-50 mb-6 text-left">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-left">Notice Date</p>
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-tight text-left">
                                            <Clock size={14} className="text-slate-300" />
                                            {req.noticeDate}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-left">Last Working Day</p>
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-tight text-left">
                                            <Calendar size={14} className="text-primary-400" />
                                            {req.lastDay}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center gap-3 text-left">
                                    {(!req.redirectedToAdmin || !isHR) && !isFinalized(req.originalStatus) && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'Approved'); }}
                                                className="flex-1 py-3.5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px] active:scale-95 text-center"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'Rejected'); }}
                                                className="flex-1 py-3.5 bg-white border border-rose-100 text-rose-600 font-black rounded-2xl hover:bg-rose-50 transition-all uppercase tracking-widest text-[10px] active:scale-95 text-center"
                                            >
                                                Reject
                                            </button>
                                            {isHR && !req.redirectedToAdmin && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRedirectToAdmin(req.id); }}
                                                    className="p-3.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-2xl transition-all hover:scale-110 active:scale-95 text-center border border-amber-100"
                                                    title="Redirect to Admin"
                                                >
                                                    <ArrowRightCircle size={20} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {isFinalized(req.originalStatus) && (
                                        <div className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 font-black rounded-2xl uppercase tracking-widest text-[10px] text-center border ${req.originalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                            {req.actionedBy && (
                                                <span className={`text-[9px] font-black tracking-widest normal-case ${req.originalStatus === 'Approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {req.originalStatus} by: {req.actionedBy}
                                                    {req.processedAt && ` • ${new Date(req.processedAt).toLocaleDateString()}`}
                                                </span>
                                            )}
                                            <span>{req.originalStatus}</span>
                                        </div>
                                    )}
                                    {req.redirectedToAdmin && !isFinalized(req.originalStatus) && (
                                        <div className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 bg-amber-50 text-amber-700 font-black rounded-2xl uppercase tracking-widest text-[10px] text-center border border-amber-200">
                                            <span>Redirected to Admin</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }}
                                        className="p-3.5 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-2xl transition-all hover:scale-110 active:scale-95 text-center"
                                    >
                                        <Eye size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                )}

                {/* Footer Portal */}
                <div className="px-10 py-6 bg-slate-900 border-t border-white/5 flex items-center justify-between text-white shrink-0 text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-left">Synchronization Status: Live Repository Node 42</p>
                    <button onClick={fetchRequests} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left">Refresh Queue</button>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedRequest(null)} />
                    <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-left">

                        {/* Modal Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-[20px] bg-slate-900 text-white flex items-center justify-center text-[11px] font-black overflow-hidden">
                                    {selectedRequest.profileImage ? (
                                        <img src={selectedRequest.profileImage} alt={selectedRequest.name} className="w-full h-full object-cover" />
                                    ) : (
                                        selectedRequest.name.split(' ').map(n => n[0]).join('')
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                            selectedRequest.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            selectedRequest.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            selectedRequest.status === 'Under Review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            selectedRequest.status === 'Redirected to Admin' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-slate-50 text-slate-600 border-slate-100'
                                        }`}>
                                            {selectedRequest.status}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                            selectedRequest.risk === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            selectedRequest.risk === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            Risk: {selectedRequest.risk}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">{selectedRequest.name}</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedRequest.role} • {selectedRequest.dept}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto space-y-6">
                            {/* Previous Approval/Rejection Banner */}
                            {isFinalized(selectedRequest.originalStatus) && selectedRequest.actionedBy && (
                                <div className={`p-5 rounded-2xl border ${selectedRequest.originalStatus === 'Approved' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedRequest.originalStatus === 'Approved' ? 'text-emerald-400' : 'text-rose-400'}`}>Processed</p>
                                    <p className="text-sm font-bold text-slate-700">{selectedRequest.originalStatus} by: {selectedRequest.actionedBy}</p>
                                    {selectedRequest.processedAt && (
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{new Date(selectedRequest.processedAt).toLocaleString()}</p>
                                    )}
                                    {selectedRequest.redirectedToAdmin && (
                                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-2">Redirected to Admin for Re-approval</p>
                                    )}
                                </div>
                            )}
                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Employee ID</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                        <User size={14} className="text-slate-300" />
                                        {selectedRequest.employeeId}
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                        <Mail size={14} className="text-slate-300" />
                                        {selectedRequest.email}
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Notice Date</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                        <Clock size={14} className="text-slate-300" />
                                        {selectedRequest.noticeDate}
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Working Day</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                        <Calendar size={14} className="text-primary-400" />
                                        {selectedRequest.lastDay}
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Notice Period</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                        <FileSignature size={14} className="text-slate-300" />
                                        {selectedRequest.noticePeriodDays} Days
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Resignation ID</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                        <ShieldAlert size={14} className="text-slate-300" />
                                        <span className="truncate">{selectedRequest.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Resignation</p>
                                <div className="flex items-start gap-2">
                                    <MessageSquare size={14} className="text-slate-300 mt-0.5 shrink-0" />
                                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedRequest.reason}</p>
                                </div>
                            </div>

                            {/* Redirected By */}
                            {selectedRequest.redirectedByName && (
                                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">Redirected By</p>
                                    <p className="text-sm font-bold text-slate-700">{selectedRequest.redirectedByName}</p>
                                </div>
                            )}

                            {/* Manager Remarks */}
                            {selectedRequest.managerRemarks && (
                                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">Manager Remarks</p>
                                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedRequest.managerRemarks}</p>
                                </div>
                            )}

                            {/* Actioned By */}
                            {selectedRequest.actionedBy && (
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Actioned By</p>
                                    <p className="text-sm font-bold text-slate-700">{selectedRequest.actionedBy}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
                            >
                                Close
                            </button>
                            {(!selectedRequest.redirectedToAdmin || !isHR) && !isFinalized(selectedRequest.originalStatus) && (
                                <>
                                    {isHR && !selectedRequest.redirectedToAdmin && (
                                        <button
                                            onClick={() => handleRedirectToAdmin(selectedRequest.id)}
                                            className="px-8 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md active:scale-95 flex items-center gap-2"
                                        >
                                            <ArrowRightCircle size={16} />
                                            Redirect to Admin
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleAction(selectedRequest.id, 'Rejected')}
                                        className="px-8 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md active:scale-95"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(selectedRequest.id, 'Approved')}
                                        className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md active:scale-95"
                                    >
                                        Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};


export default ResignationRequests;
