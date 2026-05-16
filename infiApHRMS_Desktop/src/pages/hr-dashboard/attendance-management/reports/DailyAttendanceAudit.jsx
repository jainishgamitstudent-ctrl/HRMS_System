import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  Activity,
  User,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DailyAttendanceAudit = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const auditData = [
    { id: 'EMP001', name: 'Arjun Mehta', punchIn: '08:52 AM', punchOut: '05:45 PM', status: 'On-Time', loc: 'Mumbai HQ', device: 'Bio-Auth' },
    { id: 'EMP002', name: 'Priya Sharma', punchIn: '09:12 AM', punchOut: '06:05 PM', status: 'Late', loc: 'Remote', device: 'Mobile-App' },
    { id: 'EMP003', name: 'Rohan Gupta', punchIn: '08:45 AM', punchOut: '05:30 PM', status: 'On-Time', loc: 'Mumbai HQ', device: 'Bio-Auth' },
    { id: 'EMP004', name: 'Ananya Iyer', punchIn: '09:42 AM', punchOut: '06:15 PM', status: 'Late', loc: 'Bengaluru Hub', device: 'Web-Check' },
    { id: 'EMP005', name: 'Sneha Desai', punchIn: '--:--', punchOut: '--:--', status: 'Absent', loc: '--', device: '--' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'On-Time': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Late': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Absent': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const handleExportPDF = () => {
    if (!auditData.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Daily Attendance Audit Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["ID", "Name", "Punch In", "Punch Out", "Status", "Location", "Device"];
    const tableRows = [];

    auditData.forEach(emp => {
      const rowData = [
        emp.id,
        emp.name,
        emp.punchIn,
        emp.punchOut,
        emp.status,
        emp.loc,
        emp.device
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

    doc.save(`Attendance_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden">
      
      {/* Forensic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => navigate('/attendance-reports')}
             className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1"
           >
              <ArrowLeft size={20} />
           </button>
           <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Daily Attendance Audit</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                 <Calendar size={12} className="text-primary-500" />
                 Diagnostic Report for Oct 24, 2023
              </p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white border border-slate-100 px-6 py-2.5 rounded-2xl shadow-soft flex items-center gap-4">
              <Activity size={18} className="text-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliance Rate</span>
                 <span className="text-sm font-black text-slate-800 tracking-tighter">94.2%</span>
              </div>
           </div>
           <button onClick={handleExportPDF} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px]">
              <Download size={16} />
              Export PDF
           </button>
        </div>
      </div>

      {/* Main Forensic Grid */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[44px] shadow-soft overflow-hidden flex flex-col min-h-0">
         
         {/* Toolbar */}
         <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div className="relative group max-w-sm w-full">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search employee identity..." 
                 className="w-full bg-white border border-slate-100 focus:border-primary-100 outline-none rounded-2xl pl-12 pr-4 py-3 text-xs font-black text-slate-600 transition-all shadow-sm uppercase tracking-tight"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-6">
                  {['On-Time', 'Late', 'Absent'].map(s => (
                     <div key={s} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(s).split(' ')[0]}`}></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s}</span>
                     </div>
                  ))}
               </div>
               <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-primary-600 rounded-xl transition-all shadow-sm">
                  <Filter size={20} />
               </button>
            </div>
         </div>

         {/* High-Density Table */}
         <div className="flex-1 overflow-y-auto no-scrollbar">
            <table className="w-full text-left">
               <thead className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
                  <tr>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Node</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Punch Matrix</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Geo-Verification</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Audit</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {auditData.map((emp) => (
                    <tr key={emp.id} className="group hover:bg-slate-50/50 transition-all">
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 font-black group-hover:bg-primary-50 group-hover:text-primary-500 transition-all">
                                <User size={24} />
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 shadow-primary-500 transition-colors uppercase">{emp.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp.id} • Verified Identity</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-8">
                          <div className="flex items-center gap-8">
                             <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Inflow</p>
                                <p className={`text-sm font-black tracking-tighter ${emp.punchIn === '--:--' ? 'text-slate-300' : 'text-slate-700'}`}>{emp.punchIn}</p>
                             </div>
                             <ArrowRight size={14} className="text-slate-200" />
                             <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Outflow</p>
                                <p className={`text-sm font-black tracking-tighter ${emp.punchOut === '--:--' ? 'text-slate-300' : 'text-slate-700'}`}>{emp.punchOut}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-8">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(emp.status)}`}>
                             {emp.status}
                          </span>
                       </td>
                       <td className="px-8 py-8">
                          <div className="flex items-center gap-2 text-slate-600">
                             <MapPin size={14} className="text-primary-500" />
                             <span className="text-[11px] font-bold tracking-tight">{emp.loc}</span>
                          </div>
                          <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-1 ml-5">Device: {emp.device}</p>
                       </td>
                       <td className="px-10 py-8 text-right">
                          <button className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-slate-800 rounded-2xl shadow-sm transition-all active:scale-95 hover:shadow-xl hover:-translate-y-1">
                             <ShieldCheck size={20} />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Audit Sync Footer */}
         <div className="px-12 py-5 bg-slate-900 border-t border-white/5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-5">
               <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-glow shadow-indigo-500/50"></div>
               <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Forensic Audit Log v4.2 Active</span>
            </div>
            <div className="flex items-center gap-8">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Scanned across Mumbai and Bengaluru server zones</p>
               <button className="px-10 py-3 bg-primary-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-2xl shadow-primary-500/20 active:scale-95">Re-Verify Logs</button>
            </div>
         </div>
         
      </div>

    </div>
  );
};

export default DailyAttendanceAudit;
