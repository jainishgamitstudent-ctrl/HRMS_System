import React, { useState } from 'react';
import { 
  Globe, Mail, ShieldAlert, ChevronLeft, Cloud, CheckCircle2, ShieldCheck, 
  RefreshCw, Key, Lock, Search, AlertTriangle, HelpCircle, HardDrive, Cpu, 
  MoreVertical, Settings, Users, LogOut, ChevronRight, Activity, Server
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ToggleButton = ({ active, onClick }) => (
  <button onClick={onClick} className={`w-12 h-6 flex items-center rounded-full px-1 transition-all duration-300 ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
  </button>
);

const ConfigGoogleView = ({ setView }) => (
  <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-20">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={() => setView('cloud')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
        <ChevronLeft size={20} className="text-slate-600" />
      </button>
      <h1 className="text-2xl font-black text-slate-800 tracking-tight">Google Cloud Configuration</h1>
    </div>

    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
        <CheckCircle2 size={16} />
      </div>
      <span className="text-sm font-black text-emerald-700">Integration successfully connected</span>
    </div>

    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <h2 className="text-lg font-black text-slate-800 mb-2">API Details</h2>
      <p className="text-xs font-bold text-slate-400 mb-8">Enter your Google Cloud credentials to sync data with InfiAP securely.</p>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wide">API Key</label>
          <input type="text" defaultValue="AIzaSyC_BX90ZkXj1Z_9LpQ-4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Client ID</label>
          <input type="text" defaultValue="xxxx.apps.googleusercontent.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10" disabled />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Secret Key</label>
          <input type="password" defaultValue="super-secret-key-123" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Redirect URL</label>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600">https://api.infiap.com/auth/google/callback</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <button className="w-full py-4 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
          <RefreshCw size={16} /> Connection Test
        </button>
        <button className="w-full py-4 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
          Save Integration
        </button>
        <button className="w-full py-4 bg-white text-slate-500 rounded-xl text-sm font-black tracking-widest hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
          Disconnect
        </button>
      </div>
    </div>
  </div>
);

const ConfigAwsView = ({ setView }) => (
  <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-20">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('cloud')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">AWS Configuration</h1>
      </div>
      <button className="text-sm font-black text-indigo-600 hover:text-indigo-700">Help</button>
    </div>

    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
          <Cloud size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 leading-none mb-1">Cloud Integration</h2>
          <p className="text-xs font-bold text-slate-400">InfiAP Cloud Sync & Backups</p>
        </div>
      </div>
      <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8">Securely connect your Amazon Web Services account. This allows automated infrastructure backups and real-time resource synchronization.</p>

      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex gap-4 mb-8">
        <div className="text-indigo-500 shrink-0"><AlertTriangle size={20} /></div>
        <div>
          <h4 className="text-sm font-black text-indigo-800 mb-1">Action Required</h4>
          <p className="text-xs font-bold text-indigo-600/80 leading-relaxed">Your connection is currently inactive. Please provide valid IAM credentials to start syncing.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Access Key ID</label>
          <input type="text" placeholder="AKIAIOSFODNN7EXAMPLE" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Secret Access Key</label>
          <div className="relative">
            <input type="password" placeholder="••••••••••••••••••••••••" className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300" />
            <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Default Region</label>
          <div className="relative">
            <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none">
              <option>US East (N. Virginia)</option>
              <option>US West (Oregon)</option>
              <option>EU (Frankfurt)</option>
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
          </div>
        </div>
      </div>

      <div className="mt-8 mb-6">
        <button className="w-full py-4 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
           Test Connection
        </button>
      </div>

      <div className="flex items-start gap-4 mb-8 px-4">
        <Lock className="text-slate-300 shrink-0 mt-0.5" size={14} />
        <p className="text-[10px] font-bold text-slate-400 leading-relaxed text-center">Credentials are encrypted using AES-256 at rest. InfiAP never stores your secret keys in plaintext. We recommend using an IAM role with restricted programmatic access.</p>
      </div>

      <button className="w-full py-4 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
        <HardDrive size={16} /> Save Changes
      </button>
    </div>
  </div>
);

const CloudView = ({ setView }) => {
  const [toggles, setToggles] = useState({ auto: true, backup: true, cost: false });
  
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('hub')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">SYSTEM INTEGRATIONS</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Cloud Services</h1>
          </div>
        </div>
        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-colors">
          <Search size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-2">Overall Cloud Health</h3>
            <div className="flex items-end gap-2 mb-6 relative z-10">
              <span className="text-5xl font-black text-slate-800 tracking-tighter leading-none">99.9%</span>
              <span className="text-emerald-500 text-sm font-black mb-1">↑ Uptime</span>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5">
                <Cloud size={14} /> 4 Active Services
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Stable
              </div>
            </div>
            <Cloud className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-50 opacity-50" size={120} />
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">Resource Utilization</h3>
            </div>
            
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Cpu size={16} /> <span className="text-sm font-black text-slate-800">CPU Usage</span>
                  </div>
                  <span className="text-sm font-black text-indigo-600">65%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">16 / 24 CORES ACTIVE</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-blue-500">
                    <Activity size={16} /> <span className="text-sm font-black text-slate-800">Memory</span>
                  </div>
                  <span className="text-sm font-black text-blue-500">42%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '42%' }}></div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">26.8 GB / 64 GB</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    <HardDrive size={16} /> <span className="text-sm font-black text-slate-800">Storage</span>
                  </div>
                  <span className="text-sm font-black text-amber-500">88%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '88%' }}></div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">1.8 TB / 2.0 TB USED</p>
              </div>
            </div>
            
            <button className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-colors flex justify-center gap-2 items-center">
              <ShieldCheck size={16}/> View System Logs
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">Connected Providers</h3>
              <button className="text-xs font-black text-indigo-600">Manage</button>
            </div>
            <div className="space-y-3">
              <div onClick={() => setView('config-google')} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 cursor-pointer transition-all bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center font-black text-xl text-emerald-500">G</div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Google Cloud</h4>
                    <p className="text-[10px] font-bold text-slate-400">Connected</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>

              <div onClick={() => setView('config-aws')} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 cursor-pointer transition-all bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center font-black text-xl text-amber-500">A</div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">AWS</h4>
                    <p className="text-[10px] font-bold text-amber-500">Needs Auth</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 cursor-pointer transition-all bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center font-black text-xl text-blue-500">Az</div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Microsoft Azure</h4>
                    <p className="text-[10px] font-bold text-slate-400">Active</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded">CONNECTED</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-6">Global Cloud Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">Auto-scaling</h4>
                  <p className="text-[10px] font-bold text-slate-400">Adjust resources on demand</p>
                </div>
                <ToggleButton active={toggles.auto} onClick={() => setToggles({...toggles, auto: !toggles.auto})} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">Backup Sync</h4>
                  <p className="text-[10px] font-bold text-slate-400 text-emerald-500 line-clamp-1">✔ Syncing • active</p>
                </div>
                <ToggleButton active={toggles.backup} onClick={() => setToggles({...toggles, backup: !toggles.backup})} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">Cost Alerts</h4>
                  <p className="text-[10px] font-bold text-slate-400">Notify if budget exceeds $500</p>
                </div>
                <ToggleButton active={toggles.cost} onClick={() => setToggles({...toggles, cost: !toggles.cost})} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const SecurityView = ({ setView }) => (
  <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-20">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('hub')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <ShieldAlert className="text-indigo-600" /> Security Controls
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          System Hardened
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 space-y-6">
        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Global Security Status</h3>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-black tracking-tighter">A+</span>
              <span className="text-emerald-400 text-sm font-black mb-2 uppercase tracking-widest">Reliability Score</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              All infrastructure nodes are currently encrypted with AES-256 GCM. Automated threat detection is active across 14 clusters.
            </p>
          </div>
          <ShieldCheck className="absolute right-[-20px] bottom-[-20px] text-white/5" size={240} />
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6">Protocols & Nodes</h3>
          <div className="space-y-4">
            {[
              { name: 'Multi-Factor Auth', status: 'Active', desc: 'Enforced for all administrative accounts.', icon: ShieldCheck, color: 'text-emerald-500' },
              { name: 'IAM Governance', status: 'Active', desc: 'Role-based access control with monthly audit logs.', icon: Key, color: 'text-blue-500' },
              { name: 'Endpoint Protection', status: 'Standby', desc: 'Real-time monitoring for unauthorized node access.', icon: Activity, color: 'text-amber-500' }
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-5 border border-slate-50 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-indigo-100 transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm ${p.color} group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                    <p.icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-none mb-1.5">{p.name}</h4>
                    <p className="text-xs font-bold text-slate-400 leading-none">{p.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:col-span-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 font-display">System Logs</h3>
          <div className="space-y-6">
            {[
              { msg: 'Unauthorized Login Attempt', time: '12m ago', level: 'CRITICAL', color: 'text-rose-500' },
              { msg: 'API Key Rotated: AWS-PRD', time: '1h ago', level: 'INFO', color: 'text-indigo-500' },
              { msg: 'New Admin Provisioned', time: '3h ago', level: 'AUDIT', color: 'text-emerald-500' }
            ].map((log, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className={log.color}>{log.level}</span>
                  <span className="text-slate-300">{log.time}</span>
                </div>
                <p className="text-xs font-bold text-slate-600 line-clamp-1">{log.msg}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
            Export Audit Trail
          </button>
        </div>

        <div className="bg-indigo-600 rounded-[32px] p-8 text-white">
          <div className="flex items-center gap-3 mb-4 text-indigo-200">
            <Lock size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Security Tip</span>
          </div>
          <p className="text-sm font-bold leading-relaxed mb-6">
            Regularly audit your IAM nodes to prevent permission creep across administrative roles.
          </p>
          <button className="text-xs font-black uppercase tracking-widest hover:underline text-white flex items-center gap-2">
            Read Security Manual <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const EmailView = ({ setView }) => (
  <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-20">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('hub')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2"><Mail className="text-indigo-600" /> InfiAP Email</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-colors"><Search size={18} /></button>
        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-colors"><Users size={18} /></button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Overall System Health</h3>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100">Optimal</span>
          </div>
          <div className="text-5xl font-black text-slate-800 tracking-tighter mb-4">100% Delivery</div>
          <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{width: '100%'}}></div>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-4">All 3 active services are operating without issues.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-800">Connected Services</h3>
            <button className="text-xs font-black text-indigo-600">Add New</button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-blue-500"><Mail size={18} /></div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Google Workspace</h4>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div><p className="text-[10px] font-bold text-slate-500">Connected</p></div>
                </div>
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 shadow-sm hover:text-indigo-600">Configure</button>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-sky-500">@</div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Microsoft Outlook</h4>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div><p className="text-[10px] font-bold text-slate-500">Connected</p></div>
                </div>
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 shadow-sm hover:text-indigo-600">Configure</button>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-slate-400"><Server size={18} /></div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Custom SMTP</h4>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div><p className="text-[10px] font-bold text-slate-400">Not Connected</p></div>
                </div>
              </div>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-slate-900 transition-colors">Connect</button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col">
          <h3 className="text-lg font-black text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-6 flex-1">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 size={12} /></div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Welcome Email Sent</h4>
                <p className="text-[10px] font-bold text-slate-400">To: new.hire@gmail.com</p>
              </div>
              <span className="text-[10px] font-bold text-slate-300 ml-auto pt-1">2m ago</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 size={12} /></div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Password Reset Delivered</h4>
                <p className="text-[10px] font-bold text-slate-400">To: admin.user@infiap.com</p>
              </div>
              <span className="text-[10px] font-bold text-slate-300 ml-auto pt-1">15m ago</span>
            </div>
          </div>
          <button className="w-full mt-6 py-3 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View Full Logs</button>
        </div>
      </div>
    </div>
  </div>
);

const HubView = ({ setView }) => (
  <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">System Integrations</h1>
        <p className="text-xs font-bold text-slate-400">Connect & manage services</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search integrations..." className="bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold w-72 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" />
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
           <img src="https://ui-avatars.com/api/?name=Admin&background=4E63F0&color=fff" className="w-8 h-8 rounded-lg" alt="Admin" />
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Integration Status</h3>
      <div className="flex gap-4">
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
          <Cloud className="text-indigo-500" size={24} />
          <div>
            <p className="text-xs font-bold text-slate-400">Cloud</p>
            <p className="text-xl font-black text-slate-800">2/4</p>
          </div>
        </div>
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
          <Mail className="text-amber-500" size={24} />
          <div>
            <p className="text-xs font-bold text-slate-400">Email</p>
            <p className="text-xl font-black text-slate-800">1/3</p>
          </div>
        </div>
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
          <ShieldCheck className="text-emerald-500" size={24} />
          <div>
            <p className="text-xs font-bold text-slate-400">Secure</p>
            <p className="text-xl font-black text-slate-800">2/3</p>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Cloud Services */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">Cloud Services</h2>
          <button onClick={() => setView('cloud')} className="text-xs font-black text-indigo-600 hover:text-indigo-700">View All</button>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center font-black text-xl text-emerald-500">G</div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Google Cloud</h4>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div><p className="text-[10px] font-bold text-emerald-600">Connected</p></div>
              </div>
            </div>
            <button onClick={() => setView('config-google')} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 shadow-sm hover:text-indigo-600">Configure</button>
          </div>

          <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center font-black text-xl text-amber-500">A</div>
              <div>
                <h4 className="text-sm font-black text-slate-800">AWS Services</h4>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div><p className="text-[10px] font-bold text-slate-400">Not Connected</p></div>
              </div>
            </div>
            <button onClick={() => setView('config-aws')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-slate-900 transition-colors">Connect</button>
          </div>

          <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center font-black text-xl text-blue-500">Az</div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Microsoft Azure</h4>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div><p className="text-[10px] font-bold text-slate-400">Not Connected</p></div>
              </div>
            </div>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-slate-900 transition-colors">Connect</button>
          </div>

        </div>
      </div>

      <div className="space-y-8">
        
        {/* Email System */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Email System</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-rose-500"><Mail size={18} /></div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Google Workspace</h4>
                  <p className="text-[10px] font-bold text-slate-400">Active</p>
                </div>
              </div>
              <button onClick={() => setView('email')} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 shadow-sm hover:text-indigo-600">Configure</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-sky-500">@</div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Outlook 365</h4>
                  <p className="text-[10px] font-bold text-slate-400">Not Connected</p>
                </div>
              </div>
              <button onClick={() => setView('email')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-slate-900 transition-colors">Connect</button>
            </div>
          </div>
        </div>

        {/* Security Controls */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Security Controls</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            
            <div className="flex flex-col p-4 border border-slate-100 rounded-2xl bg-slate-50 gap-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500"><ShieldCheck size={18} /></div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 mb-0.5">2FA Auth</h4>
                      <p className="text-[10px] font-bold text-emerald-600">Enabled</p>
                    </div>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 shadow-sm hover:text-indigo-600">Settings</button>
                 <button className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-slate-900 transition-colors">Activate</button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500"><Key size={18} /></div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 mb-0.5">IAM Governance</h4>
                  <p className="text-[10px] font-bold text-emerald-600">Enabled</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </div>

          </div>
        </div>

      </div>

    </div>
  </div>
);

const SystemIntegrations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view') || 'hub';
  const [view, setViewInternal] = useState(initialView); 

  React.useEffect(() => {
     setViewInternal(searchParams.get('view') || 'hub');
  }, [searchParams]);

  const setView = (newView) => {
     if (newView === 'hub') {
        setSearchParams({});
     } else {
        setSearchParams({ view: newView });
     }
     setViewInternal(newView);
     window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
       <div className="max-w-[1440px] mx-auto p-2 w-full animate-in fade-in duration-500">
          {view === 'hub' && <HubView setView={setView} />}
          {view === 'cloud' && <CloudView setView={setView} />}
          {view === 'config-google' && <ConfigGoogleView setView={setView} />}
          {view === 'config-aws' && <ConfigAwsView setView={setView} />}
          {view === 'email' && <EmailView setView={setView} />}
          {view === 'security' && <SecurityView setView={setView} />}
       </div>
    </div>
  );
};

export default SystemIntegrations;
