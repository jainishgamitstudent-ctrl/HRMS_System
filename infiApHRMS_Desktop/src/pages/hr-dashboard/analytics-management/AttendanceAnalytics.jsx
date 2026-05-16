import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  Activity as ActivityIcon, 
  Undo2, 
  Download, 
  Filter, 
  Calendar, 
  ChevronRight, 
  AlertCircle,
  LayoutDashboard,
  Globe,
  BrainCircuit,
  MapPin
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
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsAttendance, getAttendanceReports } from '../../../services/hrApi';

const AttendanceAnalytics = () => {
    const navigate = useNavigate();
    const [selectedSlot, setSelectedSlot] = useState('All Nodes');

    const defaultPeakData = [
        { time: '08:00', count: 42 },
        { time: '09:00', count: 186 },
        { time: '10:00', count: 84 },
        { time: '11:00', count: 24 },
        { time: '12:00', count: 12 },
    ];

    const defaultPunctualityData = [
        { dept: 'Engineering', score: 92 },
        { dept: 'Design', score: 88 },
        { dept: 'Operations', score: 95 },
        { dept: 'Sales', score: 78 },
        { dept: 'Product', score: 91 },
    ];

    const defaultWeeklyTrend = [
        { day: 'Mon', onTime: 92, late: 8 },
        { day: 'Tue', onTime: 94, late: 6 },
        { day: 'Wed', onTime: 88, late: 12 },
        { day: 'Thu', onTime: 91, late: 9 },
        { day: 'Fri', onTime: 85, late: 15 },
    ];

    const [peakData, setPeakData] = useState(defaultPeakData);
    const [punctualityData, setPunctualityData] = useState(defaultPunctualityData);
    const [weeklyTrend, setWeeklyTrend] = useState(defaultWeeklyTrend);

    useEffect(() => {
        let isMounted = true;

        const pickArray = (value) => (Array.isArray(value) ? value : []);

        const loadAttendanceAnalytics = async () => {
            try {
                const [attendanceRes, reportRes] = await Promise.all([
                    getAnalyticsAttendance(),
                    getAttendanceReports({ range: 'weekly' })
                ]);

                const attendancePayload = attendanceRes.data?.data;
                const departments = pickArray(attendancePayload?.departments || attendancePayload?.byDepartment || attendancePayload);
                const punctuality = departments.map((item, index) => ({
                    dept: item.department || item.dept || item.name || `Dept ${index + 1}`,
                    score: Number(item.onTimePercent ?? item.score ?? item.value ?? item.attendance ?? 0)
                })).filter((item) => item.dept);

                const peaks = pickArray(attendancePayload?.peakCheckins || attendancePayload?.peaks || attendancePayload?.hourly);
                const peakMapped = peaks.map((item, index) => ({
                    time: item.time || item.hour || item.label || `T${index + 1}`,
                    count: Number(item.count ?? item.value ?? item.total ?? 0)
                })).filter((item) => item.time);

                const weekly = pickArray(attendancePayload?.weeklyTrend || attendancePayload?.weekly || attendancePayload?.daily);
                const weeklyFallback = pickArray(reportRes.data?.data);
                const trendSource = weekly.length ? weekly : weeklyFallback;
                const trendMapped = trendSource.map((item, index) => ({
                    day: item.day || item.label || item.date || `D${index + 1}`,
                    onTime: Number(item.onTime ?? item.present ?? item.value ?? 0),
                    late: Number(item.late ?? item.absent ?? 0)
                })).filter((item) => item.day);

                if (!isMounted) return;
                if (punctuality.length) setPunctualityData(punctuality);
                if (peakMapped.length) setPeakData(peakMapped);
                if (trendMapped.length) setWeeklyTrend(trendMapped);
            } catch (err) {
                // debug error removed
            }
        };

        loadAttendanceAnalytics();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 text-left pb-20">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 text-left">
                <div className="flex items-center gap-6 text-left">
                    <button 
                        onClick={() => navigate('/analytics')}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1 active:scale-95 text-left"
                    >
                        <Undo2 size={20} />
                    </button>
                    <div className="text-left">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2 text-left underline decoration-emerald-300 underline-offset-8">Operational Pattern Diagnostic</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4 text-left">Attendance Density Heatmap & Punctuality Delta Index</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-slate-800 shadow-sm transition-all text-left">
                        <Calendar size={20} />
                    </button>
                    <button className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] text-left">
                        Sync Live Nodes
                    </button>
                </div>
            </div>

            {/* Content Workspace */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-10 text-left">
                
                {/* 1. Peak Check-in Distribution */}
                <div className="xl:col-span-4 card-soft bg-white p-10 border-slate-100 shadow-soft flex flex-col min-h-[500px] text-left">
                    <div className="mb-10 shrink-0 text-left">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest text-left">Density Trajectory</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">Peak check-in volume distribution</p>
                    </div>
                    <div className="flex-1 min-h-0 text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={peakData}>
                                <defs>
                                    <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="time" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
                                    dy={10}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px'}}
                                    itemStyle={{color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}}
                                />
                                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPeak)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left flex items-center justify-between shrink-0">
                        <div className="text-left">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest text-left">Critical Delta Window</p>
                            <p className="text-sm font-black text-slate-800 text-left tracking-tight">08:45 AM - 09:15 AM</p>
                        </div>
                        <AlertCircle size={20} className="text-emerald-500" />
                    </div>
                </div>

                {/* 2. Departmental Punctuality Radar/Bar */}
                <div className="xl:col-span-4 card-soft bg-white p-10 border-slate-100 shadow-soft flex flex-col min-h-[500px] text-left">
                    <div className="mb-10 shrink-0 text-left">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest text-left">Departmental Compliance</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">On-time performance node diagnostic</p>
                    </div>
                    <div className="flex-1 min-h-0 text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={punctualityData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis 
                                    dataKey="dept" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 9, fontWeight: 900, fill: '#64748b'}}
                                    width={80}
                                />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px'}}
                                    itemStyle={{color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}}
                                />
                                <Bar dataKey="score" fill="#6366f1" radius={[0, 8, 8, 0]}>
                                    {punctualityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.score > 90 ? '#10b981' : '#6366f1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Weekly Operational Heatmap */}
                <div className="xl:col-span-4 card-soft bg-slate-900 p-10 border-none text-white flex flex-col min-h-[500px] relative overflow-hidden group text-left">
                    <div className="relative z-10 text-left h-full flex flex-col">
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest text-left">Operational Compliance Trend</h3>
                        <div className="mt-10 flex-1 space-y-8 text-left">
                            {weeklyTrend.map((day, i) => (
                                <div key={i} className="space-y-2 text-left">
                                    <div className="flex justify-between text-left">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-left">{day.day}</span>
                                        <span className="text-[10px] font-black uppercase text-left tracking-widest">{day.onTime}% On-time</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex text-left">
                                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${day.onTime}%` }}></div>
                                        <div className="h-full bg-rose-400 rounded-full" style={{ width: `${day.late}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-10 text-left">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-4 bg-white/10 rounded-2xl text-emerald-400 text-left">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest text-left">Weekly Improvement</p>
                                    <p className="text-lg font-black text-white tracking-tighter text-left">+2.4% vs Prev. Week</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform"></div>
                </div>

            </div>

        </div>
    );
};

export default AttendanceAnalytics;
