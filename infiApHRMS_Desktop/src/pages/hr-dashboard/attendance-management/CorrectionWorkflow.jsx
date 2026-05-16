import React, { useState, useEffect } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Search,
  Check,
  X,
  BellRing,
  Filter,
  FileSearch,
  ShieldCheck
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttendanceCorrectionRequests, reviewAttendanceCorrection } from '../../../services/hrApi';

const CorrectionWorkflow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const [request, setRequest] = useState(null);

  useEffect(() => {
    const fetchCorrection = async () => {
      setLoading(true);
      try {
        const res = await getAttendanceCorrectionRequests();
        const data = res.data?.data || [];
        // If an ID is provided, find it; otherwise, default to the first one
        let target = data.find(req => String(req._id) === String(id)) || data[0];
        
        if (target) {
           setRequest({
              id: target._id || target.id,
              name: target.employee?.name || 'Unknown',
              role: target.employee?.role || 'Employee',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(target.employee?.name || 'User')}`,
              date: target.date ? new Date(target.date).toLocaleDateString() : 'N/A',
              reason: target.reason || 'No justification provided.',
              original: { 
                 checkIn: target.originalCheckIn || 'N/A', 
                 checkOut: target.originalCheckOut || 'N/A', 
                 status: target.originalStatus || 'Late' 
              },
              requested: { 
                 checkIn: target.requestedCheckIn || 'N/A', 
                 checkOut: target.requestedCheckOut || 'N/A', 
                 status: 'On Time' 
              },
              status: target.status || 'Pending Review'
           });
        } else {
           setRequest({
              id: id || '9642',
              name: 'Arjun Mehta',
              role: 'Principal Engineer',
              avatar: 'https://i.pravatar.cc/150?u=arjun',
              date: '24 Oct 2023',
              reason: 'System glitch during office WiFi outage. Punched in via personal mobile but location was flagged.',
              original: { checkIn: '09:45 AM', checkOut: '05:30 PM', status: 'Late' },
              requested: { checkIn: '08:52 AM', checkOut: '05:45 PM', status: 'On Time' },
              status: 'Pending Review'
            });
        }
      } catch (err) {
        // debug error removed
      } finally {
        setLoading(false);
      }
    };
    fetchCorrection();
  }, [id]);

  const handleAction = async (status) => {
    if (!request?._id && !request?.id) return;
    try {
       await reviewAttendanceCorrection({ id: request.id, status });
       showNotification(`Correction request has been ${status.toLowerCase()} successfully.`);
       setTimeout(() => navigate('/attendance'), 2000);
    } catch (err) {
       showNotification('Failed to update request.');
    }
  };

  if (!request) return <div className="p-8 text-center text-slate-400 font-black uppercase tracking-widest">Loading Diagnostics...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 w-full relative pt-4 px-1">
      
      {/* Premium Notification */}
      {notification && (
        <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10">
          <BellRing size={20} className="text-primary-400" />
          <span className="text-sm font-bold tracking-tight uppercase tracking-widest">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => navigate('/attendance')}
             className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all"
           >
              <X size={20} />
           </button>
           <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Correction Diagnostic</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Manual attendance variance audit and validation</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => handleAction('Denied')}
             className="px-8 py-3 bg-white border border-slate-100 text-rose-500 font-black text-[10px] uppercase rounded-2xl hover:bg-rose-50 transition-all shadow-sm active:scale-95 border-rose-100"
           >
              Reject Change
           </button>
           <button 
             onClick={() => handleAction('Approved')}
             className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px]"
           >
              Authorize Correction
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         
         {/* Center Pane: Comparative Analysis */}
         <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* 1. Original Record (Variance) */}
               <div className="card-soft bg-white p-8 border-slate-100 shadow-soft relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-900"><History size={64} /></div>
                  <div className="flex items-center gap-2 mb-8">
                     <AlertCircle size={16} className="text-rose-400" />
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Original System Entry</h3>
                  </div>
                  <div className="space-y-6">
                     <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Check-in</p>
                        <p className="text-2xl font-black text-slate-700 tracking-tighter line-through opacity-40">{request.original.checkIn}</p>
                     </div>
                     <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Check-out</p>
                        <p className="text-2xl font-black text-slate-700 tracking-tighter">{request.original.checkOut}</p>
                     </div>
                     <div className="pt-4">
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-rose-100">{request.original.status}</span>
                     </div>
                  </div>
               </div>

               {/* 2. Requested Correction (Target) */}
               <div className="card-soft bg-slate-900 p-8 border-none shadow-2xl relative overflow-hidden text-white group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-primary-500"><CheckCircle2 size={64} /></div>
                  <div className="flex items-center gap-2 mb-8">
                     <ShieldCheck size={16} className="text-primary-400" />
                     <h3 className="text-xs font-black text-primary-400/60 uppercase tracking-widest leading-none">Requested Variance</h3>
                  </div>
                  <div className="space-y-6">
                     <div className="flex justify-between items-end border-b border-white/5 pb-4">
                        <p className="text-[10px] font-black text-white/30 uppercase">Proposed In</p>
                        <p className="text-2xl font-black text-primary-400 tracking-tighter animate-pulse">{request.requested.checkIn}</p>
                     </div>
                     <div className="flex justify-between items-end border-b border-white/5 pb-4">
                        <p className="text-[10px] font-black text-white/30 uppercase">Proposed Out</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{request.requested.checkOut}</p>
                     </div>
                     <div className="pt-4">
                        <span className="px-3 py-1 bg-primary-600/20 text-primary-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary-400/30">Verified Shift Target</span>
                     </div>
                  </div>
               </div>

            </div>

            {/* Audit Justification */}
            <div className="card-soft bg-white p-10 border-slate-100 shadow-soft">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Staff Justification & Evidence</h3>
               <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 italic text-slate-600 font-medium leading-relaxed shadow-inner">
                  "{request.reason}"
               </div>
               <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><FileSearch size={22} /></div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Attached Evidence</p>
                        <p className="text-xs font-black text-primary-600 hover:underline cursor-pointer">network_outage_log_24oct.pdf</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                     <Clock size={14} />
                     Submitted 4h ago
                  </div>
               </div>
            </div>
         </div>

         {/* Sidebar: Request Meta & Audit Trail */}
         <div className="space-y-8">
            <div className="card-soft bg-white p-8 border-slate-100 shadow-soft">
               <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-8">Requestor Identity</h3>
               <div className="flex items-center gap-4 mb-8">
                  <img src={request.avatar} className="w-16 h-16 rounded-[24px] object-cover ring-4 ring-slate-50 shadow-md" alt="" />
                  <div>
                     <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1 group-hover:text-primary-600 transition-colors uppercase">{request.name}</h4>
                     <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{request.role}</p>
                  </div>
               </div>
               <div className="space-y-4 pt-8 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-slate-400">Request ID</span>
                     <span className="text-slate-800">#{request.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-slate-400">Audit Status</span>
                     <span className="text-primary-600 animate-pulse">{request.status}</span>
                  </div>
               </div>
            </div>

            {/* Micro Audit Timeline */}
            <div className="px-8 space-y-8">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Audit Traceability</h4>
               <div className="space-y-8 relative ml-3">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-100 -ml-0.5"></div>
                  {[
                    { title: 'Correction Requested', user: 'Self (Mobile App)', time: '08:52 AM', active: false },
                    { title: 'System Validation', user: 'Cloud Engine', time: '08:55 AM', active: true },
                    { title: 'Manager Review', user: 'Pending Admin', time: '---', active: false },
                  ].map((trace, i) => (
                    <div key={i} className="flex gap-6 items-start relative">
                       <div className={`w-3.5 h-3.5 rounded-full border-4 border-white shadow-sm -ml-[7.5px] relative z-10 ${trace.active ? 'bg-primary-500 scale-125' : 'bg-slate-200'}`}></div>
                       <div className="space-y-1">
                          <p className={`text-[11px] font-black uppercase tracking-tight ${trace.active ? 'text-primary-600' : 'text-slate-600'}`}>{trace.title}</p>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                             <User size={10} />
                             {trace.user}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default CorrectionWorkflow;
