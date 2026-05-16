import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Loader2,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { createResignation, getHrProfile } from '../../../services/hrApi';

const reasons = [
  'Better Opportunity',
  'Relocation',
  'Personal Reasons',
  'Career Change',
  'Higher Education',
  'Other'
];

const getProfileData = (apiData, user) => ({
  employeeName: apiData?.header?.name || apiData?.personalInfo?.fullName || apiData?.name || user?.name || '',
  employeeId: apiData?.professionalInfo?.employeeId || apiData?.header?.hrId || apiData?.employeeId || user?.employeeId || user?._id || '',
  department: apiData?.professionalInfo?.department || apiData?.department || user?.department || '',
  designation: apiData?.professionalInfo?.designation || apiData?.header?.post || apiData?.designation || user?.designation || user?.role || ''
});

const SubmitResignation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    employeeName: '',
    employeeId: '',
    department: '',
    designation: ''
  });
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    department: '',
    designation: '',
    noticeDate: '',
    lastDay: '',
    reason: '',
    comments: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        setProfileError('');
        const response = await getHrProfile();
        const apiData = response.data?.data || response.data || {};
        const loadedProfile = getProfileData(apiData, user);
        if (isMounted) {
          setProfile(loadedProfile);
          setFormData((prev) => ({
            ...prev,
            employeeName: prev.employeeName || loadedProfile.employeeName,
            employeeId: prev.employeeId || loadedProfile.employeeId,
            department: prev.department || loadedProfile.department,
            designation: prev.designation || loadedProfile.designation
          }));
        }
      } catch (err) {
        // debug error removed
        if (isMounted) {
          const fallbackProfile = getProfileData({}, user);
          setProfile(fallbackProfile);
          setFormData((prev) => ({
            ...prev,
            employeeName: prev.employeeName || fallbackProfile.employeeName,
            employeeId: prev.employeeId || fallbackProfile.employeeId,
            department: prev.department || fallbackProfile.department,
            designation: prev.designation || fallbackProfile.designation
          }));
          setProfileError('Profile API unavailable. Showing your authenticated account details.');
        }
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await createResignation({
        employeeName: formData.employeeName,
        employeeId: formData.employeeId,
        department: formData.department,
        designation: formData.designation,
        noticeDate: formData.noticeDate,
        resignationDate: formData.noticeDate,
        lastWorkingDay: formData.lastDay,
        lastWorkingDate: formData.lastDay,
        reason: formData.reason,
        comments: formData.comments
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit resignation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center pt-4">
        <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={34} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Resignation Submitted</h1>
          <p className="text-sm text-slate-500 mt-3">
            Your resignation request has been sent to HR for review.
          </p>
          <button
            onClick={() => navigate('/resignation')}
            className="mt-8 w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            Back to Resignation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-8 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-20">
      <div className="flex items-center gap-6 shrink-0">
        <button
          onClick={() => navigate('/resignation')}
          className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-x-1 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-rose-300 underline-offset-8">Submit Resignation</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-4 leading-none">Initiate Offboarding Protocol for Employee Nodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 flex-1 min-h-0">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl shadow-slate-200">
            <h2 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Employee Intelligence</h2>
            
            {loadingProfile ? (
              <div className="py-10 flex flex-col items-center gap-4 text-slate-500">
                <Loader2 size={24} className="animate-spin" />
                <p className="text-[9px] font-black uppercase tracking-widest">Accessing Profile Node...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {profileError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl flex items-start gap-3 text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle size={16} className="shrink-0" />
                    {profileError}
                  </div>
                )}

                {[
                  ['Full Name', profile.employeeName || 'N/A'],
                  ['HR Node ID', profile.employeeId || 'N/A'],
                  ['Department', profile.department || 'N/A'],
                  ['Designation', profile.designation || 'N/A']
                ].map(([label, value]) => (
                  <div key={label} className="group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-rose-400 transition-colors">{label}</p>
                    <p className="text-base font-black text-white tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-rose-50 p-8 rounded-[32px] border border-rose-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                  <AlertCircle size={24} />
              </div>
              <div>
                  <p className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Compliance Warning</p>
                  <p className="text-[9px] text-rose-600 font-bold uppercase tracking-widest mt-1">Submission will trigger IT and Financial clearance nodes.</p>
              </div>
          </div>
        </div>

        <div className="xl:col-span-3 bg-white border border-slate-50 rounded-[44px] shadow-soft overflow-hidden flex flex-col">
          <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto no-scrollbar">
            {submitError && (
              <div className="p-6 bg-rose-50 border border-rose-100 text-rose-700 rounded-3xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <AlertCircle size={20} className="text-rose-500" />
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee Name</span>
                <input
                  type="text"
                  required
                  value={formData.employeeName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, employeeName: event.target.value }))}
                  placeholder="Target node name"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-black text-slate-700 outline-none focus:border-rose-200 transition-all uppercase tracking-tight"
                />
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</span>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(event) => setFormData((prev) => ({ ...prev, employeeId: event.target.value }))}
                  placeholder="System ID"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-black text-slate-700 outline-none focus:border-rose-200 transition-all uppercase tracking-tight"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</span>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(event) => setFormData((prev) => ({ ...prev, department: event.target.value }))}
                  placeholder="Assigned department"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-black text-slate-700 outline-none focus:border-rose-200 transition-all uppercase tracking-tight"
                />
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</span>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(event) => setFormData((prev) => ({ ...prev, designation: event.target.value }))}
                  placeholder="Current role"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-black text-slate-700 outline-none focus:border-rose-200 transition-all uppercase tracking-tight"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notice Date</span>
                <div className="relative">
                  <Calendar size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="date"
                    required
                    value={formData.noticeDate}
                    onChange={(event) => setFormData((prev) => ({ ...prev, noticeDate: event.target.value }))}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-black text-slate-700 outline-none focus:border-rose-200 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Working Day</span>
                <div className="relative">
                  <Calendar size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="date"
                    required
                    value={formData.lastDay}
                    onChange={(event) => setFormData((prev) => ({ ...prev, lastDay: event.target.value }))}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-black text-slate-700 outline-none focus:border-rose-200 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Reason</span>
              <select
                required
                value={formData.reason}
                onChange={(event) => setFormData((prev) => ({ ...prev, reason: event.target.value }))}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-black text-slate-700 outline-none focus:border-rose-200 transition-all uppercase tracking-widest"
              >
                <option value="">Select Protocol Reason</option>
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contextual Comments</span>
              <textarea
                value={formData.comments}
                onChange={(event) => setFormData((prev) => ({ ...prev, comments: event.target.value }))}
                placeholder="Add optional audit context for HR nodes..."
                className="w-full h-40 px-6 py-5 bg-slate-50 border border-slate-100 rounded-[32px] text-xs font-black text-slate-700 outline-none focus:border-rose-200 transition-all resize-none placeholder:uppercase placeholder:tracking-widest"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting || loadingProfile || !formData.employeeName || !formData.employeeId || !formData.department}
                className="flex-1 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[24px] hover:bg-slate-800 transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Submit Protocol
              </button>
              <button
                type="button"
                onClick={() => navigate('/resignation')}
                className="px-10 py-5 bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-[24px] hover:bg-slate-50 transition-all active:scale-95"
              >
                Abort
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitResignation;
