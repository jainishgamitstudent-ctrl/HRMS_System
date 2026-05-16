import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  X, 
  MapPin, 
  Calendar, 
  Rocket, 
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { useAdminDashboard } from '../../../context/AdminDashboardContext';

const CreateJob = () => {
  const navigate = useNavigate();
  const { addJob, departments, fetchDepartments } = useAdminDashboard();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    type: 'Full-time',
    description: '',
    experience: 'Entry (0-2 years)',
    location: '',
    salary: '',
    deadline: ''
  });

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set first department as default once loaded
  useEffect(() => {
    if (departments.length > 0 && !formData.department) {
      setFormData(prev => ({ ...prev, department: departments[0].name }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments]);

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title.trim()) {
      setError('Job Title is required.');
      setLoading(false);
      return;
    }
    if (!formData.department) {
      setError('Please select a Department.');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Job Description is required.');
      setLoading(false);
      return;
    }

    try {
      await addJob({ ...formData, skills });
      navigate('/admin/recruitment-control/hub');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate('/admin/recruitment-control/hub')}
          className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-800 transition-all shadow-sm border border-slate-100 active:scale-95 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">Post New Job</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Fill in the details to create a new role</p>
        </div>
        <div className="w-12 flex items-center justify-center">
          {loading && <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin border-[3px]"></div>}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
          <p className="text-xs font-black text-rose-500 uppercase tracking-widest text-center">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
        
        {/* Job Title */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Job Title *</label>
          <input 
            type="text" 
            placeholder="e.g. Senior Product Designer"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        {/* Department & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Department *</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="" disabled>Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id || dept._id} value={dept.name}>{dept.name}</option>
                ))}
                {/* Fallback options if no departments loaded */}
                {departments.length === 0 && (
                  <>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="HR">HR</option>
                  </>
                )}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Job Type</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
                <option>Remote</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Experience & Salary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Experience Level</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
              >
                <option>Entry (0-2 years)</option>
                <option>Mid (3-5 years)</option>
                <option>Senior (6+ years)</option>
                <option>Lead / Principal</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Salary Range</label>
            <div className="relative">
              <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="e.g. $80k - $120k"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Location & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Location</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="e.g. Remote, Mumbai, Bangalore"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Application Deadline</label>
            <div className="relative">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="date" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Job Description *</label>
          <textarea 
            placeholder="Describe the role, responsibilities, and team expectations..."
            rows={5}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none leading-relaxed"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        {/* Required Skills */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Required Skills <span className="text-slate-300 font-bold normal-case tracking-normal">(press Enter to add)</span></label>
          <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex flex-wrap gap-2 min-h-[56px] items-start">
            {skills.map(skill => (
              <span key={skill} className="bg-indigo-50 text-indigo-600 text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-indigo-100 transition-colors">
                {skill}
                <X 
                  size={12} 
                  className="cursor-pointer hover:text-rose-500 transition-colors" 
                  onClick={() => removeSkill(skill)}
                />
              </span>
            ))}
            <input 
              type="text"
              placeholder={skills.length === 0 ? 'e.g. React, Figma, Python...' : 'Add more...'}
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 placeholder:text-slate-300 py-1.5 min-w-[150px] flex-1"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate('/admin/recruitment-control/hub')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-50 text-slate-500 hover:bg-slate-100 text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handlePublish}
            disabled={loading}
            className="w-full sm:flex-1 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Rocket size={16} />
                Publish Job
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
