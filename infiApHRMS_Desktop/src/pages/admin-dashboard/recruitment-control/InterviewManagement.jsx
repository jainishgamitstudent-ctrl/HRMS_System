import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  User,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  Monitor,
  UserCheck,
  Zap
} from 'lucide-react';

const InterviewManagement = () => {
  const navigate = useNavigate();
  const [activeDate, setActiveDate] = useState('TODAY, OCT 24');
  
  const [formData, setFormData] = useState({
    candidateName: '',
    position: 'Senior UI Designer',
    date: '',
    time: '',
    mode: 'Online',
    interviewer: ''
  });

  const handleConfirmSchedule = (e) => {
    e.preventDefault();
    // In a real app, we'd add to the interviews array here.
    // For now, we provide the 'workable' feedback the user requested.
    navigate('/admin/recruitment-control/hub');
  };

  const interviews = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Senior UI Designer',
      time: '2:00 PM - 3:00 PM',
      interviewer: 'Jane Doe',
      status: 'TECHNICAL ROUND',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256&h=256',
      mode: 'Online',
      color: 'indigo'
    },
    {
      id: 2,
      name: 'Marcus Sterling',
      role: 'Frontend Architect',
      time: '4:00 PM - 5:00 PM',
      interviewer: 'Baily Watson',
      status: 'HR ROUND',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256&h=256',
      mode: 'Online',
      color: 'amber'
    }
  ];

  const tomorrowInterviews = [
    {
      id: 3,
      name: 'Elena Rodriguez',
      role: 'Product Manager',
      time: '10:00 AM - 11:00 AM',
      interviewer: 'Alex Thompson',
      status: 'MANAGERIAL ROUND',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256&h=256',
      mode: 'In-person',
      color: 'emerald'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Premium Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-6 border-b border-slate-100">
        <div>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">Interview Synchronization</h1>
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Lifecycle Management for Talent Interactions</p>
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-2xl">
          {['Upcoming', 'Completed', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                tab === 'Upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
        
        {/* LEFT COLUMN: Schedule Form Panel */}
        <div className="xl:col-span-5 2xl:col-span-4 sticky top-12">
           <div className="bg-white rounded-[48px] border border-slate-50 shadow-soft overflow-hidden">
              <div className="p-10 bg-linear-to-br from-indigo-600 to-indigo-700 text-white">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center">
                       <Calendar size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight leading-none">Schedule Interview</h2>
                 </div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-indigo-100">Establish new interaction protocol</p>
              </div>

              <div className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Candidate Name</label>
                    <div className="relative group">
                       <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                       <input 
                         type="text" 
                         placeholder="e.g. Mitchell Clint" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-14 py-4.5 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                         value={formData.candidateName}
                         onChange={(e) => setFormData({...formData, candidateName: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Position</label>
                    <select 
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all appearance-none cursor-pointer"
                       value={formData.position}
                       onChange={(e) => setFormData({...formData, position: e.target.value})}
                    >
                       <option>Senior UI Designer</option>
                       <option>Frontend Architect</option>
                       <option>Product Manager</option>
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</label>
                       <input 
                         type="date" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                         value={formData.date}
                         onChange={(e) => setFormData({...formData, date: e.target.value})}
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time</label>
                       <input 
                         type="time" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                         value={formData.time}
                         onChange={(e) => setFormData({...formData, time: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Interaction Mode</label>
                    <div className="flex items-center gap-6">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="mode" 
                            className="w-5 h-5 text-indigo-600 border-2 border-slate-200 focus:ring-indigo-500 rounded-full" 
                            checked={formData.mode === 'Online'}
                            onChange={() => setFormData({...formData, mode: 'Online'})}
                          />
                          <span className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">Online</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="mode" 
                            className="w-5 h-5 text-indigo-600 border-2 border-slate-200 focus:ring-indigo-500 rounded-full" 
                            checked={formData.mode === 'In-person'}
                            onChange={() => setFormData({...formData, mode: 'In-person'})}
                          />
                          <span className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">In-person</span>
                       </label>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Interviewer(s)</label>
                    <div className="relative group">
                       <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                       <input 
                         type="text" 
                         placeholder="Select interviewer protocol..." 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-14 py-4.5 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                         value={formData.interviewer}
                         onChange={(e) => setFormData({...formData, interviewer: e.target.value})}
                       />
                    </div>
                 </div>

                 <button 
                    onClick={handleConfirmSchedule}
                    className="w-full py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-4"
                 >
                    Confirm Protocol Schedule
                    <ArrowRight size={16} />
                 </button>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Agenda Feed */}
        <div className="xl:col-span-7 2xl:col-span-8 space-y-12">
           
           {/* Section 1: Today */}
           <section className="space-y-8">
              <div className="flex items-center gap-4 px-2">
                 <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <Zap size={16} className="fill-current" />
                 </div>
                 <h3 className="text-xs font-black text-slate-800 tracking-widest uppercase mb-1">TODAY, OCT 24</h3>
              </div>

              <div className="space-y-8">
                 {interviews.map((int) => (
                    <div key={int.id} className="bg-white rounded-[48px] border border-slate-50 shadow-soft hover:shadow-2xl transition-all duration-700 group flex flex-col md:flex-row relative overflow-hidden">
                       {/* Left Image Partition */}
                       <div className="md:w-56 h-auto min-h-[300px] relative overflow-hidden">
                          <img src={int.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-6 left-6 right-6">
                             <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] mb-1">Time Slice</p>
                             <p className="text-sm font-black text-white tracking-[0.2em] leading-none">{int.time.split(' - ')[0]}</p>
                          </div>
                       </div>

                       {/* Content Partition */}
                       <div className="flex-1 p-10 flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-6">
                             <div>
                                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                                   int.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                   {int.status}
                                </span>
                                <h4 className="text-3xl font-black text-slate-800 tracking-tighter mt-4 leading-none uppercase group-hover:text-indigo-600 transition-colors">{int.name}</h4>
                                <p className="text-sm font-bold text-slate-400 italic mt-2">{int.role}</p>
                             </div>
                             <div className="flex flex-col items-end text-right">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 leading-none">Status</p>
                                <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Ready</span>
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-8 mb-10 py-6 border-y border-slate-50">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                   <UserCheck size={18} />
                                </div>
                                <div className="overflow-hidden">
                                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 leading-none">Interviewer</p>
                                   <p className="text-xs font-black text-slate-700 truncate">{int.interviewer}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                   {int.mode === 'Online' ? <Monitor size={18} /> : <MapPin size={18} />}
                                </div>
                                <div className="overflow-hidden">
                                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 leading-none">Method</p>
                                   <p className="text-xs font-black text-slate-700 truncate">{int.mode}</p>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-3">
                             <button className="flex-1 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100">
                                Give Feedback
                             </button>
                             <button className="px-8 py-4 bg-white border border-slate-100 text-slate-400 font-black text-[10px] uppercase rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
                                Reschedule
                             </button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           {/* Section 2: Tomorrow */}
           <section className="space-y-8">
              <div className="flex items-center gap-4 px-2 pt-10">
                 <div className="p-3 bg-slate-100 rounded-xl text-slate-400">
                    <Clock size={16} />
                 </div>
                 <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-1">TOMORROW, OCT 25</h3>
              </div>

              {tomorrowInterviews.map((int) => (
                 <div key={int.id} className="bg-slate-50/50 rounded-[48px] border border-slate-100 p-8 flex items-center justify-between group grayscale hover:grayscale-0 transition-all duration-700 opacity-80 hover:opacity-100">
                    <div className="flex items-center gap-8">
                       <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white shadow-soft">
                          <img src={int.image} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-emerald-100">{int.status}</span>
                          <h4 className="text-xl font-black text-slate-700 mt-3 uppercase">{int.name}</h4>
                          <p className="text-xs font-bold text-slate-400 italic">{int.role}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-12">
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Time Slot</p>
                          <p className="text-sm font-black text-slate-800">{int.time.split(' - ')[0]}</p>
                       </div>
                       <button className="p-4 bg-white text-slate-400 rounded-2xl border border-slate-100 hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-90">
                          <Plus size={20} />
                       </button>
                    </div>
                 </div>
              ))}
           </section>
        </div>
      </div>
    </div>
  );
};

export default InterviewManagement;
