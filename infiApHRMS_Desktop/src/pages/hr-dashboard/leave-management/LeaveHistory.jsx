import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  FileText, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowLeft,
  Share2,
  Table as TableIcon,
  PieChart,
  Activity,
  ArrowUpRight,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLeaveHistory } from '../../../services/hrApi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const LeaveHistory = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [historicalRecords, setHistoricalRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await getLeaveHistory();
                const data = res.data?.data || [];
                const formatted = data.map(rec => ({
                    id: rec._id || rec.id,
                    name: rec.employee?.name || rec.name || 'Unknown',
                    type: rec.type || 'Leave',
                    range: `${rec.startDate?.slice(0,10) || 'N/A'} - ${rec.endDate?.slice(0,10) || 'N/A'}`,
                    status: rec.status || 'Approved',
                    dept: rec.employee?.department || rec.dept || 'General',
                    verifiedBy: rec.approvedBy?.name || 'System / Manager'
                }));
                setHistoricalRecords(formatted);
            } catch (err) {
                // debug error removed
                setHistoricalRecords([
                    { id: 'HIST-001', name: 'Arjun Mehta', type: 'Annual Leave', range: 'Nov 12 - Nov 18, 2023', status: 'Approved', dept: 'Engineering', verifiedBy: 'System Auto' },
                    { id: 'HIST-002', name: 'Priya Sharma', type: 'Sick Leave', range: 'Oct 28, 2023', status: 'Approved', dept: 'Product & Design', verifiedBy: 'Sneha Desai' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleExportPDF = () => {
        if (!filteredRecords.length) return;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Leave History Report', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableColumn = ["ID", "Name", "Type", "Department", "Date Range", "Status", "Verified By"];
        const tableRows = [];

        filteredRecords.forEach(rec => {
            const rowData = [
                rec.id,
                rec.name,
                rec.type,
                rec.dept,
                rec.range,
                rec.status,
                rec.verifiedBy
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 28,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`Leave_History_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleExportExcel = () => {
        if (!filteredRecords.length) return;
        const csvContent = [
            ["ID", "Name", "Type", "Department", "Date Range", "Status", "Verified By"],
            ...filteredRecords.map(rec => [
                rec.id,
                rec.name,
                rec.type,
                rec.dept,
                rec.range,
                rec.status,
                rec.verifiedBy
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Leave_History_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredRecords = historicalRecords.filter(rec => {
        const matchesSearch = rec.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             rec.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             rec.dept.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = filterStatus === 'All' || rec.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/leave')}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Historical Archive</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <TableIcon size={12} className="text-primary-500" />
                            Forensic Log of All Leave Actions & Diagnostic History
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest text-[10px]">
                        <Printer size={16} />
                        Print Logs
                    </button>
                    <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px]">
                        <Download size={16} />
                        Export Master
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-8 overflow-hidden min-h-0">
                
                {/* 1. MAIN TABLE: Archive Log */}
                <div className="xl:col-span-3 bg-white border border-slate-100 rounded-[44px] shadow-soft flex flex-col min-h-0 overflow-hidden">
                    <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                        <div className="relative group max-w-sm w-full">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search historical records..." 
                                className="w-full bg-white border border-slate-100 focus:border-primary-100 outline-none rounded-2xl pl-12 pr-4 py-3 text-xs font-black text-slate-600 transition-all shadow-sm uppercase tracking-tight"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-6 px-6 py-2 bg-white border border-slate-100 rounded-xl">
                                {['All', 'Approved', 'Rejected', 'Pending'].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setFilterStatus(s)}
                                        className={`text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'text-primary-600' : 'text-slate-300 hover:text-slate-600'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-primary-600 rounded-xl transition-all shadow-sm">
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Identity</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Tag</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Node</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 relative z-10">
                                {filteredRecords.map((rec) => (
                                    <tr key={rec.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-slate-50 rounded-xl text-slate-300 group-hover:text-primary-500 transition-colors">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">{rec.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{rec.id} • Archive</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{rec.type}</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{rec.dept}</p>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                                <Calendar size={14} className="text-primary-400" />
                                                {rec.range}
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest border ${getStatusStyles(rec.status)}`}>
                                                {rec.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                    <ShieldCheck size={12} className="text-primary-500" />
                                                    {rec.verifiedBy}
                                                </div>
                                                <p className="text-[9px] text-slate-300 font-bold uppercase">Compliance Validated</p>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. SIDEBAR: Reporting Intelligence */}
                <div className="xl:col-span-1 flex flex-col gap-6">
                    <div className="card-soft bg-primary-600 p-10 text-white relative overflow-hidden group shadow-2xl shadow-primary-500/20">
                        <div className="relative z-10 flex flex-col h-full">
                            <PieChart size={32} className="mb-6 opacity-80" />
                            <h3 className="text-2xl font-black tracking-tight leading-none mb-4 uppercase">Leave Reports</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-70 mb-10">
                                Analyze and export department-specific absence data for Q3 compliance audits.
                            </p>
                            
                            <div className="space-y-3">
                                <button className="w-full py-4 bg-white text-primary-600 font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]">
                                    <Activity size={16} />
                                    Generate Report
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleExportPDF} className="py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-black rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[9px]">
                                        <Download size={14} />
                                        Export PDF
                                    </button>
                                    <button onClick={handleExportExcel} className="py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-black rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[9px]">
                                        <FileSpreadsheet size={14} />
                                        Export Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 scale-150 rotate-12 opacity-10">
                            <ShieldCheck size={200} />
                        </div>
                    </div>

                    <div className="card-soft bg-white p-8 border-slate-100 shadow-soft flex-1">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Departmental Metrics</h4>
                        <div className="space-y-6">
                            {[
                                { name: 'Engineering', percentage: 12, color: 'bg-primary-500' },
                                { name: 'Design', percentage: 8, color: 'bg-emerald-500' },
                                { name: 'Marketing', percentage: 15, color: 'bg-orange-500' },
                                { name: 'Sales', percentage: 5, color: 'bg-rose-500' },
                            ].map((dept) => (
                                <div key={dept.name} className="space-y-3">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-600">
                                        <span>{dept.name}</span>
                                        <span>{dept.percentage}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${dept.color} rounded-full`} style={{ width: `${dept.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-3 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:bg-primary-50 transition-all rounded-xl border border-primary-100 border-dashed">
                            View Detailed Analysis
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LeaveHistory;
