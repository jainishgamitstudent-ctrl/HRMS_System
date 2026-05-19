import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { useEmployeeContext } from '../../../context/EmployeeContext';
import { useAuth } from '../../../context/AuthContext';
import { getCompanyDepartments } from '../../../services/adminApi';
import { updateCandidate } from '../../../services/hrApi';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN (+91)' },
  { code: '+1', label: 'US (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'AU (+61)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+81', label: 'JP (+81)' },
  { code: '+49', label: 'DE (+49)' },
];

const emptyForm = {
  name: '',
  email: '',
  countryCode: '+91',
  phoneNumber: '',
  joiningDate: '',
  department: '',
  systemRole: 'employee',
  role: '',
  manager: '',
  salary: '',
  password: '',
  status: 'Onboarding',
};

const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400';

const labelClass = 'text-xs font-medium text-slate-600';

const normalizeDepartmentName = (department) => {
  if (typeof department === 'string') return department;
  return department?.name || department?.departmentName || '';
};

const AddEmployee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';
  const { addEmployee, employees, fetchEmployees, loading } = useEmployeeContext();
  const { user } = useAuth();

  const isAdmin = ['admin', 'superadmin'].includes((user?.role || '').toString().toLowerCase());
  const isHR = (user?.role || '').toString().toLowerCase() === 'hr';

  const [formData, setFormData] = useState(emptyForm);
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const candidateRef = location.state?.candidate;
  const candidateId = candidateRef?.candidateId;

  useEffect(() => {
    fetchEmployees?.({ limit: 100 });
  }, [fetchEmployees]);

  useEffect(() => {
    if (!candidateRef) return;

    // Parse phone into countryCode + phoneNumber
    let countryCode = '+91';
    let phoneNumber = '';
    const rawPhone = String(candidateRef.phone || '').trim();
    if (rawPhone) {
      const matched = COUNTRY_CODES.find((c) => rawPhone.startsWith(c.code));
      if (matched) {
        countryCode = matched.code;
        phoneNumber = rawPhone.slice(matched.code.length).replace(/\D/g, '').slice(0, 10);
      } else if (rawPhone.startsWith('+')) {
        countryCode = rawPhone.slice(0, 3);
        phoneNumber = rawPhone.slice(3).replace(/\D/g, '').slice(0, 10);
      } else {
        phoneNumber = rawPhone.replace(/\D/g, '').slice(0, 10);
      }
    }

    const today = new Date().toISOString().split('T')[0];

    setFormData((prev) => ({
      ...prev,
      name: candidateRef.name || prev.name,
      email: candidateRef.email || prev.email,
      countryCode,
      phoneNumber,
      role: candidateRef.role || prev.role,
      joiningDate: today,
      password: prev.password || 'Password@123',
      status: 'Onboarding',
    }));
  }, [candidateRef]);

  useEffect(() => {
    let isMounted = true;

    const loadDepartments = async () => {
      setIsLoadingDepartments(true);
      try {
        const response = await getCompanyDepartments();
        const list = response?.data?.data || [];
        if (isMounted) {
          setDepartments(list.map(normalizeDepartmentName).filter(Boolean));
        }
      } catch (error) {
        if (isMounted) setDepartments([]);
        // debug error removed
      } finally {
        if (isMounted) setIsLoadingDepartments(false);
      }
    };

    loadDepartments();

    return () => {
      isMounted = false;
    };
  }, []);

  const departmentOptions = useMemo(() => {
    const fromEmployees = employees.map((employee) => employee.department).filter(Boolean);
    return [...new Set([...departments, ...fromEmployees])].sort((a, b) => a.localeCompare(b));
  }, [departments, employees]);

  const managerOptions = useMemo(() => {
    return employees
      .filter((employee) => employee._id || employee.id)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [employees]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isPhoneValid = formData.phoneNumber.length === 10;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (formData.phoneNumber && !isPhoneValid) {
      setSubmitError('Phone number must be exactly 10 digits.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    const fullPhone = formData.phoneNumber
      ? `${formData.countryCode} ${formData.phoneNumber}`
      : '';

    const result = await addEmployee({
      ...formData,
      phone: fullPhone,
      annualSalary: formData.salary ? Number(formData.salary) : undefined,
      status: formData.status || 'Active',
      systemRole: formData.systemRole,
    });

    setIsSubmitting(false);

    if (result?.success === false) {
      setSubmitError(result.error || 'Failed to add employee');
      return;
    }

    // If created from a candidate, mark candidate as Hired
    if (candidateId) {
      try {
        await updateCandidate(candidateId, { status: 'Hired' });
      } catch (err) {
        console.warn('Failed to update candidate status:', err);
      }
    }

    setSuccessMessage(`${formData.name} was added to the employee directory.`);
    setFormData(emptyForm);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] w-full bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/employees`)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Back to employees"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Add Employee</h1>
              <p className="mt-1 text-sm text-slate-500">Create a new employee record using live company data.</p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              {successMessage}
            </span>
            <div className="flex items-center gap-3">
              {candidateId && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/recruitment-control/candidates')}
                  className="font-medium text-emerald-900 hover:underline"
                >
                  Back to candidates
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate(`${basePath}/employees`)}
                className="font-medium text-emerald-900 hover:underline"
              >
                View directory
              </button>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className={labelClass}>Full name</span>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                type="text"
                placeholder="Employee name"
                className={fieldClass}
              />
            </label>

            
            <label className="space-y-1.5">
              <span className={labelClass}>Email</span>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                type="email"
                placeholder="name@company.com"
                className={fieldClass}
              />
            </label>

            <label className="space-y-1.5">
              <span className={labelClass}>Phone</span>
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shrink-0"
                  style={{ width: '7rem' }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  className={`min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${formData.phoneNumber && !isPhoneValid ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                />
              </div>
              {formData.phoneNumber && !isPhoneValid && (
                <span className="text-xs text-red-500">Enter exactly 10 digits</span>
              )}
            </label>

            <label className="space-y-1.5">
              <span className={labelClass}>Department</span>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                disabled={isLoadingDepartments && departmentOptions.length === 0}
                className={fieldClass}
              >
                <option value="">{isLoadingDepartments ? 'Loading departments...' : 'Select department'}</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className={labelClass}>User Role</span>
              <select
                name="systemRole"
                value={formData.systemRole}
                onChange={handleChange}
                required
                disabled={!isAdmin}
                className={fieldClass}
                title={!isAdmin ? 'Only Admin can create HR users' : ''}
              >
                <option value="employee">Employee</option>
                {isAdmin && <option value="hr">HR</option>}
              </select>
              {!isAdmin && (
                <span className="text-[10px] text-slate-400">Only Admin can create HR users</span>
              )}
            </label>

            <label className="space-y-1.5">
              <span className={labelClass}>Employee Status</span>
              <select
                name="status"
                value={formData.status || 'Onboarding'}
                onChange={handleChange}
                required
                className={fieldClass}
              >
                <option value="New Hire">New Hire</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
                <option value="Terminated">Terminated</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className={labelClass}>Designation</span>
              <input
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                type="text"
                placeholder="Software Engineer"
                className={fieldClass}
              />
            </label>

            <label className="space-y-1.5">
              <span className={labelClass}>Password</span>
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set employee password"
                  className={`${fieldClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-indigo-600 transition-colors px-2 py-1 rounded"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label className="space-y-1.5">
              <span className={labelClass}>Reporting manager</span>
              <select
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className={fieldClass}
                disabled={loading && managerOptions.length === 0}
              >
                <option value="">{loading ? 'Loading employees...' : 'No manager'}</option>
                {managerOptions.map((employee) => (
                  <option key={employee._id || employee.id} value={employee._id || employee.id}>
                    {employee.name} {employee.employeeId ? `(${employee.employeeId})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className={labelClass}>Joining date</span>
              <input
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
                type="date"
                className={fieldClass}
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <span className={labelClass}>Annual salary</span>
              <input
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                type="number"
                min="0"
                placeholder="Optional"
                className={fieldClass}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/employees`)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isSubmitting ? 'Creating...' : 'Create employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
