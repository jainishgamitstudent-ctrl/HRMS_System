import React, { useState, useEffect } from 'react';
import { 
  BarChart as RechartBar, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart as RechartPie, 
  Pie,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  PieChart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Globe, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  ChevronRight, 
  Calendar,
  Filter,
  BarChart3,
  Download,
  Layout,
  RefreshCw,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalReports = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [timeframe, setTimeframe] = useState('Last Quarter');

  const [companyPerformance, setCompanyPerformance] = useState([
    { name: 'Acme Corp', value: 450000, color: '#6366f1' },
    { name: 'Globex Inc.', value: 380000, color: '#8b5cf6' },
    { name: 'AlphaTech', value: 520000, color: '#10b981' },
    { name: 'Cyberdyne', value: 290000, color: '#f59e0b' },
  ]);

  const [trendData, setTrendData] = useState([
    { month: 'May', companies: 32, users: 8400, revenue: 2.1 },
    { month: 'Jun', companies: 35, users: 9100, revenue: 2.4 },
    { month: 'Jul', companies: 37, users: 9800, revenue: 2.8 },
    { month: 'Aug', companies: 40, users: 11200, revenue: 3.2 },
    { month: 'Sep', companies: 42, users: 12400, revenue: 3.8 },
  ]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExport = () => {
    setIsExporting(true);
    showNotification(`Reporting Hub: Initializing master data aggregation for ${timeframe}...`);
    setTimeout(() => {
      setIsExporting(false);
      showNotification('Success: Institutional analytic report generated. Downloading payload...');
    }, 2500);
  };

  const handleTimeframeChange = (val) => {
    setTimeframe(val);
    showNotification(`Analytics Hub: Re-calculating global growth vectors for ${val}.`);
    // Randomize data for visual feedback
    setTrendData(trendData.map(d => ({ ...d, revenue: (Math.random() * 3 + 1).toFixed(1) })));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl shadow-3xl backdrop-blur-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{payload[0].payload.month || payload[0].payload.name}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <p className="text-sm font-black text-white tracking-tight">
              {payload[0].value.toLocaleString()} {payload[0].name === 'revenue' ? 'M' : ''}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ label, value, trend, isPositive, icon: Icon, color, bg }) => (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-soft group hover:border-indigo-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
       <div className="flex items-center justify-between mb-8">
          <div className={`w-14 h-14 ${bg} ${color} rounded-[24px] shadow-inner flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
             {Icon ? <Icon size={24} /> : <div className="w-6 h-6 bg-slate-200 rounded-full" />}
          </div>
          <div className={`flex items-center gap-1.5 text-[9px] font-black px-4 py-1.5 rounded-full border ${isPositive ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
             {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
             {trend}
          </div>
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 leading-none">{label}</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{value}</h3>
       </div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-12 animate-in fade-in duration-1000 pb-40 px-4 relative">
       
       {/* Premium Notification Toast */}
       {notification && (
          <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[24px] shadow-3xl border border-white/10">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification}</span>
          </div>
       )}

       <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-50 pb-12">
          <div>
             <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.35em]">Executive Analytics Suite</span>
             </div>
             <h1 className="text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">Global Governance Intelligence</h1>
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Multi-tenant Performance & Growth Diagnostics</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative group">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select 
                  value={timeframe}
                  onChange={(e) => handleTimeframeChange(e.target.value)}
                  className="bg-white border border-slate-100 rounded-[20px] pl-14 pr-8 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none cursor-pointer focus:ring-4 focus:ring-indigo-500/5 appearance-none hover:bg-slate-50 transition-all shadow-soft min-w-[200px]"
                >
                   <option>Last 30 Days</option>
                   <option>Last Quarter</option>
                   <option>Year to Date</option>
                   <option>Full Fiscal Year</option>
                </select>
                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-600 transition-colors rotate-90" size={16} />
             </div>
             <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-indigo-600 transition-all shadow-3xl active:scale-95 ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
             >
                {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                {isExporting ? 'Preparing Report...' : 'Export Intelligence'}
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard label="Institutional Revenue" value="$42.8M" trend="+14.2%" isPositive={true} icon={DollarSign} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard label="Cloud Personnel" value="124.5k" trend="+8.1%" isPositive={true} icon={Users} color="text-emerald-500" bg="bg-emerald-50" />
          <StatCard label="Global Footprint" value="18 Regions" trend="-2.4%" isPositive={false} icon={Globe} color="text-amber-500" bg="bg-amber-50" />
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          <div className="xl:col-span-8 bg-white p-12 rounded-[56px] border border-slate-100 shadow-soft space-y-10 group relative overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
                <div>
                   <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em] mb-2">Revenue Growth Vectors</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Global Revenue Flux across institutional clusters</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
                   <Filter size={18} />
                </div>
             </div>

             <div className="h-[400px] w-full relative z-10 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill:'#CBD5E1'}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill:'#CBD5E1'}} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                      <Area type="monotone" dataKey="revenue" name="revenue" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             <div className="absolute -top-32 -left-32 w-80 h-80 bg-slate-50 rounded-full blur-[100px] -z-10 group-hover:bg-indigo-50/50 transition-colors"></div>
          </div>

          <div className="xl:col-span-4 bg-slate-900 p-12 rounded-[56px] text-white shadow-3xl shadow-slate-200 flex flex-col items-center relative overflow-hidden group">
             <div className="text-center w-full mb-12 relative z-10">
                <h3 className="text-[12px] font-black uppercase tracking-[0.35em] text-slate-300 mb-2">Platform Occupancy</h3>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] leading-none">Global Market Configuration Share</p>
             </div>

             <div className="h-[280px] w-full relative z-10 overflow-hidden mb-12 transform group-hover:scale-110 transition-transform duration-1000">
                <ResponsiveContainer width="100%" height="100%">
                   <RechartPie>
                      <Pie
                         data={companyPerformance}
                         innerRadius={80}
                         outerRadius={105}
                         paddingAngle={10}
                         dataKey="value"
                         stroke="none"
                      >
                         {companyPerformance.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                   </RechartPie>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-4xl font-black text-white tracking-tighter leading-none">42</span>
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 mb-0.5">INSTITUTIONS</span>
                   <div className="w-10 h-0.5 bg-indigo-600/30 rounded-full mt-2"></div>
                </div>
             </div>

             <div className="w-full space-y-6 relative z-10">
                {companyPerformance.map((company, idx) => (
                   <div key={idx} className="flex items-center justify-between group/item cursor-pointer">
                      <div className="flex items-center gap-5">
                         <div className="w-3 h-3 rounded-full shadow-lg transition-transform group-hover/item:scale-150" style={{ backgroundColor: company.color }}></div>
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] group-hover/item:text-white transition-colors">{company.name}</span>
                      </div>
                      <span className="text-sm font-black text-white tabular-nums tracking-tight tracking-tighter">${(company.value / 1000).toLocaleString()}k</span>
                   </div>
                ))}
             </div>
             
             <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px]"></div>
          </div>
       </div>

       {/* Detailed Institutional Matrix */}
       <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-12">
             <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Master Audit Ledger</h3>
             <div className="flex items-center gap-4">
                <Search size={18} className="text-slate-300" />
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Full Analytics Deep-Dive</button>
             </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
             {[
               { name: 'Velocity Technical Solutions', rev: '$1.4M', growth: '+22%', employees: '1.2k', risk: 'LOW' },
               { name: 'Nexus Multi-Global Logistics', rev: '$840k', growth: '+14%', employees: '840', risk: 'LOW' },
               { name: 'Alpha Stream Intelligence', rev: '$2.1M', growth: '+31%', employees: '410', risk: 'MINIMAL' }
             ].map((row, i) => (
               <div key={i} className="flex items-center justify-between p-8 bg-slate-50/50 hover:bg-white border border-transparent hover:border-indigo-100 rounded-[32px] transition-all group shadow-sm">
                  <div className="flex items-center gap-8">
                     <div className="w-14 h-14 bg-white border border-slate-100 rounded-[20px] flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                        <BarChart3 size={24} />
                     </div>
                     <div>
                        <p className="text-[15px] font-black text-slate-800 tracking-tight leading-none mb-2 uppercase">{row.name}</p>
                        <div className="flex items-center gap-6">
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Growth: <span className="text-emerald-500">{row.growth}</span></p>
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Personnel: <span className="text-slate-800">{row.employees}</span></p>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-10">
                     <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Revenue Matrix</p>
                        <p className="text-lg font-black text-slate-800 tracking-tighter leading-none">{row.rev}</p>
                     </div>
                     <div className="w-12 h-12 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all duration-500">
                        <ChevronRight size={22} />
                     </div>
                  </div>
               </div>
             ))}
          </div>
       </div>

    </div>
  );
};

export default GlobalReports;
