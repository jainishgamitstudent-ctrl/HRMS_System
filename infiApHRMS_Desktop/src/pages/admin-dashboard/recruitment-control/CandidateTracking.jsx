import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  ChevronRight as ChevronRightIcon,
  Loader2
} from 'lucide-react';
import {
  getCandidateTracking,
  updateCandidate,
  shortlistCandidate,
  updateCandidateInterview,
  selectCandidate,
  rejectCandidate,
  sendCandidateOffer,
} from '../../../services/hrApi';
import AddCandidateModal from '../../hr-dashboard/recruitment/AddCandidateModal';

const formatRelativeDate = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
};

const CandidateTracking = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [activeTab, setActiveTab] = useState('All Candidates');
  const [currentPage, setCurrentPage] = useState(1);
  const [candidateList, setCandidateList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, candidateId: null, newStatus: '', candidateName: '', onConfirm: null });

  const tabs = [
    { label: 'All Candidates', value: 'All Candidates' },
    { label: 'Shortlisted', value: 'Shortlisted' },
    { label: 'Interviewed', value: 'Technical Interview' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Hired', value: 'Hired' }
  ];

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 1000 };
      if (jobId) params.jobId = jobId;
      const res = await getCandidateTracking(params);
      const raw = Array.isArray(res.data?.data) ? res.data.data : [];
      const mapped = raw.map((c) => ({
        id: c._id || c.id,
        name: c.applicantName || c.name || 'Unnamed Candidate',
        email: c.email || '',
        phone: c.phone || '',
        role: c.jobTitle || c.role || 'Role Pending',
        status: c.status || 'Applied',
        image: c.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.applicantName || 'U')}&background=random&color=fff`,
        skills: Array.isArray(c.skills) ? c.skills : [],
        appliedDate: formatRelativeDate(c.appliedDate || c.createdAt),
        experience: c.yearsOfExperience ? `${c.yearsOfExperience}+ years` : 'N/A',
        yearsOfExperience: c.yearsOfExperience || 0,
        jobId: c.jobId || c.job?._id || c.job?.id || null
      }));
      setCandidateList(mapped);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const getFilteredCandidates = () => {
    let filtered = candidateList;
    if (jobId) {
      filtered = filtered.filter(c => String(c.jobId) === String(jobId));
    }
    if (activeTab === 'All Candidates') return filtered;
    return filtered.filter(c => c.status === activeTab);
  };

  const getCountForTab = (tabValue) => {
    const baseList = jobId ? candidateList.filter(c => String(c.jobId) === String(jobId)) : candidateList;
    if (tabValue === 'All Candidates') return baseList.length;
    return baseList.filter(c => c.status === tabValue).length;
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setCandidateList(prev => prev.map(c =>
      c.id === id ? { ...c, status: newStatus } : c
    ));
    try {
      if (newStatus === 'Shortlisted') {
        await shortlistCandidate(id);
      } else if (newStatus === 'Technical Interview') {
        await updateCandidateInterview(id, { status: newStatus });
      } else if (newStatus === 'Selected') {
        await selectCandidate(id);
      } else if (newStatus === 'Hired') {
        await sendCandidateOffer(id, { status: newStatus });
      } else if (newStatus === 'Rejected') {
        await rejectCandidate(id, { reason: 'Candidate rejected' });
      } else {
        await updateCandidate(id, { status: newStatus });
      }
    } catch (err) {
      console.error('Status update failed:', err);
      fetchCandidates();
    }
  };

  const openConfirmModal = (candidateId, newStatus, candidateName) => {
    setConfirmModal({ open: true, candidateId, newStatus, candidateName, onConfirm: () => handleStatusUpdate(candidateId, newStatus) });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, candidateId: null, newStatus: '', candidateName: '', onConfirm: null });
  };

  const getConfirmTitle = (status) => {
    switch (status) {
      case 'Shortlisted': return 'Shortlist Candidate';
      case 'Technical Interview': return 'Schedule Technical Interview';
      case 'Hired': return 'Hire Candidate';
      case 'Rejected': return 'Reject Candidate';
      default: return 'Update Status';
    }
  };

  const getConfirmMessage = (name, status) => {
    switch (status) {
      case 'Shortlisted': return `Are you sure you want to shortlist ${name}?`;
      case 'Technical Interview': return `Are you sure you want to schedule a technical interview for ${name}?`;
      case 'Hired': return `Are you sure you want to hire ${name}?`;
      case 'Rejected': return `Are you sure you want to reject ${name}?`;
      default: return `Are you sure you want to update ${name}'s status?`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Shortlisted': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Technical Interview': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Selected': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Hired': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const filteredCandidates = getFilteredCandidates();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-sm text-rose-600 font-medium">{error}</p>
        <button
          onClick={fetchCandidates}
          className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header System */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">
            {jobId ? 'Job Applicants' : 'Candidate Tracking'}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">
            {jobId ? 'Viewing candidates for a specific job posting' : 'Manage and monitor applicants across all open position nodes'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {jobId && (
            <button
              onClick={() => { setSearchParams({}); }}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
            >
              View All Candidates
            </button>
          )}
          <button className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-soft active:scale-95 group">
             <Filter size={16} className="group-hover:text-indigo-500 transition-colors" />
             Filtering Logic
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 uppercase tracking-widest text-[10px] active:scale-95 group"
          >
            <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
            Add Candidate Node
          </button>
        </div>
      </div>

      <AddCandidateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchCandidates} 
      />

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCandidates.map((can) => (
          <div key={can.id} className="bg-white rounded-[32px] border border-slate-50 shadow-soft hover:shadow-3xl transition-all duration-750 hover:-translate-y-2 group relative overflow-hidden flex flex-col h-full">
            {/* Image Cluster */}
            <div className="p-5 pb-0 flex-1">
               <div className="relative w-full aspect-square rounded-[28px] overflow-hidden border border-slate-100 group-hover:shadow-2xl transition-all duration-700">
                  <img src={can.image} alt={can.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                     <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm backdrop-blur-md ${getStatusColor(can.status)}`}>
                        {can.status}
                     </span>
                  </div>
                  <button className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100">
                     <MoreVertical size={18} />
                  </button>
               </div>
            </div>

            {/* Meta Architecture */}
            <div className="p-6 text-center">
               <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors uppercase leading-none">{can.name}</h3>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Engineering Talent Node</p>
               
               <div className="flex items-center justify-center gap-6 mb-4 py-3 border-y border-slate-50">
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
               <div className="flex flex-wrap justify-center gap-2 mb-5">
                  {can.skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-slate-50 text-slate-400 text-[9px] font-black rounded-xl uppercase tracking-widest border border-transparent hover:border-indigo-100 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all">
                      {skill}
                    </span>
                  ))}
               </div>

               {/* Global Actions */}
               <div className="flex items-center gap-3">
                  {can.status === 'Technical Interview' ? (
                    <>
                      <button
                        onClick={() => openConfirmModal(can.id, 'Hired', can.name)}
                        className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 group/btn"
                      >
                        Hire
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={() => openConfirmModal(can.id, 'Rejected', can.name)}
                        className="flex-1 py-3 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-100 transition-all active:scale-95 shadow-soft border border-rose-100 border-opacity-40 flex items-center justify-center gap-2"
                      >
                        Reject
                      </button>
                    </>
                  ) : can.status === 'Hired' ? (
                    <button
                      onClick={() => navigate('/admin/employees/add', {
                        state: {
                          candidate: {
                            candidateId: can.id,
                            name: can.name,
                            email: can.email,
                            phone: can.phone,
                            role: can.role,
                            yearsOfExperience: can.yearsOfExperience,
                            jobId: can.jobId
                          }
                        }
                      })}
                      className="flex-1 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 group/btn"
                    >
                      Add as Employee
                      <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  ) : can.status === 'Rejected' ? (
                    <button
                      disabled
                      className="flex-1 py-3 bg-rose-50 text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Rejected
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                            if (can.status === 'Applied') openConfirmModal(can.id, 'Shortlisted', can.name);
                            else if (can.status === 'Shortlisted') openConfirmModal(can.id, 'Technical Interview', can.name);
                            else if (can.status === 'Selected') openConfirmModal(can.id, 'Hired', can.name);
                        }}
                        className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 group/btn"
                      >
                         {can.status === 'Applied' ? 'Shortlist' :
                          can.status === 'Shortlisted' ? 'Schedule Interview' :
                          can.status === 'Selected' ? 'Hire Candidate' : ''}
                         <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                      {(can.status === 'Applied' || can.status === 'Shortlisted' || can.status === 'Selected') && (
                        <button
                          onClick={() => openConfirmModal(can.id, 'Rejected', can.name)}
                          className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all active:scale-95 shadow-soft border border-rose-100 border-opacity-40"
                        >
                           <Mail size={16} />
                        </button>
                      )}
                    </>
                  )}
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

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-8 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ChevronRight size={24} className="text-indigo-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                {getConfirmTitle(confirmModal.newStatus)}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-2">
                {getConfirmMessage(confirmModal.candidateName, confirmModal.newStatus)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={closeConfirmModal}
                className="flex-1 py-3 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  closeConfirmModal();
                }}
                className={`flex-1 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 ${
                  confirmModal.newStatus === 'Rejected'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-100'
                    : 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-100'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateTracking;
