import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { useEmployeeContext } from '../../../context/EmployeeContext';
import { getCompanyDepartments } from '../../../services/adminApi';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  joiningDate: '',
  department: '',
  role: '',
  manager: '',
  salary: '',
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

  const [formData, setFormData] = useState(emptyForm);
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchEmployees?.({ limit: 100 });
  }, [fetchEmployees]);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');

    const result = await addEmployee({
      ...formData,
      salary: formData.salary ? Number(formData.salary) : undefined,
      status: 'Active',
    });

    setIsSubmitting(false);

    if (result?.success === false) {
      setSubmitError(result.error || 'Failed to add employee');
      return;
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
            <button
              type="button"
              onClick={() => navigate(`${basePath}/employees`)}
              className="font-medium text-emerald-900 hover:underline"
            >
              View directory
            </button>
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
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                placeholder="+91 98765 43210"
                className={fieldClass}
              />
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
              <span className={labelClass}>Role</span>
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
              onClick={() => navigate('/employees')}
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
