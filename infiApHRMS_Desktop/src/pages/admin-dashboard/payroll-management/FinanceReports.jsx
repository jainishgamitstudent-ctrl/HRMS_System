import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  PieChart, 
  ArrowRight,
  Download,
  Calendar,
  Layers,
  Activity,
  ChevronRight,
  TrendingDown,
  Layout,
  ShieldCheck
} from 'lucide-react';

const chartData = [
  { name: 'M1', gross: 400000, previous: 280000 },
  { name: 'M2', gross: 420000, previous: 290000 },
  { name: 'M3', gross: 380000, previous: 310000 },
  { name: 'M4', gross: 500000, previous: 320000 },
  { name: 'M5', gross: 480000, previous: 340000 },
  { name: 'M6', gross: 520000, previous: 360000 },
  { name: 'M7', gross: 490000, previous: 380000 },
  { name: 'M8', gross: 550000, previous: 400000 },
  { name: 'M9', gross: 580000, previous: 420000 },
  { name: 'M10', gross: 540000, previous: 440000 },
  { name: 'M11', gross: 600000, previous: 460000 },
  { name: 'M12', gross: 640000, previous: 480000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="space-y-1">
          <p className="text-sm font-black text-indigo-400 tracking-tighter">Gross: ${payload[0].value.toLocaleString()}</p>
          <p className="text-sm font-black text-slate-400 tracking-tighter">Prev: ${payload[1].value.toLocaleString()}</p>
        </div>
      </div>
    );
  }
  return null;
};

const FinanceReports = () => {
  const deptSpending = [
    { name: 'ENGINEERING', amount: '$210,000', percentage: 46, color: 'bg-indigo-600' },
    { name: 'MARKETING', amount: '$85,400', percentage: 19, color: 'bg-teal-500' },
    { name: 'SALES', amount: '$72,100', percentage: 16, color: 'bg-blue-500' },
    { name: 'HUMAN RESOURCES', amount: '$42,300', percentage: 9, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Premium Split Layout Header (Optional - for context) */}
      <div className="flex items-center justify-between px-2 mb-10">
         <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Financial Audit</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Institutional Disbursement Intelligence</p>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => alert('Fiscal Period Selector: Switching to Fiscal 2024 Intelligence Node...')}
              className="flex items-center gap-3 px-8 py-3.5 bg-slate-50 text-slate-500 font-black rounded-2xl border border-slate-100 hover:bg-white transition-all text-[10px] uppercase tracking-widest"
            >
               <Calendar size={16} />
               Fiscal 2024
            </button>
            <button 
              onClick={() => alert('Exporting Financial Audit Protocol... Report will be downloaded shortly.')}
              className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all active:scale-95 text-[10px] uppercase tracking-widest"
            >
               <Download size={16} />
               Export Audit
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2">
         
         {/* MAIN AUDIT BOARD (Left 75%) */}
         <section className="xl:col-span-9 bg-white rounded-[56px] p-16 border border-slate-50 shadow-soft relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 relative z-10">
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Monthly Overview</label>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Payroll Disbursement Trend</h2>
               </div>
               
               {/* Custom Legend to match screenshot */}
               <div className="flex items-center gap-10 mt-6 md:mt-0">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-md"></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-slate-200 shadow-sm border border-slate-300/20"></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Previous</span>
                  </div>
               </div>
            </div>

            {/* High Fidelity Recharts Component */}
            <div className="h-[450px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%" minHeight={0} debounce={1}>
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                     <defs>
                        <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                           <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.05}/>
                           <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} 
                        dy={20}
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} 
                        tickFormatter={(value) => `$${value/1000}k`}
                     />
                     <Tooltip content={<CustomTooltip />} />
                     <Area 
                        type="monotone" 
                        dataKey="gross" 
                        stroke="#4F46E5" 
                        strokeWidth={5}
                        fillOpacity={1} 
                        fill="url(#colorGross)" 
                        activeDot={{ r: 8, strokeWidth: 0, fill: '#4F46E5' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="previous" 
                        stroke="#cbd5e1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrev)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            {/* Backdrop Blur Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-50/5 rounded-full blur-[200px] pointer-events-none"></div>
         </section>

         {/* ALLOCATION SIDEBAR (Right 25%) */}
         <section className="xl:col-span-3 bg-white rounded-[56px] p-12 border border-slate-50 shadow-soft flex flex-col justify-between">
            <div>
               <div className="flex items-center gap-6 mb-16">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-slate-200">
                     <Layout size={28} />
                  </div>
                  <div>
                     <h3 className="text-xs font-black text-slate-800 tracking-widest uppercase leading-none mb-1">Allocation</h3>
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">By Department Audit</p>
                  </div>
               </div>

               <div className="space-y-12">
                  {deptSpending.map((dept, idx) => (
                    <div key={idx} className="space-y-5 group cursor-pointer">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[11px] font-black text-slate-700 tracking-wider group-hover:text-indigo-600 transition-colors">{dept.name}</span>
                          <span className="text-xl font-black text-slate-800 tracking-tighter">{dept.amount}</span>
                       </div>
                       <div className="w-full h-3 bg-slate-50 rounded-full border border-slate-100/50 overflow-hidden">
                          <div 
                            className={`h-full ${dept.color} rounded-full transition-all duration-1000 shadow-sm`} 
                            style={{ width: `${dept.percentage}%` }}
                          ></div>
                       </div>
                       <div className="flex justify-end pr-1">
                          <span className="text-[9px] font-black text-slate-200 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">{dept.percentage}% Total Share</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <button 
              onClick={() => alert('Accessing Deep Financial Audit Logs... Redirecting to Secure Infrastructure.')}
              className="w-full mt-16 py-6 border-2 border-slate-100 bg-slate-50/50 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all rounded-[32px] font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 group shadow-xl shadow-transparent hover:shadow-indigo-100/20 active:scale-95"
            >
               Full Financial Audit
               <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
         </section>

      </div>

      {/* Footer Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
         <div className="p-12 bg-indigo-600 rounded-[56px] text-white flex items-center gap-10 group relative overflow-hidden shadow-3xl shadow-indigo-100">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[32px] flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
               <TrendingUp size={40} className="text-white" />
            </div>
            <div className="relative z-10">
               <h4 className="text-2xl font-black tracking-tight leading-none mb-2">Institutional Accuracy Index</h4>
               <p className="text-sm font-medium text-indigo-100 opacity-80 leading-relaxed max-w-[400px]">
                  Financial integrity verification has passed the audit criteria with a <span className="text-white font-black underline">99.8% precision score</span> for this fiscal cycle.
               </p>
            </div>
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
         </div>

         <div className="p-12 bg-slate-900 rounded-[56px] text-white flex items-center gap-10 group relative overflow-hidden shadow-2xl">
            <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
               <ShieldCheck size={40} className="text-indigo-400" />
            </div>
            <div className="relative z-10">
               <h4 className="text-2xl font-black tracking-tight leading-none mb-2 tracking-tighter">Reserve Stability</h4>
               <p className="text-sm font-medium text-slate-400 leading-relaxed opacity-80 max-w-[400px]">
                  Capital reserves are currently indexed at <span className="text-white font-black">1.14x liabilities</span>, ensuring 100% disbursement security for the next 12 months.
               </p>
            </div>
            <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform"></div>
         </div>
      </div>

    </div>
  );
};

export default FinanceReports;
