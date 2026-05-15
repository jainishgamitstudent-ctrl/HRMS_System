import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Settings, 
  Activity, 
  BarChart3, 
  AlertCircle, 
  Plus, 
  UserPlus, 
  History, 
  Radio,
  ChevronRight,
  Monitor,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Globe,
  Mail,
  RefreshCw,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useEmployeeContext } from '../../context/EmployeeContext';

const MainDashboard = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRange, setFilterRange] = useState('Last 7 Days');
  
  const [stats, setStats] = useState({
    companies: { value: '1,084', change: '+2.4%', pos: true },
    employees: { value: '45.2k', change: '+4.1%', pos: true },
    hrManagers: { value: '312', change: '+1.2%', pos: true },
    activeUsers: { value: '12.8k', change: '-0.4%', pos: false },
    pending: { value: '43', change: '+12', pos: true },
    health: { value: '99.9%', pos: true }
  });

  const [alerts, setAlerts] = useState([
    { id: 1, title: 'API Latency Spike', msg: 'System observed a 15% increase in response time across North America clusters.', type: 'WARN', color: 'amber' },
    { id: 2, title: 'System Maintenance', msg: 'Scheduled database optimization completed successful at 02:00 AM EST.', type: 'INFO', color: 'blue' },
    { id: 3, title: 'Security Audit Passed', msg: 'Rapid7 vulnerability scan finished with zero critical failures.', type: 'SUCCESS', color: 'emerald' }
  ]);

  const [platformActivityData, setPlatformActivityData] = useState([
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 450 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 700 },
    { name: 'Sun', value: 550 },
  ]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showNotification('System Alert: Security event acknowledged and archived.');
  };

  const { fetchAllUsers } = useAuth();
  const { employees } = useEmployeeContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlatformData = async () => {
      setIsLoading(true);
      const res = await fetchAllUsers();
      if (res.success) {
        const users = res.data;
        const hrCount = users.filter(u => u.role === 'hr').length;
        
        setStats(prev => ({
          ...prev,
          employees: { value: employees.length.toString(), change: '+4.1%', pos: true },
          hrManagers: { value: hrCount.toString(), change: '+1.2%', pos: true },
          activeUsers: { value: users.length.toString(), change: '+0.5%', pos: true }
        }));
      }
      setIsLoading(false);
    };

    loadPlatformData();

    // Simulate live health monitoring
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        health: { ...prev.health, value: (99.8 + Math.random() * 0.2).toFixed(1) + '%' }
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [employees.length]);

  const handleRangeChange = (range) => {
    setFilterRange(range);
    // Randomize data for visual effect
    setPlatformActivityData(platformActivityData.map(d => ({ ...d, value: Math.floor(Math.random() * 500) + 200 })));
    showNotification(`Platform Metrics: Timeframe synchronized to ${range}.`);
  };

  const StatCard = ({ title, data, icon: Icon, iconBg, iconColor }) => (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconBg} ${iconColor}`}>
          {Icon && <Icon size={18} />}
        </div>
        {data.change && (
          <div className={`flex items-center gap-1 text-[11px] font-bold ${data.pos ? 'text-emerald-500' : 'text-rose-500'}`}>
            {data.change}
            {data.pos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </div>
        )}
      </div>
      <div>
        <p className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1.5">{data.value}</p>
        <p className="text-xs font-bold text-slate-400 capitalize">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 animate-in fade-in pb-12">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Users size={20} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">Main Admin Dashboard</h1>
              <p className="text-xs font-bold text-slate-400">Manage system access and resources</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..." 
                className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold w-48 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm" 
              />
           </div>
           <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-colors">
              <Bell size={18} />
           </button>
        </div>
      </div>

      {/* Stats Matrix Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Companies" data={stats.companies} icon={Building2} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <StatCard title="Employees" data={stats.employees} icon={Users} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <StatCard title="HR Managers" data={stats.hrManagers} icon={UserPlus} iconBg="bg-amber-50" iconColor="text-amber-500" />
        <StatCard title="Active Users" data={stats.activeUsers} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-500" />
        <StatCard title="Pending" data={stats.pending} icon={AlertCircle} iconBg="bg-rose-50" iconColor="text-rose-500" />
        <StatCard title="Health" data={stats.health} icon={Activity} iconBg="bg-blue-50" iconColor="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Chart and Companies) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           
           {/* Chart */}
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[320px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                 <h3 className="text-[15px] font-black text-slate-800 tracking-tight">Platform Activity</h3>
                 <select 
                   value={filterRange}
                   onChange={(e) => handleRangeChange(e.target.value)}
                   className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none cursor-pointer shadow-sm"
                 >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Quarterly</option>
                 </select>
              </div>
              <div className="flex-1 w-full min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformActivityData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                          dy={10}
                       />
                       <Tooltip 
                          cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 8 }}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                       />
                       <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Registered Companies */}
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-1">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-[15px] font-black text-slate-800 tracking-tight">Registered Companies</h3>
                 <button className="text-[11px] font-black text-indigo-600 hover:text-indigo-700">View All</button>
              </div>
              <div className="flex flex-col gap-3">
                 {[
                   { id: 'velocity-tech', name: 'Velocity Tech', size: '1,200 Employees', status: 'ACTIVE', color: 'emerald' },
                   { id: 'nexus-logistics', name: 'Nexus Logistics', size: '840 Employees', status: 'PENDING', color: 'amber' },
                   { id: 'ecostream-sol', name: 'EcoStream Sol.', size: '410 Employees', status: 'ACTIVE', color: 'emerald' }
                 ].filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((company, i) => (
                   <div 
                     key={i} 
                     onClick={() => navigate(`/main-admin/company/${company.id}`)}
                     className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-[12px] flex items-center justify-center text-slate-400">
                            <Building2 size={18} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-800 leading-none mb-1">{company.name}</p>
                            <p className="text-[11px] font-bold text-slate-400">{company.size}</p>
                         </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black bg-${company.color}-50 text-${company.color}-600`}>
                        {company.status}
                      </span>
                   </div>
                 ))}
              </div>
           </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           
           {/* Quick Actions */}
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-[15px] font-black text-slate-800 tracking-tight mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                 {[
                   { label: 'Add Node',  primary: true },
                   { label: 'Provision User' },
                   { label: 'Deep Audit' },
                   { label: 'Broadcast' }
                 ].map((btn, i) => (
                   <button 
                     key={i} 
                     className={`py-6 flex flex-col items-center justify-center gap-2 rounded-2xl border transition-colors
                        ${btn.primary 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                   >
                      {btn.primary ? <Plus size={20} /> : <Settings size={20} className="text-indigo-600" />}
                      <span className="text-[11px] font-black tracking-wide">{btn.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* Integrations */}
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-[15px] font-black text-slate-800 tracking-tight mb-4">System Integrations</h3>
              <div className="flex flex-col gap-3">
                 {[
                   { name: 'AWS Cloud Engine', status: 'Operational', color: 'bg-emerald-500' },
                   { name: 'Slack Protocol', status: 'Operational', color: 'bg-emerald-500' }
                 ].map((int, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="w-8 h-8 bg-white rounded-[10px] shadow-sm flex items-center justify-center text-indigo-500">
                        <Activity size={14} />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                         <span className="text-xs font-black text-slate-800">{int.name}</span>
                         <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            <div className={`w-1.5 h-1.5 rounded-full ${int.color}`}></div> {int.status}
                         </span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Alerts */}
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-1">
              <h3 className="text-[15px] font-black text-slate-800 tracking-tight mb-5">System Alerts</h3>
              <div className="space-y-6 relative before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                 {alerts.map((alert) => (
                   <div key={alert.id} className="relative pl-6">
                      <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                        alert.type === 'WARN' ? 'bg-amber-500' : 
                        alert.type === 'SUCCESS' ? 'bg-emerald-500' : 
                        'bg-blue-500'
                      }`}></div>
                      <h4 className="text-sm font-black text-slate-800 mb-1 leading-tight">{alert.title}</h4>
                      <p className="text-[11px] font-semibold text-slate-500 leading-relaxed pr-2">{alert.msg}</p>
                   </div>
                 ))}
                 {alerts.length === 0 && (
                   <div className="py-10 text-center">
                      <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">All Clear</p>
                   </div>
                 )}
              </div>
           </div>

        </div>

      </div>

    </div>
  );
};

export default MainDashboard;
