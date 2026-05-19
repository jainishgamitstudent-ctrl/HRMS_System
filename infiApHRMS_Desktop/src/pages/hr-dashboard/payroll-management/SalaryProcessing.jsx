import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight,
  MoreHorizontal,
  DollarSign,
  AlertCircle,
  Clock,
  ChevronRight,
  Undo2,
  Download,
  ShieldCheck,
  LayoutDashboard,
  Activity,
  ClipboardList,
  Wallet,
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSalaryList, processSalary } from '../../../services/hrApi';

const SalaryProcessing = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('Pending');

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const res = await getSalaryList();
            const data = res.data?.data || [];
            const formatted = data.map(emp => ({
                id: emp._id || emp.id,
                name: emp.employee?.name || emp.name || 'Unknown',
                dept: emp.employee?.department || emp.department || 'General',
                gross: emp.grossSalary || emp.baseSalary || 0,
                tax: emp.taxDeductions || 0,
                pf: emp.pfDeductions || 0,
                net: emp.netSalary || emp.netPayable || 0,
                status: emp.status || 'Pending'
            }));
            setEmployees(formatted);
        } catch (err) {
            // debug error removed
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalaries();
    }, []);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAction = async (id, newStatus) => {
        try {
            if (newStatus === 'Verified') {
                await processSalary({ employeeId: id });
            }
            setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: newStatus } : emp));
            showNotification(`Employee ${id} marked as ${newStatus}.`);
        } catch (err) {
            showNotification(`Failed to process salary for ${id}`);
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             emp.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' || emp.status === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 text-left pb-20">
            
            {/* Notification */}
            {notification && (
                <div className="fixed top-24 right-8 z-100 animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <span className="text-sm font-black uppercase tracking-widest">{notification}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-6 text-left">
                    <button 
                        onClick={() => navigate('/payroll')}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1 active:scale-95 text-left"
                    >
                        <Undo2 size={20} />
                    </button>
                    <div className="text-left">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-left">Salary Processing Engine</h1>
                        <div className="flex items-center gap-4 text-left">
                            <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-left font-sans">
                                <DollarSign size={12} />
                                Disbursement Lock: {new Date().toLocaleString('default', { month: 'short' })} {new Date().getDate()}
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-left font-sans text-[10px]">
                                <AlertCircle size={12} />
                                {employees.filter(e => e.status === 'Pending').length} Pending Verifications
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 text-left">
                    <button 
                        onClick={() => {
                            showNotification("Initiating bulk salary disbursement node...");
                            fetchSalaries();
                        }}
                        className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] active:scale-95 text-left"
                    >
                        Process Batch
                    </button>
                </div>
            </div>

            {/* Analytical Ledger Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
                
                {/* 1. Processing Ledger */}
                <div className="xl:col-span-9 bg-white border border-slate-100 rounded-[44px] shadow-soft overflow-hidden flex flex-col min-h-[600px] text-left">
                
                    {/* Command Toolbar */}
                    <div className="px-10 py-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/20 text-left">
                        <div className="flex items-center gap-8 text-left">
                            {['Pending', 'Verified', 'All'].map(tab => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 text-left ${activeTab === tab ? 'text-primary-600' : 'text-slate-300 hover:text-slate-800'}`}
                                >
                                    {tab}
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full animate-in zoom-in-y"></div>}
                                </button>
                            ))}
                        </div>
                        <div className="relative group max-w-sm w-full lg:w-64 text-left">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                type="text" 
                                placeholder="Find employee or ID..." 
                                className="w-full bg-white border border-slate-100 outline-none rounded-2xl pl-12 pr-4 py-3 text-xs font-black text-slate-600 transition-all shadow-sm uppercase tracking-tight text-left"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Ledger Workspace */}
                    <div className="flex-1 overflow-y-auto no-scrollbar text-left">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 text-left">
                                <tr className="text-left">
                                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Employee Diagnostic</th>
                                    <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Gross Pay</th>
                                    <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Deductions (Tax/PF)</th>
                                    <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Net Payable</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-left">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="group hover:bg-slate-50/50 transition-all text-left">
                                        <td className="px-10 py-6 text-left border-slate-50">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary-500 font-black text-[10px] text-left">
                                                    {emp.id.split('-')[1]}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight text-left">{emp.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-left">{emp.dept}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-black text-slate-600 text-xs text-left">₹{emp.gross.toLocaleString()}</td>
                                        <td className="px-6 py-6 text-left">
                                            <div className="flex flex-col gap-1 text-left">
                                                <span className="text-[10px] font-bold text-rose-500 text-left">-₹{emp.tax.toLocaleString()} (Tax)</span>
                                                <span className="text-[10px] font-bold text-orange-500 text-left">-₹{emp.pf.toLocaleString()} (PF)</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-left">
                                            <div className="flex items-center gap-2 text-left">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <p className="text-xs font-black text-emerald-600 tracking-tight text-left">₹{emp.net.toLocaleString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 text-right">
                                                {emp.status === 'Verified' ? (
                                                    <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-emerald-100 text-right">
                                                        <ShieldCheck size={14} />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => handleAction(emp.id, 'Verified')}
                                                            className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 text-center"
                                                        >
                                                            Verify Node
                                                        </button>
                                                        <button className="p-2 text-slate-300 hover:text-slate-800 transition-all text-center"><MoreHorizontal size={20} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Status Bar */}
                    <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-left shrink-0">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2 text-left">
                            <Clock size={14} />
                            Cycle: {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()} • Disbursement Window Open
                        </p>
                        <div className="flex items-center gap-6 text-right">
                            <div className="text-right">
                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest text-left">Total Process Volume</p>
                                <p className="text-sm font-black text-slate-800 tracking-tighter text-left">₹{employees.reduce((sum, e) => sum + (e.net || 0), 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Side Context / Actions */}
                <div className="xl:col-span-3 space-y-10 text-left">
                    <div className="card-soft bg-slate-900 p-10 border-none text-white h-full relative overflow-hidden group text-left">
                        <div className="relative z-10 text-left h-full flex flex-col">
                            <DollarSign className="mb-6 text-emerald-400" size={32} />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-left leading-tight mb-4">Batch Finalization</h3>
                            <p className="text-xs opacity-60 font-medium leading-relaxed uppercase tracking-[0.2em] mb-10 text-left">Confirming this batch will synchronize disbursement nodes with the banking gateway and generate payslip archives.</p>
                            <div className="space-y-4 text-left">
                                <div className="flex justify-between py-4 border-b border-white/10 text-left">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Net Total</span>
                                    <span className="text-[10px] font-black uppercase text-right tracking-widest">₹{employees.reduce((sum, e) => sum + (e.net || 0), 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-4 border-b border-white/10 text-left">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Tax Nodes</span>
                                    <span className="text-[10px] font-black uppercase text-right tracking-widest">₹{employees.reduce((sum, e) => sum + (e.tax || 0), 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform"></div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SalaryProcessing;
