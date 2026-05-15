import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  Server, 
  ChevronRight, 
  Search, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  BarChart3,
  RefreshCw,
  MoreVertical,
  Zap,
  Globe,
  Terminal,
  ShieldAlert,
  Signal,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SystemMonitoring = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  
  const [nodes, setNodes] = useState([
    { id: 1, name: 'API-Gateway-01', region: 'US-East', load: '14%', status: 'HEALTHY', color: 'emerald' },
    { id: 2, name: 'DB-Cluster-Main', region: 'Multi-Region', load: '32%', status: 'HEALTHY', color: 'emerald' },
    { id: 3, name: 'S3-Storage-Node', region: 'US-East', load: '45%', status: 'OPTIMIZING', color: 'amber' },
    { id: 4, name: 'CDN-Edge-Global', region: 'Global', load: '08%', status: 'HEALTHY', color: 'emerald' },
  ]);

  const [logs, setLogs] = useState([
    { id: 1, type: 'INFO', msg: 'System backup successfully localized to S3-Bucket-04', time: '2m ago' },
    { id: 2, type: 'WARN', msg: 'High latency detected in AP-South-1 routing node', time: '14m ago' },
    { id: 3, type: 'ERROR', msg: 'Failed SSL handshake for unauthorized tenant: ghost-corp', time: '1h ago' },
    { id: 4, type: 'INFO', msg: 'New SuperAdmin provisioned: jonathan@infiap.com', time: '2h ago' },
  ]);

  const [healthStatus, setHealthStatus] = useState([
    { label: 'Database Shards', val: 94, color: 'bg-emerald-500' },
    { label: 'Asset CDN Cache', val: 88, color: 'bg-indigo-500' },
    { label: 'Auth Middleware', val: 100, color: 'bg-emerald-500' },
    { label: 'Email Gateway', val: 99, color: 'bg-indigo-500' }
  ]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    showNotification('Telemetry Hub: Syncing infrastructure state across global regions...');
    setTimeout(() => {
      // Randomize load for visual effect
      setNodes(nodes.map(node => ({
        ...node,
        load: Math.floor(Math.random() * 60) + 5 + '%'
      })));
      setIsRefreshing(false);
      showNotification('Success: Infrastructure telemetry successfully re-synchronized.');
    }, 1500);
  };

  const handleAudit = () => {
    setIsAuditing(true);
    showNotification('Audit Engine: Initializing deep packet inspection for cluster consistency...');
    setTimeout(() => {
      setIsAuditing(false);
      showNotification('Audit Complete: Cluster integrity verified 100%. No anomalies found.');
    }, 4000);
  };

  const clearLogs = () => {
    setLogs([]);
    showNotification('Audit History: Local event log cache purged.');
  };

  useEffect(() => {
    // Simulated live node monitoring
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        load: Math.max(5, Math.min(95, parseInt(node.load) + (Math.random() > 0.5 ? 1 : -1))) + '%'
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto space-y-12 animate-in fade-in duration-1000 pb-40 px-4 relative">
       
       {/* Premium Notification Toast */}
       {notification && (
          <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[24px] shadow-3xl border border-white/10">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification}</span>
          </div>
       )}

       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-50 pb-12">
          <div>
             <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em]">Live Infrastructure Monitor</span>
             </div>
             <h1 className="text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">Master Telemetry</h1>
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Real-time Platform Health & Audit Streams</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
                <Activity size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Node Status: Optimal</span>
             </div>
             <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-soft hover:bg-slate-900 hover:text-white transition-all active:scale-90 ${isRefreshing ? 'opacity-50' : ''}`}
             >
                <RefreshCw size={24} className={isRefreshing ? 'animate-spin' : ''} />
             </button>
          </div>
       </div>

       {/* Hardware Matrix */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {nodes.map((node) => (
            <div key={node.id} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-soft group hover:border-indigo-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
               <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-[20px] shadow-inner flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                     <Server size={24} />
                  </div>
                  <span className={`px-4 py-2 bg-${node.color}-50 text-${node.color}-600 border border-${node.color}-100 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]`}>{node.status}</span>
               </div>
               <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{node.name}</h3>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{node.region} NODE</p>
               
               <div className="mt-8 space-y-4 pt-8 border-t border-slate-50">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logic Load</p>
                    <p className="text-xl font-black text-slate-800 tabular-nums tracking-tighter">{node.load}</p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-indigo-600 transition-all duration-1000 ease-out`} 
                      style={{ width: node.load }}
                    ></div>
                  </div>
               </div>
            </div>
          ))}
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Live System Logs */}
          <section className="xl:col-span-8 bg-white p-12 rounded-[56px] border border-slate-100 shadow-soft space-y-10 group relative overflow-hidden">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                   <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em] mb-2">Infrastructure Event Stream</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Global Master Audit History</p>
                </div>
                <button 
                  onClick={clearLogs}
                  className="px-6 py-2.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                >
                  Clear Master Logs
                </button>
             </div>

             <div className="space-y-4 relative z-10">
                {logs.map((log) => (
                  <div key={log.id} className="p-6 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 rounded-[28px] transition-all group flex items-start gap-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5">
                     <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 shadow-lg 
                        ${log.type === 'ERROR' ? 'bg-rose-500 text-white shadow-rose-100' : log.type === 'WARN' ? 'bg-amber-500 text-white shadow-amber-100' : 'bg-indigo-600 text-white shadow-indigo-100'}`}>
                        {log.type === 'ERROR' ? <AlertCircle size={22} /> : log.type === 'WARN' ? <ShieldAlert size={22} /> : <Zap size={22} />}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                           <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${log.type === 'ERROR' ? 'text-rose-500' : log.type === 'WARN' ? 'text-amber-500' : 'text-indigo-400'}`}>{log.type} PROTOCOL • {log.time}</span>
                           <button className="p-2 text-slate-200 hover:text-indigo-600 transition-colors"><MoreVertical size={16} /></button>
                        </div>
                        <p className="text-[13px] font-black text-slate-800 leading-tight uppercase tracking-tight group-hover:text-slate-900 transition-colors">{log.msg}</p>
                     </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="py-24 text-center space-y-4">
                    <Terminal size={48} className="mx-auto text-slate-100" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Event stream nominal. No pending alerts.</p>
                  </div>
                )}
             </div>

             <button 
                onClick={handleAudit}
                disabled={isAuditing}
                className={`w-full py-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.45em] rounded-[32px] shadow-3xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 relative overflow-hidden group ${isAuditing ? 'opacity-70 cursor-not-allowed' : ''}`}
             >
                {isAuditing ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Terminal size={18} />
                )}
                {isAuditing ? 'Executing In-depth Audit...' : 'Execute Regional Cluster Audit'}
                <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
             </button>
             <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-50/50 transition-colors"></div>
          </section>

          {/* Health & Availability Grid */}
          <aside className="xl:col-span-4 space-y-10">
             <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-3xl shadow-slate-200 relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-10 relative z-10">
                   <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-[18px] flex items-center justify-center border border-white/5 shadow-inner">
                      <Signal size={20} className="text-indigo-400" />
                   </div>
                   <h3 className="text-[12px] font-black uppercase tracking-[0.3em] leading-none text-slate-100">Core Sub-systems</h3>
                </div>
                <div className="space-y-8 relative z-10">
                   {healthStatus.map((item, idx) => (
                     <div key={idx} className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                           <span className="text-slate-500">{item.label}</span>
                           <span className="text-white">{item.val}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
                           <div className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-in-out`} style={{ width: `${item.val}%` }}></div>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]"></div>
             </div>

             <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-soft text-center flex flex-col items-center group">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[28px] flex items-center justify-center mb-8 border border-indigo-100 shadow-xl group-hover:scale-110 transition-transform duration-500">
                   <Globe size={40} className="animate-spin-slow" />
                </div>
                <div className="w-full">
                   <h3 className="text-[12px] font-black text-slate-800 tracking-[0.3em] leading-none mb-8 uppercase">Regional Uptime Protocol</h3>
                   <div className="space-y-3 w-full">
                      {[
                        { reg: 'NA-EAST-CLUSTER', val: '99.98%' },
                        { reg: 'EU-CENTRAL-01', val: '99.95%' },
                        { reg: 'AP-SOUTH-TRANSIT', val: '99.91%' }
                      ].map((r, i) => (
                        <div key={i} className="flex justify-between items-center px-6 py-4 bg-slate-50 rounded-[24px] border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.reg}</span>
                           <span className="text-[10px] font-black text-slate-800 uppercase tabular-nums tracking-tighter">{r.val}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </aside>

       </div>
    </div>
  );
};

export default SystemMonitoring;
