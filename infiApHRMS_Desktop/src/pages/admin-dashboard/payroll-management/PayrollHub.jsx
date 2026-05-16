import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  CreditCard,
  Clock,
  Users,
  TrendingUp,
  Play,
  FileText,
  BarChart2,
  MoreVertical,
  CheckCircle2,
  ChevronRight,
  Search,
  DollarSign,
  Download,
  AlertCircle,
} from 'lucide-react';

const chartData = [
  { month: 'May', amount: 380300 },
  { month: 'Jun', amount: 410400 },
  { month: 'Jul', amount: 395000 },
  { month: 'Aug', amount: 450200 },
  { month: 'Sep', amount: 480000 },
  { month: 'Oct', amount: 512000 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl shadow-2xl">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{payload[0].payload.month}</p>
        <p className="text-sm font-black text-white">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const PayrollHub = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState('Monthly');

  const stats = [
    { label: 'Total Monthly', value: '₹4,50,200', change: '+4.2%', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Payments', value: '₹12,400', sub: '12 items', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Employees Paid', value: '124 / 128', progress: 97, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Next Payout', value: '₹8,500', sub: 'Aug 31', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const quickActions = [
    { label: 'Run Payroll', icon: Play, path: '/admin/payroll-management/generate', primary: true },
    { label: 'View Payslips', icon: FileText, path: '/admin/payroll-management/generate' },
    { label: 'Finance Reports', icon: BarChart2, path: '/admin/payroll-management/reports' },
  ];

  const payrollStatus = [
    { month: 'August 2024', scheduled: 'Scheduled · Aug 31', amount: '₹1,12,540', status: 'PENDING', color: 'text-amber-600 bg-amber-50' },
    { month: 'July 2024', scheduled: 'Paid · Jul 28', amount: '₹1,08,220', status: 'PAID', color: 'text-emerald-600 bg-emerald-50' },
    { month: 'June 2024', scheduled: 'Paid · Jun 27', amount: '₹1,05,800', status: 'PAID', color: 'text-emerald-600 bg-emerald-50' },
  ];

  const employees = [
    { name: 'Sarah Jenkins', role: 'UI/UX Designer', dept: 'Design', amount: '₹4,250', status: 'PAID', img: 'https://i.pravatar.cc/150?u=sarah' },
    { name: 'Marcus Chen', role: 'Lead Engineer', dept: 'Engineering', amount: '₹6,500', status: 'PENDING', img: 'https://i.pravatar.cc/150?u=marcus' },
    { name: 'Elena Rodriguez', role: 'HR Manager', dept: 'HR', amount: '₹5,100', status: 'PAID', img: 'https://i.pravatar.cc/150?u=elena' },
    { name: 'Aditya Kumar', role: 'Backend Dev', dept: 'Engineering', amount: '₹5,800', status: 'PAID', img: 'https://i.pravatar.cc/150?u=aditya' },
    { name: 'Priya Sharma', role: 'Product Manager', dept: 'Product', amount: '₹7,200', status: 'PENDING', img: 'https://i.pravatar.cc/150?u=priya' },
  ];

  const handleExport = () => {
    const csvRows = [
      ['Name', 'Role', 'Department', 'Amount', 'Status'],
      ...employees.map(e => [e.name, e.role, e.dept, e.amount, e.status])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">Payroll Management</h1>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Compensation & disbursement control center</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
            {['Monthly', 'Yearly'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${period === p ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-700'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 active:scale-95"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <stat.icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{stat.label}</p>
              <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">{stat.value}</h3>
              {stat.change && <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">{stat.change}</span>}
              {stat.sub && <p className="text-[8px] font-bold text-slate-400 mt-0.5">{stat.sub}</p>}
              {stat.progress && (
                <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stat.progress}%` }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left sidebar */}
        <div className="xl:col-span-3 space-y-5">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 pb-3 border-b border-slate-50">Quick Actions</h4>
            <div className="space-y-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all group/btn
                    ${action.primary
                      ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.primary ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                    <action.icon size={15} />
                  </div>
                  {action.label}
                  <ChevronRight size={13} className="ml-auto opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Payroll Status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payroll Status</h4>
              <button className="text-[8px] font-black text-indigo-600 hover:underline uppercase tracking-widest">All History</button>
            </div>
            <div className="space-y-4">
              {payrollStatus.map((item, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <h5 className="text-xs font-black text-slate-700 group-hover:text-indigo-600 transition-colors truncate">{item.month}</h5>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{item.scheduled}</p>
                    </div>
                    <span className={`shrink-0 text-[8px] font-black px-2 py-0.5 rounded-full ${item.color}`}>{item.status}</span>
                  </div>
                  <p className="text-base font-black text-slate-800 tracking-tight">{item.amount}</p>
                  {idx < payrollStatus.length - 1 && <div className="h-px bg-slate-50 mt-3" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right main area */}
        <div className="xl:col-span-9 space-y-5">

          {/* Employee Payroll Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-50">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Employee Payroll</h2>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Current cycle disbursement status</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employee..."
                    className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all w-[200px]"
                  />
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-100 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Download size={13} />
                  CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-3">Employee</th>
                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Department</th>
                    <th className="text-right text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Amount</th>
                    <th className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Status</th>
                    <th className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-xs font-bold text-slate-300 uppercase tracking-widest">No employees found</td>
                    </tr>
                  ) : filteredEmployees.map((person, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={person.img}
                            alt={person.name}
                            className="w-9 h-9 rounded-xl object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random&color=fff`; }}
                          />
                          <div>
                            <p className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{person.name}</p>
                            <p className="text-[9px] font-bold text-slate-400">{person.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">{person.dept}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-black text-slate-800">{person.amount}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {person.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                            <CheckCircle2 size={11} />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                            <Clock size={11} />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {person.status === 'PENDING' ? (
                          <button
                            onClick={() => navigate('/admin/payroll-management/structure')}
                            className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-600 transition-all active:scale-95"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors rounded-lg hover:bg-slate-50">
                            <MoreVertical size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Payroll Disbursement Trend</h4>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Monthly capital outflow</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Avg. Volume</p>
                  <p className="text-lg font-black text-slate-800 tracking-tight">₹4,21,450</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Growth</p>
                  <p className="text-lg font-black text-emerald-500 tracking-tight">+12.4%</p>
                </div>
              </div>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={0} debounce={1}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorAmt)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PayrollHub;
