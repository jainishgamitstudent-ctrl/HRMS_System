import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  MoreVertical, 
  Mail, 
  Phone, 
  Star, 
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

const CandidateTracking = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Candidates');
  const [currentPage, setCurrentPage] = useState(1);

  const [candidateList, setCandidateList] = useState([
    {
      id: 1,
      name: 'Alex Rivera',
      role: 'Senior Frontend Engineer',
      status: 'APPLIED',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256&h=256',
      skills: ['React', 'Tailwind CSS', 'TypeScript'],
      appliedDate: '2 days ago',
      experience: '5+ years'
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      role: 'Product Designer',
      status: 'SHORTLISTED',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256&h=256',
      skills: ['Figma', 'UI/UX', 'Prototyping'],
      appliedDate: '5 days ago',
      experience: '3+ years'
    },
    {
      id: 3,
      name: 'Marcus Thorne',
      role: 'Backend Architect',
      status: 'INTERVIEW SCHEDULED',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256&h=256',
      skills: ['Go', 'Kubernetes', 'AWS'],
      appliedDate: '1 week ago',
      experience: '8+ years'
    },
    {
      id: 4,
      name: 'Emily Zhang',
      role: 'Marketing Director',
      status: 'REJECTED',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256&h=256',
      skills: ['SEO', 'Growth', 'Strategy'],
      appliedDate: '3 weeks ago',
      experience: '10+ years'
    },
    {
      id: 5,
      name: 'Michael Chen',
      role: 'Mobile Developer',
      status: 'HIRED',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256',
      skills: ['Flutter', 'Firebase', 'Native'],
      appliedDate: '1 month ago',
      experience: '4+ years'
    },
    {
      id: 6,
      name: 'Sophia Williams',
      role: 'iOS Engineer',
      status: 'APPLIED',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256&h=256',
      skills: ['Swift', 'Combine', 'SwiftUI'],
      appliedDate: '2 days ago',
      experience: '6+ years'
    }
  ]);

  const tabs = [
    { label: 'All Candidates', value: 'All Candidates' },
    { label: 'Shortlisted', value: 'SHORTLISTED' },
    { label: 'Interviewed', value: 'INTERVIEW SCHEDULED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Hired', value: 'HIRED' }
  ];

  const getFilteredCandidates = () => {
    if (activeTab === 'All Candidates') return candidateList;
    return candidateList.filter(c => c.status === activeTab);
  };

  const getCountForTab = (tabValue) => {
    if (tabValue === 'All Candidates') return candidateList.length;
    return candidateList.filter(c => c.status === tabValue).length;
  };

  const handleStatusUpdate = (id, newStatus) => {
    setCandidateList(prev => prev.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPLIED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'SHORTLISTED': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'INTERVIEW SCHEDULED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'HIRED': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const filteredCandidates = getFilteredCandidates();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header System */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">Candidate Tracking</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Manage and monitor applicants across all open position nodes</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-soft active:scale-95 group">
             <Filter size={16} className="group-hover:text-indigo-500 transition-colors" />
             Filtering Logic
          </button>
          <button 
            onClick={() => navigate('/admin/recruitment-control/create')}
            className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 uppercase tracking-widest text-[10px] active:scale-95 group"
          >
            <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
            Add Candidate Node
          </button>
        </div>
      </div>

      {/* Modern Filter Tabs */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-50 shadow-soft w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.value ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
            }`}
          >
            {tab.label}
            <span className={`ml-3 px-2 py-0.5 rounded-md text-[8px] ${activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
              {getCountForTab(tab.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Grid Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredCandidates.map((can) => (
          <div key={can.id} className="bg-white rounded-[48px] border border-slate-50 shadow-soft hover:shadow-3xl transition-all duration-750 hover:-translate-y-2 group relative overflow-hidden flex flex-col h-full">
            {/* Image Cluster */}
            <div className="p-8 pb-0 flex-1">
               <div className="relative w-full aspect-square rounded-[40px] overflow-hidden border border-slate-100 group-hover:shadow-2xl transition-all duration-700">
                  <img src={can.image} alt={can.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                     <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm backdrop-blur-md ${getStatusColor(can.status)}`}>
                        {can.status}
                     </span>
                  </div>
                  <button className="absolute top-6 right-6 p-2 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100">
                     <MoreVertical size={18} />
                  </button>
               </div>
            </div>

            {/* Meta Architecture */}
            <div className="p-10 text-center">
               <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase leading-none">{can.name}</h3>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Engineering Talent Node</p>
               
               <div className="flex items-center justify-center gap-6 mb-8 py-4 border-y border-slate-50">
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none text-left">Experience</p>
                     <p className="text-xs font-black text-slate-600 text-left">{can.experience}</p>
                  </div>
                  <div className="w-px h-6 bg-slate-100"></div>
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none text-left">Applied</p>
                     <p className="text-xs font-black text-slate-600 text-left">{can.appliedDate}</p>
                  </div>
                  <div className="w-px h-6 bg-slate-100"></div>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline active:scale-95 transition-all">View Dossier</button>
               </div>

               {/* Diagnostic Tags */}
               <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {can.skills.map(skill => (
                    <span key={skill} className="px-4 py-2 bg-slate-50 text-slate-400 text-[9px] font-black rounded-xl uppercase tracking-widest border border-transparent hover:border-indigo-100 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all">
                      {skill}
                    </span>
                  ))}
               </div>

               {/* Global Actions */}
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                        if (can.status === 'APPLIED') handleStatusUpdate(can.id, 'SHORTLISTED');
                        else if (can.status === 'SHORTLISTED') handleStatusUpdate(can.id, 'INTERVIEW SCHEDULED');
                        else if (can.status === 'INTERVIEW SCHEDULED') handleStatusUpdate(can.id, 'HIRED');
                        else handleStatusUpdate(can.id, 'APPLIED');
                    }}
                    className="flex-1 py-4.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 group/btn"
                  >
                     {can.status === 'APPLIED' ? 'Shortlist' : 
                      can.status === 'INTERVIEW SCHEDULED' ? 'Hire Candidate' : 
                      can.status === 'SHORTLISTED' ? 'Schedule Interview' : 'Re-Apply'}
                     <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(can.id, 'REJECTED')}
                    className="p-4.5 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all active:scale-95 shadow-soft border border-rose-100 border-opacity-40"
                  >
                     <Mail size={18} />
                  </button>
               </div>
            </div>

            {/* Professional Background Detail */}
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        ))}
      </div>

      {/* Desktop Pagination */}
      <div className="flex items-center justify-between px-10 py-12 bg-white rounded-[44px] border border-slate-100 shadow-soft">
         <div className="flex items-center gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Displaying {filteredCandidates.length} potential talent nodes</p>
         </div>
         <div className="flex items-center gap-2">
            <button className="p-3 text-slate-300 hover:text-slate-800 transition-all">
               <ChevronLeft size={20} />
            </button>
            {[1, 2, 3].map((num) => (
              <button 
                key={num} 
                onClick={() => setCurrentPage(num)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === num ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                {num}
              </button>
            ))}
            <button className="p-3 text-slate-300 hover:text-slate-800 transition-all">
               <ChevronRightIcon size={20} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default CandidateTracking;
