import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  PieChart, 
  ArrowUpRight, 
  Globe, 
  MessageSquare,
  Briefcase,
  ChevronDown,
  Calendar,
  Filter,
  LayoutDashboard
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart as RechartsPie, 
  Pie 
} from 'recharts';

const LinkedInIcon = ({ size = 18, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const RecruitmentAnalytics = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const funnelData = [
    { label: 'Applied', value: 2482, total: 2482, color: 'bg-indigo-300' },
    { label: 'Screened', value: 1150, total: 2482, color: 'bg-indigo-400' },
    { label: 'Interviewed', value: 334, total: 2482, color: 'bg-indigo-500' },
    { label: 'Offered', value: 124, total: 2482, color: 'bg-indigo-600' },
    { label: 'Hired', value: 104, total: 2482, color: 'bg-emerald-500' },
  ];

  const sourcingChannels = [
    { name: 'LinkedIn', score: 44, icon: LinkedInIcon, color: 'bg-blue-600' },
    { name: 'Referrals', score: 25, icon: Users, color: 'bg-emerald-500' },
    { name: 'Job Boards', score: 18, icon: Globe, color: 'bg-orange-500' },
    { name: 'Agencies', score: 13, icon: Briefcase, color: 'bg-purple-600' },
  ];

  const diversityData = [
    { name: 'Female', value: 43 },
    { name: 'Male', value: 54 },
    { name: 'Non-binary', value: 3 },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-2">
        <div>
           <nav className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">
              <span>Recruitment</span>
              <ChevronDown size={12} className="-rotate-90" />
              <span className="text-slate-900">Analytics Overview</span>
           </nav>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">Analytics Overview</h1>
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">InfiAP Recruitment Performance Nodes</p>
           <div className="flex items-center gap-4 mt-6">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white transition-all">
                 <Calendar size={14} />
                 Last 30 Days
                 <ChevronDown size={14} />
              </button>
           </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-3xl border border-slate-100 shadow-inner">
           {['Overview', 'Sourcing', 'Diversity', 'Budget'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500
                 ${activeTab === tab ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
             >
                {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 px-2">
         
         {/* LEFT COLUMN - Metrics & Charts */}
         <div className="xl:col-span-8 space-y-10">
            
            {/* Main Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { label: 'Total Applied', value: '2,482', trend: '+15%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'vs last month' },
                 { label: 'Avg. Time-to-Hire', value: '24', suffix: 'days', trend: '-2d', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', sub: 'Improving' },
                 { label: 'Cost-per-Hire', value: '$4,200', trend: '-5%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', sub: 'Efficiency Up' },
                 { label: 'Active Jobs', value: '48', trend: '+4', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'Live roles' }
               ].map((stat, idx) => (
                 <div key={idx} className="bg-white p-12 rounded-[56px] border border-slate-50 shadow-soft group hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                       <div className={`w-20 h-20 ${stat.bg} ${stat.color} rounded-[32px] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-current/5`}>
                          <stat.icon size={36} />
                       </div>
                       <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
                          <ArrowUpRight size={14} />
                          {stat.trend}
                       </div>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>
                       <div className="flex items-baseline gap-2">
                          <h3 className="text-5xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                          {stat.suffix && <span className="text-xl font-bold text-slate-300 uppercase tracking-tighter">{stat.suffix}</span>}
                       </div>
                       <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-4">{stat.sub}</p>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[100px]"></div>
                 </div>
               ))}
            </div>

            {/* Sourcing Channel Efficiency (Screen 1 Middle) */}
            <div className="bg-white p-16 rounded-[64px] border border-slate-50 shadow-soft space-y-12">
               <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black text-slate-800 tracking-widest uppercase leading-none">Sourcing Channel Efficiency Nodes</h3>
               </div>
               <div className="space-y-10">
                  {sourcingChannels.map((source, idx) => (
                    <div key={idx} className="space-y-4 group">
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 ${source.color} text-white rounded-xl flex items-center justify-center shadow-lg shadow-current/10`}>
                                <source.icon size={24} />
                             </div>
                             <span className="text-sm font-black text-slate-800 tracking-tight">{source.name}</span>
                          </div>
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{source.score}% Perf.</span>
                       </div>
                       <div className="w-full h-4 bg-slate-50 rounded-full border border-slate-100/50 overflow-hidden p-1 shadow-inner">
                          <div 
                             className={`h-full ${source.color} rounded-full transition-all duration-1000 shadow-sm`} 
                             style={{ width: `${source.score}%` }}
                          ></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

         </div>

         {/* RIGHT COLUMN - Funnel & Diversity */}
         <div className="xl:col-span-4 space-y-10">
            
            {/* Recruitment Funnel (Screen 1 Lower) */}
            <div className="bg-white p-16 rounded-[64px] border border-slate-100 shadow-soft space-y-12 flex flex-col items-center">
               <div className="text-center w-full">
                   <h3 className="text-xs font-black text-slate-800 tracking-widest uppercase leading-none mb-2">Recruitment Funnel Nodes</h3>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                     <span>Total Applicants: 2482</span>
                     <div className="w-1 h-1 bg-slate-200 rounded-full mx-2"></div>
                     <span className="text-indigo-600">4.2% Hired</span>
                  </div>
               </div>

               <div className="w-full space-y-8">
                  {funnelData.map((step, idx) => (
                    <div key={idx} className="relative space-y-3 group cursor-pointer">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{step.label}</span>
                          <span className="text-sm font-black text-slate-800 tracking-tight">{step.value.toLocaleString()}</span>
                       </div>
                       <div className="w-full h-12 bg-slate-50 rounded-3xl border border-slate-100/50 overflow-hidden relative">
                          <div 
                            className={`h-full ${step.color} rounded-r-3xl transition-all duration-1000 opacity-80 group-hover:opacity-100`}
                            style={{ width: `${(step.value / step.total) * 100}%` }}
                          ></div>
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                             {Math.round((step.value / step.total) * 100)}%
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Diversity Metrics (Screen 1 Bottom) */}
            <div className="bg-white p-16 rounded-[64px] border border-slate-100 shadow-soft space-y-12">
               <div className="text-center w-full">
                   <h3 className="text-xs font-black text-slate-800 tracking-widest uppercase leading-none mb-2">Diversity Hiring Nodes</h3>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Gender Distribution</p>
               </div>

               <div className="h-[280px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%" minHeight={0} debounce={1}>
                    <RechartsPie>
                       <Pie
                          data={diversityData}
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={8}
                          dataKey="value"
                       >
                          <Cell fill="#4F46E5" />
                          <Cell fill="#cbd5e1" />
                          <Cell fill="#94a3b8" />
                       </Pie>
                       <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none">43%</span>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Female Share</span>
                  </div>
               </div>

               <div className="space-y-6">
                  {diversityData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-slate-300' : 'bg-slate-400'}`}></div>
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                       </div>
                       <span className="text-sm font-black text-slate-800 tracking-tight">{item.value}%</span>
                    </div>
                  ))}
               </div>
            </div>

         </div>

      </div>

    </div>
  );
};

export default RecruitmentAnalytics;
