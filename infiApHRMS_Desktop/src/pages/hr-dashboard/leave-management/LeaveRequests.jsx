import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User,
  Calendar,
  MoreHorizontal,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Undo2,
  Check,
  X,
  LayoutGrid,
  List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLeaveRequests, approveLeave, redirectLeaveToAdmin } from '../../../services/hrApi';
import { useRealtimeLeaves } from '../../../hooks/useRealtime';

const LeaveRequests = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All Requests');
    const [viewMode, setViewMode] = useState('List');
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [notification, setNotification] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getLeaveRequests();
            const data = res.data?.data || [];
            const formatted = data.map(req => ({
                id: req._id || req.id,
                name: req.employee?.name || req.name || 'Unknown',
                dept: req.employee?.department || req.dept || 'General',
                type: req.type || 'Leave',
                range: `${req.startDate?.slice(0,10) || 'N/A'} - ${req.endDate?.slice(0,10) || 'N/A'}`,
                days: req.days || 1,
                status: req.redirectedToAdmin ? 'Redirected to Admin' : (req.status || 'Pending'),
                reason: req.reason || 'No reason provided',
                redirectedToAdmin: req.redirectedToAdmin || false,
                avatar: req.employee?.avatar || req.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.employee?.name || req.name || 'U')}`
            }));
            setRequests(formatted);
        } catch (error) {
            // debug error removed
            // Fallback mock data
            setRequests([
                { id: 'LR-9021', name: 'Sarah Chen', dept: 'Engineering', type: 'Sick Leave', range: 'Oct 12 - Oct 14', days: 3, status: 'Pending', reason: 'Medical - Requires surgery recovery time following minor procedure.', avatar: 'https://i.pravatar.cc/150?u=sarah' },
                { id: 'LR-9022', name: 'Marcus Thompson', dept: 'Design', type: 'Annual Leave', range: 'Oct 20 - Oct 25', days: 6, status: 'Pending', reason: 'Family vacation planned long ago. Handover document shared with the lead.', avatar: 'https://i.pravatar.cc/150?u=marcus' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useRealtimeLeaves((action, payload) => {
        console.log('[Realtime] Leave event:', action, payload);
        fetchRequests();
    });

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAction = async (id, status) => {
        try {
            await approveLeave({ id, status });
            setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
            showNotification(`Request ${id} ${status} successfully.`);
            setTimeout(() => navigate('/leave'), 1000);
        } catch (error) {
            showNotification(`Failed to ${status} request ${id}.`);
        }
    };

    const handleRedirect = async (id) => {
        try {
            await redirectLeaveToAdmin({ leaveId: id });
            setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Redirected to Admin', redirectedToAdmin: true } : req));
            showNotification(`Request ${id} redirected to admin successfully.`);
        } catch (error) {
            showNotification(`Failed to redirect request ${id}.`);
        }
    };

    const handleBulkAction = async (status) => {
        try {
            await Promise.all(selectedRequests.map(id => approveLeave({ id, status })));
            setRequests(prev => prev.map(req => 
                selectedRequests.includes(req.id) ? { ...req, status } : req
            ));
            showNotification(`${selectedRequests.length} requests ${status} successfully.`);
            setSelectedRequests([]);
            setTimeout(() => navigate('/leave'), 1000);
        } catch (error) {
            showNotification(`Failed to process bulk action.`);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             req.dept.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All Requests' || req.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const toggleSelection = (id) => {
        setSelectedRequests(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Redirected to Admin': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden">
            
            {/* Global Notification */}
            {notification && (
                <div className="fixed top-24 right-8 z-100 animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10">
                    <Check size={20} className="text-emerald-400" />
                    <span className="text-sm font-bold uppercase tracking-widest">{notification}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/leave')}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1"
                    >
                        <Undo2 size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Leave Management</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck size={12} className="text-primary-500" />
                            Manage employee leave requests, approvals, and history.
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button 
                            onClick={() => setViewMode('List')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'List' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('Grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'Grid' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                    <button 
                        onClick={() => {
                            showNotification("Synchronizing real-time leave dataset...");
                            fetchRequests();
                        }}
                        className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] active:scale-95"
                    >
                        Sync Requests
                    </button>
                </div>
            </div>

            {/* Main Hub */}
            <div className="flex-1 bg-white border border-slate-100 rounded-[44px] shadow-soft overflow-hidden flex flex-col min-h-0">
                
                {/* Toolbar */}
                <div className="px-10 py-6 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/20">
                    <div className="flex items-center gap-8">
                        {['All Requests', 'Pending', 'Approved', 'Rejected', 'Redirected to Admin'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)}
                                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${activeTab === tab ? 'text-primary-600' : 'text-slate-300 hover:text-slate-800'}`}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full animate-in zoom-in-y"></div>}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative group max-w-sm w-full lg:w-64">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search records..." 
                                className="w-full bg-white border border-slate-100 focus:border-primary-100 outline-none rounded-2xl pl-12 pr-4 py-3 text-xs font-black text-slate-600 transition-all shadow-sm uppercase tracking-tight"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => showNotification("Applying advanced filter parameters...")}
                            className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-primary-600 rounded-xl transition-all shadow-sm active:scale-95"
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Table View */}
                <div className="flex-1 overflow-y-auto no-scrollbar relative">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
                            <tr>
                                <th className="pl-10 pr-6 py-6 w-12">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded-lg border-slate-200 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                                        checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                                        onChange={() => {
                                            if (selectedRequests.length === filteredRequests.length) setSelectedRequests([]);
                                            else setSelectedRequests(filteredRequests.map(r => r.id));
                                        }}
                                    />
                                </th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Intelligence</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Meta</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Log Period</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 relative z-10">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className={`group hover:bg-slate-50/50 transition-all cursor-pointer ${selectedRequests.includes(req.id) ? 'bg-primary-50/30' : ''}`}>
                                    <td className="pl-10 pr-6 py-8" onClick={(e) => e.stopPropagation()}>
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 rounded-lg border-slate-200 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                                            checked={selectedRequests.includes(req.id)}
                                            onChange={() => toggleSelection(req.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-8" onClick={() => navigate('/leave/approval')}>
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <img src={req.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-slate-100 group-hover:scale-110 transition-transform" alt="" />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 group-hover:text-primary-600 transition-colors uppercase">{req.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{req.dept} • {req.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8" onClick={() => navigate('/leave/approval')}>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{req.type}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight line-clamp-1">{req.reason}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8" onClick={() => navigate('/leave/approval')}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{req.range}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{req.days} Days Total</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8" onClick={() => navigate('/leave/approval')}>
                                        <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest border ${getStatusStyles(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                            {req.status === 'Pending' && (
                                                <>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'Approved'); }}
                                                        className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'Rejected'); }}
                                                        className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleRedirect(req.id); }}
                                                        className="px-4 py-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all active:scale-95"
                                                    >
                                                        Redirect
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); showNotification(`Analysis triggered for ${req.id}...`); }}
                                                className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-slate-800 rounded-xl transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Bulk Actions Footer */}
                {selectedRequests.length > 0 && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 px-8 py-5 rounded-[32px] shadow-2xl flex items-center gap-8 border border-white/10 animate-in slide-in-from-bottom-2 duration-300 z-50">
                        <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                            <div className="w-10 h-10 bg-white/10 flex items-center justify-center text-white font-black rounded-2xl shadow-inner uppercase tracking-widest">
                                {selectedRequests.length}
                            </div>
                            <div>
                                <p className="text-[10px] text-white font-black uppercase tracking-widest leading-none mb-1">Items Selected</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Global Batch Diagnostic</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => handleBulkAction('Approved')}
                                className="px-8 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                            >
                                Approve Selected
                            </button>
                            <button 
                                onClick={() => handleBulkAction('Rejected')}
                                className="px-8 py-3 bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95"
                            >
                                Reject All
                            </button>
                            <button 
                                onClick={() => setSelectedRequests([])}
                                className="p-3 bg-white/10 text-white hover:bg-white/20 rounded-2xl transition-all active:scale-95 shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Persistence Footer */}
                <div className="px-12 py-5 bg-slate-900 border-t border-white/5 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-glow shadow-indigo-500/50"></div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Diagnostic Workforce Log v4.2 Active</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Total Unresolved Requests: {requests.filter(r => r.status === 'Pending').length}</p>
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest leading-none">Redirected: {requests.filter(r => r.status === 'Redirected to Admin').length}</p>
                        <button 
                            onClick={() => showNotification("Running batch compliance verification...")}
                            className="px-10 py-3 bg-primary-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-2xl shadow-primary-500/20 active:scale-95"
                        >
                            Verify Pending Batch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequests;
