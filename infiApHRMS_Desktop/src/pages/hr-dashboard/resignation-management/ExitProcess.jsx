import React, { useState, useEffect } from 'react';
import { 
  Undo2, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  DollarSign, 
  Briefcase, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  FileText,
  DoorOpen,
  XCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { hrService } from '../../../services/hr.service';

const ExitProcess = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const baseRoute = role === 'HR' ? '' : '/admin';
    const [notification, setNotification] = useState(null);

    const [exitData, setExitData] = useState(null);
    const [loading, setLoading] = useState(false);

    const checklist = [
        { id: 1, task: 'HR Clearance', detail: 'Exit interview and document verification', status: exitData?.hrClearance ? 'Done' : 'Pending', color: 'text-primary-500' },
        { id: 2, task: 'IT Asset Return', detail: 'Laptop, mobile, and security tokens', status: exitData?.itAssetReturn ? 'Done' : 'Pending', color: 'text-emerald-500' },
        { id: 3, task: 'Knowledge Transfer (KT)', detail: 'Technical handover and documentation', status: exitData?.knowledgeTransfer ? 'Done' : 'Pending', color: 'text-indigo-500' },
        { id: 4, task: 'Final Settlement', detail: 'Financial approval and disbursement', status: exitData?.finalSettlement ? 'Done' : 'Pending', color: 'text-slate-300' },
    ];

    const settlementItems = exitData?.settlement || [
        { label: 'Pending Salary', amount: 65480.00, type: 'Credit' },
        { label: 'Leave Encashment', amount: 12250.00, type: 'Credit' },
        { label: 'Performance Bonus', amount: 35285.00, type: 'Credit' },
        { label: 'Tax Deductions', amount: -18350.00, type: 'Debit' },
    ];

    const history = exitData?.auditLog || [
        { date: 'Oct 28', event: 'Asset Return Sync Successful', user: 'System Agent' },
        { date: 'Oct 26', event: 'Exit Interview Completed', user: 'Sarah Chen' },
        { date: 'Oct 24', event: 'Resignation Node Active', user: 'Mark Wilson' },
    ];

    useEffect(() => {
        const fetchExitData = async () => {
            setLoading(true);
            try {
                const res = await hrService.getResignationRegister();
                const data = res.data?.[0]; // most recent exit
                if (data) setExitData(data);
            } catch (err) {
                // debug error removed
            } finally {
                setLoading(false);
            }
        };
        fetchExitData();
    }, []);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUpdateStatus = async () => {
        try {
            if (exitData?._id) {
                await hrService.updateExitProcess({ id: exitData._id, status: 'Completed' });
            }
            showNotification('Exit status updated successfully.');
        } catch (err) {
            showNotification('Failed to update exit status.');
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
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-left">Exit & Settlement Audit</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 text-left leading-none">Forensic Offboarding Diagnostic & Financial Finalization</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                    <button 
                        onClick={handleUpdateStatus}
                        className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] active:scale-95 text-left"
                    >
                        Update Exit Status
                    </button>
                </div>
            </div>

            {/* Profile Brief (Top Bar) */}
            <div className="card-soft bg-white p-8 border-slate-100 shadow-soft flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                <div className="flex items-center gap-6 text-left">
                    <div className="w-20 h-20 rounded-[28px] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center text-primary-500 font-black text-xl text-left">
                        {(exitData?.employee?.name || 'SD').split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <div className="text-left">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2 text-left">{exitData?.employee?.name || 'Sneha Desai'}</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-left">{exitData?.employee?.role || 'Senior Software Engineer'} • {exitData?.employee?.id || 'EMP-081920'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-10 text-right">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 text-right">Clearance Nodes</p>
                        <p className="text-2xl font-black text-emerald-600 tracking-tighter text-right leading-none">75% Complete</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-slate-50 flex items-center justify-center relative shadow-inner text-center">
                        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transform: 'rotate(270deg)' }}></div>
                        <CheckCircle2 className="text-emerald-500" size={24} />
                    </div>
                </div>
            </div>

            {/* Main Workspace: Audit Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
                
                {/* 1. LEFT: Exit Process Tracker */}
                <div className="xl:col-span-12 card-soft bg-white border border-slate-100 shadow-soft flex flex-col min-h-[400px] text-left">
                    <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/20 text-left shrink-0">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest text-left">Critical Clearance Tracker</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">Sequential Offboarding Protocol Validation</p>
                    </div>
                    <div className="flex-1 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                        {checklist.map((item) => (
                            <div key={item.id} className="card-soft bg-slate-50/50 p-8 border-slate-100 hover:bg-white hover:shadow-xl hover:scale-105 transition-all group cursor-crosshair text-left">
                                <div className="flex items-center justify-between mb-6 text-left">
                                    <div className={`p-3 rounded-2xl bg-white shadow-sm transition-all ${item.status === 'Done' ? 'text-emerald-500' : 'text-slate-300'}`}>
                                        {item.status === 'Done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                                        item.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                                    }`}>{item.status}</span>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2 text-left">{item.task}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed text-left opacity-60 group-hover:opacity-100 transition-opacity">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. MIDDLE: Final Settlement Panel */}
                <div className="xl:col-span-8 card-soft bg-white border border-slate-100 shadow-soft flex flex-col min-h-[500px] text-left">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between text-left shrink-0">
                        <div className="text-left">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest text-left">Final Settlement Panel</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">Financial Reconciliation Logic & Net Balance</p>
                        </div>
                        <CreditCard size={24} className="text-primary-500" />
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar text-left">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-left">
                                <tr className="text-left">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Ledger Item</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount Node</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-left">
                                {settlementItems.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-all text-left">
                                        <td className="px-10 py-6 text-left">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className={`w-2 h-2 rounded-full ${item.type === 'Credit' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest text-left">{item.label}</span>
                                            </div>
                                        </td>
                                        <td className={`px-10 py-6 text-right font-black text-xs ${item.type === 'Credit' ? 'text-slate-800' : 'text-rose-500'} text-right`}>
                                            {item.type === 'Credit' ? '' : '-'}₹{Math.abs(item.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-10 bg-slate-900 rounded-b-[44px] flex items-center justify-between text-white text-left shrink-0">
                        <div className="text-left">
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest text-left font-sans text-xs">Net Settlement Node</p>
                            <p className="text-3xl font-black text-white tracking-tighter text-left">₹1,04,250.00</p>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-[24px] border border-white/5 text-left">
                            <ShieldCheck size={20} className="text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-left">Verified</span>
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT: Resignation History Log */}
                <div className="xl:col-span-4 flex flex-col gap-10 text-left">
                    <div className="card-soft bg-white p-10 border-slate-100 shadow-soft flex-1 text-left">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-10 border-b border-slate-50 pb-4 text-left">Node History</h3>
                        <div className="space-y-10 relative text-left">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-50"></div>
                            {history.map((log, i) => (
                                <div key={i} className="relative pl-12 text-left">
                                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center z-10 text-left">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse text-left"></div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">{log.date} • {log.user}</p>
                                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight text-left leading-relaxed">{log.event}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 mt-12 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-[9px] text-center border border-slate-100">View Full Audit Log</button>
                    </div>

                    <div className="card-soft bg-orange-50 p-10 border-none text-left relative overflow-hidden group">
                        <div className="relative z-10 text-left">
                            <AlertCircle className="text-orange-500 mb-4" size={24} />
                            <h4 className="text-sm font-black text-orange-900 uppercase tracking-widest text-left underline decoration-orange-200 underline-offset-4">Critical Action Required</h4>
                            <p className="text-[9px] text-orange-600 font-bold uppercase leading-relaxed mt-4 text-left">Pending "Notice Buyout" confirmation for Q4 synchronization. Please verify the buyout value manually.</p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default ExitProcess;
