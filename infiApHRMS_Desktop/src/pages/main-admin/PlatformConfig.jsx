import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  ShieldCheck, 
  Workflow, 
  Zap, 
  Bell, 
  ShieldAlert, 
  HardDrive, 
  Share2, 
  ChevronRight, 
  Plus, 
  Trash2, 
  RefreshCw,
  Clock,
  DollarSign,
  Lock,
  Mail,
  Smartphone,
  Info,
  ChevronDown,
  Database,
  Cloud,
  FileDown,
  FileUp,
  Layout,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Externalized Component to prevent focus loss
const Toggle = ({ active, onClick }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`relative w-12 h-7 rounded-full transition-all duration-500 ease-in-out p-1 cursor-pointer ${active ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200'}`}
  >
    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-500 ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
  </div>
);

const PlatformConfig = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecutingCache, setIsExecutingCache] = useState(false);

  const [toggles, setToggles] = useState({
    maintenanceMode: false,
    autoApproval: true,
    smartAssignment: false,
    twoFactor: true,
    emailAlerts: true,
    pushNotifications: true
  });

  const [params, setParams] = useState({
    language: 'English (United States)',
    timezone: '(GMT-08:00) Pacific Time',
    currency: 'USD ($) - 1,234.56'
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggle = (key) => {
    const newState = !toggles[key];
    setToggles(prev => ({ ...prev, [key]: newState }));
    showNotification(`Infrastructure node ${key.replace(/([A-Z])/g, ' $1').trim()} updated to ${newState ? 'ACTIVE' : 'INACTIVE'}.`);
  };

  const handleParamChange = (key, val) => {
    setParams(prev => ({ ...prev, [key]: val }));
    showNotification(`Global Parameter: ${key.charAt(0).toUpperCase() + key.slice(1)} synchronized.`);
  };

  const handleSave = () => {
    setIsSaving(true);
    showNotification('Master Configuration: Deploying institutional nodes across clusters...');
    setTimeout(() => {
      setIsSaving(false);
      showNotification('Success: Architecture parameters successfully deployed to master core.');
    }, 2000);
  };

  const handleExecuteCache = () => {
    if (window.confirm('Institutional Security Alert: Rebuilding system indexes will cause temporary volatility. Proceed with cache purge?')) {
      setIsExecutingCache(true);
      showNotification('Risk Node: Initiating master cache purge and index reconstruction...');
      setTimeout(() => {
        setIsExecutingCache(false);
        showNotification('Operation Complete: System indexes reconstructed successfully.');
      }, 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-40 relative">
       
       {/* Premium Notification Toast */}
       {notification && (
          <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[24px] shadow-3xl border border-white/10">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification}</span>
          </div>
       )}

       <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-50 pb-12 px-2">
          <div className="flex items-center gap-6">
             <button onClick={() => navigate('/main-admin/dashboard')} className="w-14 h-14 bg-slate-900 text-white rounded-[24px] hover:bg-indigo-600 transition-all flex items-center justify-center shadow-xl active:scale-95">
                <Layout size={24} />
             </button>
             <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">Platform Logic</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] leading-none">Global HCM Instance Parameters & Infrastructure</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-soft cursor-pointer hover:bg-slate-50 transition-all">
                <Search size={18} />
             </div>
             <div className="w-12 h-12 rounded-[20px] bg-amber-50 flex items-center justify-center border border-amber-100 shadow-soft">
                <div className="text-[10px] font-black text-amber-600">JS</div>
             </div>
          </div>
       </div>

       <div className="bg-white rounded-[56px] border border-slate-100 shadow-soft overflow-hidden">
          
          <div className="p-12 space-y-16">
             
             {/* Quick Settings Section */}
             <section className="space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/50">
                        <Zap size={20} />
                      </div>
                      <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Critical Protocol</h3>
                   </div>
                   <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      System Nominative
                   </span>
                </div>
                <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 group hover:border-indigo-100 transition-all cursor-pointer" onClick={() => handleToggle('maintenanceMode')}>
                   <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">Master Maintenance Node</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Redirect all client nodes to scheduled administrative state</p>
                   </div>
                   <Toggle active={toggles.maintenanceMode} onClick={() => handleToggle('maintenanceMode')} />
                </div>
             </section>

             {/* System Preferences Section */}
             <section className="space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/50">
                    <Globe size={20} />
                   </div>
                   <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Institutional Regions</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {[
                      { key: 'language', label: 'Identity Language', icon: Globe, options: ['English (United States)', 'Spanish (ES)', 'Hindi (IN)', 'French (FR)'] },
                      { key: 'timezone', label: 'Temporal Cluster', icon: Clock, options: ['(GMT-08:00) Pacific Time', '(GMT+00:00) UTC', '(GMT+05:30) IST'] },
                      { key: 'currency', label: 'Financial Matrix', icon: DollarSign, options: ['USD ($) - 1,234.56', 'INR (₹) - 1,234.56', 'EUR (€) - 1,234.56'] }
                   ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[28px] group hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 shadow-sm relative pr-20">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-all">
                               <item.icon size={20} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-2">{item.label}</p>
                               <select 
                                 value={params[item.key]}
                                 onChange={(e) => handleParamChange(item.key, e.target.value)}
                                 className="bg-transparent border-none p-0 text-sm font-black uppercase tracking-tight outline-none cursor-pointer appearance-none group-hover:text-white w-full"
                               >
                                  {item.options.map(opt => <option key={opt} className="text-slate-900">{opt}</option>)}
                               </select>
                            </div>
                         </div>
                         <ChevronDown size={18} className="text-slate-200 group-hover:text-white absolute right-8" />
                      </div>
                   ))}
                </div>
             </section>

             {/* Workflow Automation Section */}
             <section className="space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/50">
                    <Workflow size={20} />
                   </div>
                   <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Logical Automation Flow</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[
                     { key: 'autoApproval', label: 'Auto-Approval Engine', desc: 'Sync standard leave requests via core logic' },
                     { key: 'smartAssignment', label: 'Cluster Assignment', desc: 'Auto-provision tickets to available assets' }
                   ].map(workflow => (
                     <div key={workflow.key} className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => handleToggle(workflow.key)}>
                        <div>
                           <p className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2 leading-none">{workflow.label}</p>
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">{workflow.desc}</p>
                        </div>
                        <Toggle active={toggles[workflow.key]} onClick={() => handleToggle(workflow.key)} />
                     </div>
                   ))}
                </div>
             </section>

             {/* Security Settings Section */}
             <section className="space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/50">
                    <ShieldCheck size={20} />
                   </div>
                   <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Identity Integrity</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   <div className="flex items-center justify-between p-8 bg-amber-50/20 border border-amber-100 rounded-[32px] group" onClick={() => handleToggle('twoFactor')}>
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-100/50 group-hover:scale-110 transition-transform">
                            <Smartphone size={28} />
                         </div>
                         <div>
                            <p className="text-[15px] font-black text-slate-800 uppercase tracking-tight mb-2 leading-none">Mandatory Institutional 2FA</p>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Identity verification gate for all master entities</p>
                         </div>
                      </div>
                      <Toggle active={toggles.twoFactor} onClick={() => handleToggle('twoFactor')} />
                   </div>
                   <div className="flex items-center justify-between p-8 bg-white border border-slate-50 rounded-[32px] hover:border-indigo-600 group transition-all cursor-pointer" onClick={() => showNotification('Security: Initializing identity policy constructor...')}>
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Lock size={22} />
                         </div>
                         <div>
                            <p className="text-[15px] font-black text-slate-800 uppercase tracking-tight mb-2 leading-none">Encryption Complexity</p>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Global HCM password node requirement: Min 12 chars</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-600 transition-all" />
                   </div>
                </div>
             </section>

             {/* Integrations Section */}
             <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/50">
                        <Share2 size={20} />
                      </div>
                      <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Master Interconnects</h3>
                   </div>
                   <button className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.25em] hover:underline">Sync All Channels</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="p-10 border border-slate-100 rounded-[40px] bg-slate-50/50 flex flex-col items-center text-center space-y-6 group transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900 cursor-pointer shadow-sm active:scale-95" onClick={() => showNotification('Cloud Interconnect: Verified AWS S3 cluster integrity.')}>
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl group-hover:bg-white/10 group-hover:text-white transition-all">
                         <Globe size={28} />
                      </div>
                      <div>
                         <p className="text-[13px] font-black uppercase tracking-tight mb-2">Workspace Cloud</p>
                         <div className="flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Connected Node Status</p>
                         </div>
                      </div>
                   </div>
                   <div className="p-10 border border-slate-100 rounded-[40px] bg-slate-50/50 flex flex-col items-center text-center space-y-6 group transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900 cursor-pointer shadow-sm active:scale-95" onClick={() => showNotification('Service Node: Initializing Slack protocol link payload...')}>
                      <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:bg-white/10 group-hover:text-white transition-all">
                         <Smartphone size={28} />
                      </div>
                      <div>
                         <p className="text-[13px] font-black uppercase tracking-tight mb-2">Institutional Slack</p>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Inactive Sync Point</p>
                      </div>
                   </div>
                </div>
             </section>

             {/* Data & Backup Section */}
             <section className="space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/50">
                    <HardDrive size={20} />
                   </div>
                   <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Master Data Integrity</h3>
                </div>
                <div className="p-10 bg-slate-900 rounded-[48px] text-white space-y-10 relative overflow-hidden shadow-3xl shadow-slate-200">
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5">
                            <Cloud size={24} className="text-indigo-400" />
                         </div>
                         <div>
                            <p className="text-[13px] font-black uppercase tracking-tight mb-1">Institutional Cloud Backup</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Last successful sequence: Today, 02:00 AM EST</p>
                         </div>
                      </div>
                      <button className="px-5 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">Edit Node</button>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                      <button className="flex items-center justify-center gap-4 py-5 bg-white/5 border border-white/5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-slate-900 transition-all active:scale-95" onClick={() => showNotification('Data Inbound: Preparing encryption key for master import...')}>
                         <FileDown size={18} /> Import Payload
                      </button>
                      <button className="flex items-center justify-center gap-4 py-5 bg-white/5 border border-white/5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-slate-900 transition-all active:scale-95" onClick={() => showNotification('Data Outbound: Building institutional archive for export...')}>
                         <FileUp size={18} /> Export Archive
                      </button>
                   </div>
                   <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]"></div>
                </div>
             </section>

             {/* Notifications Section */}
             <section className="space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/50">
                    <Bell size={20} />
                   </div>
                   <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Platform Dispatch</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                   {[
                     { key: 'emailAlerts', label: 'Cloud Identity Alerts', sub: 'Primary synchronization notifications', icon: Mail },
                     { key: 'pushNotifications', label: 'Device Push Vectors', sub: 'Global HCM instant alerts', icon: Smartphone }
                   ].map(notif => (
                     <div key={notif.key} className="flex items-center justify-between group pointer-events-auto" onClick={() => handleToggle(notif.key)}>
                        <div className="flex items-center gap-6 cursor-pointer">
                           <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <notif.icon size={18} />
                           </div>
                           <div>
                            <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight mb-1 leading-none">{notif.label}</p>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">{notif.sub}</p>
                           </div>
                        </div>
                        <Toggle active={toggles[notif.key]} onClick={() => handleToggle(notif.key)} />
                     </div>
                   ))}
                </div>
             </section>

             {/* System & Risks Section */}
             <section className="space-y-8 pt-12 border-t-2 border-slate-50">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center border border-rose-100/50">
                    <ShieldAlert size={20} />
                   </div>
                   <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Master System Integrity</h3>
                </div>
                <div className="p-10 bg-rose-50/30 rounded-[48px] border border-rose-100/50 flex flex-col lg:flex-row items-center justify-between gap-10 group relative overflow-hidden">
                   <div className="flex-1 relative z-10">
                      <h4 className="text-base font-black text-rose-600 uppercase tracking-tight mb-2">Logic Cache Purge</h4>
                      <p className="text-[10px] font-black text-rose-400 leading-relaxed uppercase tracking-[0.25em] mb-4">Reconstruct master system indexes and clear institutional memory.</p>
                      <div className="flex items-start gap-3 p-4 bg-white/50 rounded-2xl border border-rose-100/50">
                        <Info size={14} className="text-rose-400 shrink-0 mt-0.5" />
                        <p className="text-[9px] font-bold text-rose-300 uppercase tracking-widest leading-relaxed">WARNING: Node performance will be volatile for approx 300s during reconstruction. Sync events may be delayed.</p>
                      </div>
                   </div>
                   <button 
                    disabled={isExecutingCache}
                    onClick={handleExecuteCache}
                    className={`px-10 py-5 bg-rose-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-[24px] shadow-2xl shadow-rose-200 hover:bg-slate-900 transition-all active:scale-95 relative z-10 flex items-center gap-3 ${isExecutingCache ? 'opacity-70 cursor-not-allowed' : ''}`}
                   >
                      {isExecutingCache ? <RefreshCw size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                      {isExecutingCache ? 'Executing Purge...' : 'Purge Master Cache'}
                   </button>
                   <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-200/20 rounded-full blur-[80px]"></div>
                </div>
             </section>

             {/* Save Button Suite */}
             <div className="flex flex-col sm:flex-row gap-6 pt-12 border-t-2 border-slate-50">
                <button 
                   disabled={isSaving}
                   onClick={handleSave}
                   className={`flex-1 py-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.45em] rounded-[32px] shadow-3xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 relative overflow-hidden group ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                   {isSaving ? (
                     <div className="flex items-center justify-center gap-3">
                        <RefreshCw size={18} className="animate-spin" />
                        Deploying...
                     </div>
                   ) : (
                      <>
                        Deploy Configuration
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      </>
                   )}
                </button>
                <button 
                   onClick={() => {
                     if(window.confirm('Institutional Protocol: Revert architecture to master factory baselines?')) {
                       showNotification('Reset: Core parameters restored to master baselines.');
                     }
                   }}
                   className="px-12 py-6 bg-white border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-[32px] hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95"
                >
                   Institutional Reset
                </button>
             </div>

          </div>
       </div>
    </div>
  );
};

export default PlatformConfig;
