import React, { useState } from 'react';
import { 
  ClipboardList, 
  MessageSquare, 
  Star, 
  Send, 
  Undo2, 
  User, 
  Search, 
  ChevronDown, 
  ShieldCheck, 
  AlertCircle,
  LayoutDashboard,
  Zap,
  FileText,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManagerFeedback = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showEmployeeList, setShowEmployeeList] = useState(false);

    const [ratings, setRatings] = useState({
        velocity: 0,
        quality: 0,
        reliability: 0,
        innovation: 0
    });

    const [feedbackText, setFeedbackText] = useState('');

    const employees = [
        { id: 'EMP-001', name: 'Mark Wilson', dept: 'Engineering', role: 'Senior Developer' },
        { id: 'EMP-002', name: 'Sarah Chen', dept: 'Design', role: 'UI/UX Lead' },
        { id: 'EMP-003', name: 'Alex Rivers', dept: 'Engineering', role: 'Frontend Architect' },
        { id: 'EMP-004', name: 'Elena Rodriguez', dept: 'Operations', role: 'Ops Manager' },
    ];

    const handleRating = (metric, value) => {
        setRatings(prev => ({ ...prev, [metric]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedEmployee) return;
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex flex-col min-h-[calc(100vh-120px)] w-full items-center justify-center animate-in fade-in zoom-in-95 duration-700 text-left">
                <div className="max-w-xl w-full card-soft bg-white p-12 border-slate-100 shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-500 mb-8 border-4 border-white shadow-xl animate-bounce">
                            <ShieldCheck size={48} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-6 text-center">Review Submitted!</h2>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest leading-relaxed mb-10 max-w-sm mx-auto text-center">
                            The performance diagnostic for <span className="text-primary-600 font-black">{selectedEmployee.name}</span> has been archived and synchronized with the global merit engine.
                        </p>
                        <div className="flex flex-col w-full gap-4">
                            <button 
                                onClick={() => navigate('/performance')}
                                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-[0.2em] text-[11px] active:scale-95"
                            >
                                Return to Hub
                            </button>
                            <button 
                                onClick={() => { setSubmitted(false); setSelectedEmployee(null); setRatings({velocity:0, quality:0, reliability:0, innovation:0}); setFeedbackText(''); }}
                                className="w-full py-5 bg-white border border-slate-200 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px] active:scale-95"
                            >
                                Submit New Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 text-left pb-20">
            
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
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-left">Leadership Feedback Portal</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 text-left leading-none">Qualitative Diagnostics & Merit Score Validation</p>
                    </div>
                </div>
            </div>

            {/* Performance Workspace */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32 text-left">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-10 text-left">
                    
                    {/* Left Column: Target Selection */}
                    <div className="xl:col-span-4 space-y-10 text-left">
                        <div className="card-soft bg-white p-10 border-slate-100 shadow-soft space-y-8 text-left">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] text-left">Employee Target Identification</h3>
                            
                            <div className="relative text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Select Node for Review</label>
                                <button 
                                    type="button"
                                    onClick={() => setShowEmployeeList(!showEmployeeList)}
                                    className={`w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-tight text-left flex items-center justify-between mt-3 hover:bg-slate-100 transition-all ${selectedEmployee ? 'border-primary-100 bg-primary-50/10' : ''}`}
                                >
                                    {selectedEmployee ? selectedEmployee.name : 'Choose employee from directory...'}
                                    <ChevronDown size={18} className={`transition-transform duration-300 ${showEmployeeList ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showEmployeeList && (
                                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 text-left">
                                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 text-left">
                                            <div className="relative text-left">
                                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search names..." 
                                                    className="w-full bg-white border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none text-left"
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {employees.map(emp => (
                                            <button 
                                                key={emp.id} type="button" 
                                                onClick={() => { setSelectedEmployee(emp); setShowEmployeeList(false); }}
                                                className="w-full p-5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-none transition-colors group"
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[8px] font-black group-hover:scale-110 transition-transform">{emp.name.split(' ').map(n=>n[0]).join('')}</div>
                                                    <div className="text-left">
                                                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight text-left">{emp.name}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-left">{emp.role}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedEmployee && (
                                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 animate-in fade-in slide-in-from-bottom-2 text-left">
                                    <div className="flex items-center gap-4 text-left">
                                        <AlertCircle size={20} className="text-primary-500" />
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-left leading-relaxed">
                                            Currently reviewing <span className="text-primary-600 underline">Q3 performance thresholds</span> for the {selectedEmployee.dept} department node.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="card-soft bg-white p-10 border-slate-100 shadow-soft text-left">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] text-left">Metric Validation</h3>
                            <div className="space-y-10 text-left">
                                {[
                                    { id: 'velocity', label: 'Velocity & Speed', desc: 'Efficiency of task completion' },
                                    { id: 'quality', label: 'Output Precision', desc: 'Accuracy and consistency of work' },
                                    { id: 'reliability', label: 'Operational Dependability', desc: 'Attendance and responsibility score' },
                                    { id: 'innovation', label: 'Innovation Engine', desc: 'Creative problem solving input' },
                                ].map((metric) => (
                                    <div key={metric.id} className="space-y-4 text-left">
                                        <div className="flex justify-between items-end text-left">
                                            <div className="text-left">
                                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight text-left">{metric.label}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-left mt-1">{metric.desc}</p>
                                            </div>
                                            <div className="flex gap-1 text-left">
                                                {[1,2,3,4,5].map(v => (
                                                    <button 
                                                        key={v} type="button" 
                                                        onClick={() => handleRating(metric.id, v)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${ratings[metric.id] >= v ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                                                    >
                                                        <Star size={14} fill={ratings[metric.id] >= v ? "currentColor" : "none"} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Qualitative Notes */}
                    <div className="xl:col-span-8 space-y-10 text-left">
                        <div className="card-soft bg-white p-10 border-slate-100 shadow-soft h-full flex flex-col text-left min-h-[600px]">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] text-left">Qualitative Diagnostics</h3>
                            <div className="flex-1 mt-8 relative text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Manager's Narrative Statement</label>
                                <textarea 
                                    className="w-full flex-1 mt-4 p-8 bg-slate-50 border border-slate-100 rounded-[32px] text-xs font-black text-slate-600 uppercase tracking-tight outline-none focus:border-primary-100 transition-all resize-none no-scrollbar text-left h-[400px]"
                                    placeholder="Enter forensic performance summary, strengths, and areas for strategic growth..."
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                ></textarea>
                                <div className="absolute bottom-6 right-6 p-4 bg-white/80 backdrop-blur shadow-xl rounded-2xl text-[9px] font-black text-slate-400 uppercase text-left border border-slate-50">
                                    Characters: {feedbackText.length}
                                </div>
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={!selectedEmployee}
                                className={`w-full py-6 mt-10 font-black rounded-[32px] transition-all shadow-2xl uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 active:scale-95 group ${selectedEmployee ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-50 shadow-none'}`}
                            >
                                <Send size={18} className={selectedEmployee ? 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform' : ''} />
                                Synchronize Review
                            </button>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default ManagerFeedback;
