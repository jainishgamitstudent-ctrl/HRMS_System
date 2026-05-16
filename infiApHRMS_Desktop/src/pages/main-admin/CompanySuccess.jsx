import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronLeft, 
  Building2, 
  ArrowRight,
  Monitor,
  LayoutDashboard,
  ExternalLink,
  ShieldCheck,
  Check,
  RefreshCw,
  Copy,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanySuccess = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const copyEntityId = () => {
    navigator.clipboard.writeText('INF-TX-2024-001');
    showNotification('Identity Hub: Entity ID copied to system clipboard.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 animate-in fade-in zoom-in duration-1000 relative overflow-hidden">
      
      {/* Premium Notification Toast */}
      {notification && (
          <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[24px] shadow-3xl border border-white/10">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification}</span>
          </div>
      )}

      {/* Hero Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[160px] -z-10"></div>

      <div className="relative w-full max-w-2xl">
        
        <div className="bg-white rounded-[64px] border border-slate-100 shadow-soft p-16 text-center relative z-10 space-y-12">
          
          {/* Success Checkmark Circle */}
          <div className="relative mx-auto w-40 h-40">
            <div className="absolute inset-0 bg-emerald-50 rounded-[48px] scale-125 opacity-40 animate-pulse"></div>
            <div className="absolute inset-0 bg-emerald-100/30 rounded-[48px] animate-ping duration-[4000ms]"></div>
            <div className="relative w-full h-full bg-emerald-500 text-white rounded-[48px] flex items-center justify-center shadow-3xl shadow-emerald-100 border-8 border-white group hover:rotate-12 transition-transform duration-500">
               <Check size={72} strokeWidth={4} />
            </div>
          </div>

          <div className="space-y-6">
             <div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-4 block">Deployment Successful</span>
                <h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">Institutional Node Provisioned</h2>
             </div>
             <p className="text-sm font-bold text-slate-400 mx-auto max-w-md leading-relaxed uppercase tracking-tight">
                The enterprise entity <span className="text-indigo-600 font-black">TechMishra Solutions</span> has been successfully integrated into the platform architecture.
             </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
             <button 
               onClick={() => {
                  showNotification('Provisioning: Finalizing node synchronization...');
                  setTimeout(() => navigate('/main-admin/dashboard'), 1000);
               }}
               className="flex items-center justify-center gap-4 py-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[32px] shadow-3xl hover:bg-indigo-600 transition-all group active:scale-95"
             >
                Dashboard <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
             </button>
             <button 
               onClick={() => navigate('/main-admin/company-setup')}
               className="flex items-center justify-center gap-4 py-6 bg-white border-2 border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] rounded-[32px] hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95 shadow-sm"
             >
                <Plus size={18} /> New Setup
             </button>
          </div>

          {/* Entity ID Card */}
          <div 
            onClick={copyEntityId}
            className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 flex items-center justify-between text-left group hover:border-indigo-200 hover:bg-white transition-all cursor-pointer shadow-sm active:scale-95"
          >
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-500 shadow-xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                   <Building2 size={32} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-2">Master Entity ID</p>
                   <p className="text-xl font-black text-slate-800 uppercase tabular-nums tracking-tighter">INF-TX-2024-001</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse group-hover:bg-white"></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live</span>
                </div>
                <Copy size={18} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
             </div>
          </div>

          {/* Site Footer Link */}
          <div className="pt-8 flex items-center justify-center gap-3 text-slate-200">
             <ShieldCheck size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">InfiAP Autonomous Infrastructure</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompanySuccess;
