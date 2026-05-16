import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  ChevronRight, 
  MoreVertical,
  Briefcase,
  Target,
  ShieldCheck,
  BarChart2,
  Lock,
  Calendar,
  Zap,
  CheckCircle2
} from 'lucide-react';

const SalaryStructure = () => {
  const navigate = useNavigate();

  const earnings = [
    { label: 'Basic Pay', amount: '$4,250.00' },
    { label: 'House Rent Allowance', amount: '$2,125.00' },
    { label: 'Conveyance Allowance', amount: '$400.00' },
    { label: 'Special Allowance', amount: '$1,725.00' },
  ];

  const deductions = [
    { label: 'Provident Fund (Employee)', amount: '-$510.00', negative: true },
    { label: 'Professional Tax', amount: '-$20.00', negative: true },
    { label: 'Health Insurance Premium', amount: '-$150.00', negative: true },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Premium Header - Realigned for Perfection */}
      <div className="flex items-center justify-between px-2 pb-8 border-b border-slate-100">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin/payroll-management/hub')}
              className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-soft active:scale-90 group"
            >
               <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
               <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">Salary Structure</h1>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 leading-none underline decoration-indigo-300 underline-offset-4">Compensation Audit & Breakdown</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 px-8 py-4.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-100 active:scale-95 group">
               <Download size={16} className="group-hover:translate-y-1 transition-transform" />
               Download Structure (PDF)
            </button>
            <button className="p-4.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-soft active:scale-90">
               <MoreVertical size={20} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start px-2">
         
         {/* Left Column: Identity & Primary Metrics */}
         <div className="xl:col-span-4 space-y-10">
            
            {/* Identity Card - Refined Typography */}
            <div className="bg-white rounded-[56px] border border-slate-50 shadow-soft p-12 relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex flex-col items-center text-center mb-12">
                     <div className="w-32 h-32 rounded-[48px] overflow-hidden border-8 border-slate-50 shadow-soft group-hover:scale-105 duration-1000 transition-transform mb-6 ring-1 ring-slate-100">
                        <img src="https://i.pravatar.cc/150?u=alex" alt="Alex Thompson" className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2 uppercase">Alex Thompson</h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-4">Senior Software Engineer • INF-9021</p>
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-full uppercase tracking-widest border border-indigo-100 shadow-sm">Full-time Node</span>
                     </div>
                  </div>

                  <div className="bg-linear-to-br from-[#4E63F0] to-[#6855E8] rounded-[44px] p-10 text-white shadow-3xl shadow-indigo-200 relative overflow-hidden group/gross hover:-translate-y-1 transition-transform duration-500">
                     <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-100 mb-2">Current Monthly Gross</p>
                     <div className="flex items-baseline gap-3 mb-6">
                        <h3 className="text-3xl font-black tracking-tighter leading-none">$8,500.00</h3>
                        <Zap size={14} className="text-indigo-200 fill-current animate-pulse" />
                     </div>
                     <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
                        <Calendar size={14} className="text-indigo-100" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Effective from Jan 2024</span>
                     </div>
                     {/* Decorative Elements */}
                     <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover/gross:scale-150 transition-transform duration-1000"></div>
                  </div>
               </div>
            </div>

            {/* Annual CTC Diagnostic */}
            <div className="bg-slate-900 rounded-[56px] p-12 text-white shadow-soft relative overflow-hidden border-b-[12px] border-b-indigo-500 hover:shadow-indigo-900/20 transition-all duration-700">
               <div className="flex justify-between items-start mb-10 relative z-10">
                  <div>
                     <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Annual CTC Package</p>
                     <h3 className="text-2xl font-black tracking-tighter text-white uppercase">$102,000.00</h3>
                  </div>
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all cursor-pointer group/icon">
                     <BarChart2 size={24} className="text-indigo-400 group-hover/icon:scale-110 transition-transform" />
                  </div>
               </div>

               <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">YoY GROWTH ARCHITECTURE</p>
                    <span className="text-[8px] bg-slate-800 px-3 py-1 rounded-full text-slate-500">2023 VS 2024</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 hover:border-indigo-500/30 transition-colors">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Monthly</p>
                        <div className="flex flex-col gap-1">
                           <span className="text-2xl font-black">$8,500</span>
                           <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">+4.2% GROWTH</span>
                        </div>
                     </div>
                     <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 hover:border-indigo-500/30 transition-colors">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Package</p>
                        <div className="flex flex-col gap-1">
                           <span className="text-2xl font-black">$102k</span>
                           <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">+5.8% GROWTH</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6 pt-2">
                     <div className="group/progress">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                           <span className="text-slate-400">Basic Pay Growth</span>
                           <span className="text-emerald-400">+8.5%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500 group-hover/progress:bg-emerald-500 transition-colors" style={{ width: '85%' }}></div>
                        </div>
                     </div>
                     <div className="group/progress">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                           <span className="text-slate-400">Allowances Factor</span>
                           <span className="text-indigo-400">+4.2%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-400 opacity-50 group-hover/progress:opacity-100 transition-all" style={{ width: '60%' }}></div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Design Detail */}
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
         </div>

         {/* Right Column: Breakdown Ecology */}
         <div className="xl:col-span-8 space-y-12">
            
            {/* Earnings Architecture */}
            <section className="bg-white rounded-[64px] border border-slate-50 shadow-soft overflow-hidden group">
               <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-white shadow-soft text-indigo-600 rounded-3xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                        <TrendingUp size={28} />
                     </div>
                     <div>
                        <h4 className="text-lg font-black uppercase tracking-tight text-slate-800 leading-none mb-1">Monthly Earnings</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Calculated Compensation Protocol</p>
                     </div>
                  </div>
                  <span className="px-5 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-100">Frequency: Monthly</span>
               </div>

               <div className="p-12 space-y-8">
                  {earnings.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group/row cursor-pointer transition-all border-b border-dashed border-slate-100 pb-5 last:border-0 last:pb-0 hover:bg-slate-50/50 -mx-4 px-4 rounded-2xl">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] group-hover/row:text-slate-900 transition-colors">{item.label}</p>
                       <div className="flex items-center gap-4">
                          <p className="text-base font-black text-slate-800 tracking-tight">{item.amount}</p>
                          <ChevronRight size={14} className="text-slate-200 group-hover/row:translate-x-1 group-hover/row:text-indigo-400 transition-all" />
                       </div>
                    </div>
                  ))}
                  <div className="pt-10 mt-4 bg-slate-50/50 -mx-12 px-12 pb-12 rounded-b-[64px] flex items-center justify-between border-t border-slate-100">
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Component sum</p>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Gross Earnings</h5>
                     </div>
                     <p className="text-2xl font-black text-indigo-600 tracking-tighter">$8,500.00</p>
                  </div>
               </div>
            </section>

            {/* Deductions Architecture */}
            <section className="bg-white rounded-[64px] border border-slate-50 shadow-soft overflow-hidden group">
               <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center group-hover:-rotate-6 transition-transform">
                        <Lock size={28} />
                     </div>
                     <div>
                        <h4 className="text-2xl font-black uppercase tracking-tight text-slate-800 leading-none mb-1">Deductions</h4>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Compliance & Security Retention</p>
                     </div>
                  </div>
                  <span className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em]">Automated Retention</span>
               </div>

               <div className="p-12 space-y-8">
                  {deductions.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group/row cursor-pointer transition-all border-b border-dashed border-slate-100 pb-5 last:border-0 last:pb-0 hover:bg-rose-50/30 -mx-4 px-4 rounded-2xl">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] group-hover/row:text-slate-900 transition-colors">{item.label}</p>
                       <p className="text-base font-black text-rose-500 tracking-tight">{item.amount}</p>
                    </div>
                  ))}
                  <div className="pt-10 flex items-center justify-between border-t border-slate-100">
                     <p className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em]">Total Deductions Retention</p>
                     <p className="text-2xl font-black text-rose-500 tracking-tighter">$680.00</p>
                  </div>
               </div>
            </section>

            {/* Net Pay Conclusion */}
            <div className="p-14 bg-linear-to-r from-slate-900 to-slate-800 rounded-[56px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group border-b-[16px] border-b-emerald-500 shadow-3xl shadow-slate-200">
               <div className="relative z-10 flex items-center gap-8">
                  <div className="w-24 h-24 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-[36px] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                     <CheckCircle2 size={42} className="text-white" />
                  </div>
                  <div>
                     <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">Estimated Monthly Net Disbursement</p>
                     <h3 className="text-4xl font-black tracking-tighter leading-none text-white">$7,820.00</h3>
                  </div>
               </div>
               <div className="relative z-10 text-right flex flex-col items-center md:items-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-6 bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/20">Secure Audit Protocol Ready</p>
                  <button 
                    onClick={() => navigate('/admin/payroll-management/reports')}
                    className="px-12 py-6 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[24px] hover:bg-indigo-700 hover:shadow-indigo-500/50 hover:-translate-y-1 active:scale-95 transition-all shadow-2xl shadow-indigo-900/50"
                  >
                     Approve Salary Protocol
                  </button>
               </div>
               {/* Pattern Detail */}
               <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default SalaryStructure;
