import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  MapPin, 
  Globe, 
  Contact, 
  ChevronLeft, 
  ArrowUpRight, 
  CreditCard, 
  History, 
  ShieldAlert, 
  ChevronRight,
  MoreVertical,
  Edit3,
  ExternalLink,
  Plus,
  FileText,
  RefreshCw,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const CompanyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notification, setNotification] = useState(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated dynamic company data state
  const [company, setCompany] = useState({
    name: id ? id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Acme Corp',
    status: 'ACTIVE',
    website: id ? `${id}.com` : 'acmecorp.com',
    industry: 'Software & Technology',
    size: '1,000 - 5,000 employees',
    headquarters: 'San Francisco, CA',
    primaryContact: 'Jane Smith (HR Director)',
    stats: {
      totalEmployees: '1,240',
      activeUsers: '982',
      departments: '12',
      growth: '+12%',
      target: '1,100'
    },
    billing: {
      plan: 'Enterprise Plan',
      features: 'Full suite, unlimited storage',
      price: '$2,450.00',
      period: '/month',
      renewal: 'Oct 12, 2024',
      nextPayment: 'Sept 12, 2024'
    },
    activity: [
      { id: 1, type: 'USER', msg: 'New user added: Marcus Aurelius (Marketing)', time: '2 hours ago', icon: Plus, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { id: 2, type: 'POLICY', msg: 'Security Policy Update: Enabled 2FA for all admins', time: 'Yesterday, 4:15 PM', icon: ShieldAlert, color: 'text-indigo-500', bg: 'bg-indigo-50' },
      { id: 3, type: 'BILLING', msg: 'Billing cycle completed: Invoice #INV-8821 paid', time: 'Aug 25, 2024', icon: History, color: 'text-amber-500', bg: 'bg-amber-50' },
    ]
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    // Simulate loading sequence
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [id]);

  const handleSuspend = () => {
    if (window.confirm('Institutional Security Alert: Suspending this node will immediately revoke all employee access and freeze financial disbursements. Continue?')) {
      setIsSuspending(true);
      showNotification('Risk Node: Propagating suspension signal across cluster nodes...');
      setTimeout(() => {
        setCompany(prev => ({ ...prev, status: 'SUSPENDED' }));
        setIsSuspending(false);
        showNotification('Update: Institutional node successfully suspended. All access revoked.');
      }, 2000);
    }
  };

  const handleActivate = () => {
    showNotification('Provisioning: Re-authorizing institutional credentials...');
    setTimeout(() => {
      setCompany(prev => ({ ...prev, status: 'ACTIVE' }));
      showNotification('Success: Institutional node re-activated and synchronized.');
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-6">
          <RefreshCw size={48} className="text-indigo-600 animate-spin mx-auto" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Node Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-12 animate-in fade-in duration-1000 pb-40 px-4 relative">
       
       {/* Premium Notification Toast */}
       {notification && (
          <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[24px] shadow-3xl border border-white/10">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification}</span>
          </div>
       )}

       <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-50 pb-12">
          <div className="flex items-center gap-6">
             <button onClick={() => navigate('/main-admin/dashboard')} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-[24px] hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center shadow-sm">
                <ChevronLeft size={28} />
             </button>
             <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">Node Intelligence</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] leading-none">Organizational Directory / {company.name}</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => company.status === 'ACTIVE' ? handleSuspend() : handleActivate()}
                className={`px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-3 border
                   ${company.status === 'ACTIVE' ? 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'}`}
             >
                {company.status === 'ACTIVE' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
                {company.status === 'ACTIVE' ? 'Suspend Node' : 'Activate Node'}
             </button>
             <button className="w-14 h-14 bg-white border border-slate-100 rounded-[20px] flex items-center justify-center text-slate-400 shadow-soft hover:bg-slate-900 hover:text-white transition-all">
                <MoreVertical size={24} />
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-10">
             
             {/* Company Hero Card */}
             <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-soft flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
                <div className="w-28 h-28 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 shadow-inner group-hover:scale-110 transition-transform duration-500 relative">
                   <Building2 size={56} />
                   <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg animate-pulse ${company.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                </div>
                <div className="flex-1 text-center md:text-left">
                   <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                      <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">{company.name}</h2>
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${company.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>{company.status}</span>
                   </div>
                   <div 
                      onClick={() => showNotification('External Link: Navigating to institution gateway...')}
                      className="flex items-center justify-center md:justify-start gap-3 text-xs font-black text-indigo-600 lowercase hover:underline cursor-pointer transition-all tracking-tight"
                    >
                      <Globe size={16} className="text-indigo-400" /> @{company.website}
                   </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto relative z-10">
                   <button 
                    onClick={() => showNotification('Configuration: Accessing profile encryption suite...')}
                    className="px-10 py-5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-[24px] shadow-3xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                   >
                      <Edit3 size={18} /> Edit Core Identity
                   </button>
                   <button onClick={() => navigate('/main-admin/user-management')} className="px-10 py-5 bg-white border border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] rounded-[24px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm">
                      <Users size={18} /> Manage Access
                   </button>
                </div>
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-slate-50 rounded-full blur-[100px] -z-10 group-hover:bg-indigo-50/50 transition-colors"></div>
             </div>

             {/* Company Information */}
             <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-soft space-y-12 group">
                <div className="flex items-center gap-4 pb-8 border-b border-slate-50">
                   <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <Info size={24} />
                   </div>
                   <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-[0.3em]">Governance Metadata</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {[
                      { label: 'Industry Vector', val: company.industry, icon: Activity },
                      { label: 'Cloud Scale', val: company.size, icon: Cloud },
                      { label: 'Institutional HQ', val: company.headquarters, icon: MapPin },
                      { label: 'Primary Delegate', val: company.primaryContact, icon: Users, isContact: true }
                   ].map((item, i) => (
                      <div key={i} className="group/item flex flex-col gap-3">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.35em] leading-none mb-1">{item.label}</p>
                         <div className="flex items-center gap-4 group/box">
                            {item.isContact ? (
                               <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg group-hover/item:scale-110 transition-transform">
                                  {item.val.charAt(0)}
                               </div>
                            ) : (
                               <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                  <item.icon size={16} />
                               </div>
                            )}
                            <p className="text-sm font-black text-slate-800 tracking-tight uppercase group-hover/item:text-indigo-600 transition-colors">{item.val}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Subscription & Billing */}
             <div className="bg-slate-900 p-12 rounded-[56px] text-white shadow-3xl shadow-slate-200 space-y-12 relative overflow-hidden group">
                <div className="flex items-center justify-between pb-8 border-b border-white/5 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md text-emerald-400 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:rotate-12 transition-transform">
                         <CreditCard size={24} />
                      </div>
                      <h3 className="text-[13px] font-black text-white uppercase tracking-[0.3em]">Financial Ledger</h3>
                   </div>
                   <button 
                    onClick={() => showNotification('Audit Hub: Generating invoice historical archive...')}
                    className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] hover:text-white transition-all flex items-center gap-3 bg-white/5 px-6 py-2 rounded-xl border border-white/5"
                   >
                      View Statements <ExternalLink size={14} />
                   </button>
                </div>
                <div className="p-10 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10 group-hover:border-white/10 transition-all">
                   <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-slate-900 shadow-2xl group-hover:scale-110 transition-transform">
                         <Building2 size={32} />
                      </div>
                      <div>
                         <p className="text-[17px] font-black text-white uppercase tracking-tighter leading-none mb-2">{company.billing.plan}</p>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] leading-none">{company.billing.features}</p>
                      </div>
                   </div>
                   <div className="text-center md:text-right">
                      <p className="text-4xl font-black text-white tracking-tighter leading-none mb-2">{company.billing.price}</p>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">{company.billing.period}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-8 relative z-10">
                   <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 leading-none">Renewal Sequence</p>
                      <p className="text-[15px] font-black text-white tabular-nums uppercase tracking-tight">{company.billing.renewal}</p>
                   </div>
                   <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 leading-none">Net Disburstment</p>
                      <p className="text-[15px] font-black text-white tabular-nums uppercase tracking-tight">{company.billing.nextPayment}</p>
                   </div>
                </div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
             </div>

             {/* Recent Activity */}
             <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-soft space-y-12">
                <div className="flex items-center gap-4 pb-8 border-b border-slate-50">
                   <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shadow-inner">
                      <History size={24} />
                   </div>
                   <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-[0.3em]">Master Audit Stream</h3>
                </div>
                <div className="space-y-6">
                   {company.activity.map((item) => (
                      <div key={item.id} className="flex items-start gap-6 p-6 hover:bg-slate-50/50 rounded-[32px] transition-all group border border-transparent hover:border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1">
                         <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-[20px] shrink-0 flex items-center justify-center shadow-lg`}>
                            <item.icon size={20} />
                         </div>
                         <div className="flex-1 pt-1">
                            <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight leading-relaxed">{item.msg}</p>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
                               <Clock size={12} /> {item.time}
                            </p>
                         </div>
                         <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-200 hover:text-slate-900">
                            <MoreVertical size={20} />
                         </button>
                      </div>
                   ))}
                </div>
                <button 
                  onClick={() => showNotification('Audit Engine: Querying comprehensive instance logs...')}
                  className="w-full py-5 text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] hover:bg-indigo-50 border-2 border-dashed border-indigo-100 rounded-[32px] transition-all"
                >
                  Retrieve All Instance Logs
                </button>
             </div>

          </div>

          {/* Right/Stats Column */}
          <aside className="lg:col-span-4 space-y-10">
             
             {/* Mini Stats Card */}
             <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-soft space-y-10 group overflow-hidden relative">
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Personnel Cluster</p>
                   <div className="flex items-end justify-between">
                      <span className="text-5xl font-black text-slate-800 tracking-tighter tabular-nums leading-none">{company.stats.totalEmployees}</span>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-500 rounded-lg text-[10px] font-black border border-emerald-100 transform group-hover:scale-110 transition-transform">
                         <ArrowUpRight size={14} /> {company.stats.growth}
                      </div>
                   </div>
                </div>
                <div className="space-y-4 pt-10 border-t border-slate-50">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Live Node Activity</p>
                   <div className="flex items-end justify-between">
                      <span className="text-5xl font-black text-slate-800 tracking-tighter tabular-nums leading-none">{company.stats.activeUsers}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Cap: {company.stats.target}</span>
                   </div>
                </div>
                <div className="space-y-4 pt-10 border-t border-slate-50">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Deployment Nodes</p>
                   <div className="flex items-end justify-between">
                      <span className="text-5xl font-black text-slate-800 tracking-tighter tabular-nums leading-none">{company.stats.departments}</span>
                      <div className="flex flex-col items-end">
                         <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">New Sync</span>
                         <span className="text-[14px] font-black text-slate-800 tracking-tighter">+3 Nodes</span>
                      </div>
                   </div>
                </div>
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-slate-50 rounded-full blur-[60px] group-hover:bg-indigo-50/50 transition-colors"></div>
             </div>

             {/* Quick Links / Docs */}
             <div className="bg-indigo-600 p-12 rounded-[56px] text-white shadow-3xl shadow-indigo-200 text-center space-y-8 relative overflow-hidden group hover:bg-slate-900 transition-colors duration-500">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md text-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/5 group-hover:rotate-12 transition-transform">
                   <FileText size={40} />
                </div>
                <div>
                   <h4 className="text-[15px] font-black uppercase tracking-[0.2em] mb-3">Provisioning Audit</h4>
                   <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] leading-relaxed group-hover:text-slate-500 transition-colors">Execute initial institutional onboarding trace for node 0x902.</p>
                </div>
                <button 
                  onClick={() => showNotification('Audit Hub: Downloading comprehensive institutional trace...')}
                  className="w-full py-5 bg-white text-indigo-600 text-[11px] font-black uppercase tracking-[0.4em] rounded-[24px] shadow-xl hover:bg-indigo-50 transition-all active:scale-95"
                >
                  Master Audit Report
                </button>
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-[80px]"></div>
             </div>

          </aside>

       </div>
    </div>
  );
};

export default CompanyDetails;
