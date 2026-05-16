import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  User,
  Activity,
  ShieldAlert,
  PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

const LateArrivalDiagnostic = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const lateData = [
    { name: 'Arjun Mehta', minutesLate: 12, frequency: 3, dept: 'Engineering', status: 'Verifying' },
    { name: 'Priya Sharma', minutesLate: 35, frequency: 1, dept: 'HR Ops', status: 'Warned' },
    { name: 'Ananya Iyer', minutesLate: 52, frequency: 4, dept: 'Design', status: 'Critical' },
    { name: 'Vikram Singh', minutesLate: 8, frequency: 2, dept: 'Sales', status: 'On Track' },
  ];

  const chartData = [
    { name: 'Mon', late: 14 },
    { name: 'Tue', late: 22 },
    { name: 'Wed', late: 8 },
    { name: 'Thu', late: 18 },
    { name: 'Fri', late: 35 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden">
      
      {/* Red Alert Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => navigate('/attendance-reports')}
             className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1"
           >
              <ArrowLeft size={20} />
           </button>
           <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Late Arrival Diagnostic</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                 <ShieldAlert size={12} className="text-rose-500" />
                 Red-Alert Compliance Dashboard • Wk 42
              </p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white border border-slate-100 px-6 py-2.5 rounded-2xl shadow-soft flex items-center gap-4">
              <TrendingUp size={18} className="text-rose-500 animate-bounce" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Late Trend</span>
                 <span className="text-sm font-black text-slate-800 tracking-tighter">+14.2%</span>
              </div>
           </div>
           <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px]">
              <Download size={16} />
              Export Violation Log
           </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-8 overflow-hidden min-h-0">
         
         {/* 1. LEFT: Trend Analytics */}
         <div className="xl:col-span-1 flex flex-col gap-6">
            <div className="card-soft bg-white p-8 border-slate-100 shadow-soft flex-1 flex flex-col">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Weekly Violation Volume</h3>
                  <Activity size={20} className="text-primary-500" />
               </div>
               <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                       <Bar dataKey="late" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 4 ? '#ef4444' : '#e2e8f0'} />
                          ))}
                       </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-10 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2">Diagnostic Insight</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Violations peaked on Friday with 35 unique latency events detected.</p>
               </div>
            </div>
         </div>

         {/* 2. RIGHT: Top Violations Hub */}
         <div className="xl:col-span-2 flex flex-col bg-white border border-slate-100 rounded-[44px] shadow-soft overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Employee Violation Index</h3>
               <div className="relative group w-48">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Search employees..." 
                    className="bg-white border border-slate-100 rounded-xl pl-8 pr-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:border-primary-100 w-full" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
               <table className="w-full text-left">
                  <thead className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
                     <tr>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Latency</th>
                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequency</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Corrective</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {lateData.map((emp, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">{emp.name.split(' ')[0][0]}{emp.name.split(' ')[1][0]}</div>
                                 <div>
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{emp.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{emp.dept}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-8">
                              <span className={`text-sm font-black tracking-tighter ${emp.minutesLate > 30 ? 'text-rose-500' : 'text-slate-800'}`}>{emp.minutesLate} mins</span>
                           </td>
                           <td className="px-6 py-8">
                              <div className="flex items-center gap-1">
                                 {Array.from({ length: 5 }).map((_, dot) => (
                                    <div key={dot} className={`w-1.5 h-1.5 rounded-full ${dot < emp.frequency ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
                                 ))}
                                 <span className="text-[10px] font-black text-slate-400 ml-2">{emp.frequency}/5</span>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <button className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                 emp.status === 'Critical' ? 'bg-rose-500 text-white border-rose-600 shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-800'
                              }`}>
                                 {emp.status === 'Critical' ? 'Escalate' : 'Send Warning'}
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            
            {/* Legend Footer */}
            <div className="px-10 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Critical (&gt;30m)</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Warning (15-30m)</span>
                  </div>
               </div>
            </div>

         </div>

      </div>

    </div>
  );
};

export default LateArrivalDiagnostic;
