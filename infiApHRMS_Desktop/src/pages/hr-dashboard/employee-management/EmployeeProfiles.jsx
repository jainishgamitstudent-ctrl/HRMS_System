import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  User,
  Briefcase,
   BadgeCheck
} from 'lucide-react';
import { useEmployeeContext } from '../../../context/EmployeeContext';
import { getEmployeeProfile } from '../../../services/hrApi';

const formatDate = (value) => {
   if (!value) return null;

   try {
      return new Date(value).toLocaleDateString('en-IN', {
         day: '2-digit',
         month: 'short',
         year: 'numeric'
      });
   } catch {
      return null;
   }
};

const formatSalary = (value) => {
   if (value === null || value === undefined || value === '') return null;

   const amount = Number(value);
   if (Number.isNaN(amount)) return null;

   return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
   }).format(amount);
};

const normalizeProfileData = (payload, fallbackId) => {
   const data = payload?.data || payload || {};
   const profile = data.profileInfo || data;
   const personal = data.personalInfo || {};
   const job = data.jobDetails || {};
   const attendance = data.attendanceSummary || {};
   const financial = data.financial || {};

   return {
      id: profile.employeeId || data.employeeId || data._id || data.id || fallbackId,
      name: profile.name || data.name || 'Unnamed employee',
      role: job.role || data.designation || data.role || 'Employee',
      email: personal.email || data.email || '',
      phone: personal.phone || data.phone || '',
      location: data.address || data.location || '',
      department: job.department || data.department || '',
      manager: job.manager?.name || job.manager || data.reportingManager?.name || data.manager || '',
      joiningDate: formatDate(job.joiningDate || data.joiningDate),
      status: job.status || data.status || 'Active',
      employeeType: job.employeeType || data.employmentType || '',
      avatar: profile.profileImage || data.profileImage || data.avatar || '',
      attendance,
      salary: formatSalary(financial.currentBaseSalary || financial.annualSalaryUSD || data.currentBaseSalary || data.annualSalary),
   };
};

const EmployeeProfiles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';
  const { employees } = useEmployeeContext();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
         setError('');
      try {
        const res = await getEmployeeProfile(id);
            const profile = normalizeProfileData(res.data, id);
            setEmployee(profile);
      } catch (err) {
            // debug error removed
        const ctxEmp = employees.find(emp => String(emp.id) === String(id) || String(emp.employeeId) === String(id));

        if (ctxEmp) {
               setEmployee({
                  id: ctxEmp.employeeId || ctxEmp.id,
                  name: ctxEmp.name || 'Unnamed employee',
                  role: ctxEmp.role || 'Employee',
                  email: ctxEmp.email || '',
                  phone: ctxEmp.phone || '',
                  location: ctxEmp.location || '',
                  department: ctxEmp.department || '',
                  manager: ctxEmp.manager || '',
                  joiningDate: formatDate(ctxEmp.joiningDate),
                  status: ctxEmp.status || 'Active',
                  employeeType: ctxEmp.employeeType || '',
                  avatar: ctxEmp.avatar || '',
                  attendance: {},
                  salary: null,
               });
        } else {
               setEmployee(null);
               setError('Employee profile could not be loaded.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id, employees]);

  if (loading || !employee) {
      return (
         <div className="p-8 text-center text-slate-400 font-black uppercase tracking-widest">
            {loading ? 'Loading employee profile...' : error || 'Profile not available.'}
         </div>
      );
  }

   const contactItems = [
      { label: 'Email', value: employee.email, icon: Mail },
      { label: 'Phone', value: employee.phone, icon: Phone },
      { label: 'Department', value: employee.department, icon: Briefcase },
      { label: 'Manager', value: employee.manager, icon: User },
      { label: 'Location', value: employee.location, icon: MapPin },
      { label: 'Joined', value: employee.joiningDate, icon: Calendar },
   ].filter(item => item.value);

   const attendanceItems = [
      { label: 'Present', value: employee.attendance?.present },
      { label: 'Absent', value: employee.attendance?.absent },
      { label: 'Leave', value: employee.attendance?.leave },
   ].filter(item => item.value !== undefined && item.value !== null);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`${basePath}/employees`)}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">
              Employee Profile
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">
              Individual Talent Record &amp; Identity Portfolio
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`${basePath}/employees/edit/${employee.id}`)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
        >
          Edit Profile
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 overflow-hidden min-h-0">
        
        {/* Profile summary - Left column */}
        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6 lg:h-full lg:sticky lg:top-0">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-white to-indigo-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 mb-4 flex items-center justify-center ring-4 ring-white shadow-lg">
                {employee.avatar ? (
                  <img 
                    src={employee.avatar} 
                    alt={employee.name} 
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-semibold text-indigo-600">{(employee.name || 'U').split(' ').map(part => part[0]).slice(0, 2).join('')}</span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-1">{employee.name}</h2>
              <p className="text-sm text-indigo-600 font-medium">{employee.role}</p>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">{employee.status}</span>
                {employee.employeeType && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">{employee.employeeType}</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Employee ID</span>
                <span className="text-sm font-medium text-slate-800">{employee.id || 'N/A'}</span>
              </div>
              {employee.salary && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Base Salary</span>
                  <span className="text-sm font-medium text-slate-800">{employee.salary}</span>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Summary */}
          {attendanceItems.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-500" />
                Attendance Summary
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {attendanceItems.map((item) => {
                  const getAttendanceColor = (label) => {
                    if (label.toLowerCase() === 'present') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
                    if (label.toLowerCase() === 'absent') return 'bg-red-50 border-red-200 text-red-700';
                    if (label.toLowerCase() === 'leave') return 'bg-amber-50 border-amber-200 text-amber-700';
                    return 'bg-slate-50 border-slate-200 text-slate-700';
                  };
                  return (
                    <div key={item.label} className={`text-center p-4 rounded-xl border ${getAttendanceColor(item.label)}`}>
                      <p className="text-2xl font-bold">{item.value}</p>
                      <p className="text-xs mt-1 font-medium uppercase tracking-wide">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main details - Right column */}
        <div className="flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Contact Information */}
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-indigo-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      item.label === 'Email' ? 'bg-indigo-100 text-indigo-600' :
                      item.label === 'Phone' ? 'bg-emerald-100 text-emerald-600' :
                      item.label === 'Department' ? 'bg-purple-100 text-purple-600' :
                      item.label === 'Manager' ? 'bg-amber-100 text-amber-600' :
                      item.label === 'Location' ? 'bg-rose-100 text-rose-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <item.icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-slate-800 break-words">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Record Details */}
            <div className="p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-500" />
                Record Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Employee ID', value: employee.id },
                  { label: 'Department', value: employee.department },
                  { label: 'Manager', value: employee.manager },
                  { label: 'Location', value: employee.location },
                  { label: 'Joined', value: employee.joiningDate },
                  { label: 'Employment Type', value: employee.employeeType },
                ].filter(item => item.value).map((item) => (
                  <div key={item.label} className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-slate-800 break-words">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfiles;
