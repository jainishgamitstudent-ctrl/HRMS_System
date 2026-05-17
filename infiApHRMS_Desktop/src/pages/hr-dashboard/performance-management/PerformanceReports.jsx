import React, { useState } from 'react';
import {
    FileText,
    Download,
    BarChart3,
    TrendingUp,
    Undo2,
    Filter,
    Activity,
    Award,
    Building,
    Search,
    ChevronDown,
    LayoutDashboard,
    Zap,
    ClipboardList,
    BellRing
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const PerformanceReports = () => {
    const navigate = useNavigate();
    const [activeCycle, setActiveCycle] = useState('Quarter 3, 2023');
    const [notification, setNotification] = useState(null);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const distributionData = [
        { name: 'Under', count: 12, range: '0-40' },
        { name: 'Emerging', count: 48, range: '40-60' },
        { name: 'Standard', count: 184, range: '60-80' },
        { name: 'High', count: 86, range: '80-90' },
        { name: 'Elite', count: 18, range: '90-100' },
    ];

    const growthData = [
        { month: 'May', engineering: 78, product: 82, sales: 65 },
        { month: 'Jun', engineering: 82, product: 84, sales: 72 },
        { month: 'Jul', engineering: 85, product: 88, sales: 78 },
        { month: 'Aug', engineering: 88, product: 85, sales: 82 },
        { month: 'Sep', engineering: 92, product: 91, sales: 88 },
        { month: 'Oct', engineering: 94, product: 93, sales: 90 },
    ];

    const COLORS = ['#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

    const handleExportData = () => {
        const headers1 = ["Distribution Category", "Count", "Range"];
        const rows1 = distributionData.map(item => [item.name, item.count, item.range]);

        const headers2 = ["Month", "Engineering Growth", "Product Growth", "Sales Growth"];
        const rows2 = growthData.map(item => [item.month, item.engineering, item.product, item.sales]);

        let csvContent = "MERIT DISTRIBUTION MATRIX\n";
        csvContent += headers1.join(",") + "\n";
        csvContent += rows1.map(row => row.join(",")).join("\n") + "\n\n";

        csvContent += "EVOLUTION VELOCITY BY NODE\n";
        csvContent += headers2.join(",") + "\n";
        csvContent += rows2.map(row => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Performance_Analytics_Report_${activeCycle.replace(/\s+/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Performance report exported successfully.");
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 text-left pb-20">

            {/* Notification */}
            {notification && (
                <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg animate-in slide-in-from-right-4">
                    <BellRing size={16} className="text-indigo-400" />
                    <span className="text-sm font-medium">{notification}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 text-left">
                <div className="flex items-center gap-6 text-left">
                    <button
                        onClick={() => navigate('/performance')}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1 active:scale-95 text-left"
                    >
                        <Undo2 size={20} />
                    </button>
                    <div className="text-left">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-left">Performance Analytics & Reports</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 text-left leading-none">Forensic Growth Attribution & Merit Bell Curve Diagnostic</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 px-5 py-2 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm text-left">
                        Cycle: {activeCycle}
                    </div>
                    <button
                        onClick={handleExportData}
                        className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 text-left"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Analytical Workspace */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 text-left">

                {/* Row 1: Merit Distribution (8) + Insights (4) */}
                <div className="xl:col-span-8 bg-white p-8 rounded-[32px] border border-slate-100 shadow-soft flex flex-col min-h-[480px] text-left">
                    <div className="mb-8 flex items-center justify-between shrink-0 text-left">
                        <div>
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] text-left">Merit Distribution Matrix</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">Bell curve mapping of current performance nodes</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Engine Data</span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-6 flex flex-col">
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl shadow-slate-200 flex-1 flex flex-col justify-center">
                        <TrendingUp className="mb-4 text-indigo-400" size={24} />
                        <h4 className="text-sm font-black uppercase tracking-widest mb-2">Performance Surge</h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed mb-8">Engineering output has increased by 14% this quarter, driven by full-stack node optimization.</p>
                        <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                            <div>
                                <p className="text-2xl font-black text-white leading-none mb-1">+14%</p>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Growth Index</p>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div>
                                <p className="text-2xl font-black text-indigo-400 leading-none mb-1">92.4</p>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Merit Avg</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-soft">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6">Talent Distribution</h3>
                        <div className="space-y-4">
                            {distributionData.slice(-3).map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[distributionData.length - 3 + i] }}></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-800">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 2: Evolution Velocity (Full Width) */}
                <div className="xl:col-span-12 bg-white p-8 rounded-[32px] border border-slate-100 shadow-soft flex flex-col min-h-[480px] text-left">
                    <div className="mb-8 flex items-center justify-between shrink-0 text-left">
                        <div>
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] text-left">Evolution Velocity by Node</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">Quarterly growth scores across core departments</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Engineering</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sales</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={growthData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                    domain={[50, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <Line type="monotone" dataKey="engineering" stroke="#6366f1" strokeWidth={4} dot={false} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="product" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={4} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row 3: Summary (Full Width) */}
                <div className="xl:col-span-12 flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 flex-1 w-full">
                        <div className="p-8 bg-white rounded-[32px] shadow-soft flex items-center gap-6 border border-slate-100 flex-1 w-full group hover:border-indigo-500 transition-all">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <TrendingUp size={28} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-left">Top Growth Node</p>
                                <p className="text-base font-black text-slate-800 text-left uppercase">Engineering • +12%</p>
                            </div>
                        </div>
                        <div className="p-8 bg-white rounded-[32px] shadow-soft flex items-center gap-6 border border-slate-100 flex-1 w-full group hover:border-emerald-500 transition-all">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Award size={28} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-left">Top Talent Core</p>
                                <p className="text-base font-black text-slate-800 text-left uppercase">Product Design</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleExportData}
                        className="w-full lg:w-auto px-12 py-6 bg-slate-900 text-white font-black rounded-[24px] hover:bg-slate-800 transition-all uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <FileText size={20} /> Generate Report
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PerformanceReports;
