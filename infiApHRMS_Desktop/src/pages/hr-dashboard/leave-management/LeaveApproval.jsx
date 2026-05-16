import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertCircle,
  MoreHorizontal,
  MapPin,
  TrendingUp,
  FileText,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLeaveRequests, approveLeave } from '../../../services/hrApi';
import { API_CONFIG } from '../../../config.js';

const LeaveApproval = () => {
    const navigate = useNavigate();
    const [managerNote, setManagerNote] = useState('');
    const [status, setStatus] = useState('Pending Review');
    const [leaveRequest, setLeaveRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      const fetchLeaveRequest = async () => {
        try {
          const res = await getLeaveRequests({ status: 'Pending', limit: 1 });
          const leaves = res.data?.data || [];
          // debug log removed
          // debug log removed
          if (leaves.length > 0) {
            const leave = leaves[0];
            // debug log removed
            // debug log removed
            // debug log removed
            const start = new Date(leave.StartDate);
            const end = new Date(leave.EndDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            setLeaveRequest({
              id: leave._id,
              employeeName: leave.EmployeeID?.name || 'Unknown Employee',
              employeeId: leave.EmployeeID?.employeeId || 'N/A',
              department: leave.EmployeeID?.department || 'N/A',
              profileImage: leave.EmployeeID?.profileImage || null,
              type: leave.LeaveType,
              days: leave.IsHalfDay ? 0.5 : diffDays,
              range: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
              reason: leave.Reason,
              submittedAt: new Date(leave.createdAt).toLocaleString(),
            });
          }
        } catch (err) {
          // debug error removed
        } finally {
          setLoading(false);
        }
      };
      fetchLeaveRequest();
    }, []);

    const handleApprove = async () => {
      if (!leaveRequest) return;
      setSubmitting(true);
      try {
        await approveLeave({ leaveId: leaveRequest.id, status: 'Approved' });
        setStatus('Approved');
        setTimeout(() => navigate('/leave'), 1000);
      } catch (err) {
        // debug error removed
      } finally {
        setSubmitting(false);
      }
    };

    const handleReject = async () => {
      if (!leaveRequest) return;
      setSubmitting(true);
      try {
        await approveLeave({ leaveId: leaveRequest.id, status: 'Rejected' });
        setStatus('Rejected');
        setTimeout(() => navigate('/leave'), 1000);
      } catch (err) {
        // debug error removed
      } finally {
        setSubmitting(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
        </div>
      );
    }

    if (!leaveRequest) {
      return (
        <div className="flex flex-col h-[calc(100vh-120px)] items-center justify-center">
          <p className="text-slate-600 mb-4">No pending leave requests</p>
          <button 
            onClick={() => navigate('/leave')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Back to Hub
          </button>
        </div>
      );
    }

    const employee = {
        name: leaveRequest.employeeName,
        id: leaveRequest.employeeId,
        dept: leaveRequest.department,
        role: 'Employee',
        profileImage: leaveRequest.profileImage,
        stats: {
            taken: 12,
            remaining: 18,
            trend: '-2% from last year'
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    };

    const getProfileImage = (image) => {
        if (!image) return null;
        // If it's a base64 string, return it as is
        if (image.startsWith('data:image')) return image;
        // If it's a relative path starting with /uploads, prefix with backend URL
        if (image.startsWith('/uploads')) return `${API_CONFIG.baseURL}${image}`;
        // If it's a relative path without /, prefix with backend URL
        if (!image.startsWith('http')) return `${API_CONFIG.baseURL}/uploads/${image}`;
        return image;
    };

    const request = {
        type: leaveRequest.type,
        range: leaveRequest.range,
        totalDays: leaveRequest.days,
        reason: leaveRequest.reason,
        submittedAt: leaveRequest.submittedAt
    };

    return (
        <div className="flex flex-col h-[calc(100vh-150px)] w-full gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            
            {/* Context Header */}
            <div className="flex items-center justify-between shrink-0 px-2">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/leave')}
                        className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm transition-all hover:-translate-x-1"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">Request Diagnostic</h1>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Review Queue • <span className="text-indigo-600">{status}</span></p>
                    </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 flex items-center divide-x divide-slate-100 rounded-xl shadow-soft overflow-hidden">
                    <div className="px-5 py-2 flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Taken</span>
                        <span className="text-[11px] font-black text-slate-800">{employee.stats.taken} Days</span>
                    </div>
                    <div className="px-5 py-2 flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Remaining</span>
                        <span className="text-[11px] font-black text-emerald-600">{employee.stats.remaining} Days</span>
                    </div>
                </div>
            </div>

            {/* Diagnostic Workspace Split */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-5 overflow-hidden min-h-0">
                
                {/* 1. LEFT: Employee Intelligence & Metrics */}
                <div className="xl:col-span-4 flex flex-col gap-5 overflow-y-auto no-scrollbar pb-4 px-2">
                    <div className="bg-white p-6 border border-slate-100 shadow-soft rounded-[28px] relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center">
                            {/* Profile Image */}
                            <div className="relative mb-4">
                                <div className="w-20 h-20 rounded-2xl bg-indigo-50 p-1 group-hover:scale-105 transition-all shadow-lg rotate-2">
                                    {employee.profileImage ? (
                                        <img
                                            src={getProfileImage(employee.profileImage)}
                                            className="w-full h-full rounded-[14px] object-cover -rotate-2 border-2 border-white"
                                            alt={employee.name}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `<div class="w-full h-full rounded-[14px] bg-indigo-600 flex items-center justify-center -rotate-2 border-2 border-white"><span class="text-xl font-black text-white">${getInitials(employee.name)}</span></div>`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-[14px] bg-indigo-600 flex items-center justify-center -rotate-2 border-2 border-white shadow-inner">
                                            <span className="text-xl font-black text-white">{getInitials(employee.name)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center text-white shadow-md">
                                    <ShieldCheck size={12} strokeWidth={3} />
                                </div>
                            </div>

                            {/* Employee Name & Role */}
                            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">{employee.name}</h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">{employee.role} • {employee.dept}</p>

                            {/* Employee Info Cards */}
                            <div className="w-full space-y-2">
                                <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group/item">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover/item:text-indigo-600 transition-colors">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ID</span>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-900">{employee.id}</span>
                                </div>
                                <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group/item">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover/item:text-indigo-600 transition-colors">
                                            <TrendingUp size={14} />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Attendance</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Optimal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-[28px] text-white relative overflow-hidden shadow-xl shadow-slate-200">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                                    <TrendingUp size={16} />
                                </div>
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em]">Diagnostic Insight</h4>
                            </div>
                            <p className="text-[10px] opacity-70 font-bold leading-relaxed mb-4">
                                {employee.name} carries an 18% lower absence rate compared to average.
                            </p>
                            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20">Analyze patterns</button>
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT: Request Breakdown & Action */}
                <div className="xl:col-span-8 flex flex-col bg-white border border-slate-100 rounded-[28px] shadow-soft overflow-hidden min-h-0">
                    <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div>
                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-0.5">Diagnostic Target</p>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Leave Details</h3>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <Calendar size={12} className="text-indigo-500" />
                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Sub: {request.submittedAt}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar pb-16">
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-white rounded-lg text-indigo-600 shadow-sm flex items-center justify-center"><FileText size={16} /></div>
                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</h4>
                                </div>
                                <p className="text-lg font-black text-slate-900 tracking-tight uppercase underline decoration-indigo-200 decoration-4 underline-offset-4">{request.type}</p>
                            </div>
                            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-white rounded-lg text-emerald-600 shadow-sm flex items-center justify-center"><Clock size={16} /></div>
                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</h4>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-slate-900 tracking-tighter">{request.totalDays}</span>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Days</span>
                                    </div>
                                    <div className="w-px h-6 bg-slate-200"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-800 tracking-tight uppercase">{request.range}</span>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Range</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <MessageSquare size={12} className="text-indigo-500" />
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason</h4>
                            </div>
                            <div className="p-6 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl italic text-slate-600 text-xs font-medium leading-relaxed border-l-4 border-l-indigo-600">
                                "{request.reason}"
                            </div>
                        </section>

                        <section className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Manager Recommendation</h4>
                            </div>
                            <div className="relative">
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-200 outline-none rounded-2xl p-5 text-xs font-medium text-slate-700 transition-all focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300 resize-none"
                                    placeholder="Add your notes or recommendation..."
                                    rows="3"
                                    value={managerNote}
                                    onChange={(e) => setManagerNote(e.target.value)}
                                />
                                <div className="absolute bottom-3 right-5 text-[7px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
                                    <AlertCircle size={8} />
                                    Visible to employee
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Fixed Action Footer */}
                    <div className="px-8 py-5 border-t border-slate-50 bg-slate-900 flex items-center gap-4 shrink-0">
                        <button 
                            onClick={handleApprove}
                            disabled={submitting}
                            className="flex-1 py-3.5 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-50 transition-all shadow-xl uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={14} className="animate-spin text-indigo-600" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                            {submitting ? 'Processing...' : 'Approve'}
                        </button>
                        <button 
                            onClick={handleReject}
                            disabled={submitting}
                            className="flex-1 py-3.5 bg-white/10 text-white font-black rounded-xl hover:bg-white/20 transition-all uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} className="text-rose-400" />}
                            {submitting ? 'Processing...' : 'Reject'}
                        </button>
                        <button className="p-3.5 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all shadow-xl active:scale-95">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveApproval;
