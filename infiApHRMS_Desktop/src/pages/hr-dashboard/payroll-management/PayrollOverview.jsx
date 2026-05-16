import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon, 
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  CreditCard,
  Building,
  Users,
  AlertCircle,
  Activity,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Undo2,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const PayrollOverview = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('6 Months');

    const summaryCards = [
        { label: 'Total Disbursement', value: '₹1.42 Cr', trend: '+8.2%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Tax Deductions', value: '₹22.4 L', trend: '+4.1%', icon: ShieldCheck, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'Benefits & PF', value: '₹18.2 L', trend: '+2.5%', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active Employees', value: '348', trend: '+12', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    const areaData = [
        { name: 'May', amount: 12000000 },
        { name: 'Jun', amount: 12500000 },
        { name: 'Jul', amount: 13200000 },
        { name: 'Aug', amount: 12800000 },
        { name: 'Sep', amount: 14000000 },
        { name: 'Oct', amount: 14200000 },
    ];

    const pieData = [
        { name: 'Engineering', value: 4500000 },
        { name: 'Product', value: 3200000 },
        { name: 'Operations', value: 2100000 },
        { name: 'Marketing', value: 1800000 },
        { name: 'Others', value: 2600000 },
    ];

    const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b'];

    return (
        <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 text-left pb-20">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/payroll')}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1 active:scale-95"
                    >
                        <Undo2 size={20} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Payroll Intelligence</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 leading-none">Forensic Financial Overview & Disbursement Analytics</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        {['1 Month', '6 Months', '1 Year'].map(range => (
                            <button 
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                {summaryCards.map((card, i) => (
                    <div key={i} className="card-soft bg-white p-8 border-slate-100 shadow-soft hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`p-4 rounded-[20px] ${card.bg} ${card.color} shadow-inner group-hover:scale-110 transition-transform`}>
                                <card.icon size={24} />
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                                <TrendingUp size={12} />
                                {card.trend}
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2">{card.label}</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{card.value}</h3>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full blur-2xl group-hover:scale-150 transition-transform opacity-50"></div>
                    </div>
                ))}
            </div>

            {/* Content Sidebar + Main Chart */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-10 text-left">
                
                {/* Side Metrics Corridor */}
                <div className="xl:col-span-3 flex flex-col gap-10 text-left">
                    <div className="card-soft bg-white p-10 border-slate-100 shadow-soft text-left flex flex-col min-h-[400px]">
                        {/* Placeholder for additional metrics */}
                    </div>
                </div>

                {/* Disbursement Trend */}
                <div className="xl:col-span-9 card-soft bg-white p-10 border-slate-100 shadow-soft flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-10 shrink-0">
                        <div>
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Disbursement Trajectory</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Monthly payroll volume trends</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INR (Cr)</span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}}
                                    tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`}
                                />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px'}}
                                    itemStyle={{color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}}
                                    labelStyle={{color: '#64748b', fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px'}}
                                    formatter={(val) => [`₹${(val/10000000).toFixed(2)} Cr`, 'Disbursement']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Departmental Allocation */}
                <div className="xl:col-span-1 card-soft bg-white p-10 border-slate-100 shadow-soft flex flex-col min-h-0">
                    <div className="mb-10 shrink-0">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Budgetary Distribution</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Departmental payroll allocation</p>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px'}}
                                    itemStyle={{color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Total</p>
                            <p className="text-xl font-black text-slate-800 tracking-tighter leading-none">₹1.42 Cr</p>
                        </div>
                    </div>
                    <div className="mt-8 space-y-3 shrink-0">
                        {pieData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{d.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">₹{(d.value/100000).toFixed(1)}L</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default PayrollOverview;
