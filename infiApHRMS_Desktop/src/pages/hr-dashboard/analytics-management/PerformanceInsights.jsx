import React, { useEffect, useState } from 'react';
import { 
  BrainCircuit, 
  Target, 
  TrendingUp, 
  Zap, 
  Undo2, 
  Download, 
  Filter, 
  Activity, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle,
  LayoutDashboard,
  Globe,
  Database,
  Star
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsPerformance, getPerformanceReportTrends } from '../../../services/hrApi';

const PerformanceInsights = () => {
    const navigate = useNavigate();
    const [selectedIndex, setSelectedIndex] = useState('Growth Forecast');

    const defaultForecastData = [
        { month: 'Oct', current: 78, projected: 78 },
        { month: 'Nov', current: 82, projected: 84 },
        { month: 'Dec', current: null, projected: 88 },
        { month: 'Jan', current: null, projected: 92 },
        { month: 'Feb', current: null, projected: 95 },
    ];

    const defaultTurnoverRisk = [
        { dept: 'Tech', risk: 12, trend: 'stable' },
        { dept: 'Sales', risk: 42, trend: 'rising' },
        { dept: 'Ops', risk: 8, trend: 'low' },
        { dept: 'Design', risk: 18, trend: 'stable' },
    ];

    const defaultRadarData = [
        { subject: 'Strategy', A: 120, B: 110, fullMark: 150 },
        { subject: 'Velocity', A: 98, B: 130, fullMark: 150 },
        { subject: 'Quality', A: 86, B: 130, fullMark: 150 },
        { subject: 'Teamwork', A: 99, B: 100, fullMark: 150 },
        { subject: 'Reliability', A: 85, B: 90, fullMark: 150 },
        { subject: 'Innovation', A: 65, B: 85, fullMark: 150 },
    ];

    const [forecastData, setForecastData] = useState(defaultForecastData);
    const [turnoverRisk, setTurnoverRisk] = useState(defaultTurnoverRisk);
    const [radarData, setRadarData] = useState(defaultRadarData);

    useEffect(() => {
        let isMounted = true;

        const pickArray = (value) => (Array.isArray(value) ? value : []);

        const loadPerformanceInsights = async () => {
            try {
                const [analyticsRes, trendsRes] = await Promise.all([
                    getAnalyticsPerformance(),
                    getPerformanceReportTrends()
                ]);

                const analytics = analyticsRes.data?.data || {};
                const trends = trendsRes.data?.data || {};

                const radarSource = pickArray(analytics.radar || analytics.skills || analytics.competencies || analytics.metrics);
                const radarMapped = radarSource.map((item, index) => ({
                    subject: item.subject || item.label || item.name || `Metric ${index + 1}`,
                    A: Number(item.score ?? item.value ?? item.current ?? 0),
                    B: Number(item.target ?? item.projected ?? item.baseline ?? 0),
                    fullMark: Number(item.fullMark ?? 150)
                })).filter((item) => item.subject);

                const riskSource = pickArray(analytics.turnoverRisk || analytics.risks || analytics.departments);
                const riskMapped = riskSource.map((item, index) => ({
                    dept: item.department || item.dept || item.name || `Dept ${index + 1}`,
                    risk: Number(item.risk ?? item.value ?? item.turnover ?? 0),
                    trend: item.trend || (Number(item.risk ?? item.value ?? 0) > 30 ? 'rising' : 'stable')
                })).filter((item) => item.dept);

                const forecastSource = pickArray(trends.forecast || trends.trend || trends.data || trends);
                const forecastMapped = forecastSource.map((item, index) => ({
                    month: item.month || item.label || item.period || `M${index + 1}`,
                    current: item.current ?? item.actual ?? null,
                    projected: item.projected ?? item.forecast ?? item.value ?? null
                })).filter((item) => item.month);

                if (!isMounted) return;
                if (radarMapped.length) setRadarData(radarMapped);
                if (riskMapped.length) setTurnoverRisk(riskMapped);
                if (forecastMapped.length) setForecastData(forecastMapped);
            } catch (err) {
                // debug error removed
            }
        };

        loadPerformanceInsights();

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
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-left">Enterprise Predictive Hub</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 text-left leading-none">AI-Driven Performance Forecasting & Operational Integrity Insights</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="px-10 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-[10px] text-left">
                        Run Forecast Engine
                    </button>
                </div>
            </div>

            {/* Content Workspace */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-10 text-left">
                
                {/* 1. SIDEBAR: Risk Identifiers */}
                <div className="xl:col-span-3 flex flex-col gap-10 text-left">
                    <div className="card-soft bg-white p-10 border-slate-100 shadow-soft text-left flex flex-col min-h-[300px]">
                        <div className="flex items-center justify-between mb-8 text-left">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] text-left">Turnover Probabilities</h3>
                            <AlertCircle size={20} className="text-rose-500" />
                        </div>
                        <div className="space-y-6 text-left">
                            {turnoverRisk.map((node, i) => (
                                <div key={i} className="space-y-2 text-left">
                                    <div className="flex justify-between text-left">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-left">{node.dept} Risk</span>
                                        <span className={`text-[10px] font-black uppercase text-left tracking-widest ${node.risk > 30 ? 'text-rose-500' : 'text-slate-400'}`}>{node.risk}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden text-left">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${node.risk > 30 ? 'bg-rose-400' : 'bg-slate-300'}`} 
                                            style={{ width: `${node.risk}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-soft bg-indigo-900 p-8 border-none text-white relative overflow-hidden group text-left">
                        <div className="relative z-10 text-left">
                            <BrainCircuit className="mb-4 text-indigo-300" size={24} />
                            <h4 className="text-sm font-black uppercase tracking-widest leading-tight mb-2 text-left">Recruitment ROI</h4>
                            <p className="text-[10px] opacity-60 font-medium leading-relaxed uppercase tracking-widest mb-6 text-left">Strategic hiring nodes in Q3 have delivered 14% higher velocity vs baseline.</p>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-center">View Full Audit</button>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN HUB: Growth Forecast */}
                <div className="xl:col-span-9 card-soft bg-white border border-slate-100 shadow-soft overflow-hidden flex flex-col min-h-[600px] text-left">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20 text-left shrink-0">
                        <div className="text-left">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] text-left">Trajectory Forecasting</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">Predicted growth velocity nodes vs current actuals</p>
                        </div>
                        <div className="flex items-center gap-6 text-left">
                            <div className="flex items-center gap-2 text-left">
                                <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actual</span>
                            </div>
                            <div className="flex items-center gap-2 text-left">
                                <div className="w-2 h-2 rounded-full bg-indigo-200"></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Projected (AI)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 min-h-0 p-10 text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecastData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
                                    domain={[60, 100]}
                                />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px'}}
                                    itemStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}}
                                />
                                <Line type="monotone" dataKey="current" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                                <Line type="dashed" dataKey="projected" stroke="#c7d2fe" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#c7d2fe' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-left shrink-0">
                        <div className="flex items-center gap-4 text-left">
                            <ShieldCheck size={20} className="text-indigo-500" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">Model Reliability: 94% Based on historical cross-node data</p>
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-800 transition-all text-left">
                            Export Prediction Set
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default PerformanceInsights;
