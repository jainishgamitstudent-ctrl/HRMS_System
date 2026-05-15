import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Download,
    Loader2,
    AlertCircle,
    Info,
    X
} from 'lucide-react';
import { hrService } from '../../../services/hr.service';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const STATUS_META = {
    P: { label: 'Present', bg: 'bg-emerald-500', text: 'text-white', light: 'bg-emerald-50 text-emerald-700' },
    A: { label: 'Absent', bg: 'bg-rose-500', text: 'text-white', light: 'bg-rose-50 text-rose-700' },
    L: { label: 'Late', bg: 'bg-amber-500', text: 'text-white', light: 'bg-amber-50 text-amber-700' },
    W: { label: 'Weekend', bg: 'bg-slate-100', text: 'text-slate-300', light: 'bg-slate-50 text-slate-400' },
    H: { label: 'Holiday', bg: 'bg-sky-100', text: 'text-sky-400', light: 'bg-sky-50 text-sky-600' },
};

const MonthlyAttendance = () => {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [hoveredCol, setHoveredCol] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const nameScrollRef = useRef(null);
    const dataScrollRef = useRef(null);
    const headerScrollRef = useRef(null);

    const daysInMonth = data?.daysInMonth || new Date(year, month, 0).getDate();

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await hrService.getMonthlyAttendance(year, month);
                if (mounted) setData(res.data);
            } catch (err) {
                if (mounted) setError('Failed to load attendance data');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => { mounted = false; };
    }, [year, month]);

    const records = useMemo(() => data?.records || [], [data]);

    const filtered = useMemo(() => {
        if (!searchQuery) return records;
        return records.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [records, searchQuery]);

    const syncScroll = (e) => {
        const { scrollTop, scrollLeft } = e.target;
        if (e.target === nameScrollRef.current && dataScrollRef.current) {
            dataScrollRef.current.scrollTop = scrollTop;
        } else if (e.target === dataScrollRef.current) {
            if (nameScrollRef.current) nameScrollRef.current.scrollTop = scrollTop;
            if (headerScrollRef.current) headerScrollRef.current.scrollLeft = scrollLeft;
        } else if (e.target === headerScrollRef.current && dataScrollRef.current) {
            dataScrollRef.current.scrollLeft = scrollLeft;
        }
    };

    const goPrev = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const goNext = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const handleExport = () => {
        if (!data?.records?.length) return;
        const headers = ['Employee', 'Designation', ...Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`), 'Present', 'Absent', 'Late'];
        const rows = data.records.map(emp => [
            emp.name,
            emp.designation,
            ...emp.history,
            emp.summary.P,
            emp.summary.A,
            emp.summary.L
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${MONTH_NAMES[month - 1]}-${year}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const cellSize = 44;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative mt-4">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">Monthly Attendance</h1>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Employee presence overview by day</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                        <button onClick={goPrev} className="p-1 text-slate-400 hover:text-slate-700"><ChevronLeft size={18} /></button>
                        <span className="text-sm font-bold text-slate-800 min-w-[140px] text-center">{MONTH_NAMES[month - 1]} {year}</span>
                        <button onClick={goNext} className="p-1 text-slate-400 hover:text-slate-700"><ChevronRight size={18} /></button>
                    </div>
                    <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 shrink-0">
                <div className="relative w-full max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search employee..."
                        className="w-full bg-white border border-slate-200 focus:border-primary-400 outline-none rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" onClick={() => setSearchQuery('')} />
                    )}
                </div>
                <div className="hidden md:flex items-center gap-5">
                    {Object.entries(STATUS_META).map(([key, meta]) => (
                        <div key={key} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${meta.bg}`}></div>
                            <span className="text-xs text-slate-500 font-medium">{meta.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">

                {/* Loading / Error overlays */}
                {loading && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 size={28} className="text-primary-500 animate-spin mb-2" />
                        <p className="text-xs text-slate-400 font-medium">Loading attendance...</p>
                    </div>
                )}
                {!loading && error && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <AlertCircle size={28} className="text-red-500 mb-2" />
                        <p className="text-sm text-slate-700 font-medium mb-2">{error}</p>
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg">Retry</button>
                    </div>
                )}
                {!loading && !error && records.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Info size={28} className="text-slate-300 mb-2" />
                        <p className="text-sm text-slate-400 font-medium">No records found</p>
                    </div>
                )}

                {!loading && !error && records.length > 0 && (
                    <>
                        {/* Header row with day numbers */}
                        <div className="flex shrink-0 border-b border-slate-100 bg-slate-50/60">
                            <div className="w-[260px] shrink-0 flex items-center px-6 text-xs font-bold text-slate-500 border-r border-slate-100" style={{ height: 40 }}>
                                Employee
                            </div>
                            <div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar" ref={headerScrollRef} onScroll={syncScroll}>
                                <div className="flex min-w-max">
                                    {Array.from({ length: daysInMonth }, (_, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-center text-[11px] font-bold border-r border-slate-50 transition-colors ${hoveredCol === i ? 'bg-primary-50 text-primary-700' : 'text-slate-400'}`}
                                            style={{ width: cellSize, height: 40 }}
                                            onMouseEnter={() => setHoveredCol(i)}
                                            onMouseLeave={() => setHoveredCol(null)}
                                        >
                                            {i + 1}
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-center text-[10px] font-bold text-slate-500 tracking-wide uppercase" style={{ width: 120 }}>
                                        Summary
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Split panes */}
                        <div className="flex-1 flex overflow-hidden min-h-0">

                            {/* Names pane */}
                            <div className="w-[260px] shrink-0 border-r border-slate-100 overflow-y-auto no-scrollbar" ref={nameScrollRef} onScroll={syncScroll}>
                                {filtered.map((emp, i) => (
                                    <div
                                        key={emp.id}
                                        className={`flex items-center gap-3 px-5 border-b border-slate-50 transition-colors ${hoveredRow === i ? 'bg-slate-50' : ''}`}
                                        style={{ height: 53 }}
                                        onMouseEnter={() => setHoveredRow(i)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        <img src={emp.avatar} className="w-8 h-8 rounded-lg object-cover bg-slate-100" alt="" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{emp.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{emp.designation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Data pane */}
                            <div className="flex-1 overflow-auto no-scrollbar" ref={dataScrollRef} onScroll={syncScroll}>
                                <div className="min-w-max">
                                    {filtered.map((emp, rowIdx) => (
                                        <div
                                            key={emp.id}
                                            className={`flex border-b border-slate-50 transition-colors ${hoveredRow === rowIdx ? 'bg-slate-50' : ''}`}
                                            onMouseEnter={() => setHoveredRow(rowIdx)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                        >
                                            {emp.history.map((status, colIdx) => {
                                                const meta = STATUS_META[status] || STATUS_META.P;
                                                const isHL = hoveredRow === rowIdx && hoveredCol === colIdx;
                                                return (
                                                    <div
                                                        key={colIdx}
                                                        className={`flex items-center justify-center border-r border-slate-50 transition-colors ${hoveredCol === colIdx ? 'bg-primary-50/40' : ''}`}
                                                        style={{ width: cellSize, height: 53 }}
                                                        onMouseEnter={(e) => {
                                                            setHoveredCol(colIdx);
                                                            setTooltip({ name: emp.name, day: colIdx + 1, status, label: meta.label });
                                                            setMousePos({ x: e.clientX, y: e.clientY });
                                                        }}
                                                        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                                                        onMouseLeave={() => { setHoveredCol(null); setTooltip(null); }}
                                                    >
                                                        <div
                                                            className={`flex items-center justify-center text-[10px] font-bold rounded-lg transition-all ${meta.bg} ${meta.text} ${isHL ? 'scale-110 ring-2 ring-white shadow-md' : ''}`}
                                                            style={{ width: 28, height: 28 }}
                                                        >
                                                            {status}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div className="flex items-center justify-center gap-2" style={{ width: 120, height: 53 }}>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${STATUS_META.P.light}`}>{emp.summary.P}</span>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${STATUS_META.A.light}`}>{emp.summary.A}</span>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${STATUS_META.L.light}`}>{emp.summary.L}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Simple tooltip */}
                {tooltip && (
                    <div className="fixed z-50 bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs pointer-events-none"
                        style={{ top: mousePos.y - 48, left: mousePos.x + 12 }}>
                        <span className="font-bold">{tooltip.name}</span> — Day {tooltip.day}: {tooltip.label}
                    </div>
                )}

                {/* Footer */}
                <div className="shrink-0 px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">{filtered.length} employees shown</p>
                    <p className="text-[10px] text-slate-400">Last updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>
        </div>
    );
};

export default MonthlyAttendance;
