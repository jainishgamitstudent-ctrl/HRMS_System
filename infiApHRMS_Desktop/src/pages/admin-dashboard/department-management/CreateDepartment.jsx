import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building2, 
  ArrowLeft, 
  ChevronDown, 
  LayoutGrid,
  MapPin,
  Users,
  Check
} from 'lucide-react';
import { useAdminDashboard } from '../../../context/AdminDashboardContext';
import { useEmployeeContext } from '../../../context/EmployeeContext';

import { useAuth } from '../../../context/AuthContext';

const CreateDepartment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { role, user } = useAuth();
  const { addDepartment, updateDepartment, departments } = useAdminDashboard();
  const { employees } = useEmployeeContext();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignSelf, setAssignSelf] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    teams: '',
    manager: ''
  });

  const eligibleEmployees = role === 'HR'
    ? (employees || []).filter(emp => String(emp.department || '').trim() === String(user?.department || '').trim())
    : (employees || []);
  const hasEmployees = eligibleEmployees.length > 0;

  useEffect(() => {
    if (isEditMode && departments.length > 0) {
      const dept = departments.find(d => d.id === id);
      if (dept) {
        setFormData({
          name: dept.name,
          description: dept.description || '',
          location: dept.location || 'Headquarters',
          teams: String(dept.teams),
          manager: typeof dept.head === 'string' ? '' : (dept.head?._id || dept.head?.id || '')
        });
      }
    }
  }, [id, isEditMode, departments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      ...formData,
      manager: assignSelf ? (user?._id || user?.id) : formData.manager
    };

    let result;
    if (isEditMode) {
      result = await updateDepartment(id, payload);
    } else {
      result = await addDepartment(payload);
    }

    setIsSubmitting(false);

    if (result?.success) {
      navigate(role === 'HR' ? '/departments' : '/admin/departments');
      return;
    }

    setError(result?.error || `Failed to ${isEditMode ? 'update' : 'create'} department. Please try again.`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Back Link */}
      <button 
        onClick={() => navigate(role === 'HR' ? '/departments' : '/admin/departments')}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-10 transition-colors mr-auto ml-[15%]"
      >
        <ArrowLeft size={16} />
        Back to Departments
      </button>

      {/* Main Form Card */}
      <div className="w-full max-w-[700px] bg-white rounded-[32px] border border-slate-50 shadow-soft overflow-hidden">
        <div className="p-8 md:p-10">
          
          {/* Header */}
          <div className="flex items-center gap-6 mb-10 px-2">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-[20px] flex items-center justify-center shadow-lg shadow-indigo-100 transition-transform hover:scale-110">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{isEditMode ? 'Edit' : 'Create'} Department</h1>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">{isEditMode ? 'Update existing' : 'Setup new'} organizational unit</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-xs font-semibold text-red-700 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Department Name */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Department Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Engineering, Marketing..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-[18px] px-6 py-3.5 text-base font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Department Description</label>
                <textarea 
                  placeholder="Briefly describe the department's role and objectives..."
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 text-base font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 focus:bg-white transition-all outline-none placeholder:text-slate-300 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              {/* Location & Teams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Primary Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text"
                      placeholder="e.g. Headquarters"
                      className="w-full bg-slate-50 border border-slate-100 rounded-[18px] pl-14 pr-6 py-3.5 text-base font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Initial Teams Count</label>
                  <div className="relative">
                    <LayoutGrid className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="number"
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-[18px] pl-14 pr-6 py-3.5 text-base font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                      value={formData.teams}
                      onChange={(e) => setFormData({...formData, teams: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Department Head */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Department Head / Manager</label>
                <div className="relative">
                  <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select
                    className={`w-full bg-slate-50 border border-slate-100 rounded-[18px] pl-14 pr-8 py-3.5 text-base font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 focus:bg-white transition-all outline-none appearance-none cursor-pointer ${assignSelf ? 'opacity-50 pointer-events-none' : ''}`}
                    value={formData.manager}
                    onChange={(e) => setFormData({...formData, manager: e.target.value})}
                    required={!assignSelf}
                    disabled={assignSelf}
                  >
                    <option value="">{hasEmployees ? 'Select a manager...' : 'No employees available'}</option>
                    {eligibleEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>

                {/* Self-assign checkbox */}
                <label className="flex items-center gap-3 mt-3 cursor-pointer select-none group">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${assignSelf ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                    {assignSelf && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={assignSelf}
                    onChange={(e) => setAssignSelf(e.target.checked)}
                  />
                  <span className="text-sm font-semibold text-slate-600">
                    Assign myself as department head {user?.name ? `(${user.name})` : ''}
                  </span>
                </label>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 pt-6">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full md:flex-1 py-4 bg-linear-to-r from-[#4E63F0] to-[#6855E8] text-white rounded-[18px] font-black text-[9px] uppercase tracking-[0.25em] shadow-2xl shadow-indigo-100 hover:shadow-indigo-300 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4"
              >
                <Check size={18} strokeWidth={3} />
                {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Department' : 'Create Department')}
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ name: '', description: '', location: '', teams: '', manager: '' })}
                className="w-full md:w-auto px-10 py-4 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-[18px] font-black text-[9px] uppercase tracking-[0.25em] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDepartment;
