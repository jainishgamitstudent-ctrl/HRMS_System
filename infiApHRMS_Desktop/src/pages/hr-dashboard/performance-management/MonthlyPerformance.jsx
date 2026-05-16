import React, { useState } from 'react';
import {
    Zap,
    Target,
    TrendingUp,
    Activity,
    Undo2,
    Download,
    Filter,
    Award,
    Star,
    Clock,
    ChevronRight,
    TrendingDown,
    LayoutDashboard,
    ClipboardList,
    FileText
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const MonthlyPerformance = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('October 2023');

    const radarData = [
        { subject: 'Velocity', A: 120, fullMark: 150 },
        { subject: 'Quality', A: 98, fullMark: 150 },
        { subject: 'Strategy', A: 86, fullMark: 150 },
        { subject: 'Teamwork', A: 99, fullMark: 150 },
        { subject: 'Reliability', A: 130, fullMark: 150 },
        { subject: 'Innovation', A: 75, fullMark: 150 },
    ];

    const leaderboard = [
        { name: 'Alex Rivers', score: 98, trend: '+2', avatar: 'AR' },
        { name: 'Sarah Chen', score: 95, trend: '+1', avatar: 'SC' },
        { name: 'Mark Wilson', score: 92, trend: '-1', avatar: 'MW' },
        { name: 'Elena Rodriguez', score: 89, trend: '+4', avatar: 'ER' },
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 text-left pb-20">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/performance')}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1 active:scale-95 text-left"
                    >
                        <Undo2 size={20} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-left">Monthly Performance Metrics</h1>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-left">
                                <Zap size={12} />
                                Cycle: Q3 Finalization
                            </span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-left">Corporate Merit Engine Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-slate-800 shadow-sm transition-all text-left">
                        <Filter size={20} />
                    </button>
                    <button className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] text-left">
                        Sync Data
                    </button>
                </div>
            </div>

            {/* Workspace Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-10 text-left">

                {/* 1. Skill Diagnostic Hub */}
                <div className="xl:col-span-4 card-soft bg-white p-10 border-slate-100 shadow-soft flex flex-col min-h-[500px] text-left">
                    <div className="mb-10 shrink-0 text-left">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] text-left">Aggregate Skill Index</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">Multi-dimensional capability mapping</p>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                                <Radar
                                    name="Engineering"
                                    dataKey="A"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.2}
                                    strokeWidth={3}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Top Performer Leaderboard */}
                <div className="xl:col-span-4 card-soft bg-white p-10 border-slate-100 shadow-soft flex flex-col min-h-[500px] text-left">
                    <div className="mb-10 shrink-0 text-left">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] text-left">Performance Elite</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">Oct Merit Identification Leaderboard</p>
                    </div>
                    <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-2 text-left">
                        {leaderboard.map((user, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-[24px] hover:bg-slate-100 transition-all group">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-indigo-500 text-xs">
                                        {user.avatar}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight text-left">{user.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-left">Rank #{i + 1}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-slate-800 tracking-tighter leading-none text-left">{user.score}%</p>
                                    <p className={`text-[9px] font-black uppercase ${user.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'} text-left`}>{user.trend}% delta</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px] shrink-0 text-left flex items-center justify-center gap-2">
                        View Full Rankings
                        <ChevronRight size={14} />
                    </button>
                </div>

                {/* 3. Strategic Goal Matrix */}
                <div className="xl:col-span-4 card-soft bg-slate-900 p-10 border-none text-white flex flex-col min-h-[500px] relative overflow-hidden group text-left">
                    <div className="relative z-10 text-left">
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest text-left">Strategic Goal Matrix</h3>
                        <p className="text-xl font-black text-white tracking-tight mt-2 text-left leading-tight">94% Core Achievement across all nodes.</p>

                        <div className="mt-12 space-y-10 text-left">
                            {[
                                { label: 'Velocity Node', value: 85, color: 'bg-indigo-400' },
                                { label: 'Quality Threshold', value: 92, color: 'bg-emerald-400' },
                                { label: 'Innovation Sprint', value: 68, color: 'bg-yellow-400' },
                            ].map((goal, i) => (
                                <div key={i} className="space-y-3 text-left">
                                    <div className="flex justify-between text-left">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-left opacity-60">{goal.label}</span>
                                        <span className="text-[10px] font-black uppercase text-left tracking-widest">{goal.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${goal.color} rounded-full transition-all duration-1000`}
                                            style={{ width: `${goal.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-10 text-left">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-left flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest text-left">Merit Index Status</p>
                                    <p className="text-sm font-black text-emerald-400 text-left tracking-widest">CRITICAL SUCCESS</p>
                                </div>
                                <Award size={32} className="text-emerald-400 opacity-50" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform"></div>
                </div>

            </div>

        </div>
    );
};

export default MonthlyPerformance;
