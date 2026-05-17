import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminDashboard } from '../../../context/AdminDashboardContext';
import { useEmployeeContext } from '../../../context/EmployeeContext';
import { 
  Users, 
  ArrowLeft, 
  ChevronDown, 
  Building2,
  Target,
  LayoutGrid,
  Check
} from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';

const CreateTeam = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { addTeam, departments, fetchDepartments } = useAdminDashboard();
  const { employees, fetchEmployees } = useEmployeeContext();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const queryParams = new URLSearchParams(location.search);
  const preSelectedDeptId = queryParams.get('dept');

  const [formData, setFormData] = useState({
    name: '',
    department: preSelectedDeptId || '',
    lead: '',
    capacity: '',
    mission: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTeam(formData);
    if (preSelectedDeptId) {
        navigate(isAdminRoute ? `/admin/department-management/teams/view/${preSelectedDeptId}` : `/departments/teams/view/${preSelectedDeptId}`);
    } else {
        navigate(isAdminRoute ? '/admin/department-management/teams' : '/departments/teams');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Back Link */}
      <div className="w-full max-w-[800px] mb-10">
        <button 
          onClick={() => {
              if (preSelectedDeptId) {
                  navigate(isAdminRoute ? `/admin/department-management/teams/view/${preSelectedDeptId}` : `/departments/teams/view/${preSelectedDeptId}`);
              } else {
                  navigate(isAdminRoute ? '/admin/department-management/teams' : '/departments/teams');
              }
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <ArrowLeft size={16} />
          Back to {preSelectedDeptId ? 'Department Teams' : 'Teams Dashboard'}
        </button>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-[800px] bg-white rounded-[48px] border border-slate-50 shadow-soft overflow-hidden">
        <div className="p-12 md:p-16">
          
          {/* Header */}
          <div className="flex items-center gap-8 mb-16 px-2">
            <div className="w-20 h-20 bg-slate-900 text-white rounded-[28px] flex items-center justify-center shadow-2xl shadow-slate-200 transition-transform hover:scale-110">
              <Users size={36} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Create New Team</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none text-left">Assemble a new squad or department unit</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-8">
              
              {/* Team Name */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Team Name</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="text"
                    placeholder="e.g. Frontend Squad, Design Ops..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] pl-16 pr-8 py-5 text-lg font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Department & Lead Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Assign Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <select 
                      className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-[24px] pl-16 pr-12 py-5 text-lg font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 focus:bg-white transition-all outline-none"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id || dept._id} value={dept.id || dept._id}>
                          {dept.name} (Head: {dept.head || 'Unassigned'})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Appoint Team Lead</label>
                  <div className="relative">
                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <select 
                      className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-[24px] pl-16 pr-12 py-5 text-lg font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 focus:bg-white transition-all outline-none"
                      value={formData.lead}
                      onChange={(e) => setFormData({...formData, lead: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select Team Lead</option>
                      {(() => {
                        const getDeptName = (dept) => {
                          if (!dept) return '';
                          if (typeof dept === 'string') return dept.trim();
                          return (dept.name || '').trim();
                        };
                        const userDept = getDeptName(user?.department);
                        const list = role === 'HR'
                          ? (employees || []).filter(emp => getDeptName(emp.department) === userDept)
                          : (employees || []);
                        return list.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.employeeId || emp.id}) - {emp.role}
                          </option>
                        ));
                      })()}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </div>

              {/* Team Capacity */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Target Team Size (Potential)</label>
                <div className="relative">
                  <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="number"
                    placeholder="e.g. 10"
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] pl-16 pr-8 py-5 text-lg font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Team Mission / Description */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Team Mission & Objectives</label>
                <div className="relative">
                   <Target className="absolute left-6 top-7 text-slate-300" size={20} />
                   <textarea 
                    placeholder="Describe the primary mission and goals of this team..."
                    rows="4"
                    className="w-full bg-slate-50 border border-slate-100 rounded-[32px] pl-16 pr-8 py-6 text-lg font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 focus:bg-white transition-all outline-none placeholder:text-slate-300 resize-none"
                    value={formData.mission}
                    onChange={(e) => setFormData({...formData, mission: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center gap-6 pt-10">
              <button 
                type="submit"
                className="w-full md:flex-1 py-6 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl shadow-indigo-100 hover:shadow-indigo-300 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4"
              >
                <Check size={20} strokeWidth={3} />
                Confirm & Create Team
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ name: '', department: '', lead: '', capacity: '', mission: '' })}
                className="w-full md:w-auto px-12 py-6 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] transition-all"
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

export default CreateTeam;
