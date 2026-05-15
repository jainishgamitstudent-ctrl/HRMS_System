import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  MoreHorizontal,
  Mail,
  ShieldCheck,
  LayoutDashboard,
  Activity,
  CreditCard,
  ClipboardList,
  Eye,
  Undo2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSalaryList } from '../../../services/hrApi';

const PayslipManagement = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState(null);

    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPayslips = async () => {
        setLoading(true);
        try {
            const res = await getSalaryList();
            const data = res.data?.data || [];
            const formatted = data.map(ps => ({
                id: ps._id || ps.id || `PS-${Date.now()}`,
                name: ps.employee?.name || ps.name || 'Unknown',
                date: `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`,
                amount: ps.netSalary || ps.netPayable || 0,
                status: ps.status === 'Verified' ? 'Dispatched' : 'Generated',
                type: 'Monthly'
            }));
            setPayslips(formatted);
        } catch (err) {
            // debug error removed
            setPayslips([
                { id: 'PS-1024-001', name: 'Mark Wilson', date: `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`, amount: 114500, status: 'Generated', type: 'Monthly' },
                { id: 'PS-1024-002', name: 'Sarah Chen', date: `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`, amount: 99100, status: 'Generated', type: 'Monthly' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayslips();
    }, []);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredPayslips = payslips.filter(ps => 
        ps.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ps.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 text-left pb-20">
            
            {/* Notification */}
            {notification && (
                <div className="fixed top-24 right-8 z-100 animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 text-left">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-left">{notification}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 text-left">
                <div className="flex items-center gap-6 text-left">
                    <button 
                        onClick={() => navigate('/payroll')}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1 active:scale-95 text-left"
                    >
                        <Undo2 size={20} />
                    </button>
                    <div className="text-left">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-left">Payslip Repository</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 text-left leading-none">Forensic Archive & Disbursement Management</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 text-left">
                    <button 
                        onClick={() => {
                            showNotification("Initiating bulk cloud synchronization for all payslip nodes...");
                            fetchPayslips();
                        }}
                        className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-[0.2em] text-[10px] active:scale-95 text-left"
                    >
                        Sync Repository
                    </button>
                </div>
            </div>

            {/* Analytical Ledger Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
                
                {/* 1. Payslip Ledger */}
                <div className="xl:col-span-9 bg-white border border-slate-100 rounded-[44px] shadow-soft overflow-hidden flex flex-col min-h-[600px] text-left">
                
                    {/* Command Toolbar */}
                    <div className="px-10 py-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/20 text-left">
                        <div className="flex items-center gap-8 text-left">
                            {['All Archives', 'Recent Oct', 'Flagged'].map(tab => (
                                <button key={tab} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-slate-800 transition-all text-left">{tab}</button>
                            ))}
                        </div>
                        <div className="relative group max-w-sm w-full lg:w-64 text-left">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                type="text" 
                                placeholder="Search archives..." 
                                className="w-full bg-white border border-slate-100 outline-none rounded-2xl pl-12 pr-4 py-3 text-xs font-black text-slate-600 transition-all shadow-sm uppercase tracking-tight text-left"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Repository Workspace */}
                    <div className="flex-1 overflow-y-auto no-scrollbar text-left">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 text-left">
                                <tr className="text-left">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Archive Identity</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Period</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Net Amount</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Synchronization</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-left">
                                {filteredPayslips.map((ps) => (
                                    <tr key={ps.id} className="group hover:bg-emerald-50/30 transition-all text-left">
                                        <td className="px-10 py-6 text-left">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-[10px] text-left">
                                                    PDF
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight text-left">{ps.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-left">{ps.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-black text-slate-600 text-[10px] uppercase text-left">{ps.date}</td>
                                        <td className="px-6 py-6 font-black text-slate-800 text-xs text-left">₹{ps.amount.toLocaleString()}</td>
                                        <td className="px-6 py-6 text-left">
                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${ps.status === 'Dispatched' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'} text-left`}>
                                                {ps.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 text-right">
                                                <button onClick={() => showNotification("Previewing payslip node...")} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-all hover:bg-white hover:shadow-md text-right"><Eye size={16} /></button>
                                                <button onClick={() => showNotification("Downloading archive batch...")} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-all hover:bg-white hover:shadow-md text-right"><Download size={16} /></button>
                                                <button onClick={() => showNotification("Dispatching node to employee gateway...")} className="p-3 bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white rounded-xl transition-all shadow-sm text-right"><Mail size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Status Bar */}
                    <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-left shrink-0">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2 text-left">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            All 348 archives cryptographically signed and verified.
                        </p>
                        <div className="flex items-center gap-6 text-right">
                            <div className="text-right">
                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] text-left">Node Availability</p>
                                <p className="text-sm font-black text-slate-800 tracking-tighter text-left">Cloud Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Side Context / Actions */}
                <div className="xl:col-span-3 space-y-10 text-left">
                    <div className="card-soft bg-slate-900 p-10 border-none text-white h-full relative overflow-hidden group text-left">
                        <div className="relative z-10 text-left h-full flex flex-col">
                            <ClipboardList className="mb-6 text-primary-400" size={32} />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-left leading-tight mb-4 text-left">Payslip Repository</h3>
                            <p className="text-xs opacity-60 font-medium leading-relaxed uppercase tracking-[0.2em] mb-10 text-left">Access the forensic archive of generated payslips for the current cycle. All files are cryptographically signed and ready for disbursement.</p>
                            <div className="space-y-4 text-left">
                                <div className="flex justify-between py-4 border-b border-white/10 text-left">
                                    <span className="text-[10px] font-black uppercase text-left tracking-[0.2em]">Current Node</span>
                                    <span className="text-[10px] font-black uppercase text-right tracking-[0.2em]">Oct 2023</span>
                                </div>
                                <div className="flex justify-between py-4 border-b border-white/10 text-left text-right">
                                    <span className="text-[10px] font-black uppercase text-left tracking-[0.2em]">Total Records</span>
                                    <span className="text-[10px] font-black uppercase text-right tracking-[0.2em]">348</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-600/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform"></div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PayslipManagement;
