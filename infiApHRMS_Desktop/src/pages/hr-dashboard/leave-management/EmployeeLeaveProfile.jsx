import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp,
  Activity,
  History,
  MoreHorizontal,
  Mail,
  Briefcase,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeLeaveProfile = () => {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date(2024, 5, 1)); // June 2024 as per screenshot

    const employee = {
        name: 'Sneha Desai',
        role: 'Senior Software Engineer',
        id: 'INF-3621',
        dept: 'Engineering',
        avatar: 'https://i.pravatar.cc/150?u=sneha',
        stats: {
            taken: 12,
            takenTrend: '-2% from last year',
            remaining: 18,
            remainingTrend: '~5% vs team avg'
        }
    };

    const recentActivity = [
        { type: 'Casual Leave', range: '14 Jun - 15 Jun • 2 Days', status: 'Approved', color: 'text-emerald-500' },
        { type: 'Sick Leave', range: '23 May • 1 Day', status: 'Approved', color: 'text-emerald-500' },
        { type: 'Vacation', range: '10 Apr - 15 Apr • 5 Days', status: 'Completed', color: 'text-slate-400' },
    ];

    const calendarDates = [
        { day: 1, type: 'work' }, { day: 2, type: 'work' }, { day: 3, type: 'work' }, 
        { day: 4, type: 'work' }, { day: 5, type: 'work' }, { day: 6, type: 'work' }, { day: 7, type: 'work' },
        { day: 8, type: 'work' }, { day: 9, type: 'work' }, { day: 10, type: 'work' }, { day: 11, type: 'leave' }, { day: 12, type: 'leave' },
        { day: 13, type: 'work' }, { day: 14, type: 'work' }, { day: 15, type: 'work' }, { day: 16, type: 'work' }, { day: 17, type: 'work' }, 
        { day: 18, type: 'work' }, { day: 19, type: 'work' }, { day: 20, type: 'work' }, { day: 21, type: 'work' }, { day: 22, type: 'work' },
        { day: 23, type: 'work' }, { day: 24, type: 'work' }, { day: 25, type: 'work' }, { day: 26, type: 'work' }, { day: 27, type: 'work' },
        { day: 28, type: 'work' }, { day: 29, type: 'work' }, { day: 30, type: 'work' }
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden">
            
            {/* Context Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-emerald-300 underline-offset-12 uppercase">Employee Leave Profile</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity size={12} className="text-primary-500" />
                            Individual Absence Diagnostic & Quota Tracking
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-primary-600 rounded-2xl shadow-sm transition-all active:scale-95">
                        <Mail size={20} />
                    </button>
                    <button className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all active:scale-95">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-8 overflow-hidden min-h-0">
                
                {/* 1. LEFT: Persona & Quota Status */}
                <div className="xl:col-span-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10">
                    <div className="card-soft bg-white p-10 border-slate-100 shadow-soft flex flex-col items-center relative overflow-hidden group">
                        <div className="w-40 h-40 rounded-[56px] bg-slate-50 p-2 mb-8 relative z-10 group-hover:scale-105 transition-all">
                            <img src={employee.avatar} className="w-full h-full rounded-[48px] border-4 border-white shadow-2xl object-cover" alt="" />
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <ShieldCheck size={20} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2 uppercase text-center">{employee.name}</h2>
                        <p className="text-[11px] text-primary-500 font-black uppercase tracking-widest mb-10">{employee.role}</p>
                        
                        <div className="w-full grid grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group-hover:bg-slate-100/50 transition-all">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Taken</p>
                                <p className="text-xl font-black text-slate-800 tracking-tighter mb-2">{employee.stats.taken} Days</p>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                                    <TrendingDown size={10} /> {employee.stats.takenTrend}
                                </span>
                            </div>
                            <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group-hover:bg-slate-100/50 transition-all">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                                <p className="text-xl font-black text-slate-800 tracking-tighter mb-2">{employee.stats.remaining} Days</p>
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-1">
                                    <TrendingUp size={10} /> {employee.stats.remainingTrend}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card-soft bg-slate-900 p-8 text-white relative overflow-hidden group">
                        <History size={24} className="text-primary-400 mb-4" />
                        <h4 className="text-sm font-black uppercase tracking-widest mb-2 leading-tight">Forensic Log Archive</h4>
                        <p className="text-[10px] opacity-60 font-medium leading-relaxed uppercase tracking-widest mb-6">
                            View full historical interaction logs for {employee.name.split(' ')[0]}'s leave lifecycle.
                        </p>
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-white border border-white/5">
                            Access Archives
                        </button>
                    </div>
                </div>

                {/* 2. CENTER: Visual Calendar Diagnostic */}
                <div className="xl:col-span-2 flex flex-col bg-white border border-slate-100 rounded-[44px] shadow-soft overflow-hidden min-h-0 relative">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-100/30">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Diagnostic Timeline</p>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Monthly Leave Calendar</h3>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                            <button className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400"><ChevronLeft size={18} /></button>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-widest px-4">June 2024</span>
                            <button className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400"><ChevronRight size={18} /></button>
                        </div>
                    </div>

                    <div className="flex-1 p-10 overflow-y-auto no-scrollbar">
                        <div className="grid grid-cols-7 gap-6 text-center mb-8">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <span key={day} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{day}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-6 place-items-center">
                            {/* Empty slots for first week if needed */}
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={`empty-${i}`} className="w-12 h-12"></div>
                            ))}
                            {calendarDates.map((date) => (
                                <div 
                                    key={date.day} 
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all relative group cursor-pointer shadow-sm
                                        ${date.type === 'leave' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-110' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:-translate-y-1'}`}
                                >
                                    {date.day}
                                    {date.day === 12 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md animate-bounce">
                                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-16 flex items-center justify-center gap-12 border-t border-slate-50 pt-10">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-primary-500 rounded-full shadow-lg shadow-primary-500/20"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Absence</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-slate-100 rounded-full shadow-inner"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Presence</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Holiday</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT: Activity Intelligence */}
                <div className="xl:col-span-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10">
                    <div className="card-soft bg-white p-8 border-slate-100 shadow-soft flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Recent Leave Activity</h3>
                            <Activity size={18} className="text-primary-500" />
                        </div>
                        <div className="space-y-6 overflow-y-auto no-scrollbar pr-2">
                            {recentActivity.map((act, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="flex items-start gap-4 mb-2">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all border border-slate-100">
                                            <CalendarIcon size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight group-hover:text-primary-600 transition-colors">{act.type}</p>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${act.color}`}>{act.status}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{act.range}</p>
                                        </div>
                                    </div>
                                    {i < recentActivity.length - 1 && <div className="ml-5 h-6 w-px bg-slate-100"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-soft bg-emerald-600 p-8 text-white shadow-2xl shadow-emerald-500/20 group relative overflow-hidden">
                        <div className="relative z-10 h-full">
                            <CheckCircle2 size={24} className="mb-4 opacity-80" />
                            <h4 className="text-sm font-black uppercase tracking-widest mb-2 leading-tight">Eligibility Report</h4>
                            <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest leading-relaxed mb-6">
                                Sneha is eligible for a long-service sabbatical starting Oct 2024.
                            </p>
                            <button className="w-full py-3 bg-white text-emerald-600 font-black rounded-xl text-[9px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 shadow-lg">
                                Download Certificate
                            </button>
                        </div>
                        <div className="absolute -bottom-4 -right-4 scale-150 rotate-12 opacity-10">
                            <Briefcase size={80} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeLeaveProfile;
