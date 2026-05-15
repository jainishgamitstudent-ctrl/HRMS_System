import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  RefreshCw,
  Search,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsReport } from '../../../services/hrApi';

const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

const getArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.records)) return value.records;
  return [];
};

const formatNumber = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) return '0';
  return number.toLocaleString();
};

const formatDate = (value) => {
  if (!value) return 'Current';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const normalizeDepartment = (item, index) => ({
  id: item.id || item._id || item.department || item.name || `dept-${index}`,
  name: item.department || item.name || item.dept || `Department ${index + 1}`,
  count: Number(item.count ?? item.value ?? item.total ?? item.employees ?? 0),
  active: Number(item.active ?? item.activeEmployees ?? item.count ?? item.value ?? 0)
});

const normalizeTenure = (item, index) => ({
  id: item.id || item._id || item.range || item.label || `tenure-${index}`,
  range: item.range || item.label || item.bucket || `Range ${index + 1}`,
  count: Number(item.count ?? item.value ?? item.total ?? 0)
});

const EmployeeReports = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [tenureBuckets, setTenureBuckets] = useState([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    departments: 0,
    avgTenure: 'N/A',
    generatedAt: 'Current'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEmployeeReport = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getAnalyticsReport();
      const payload = getPayload(response);
      const departmentRows = getArray(payload.departments || payload.byDepartment || payload.departmentStats)
        .map(normalizeDepartment)
        .filter((item) => item.name);
      const tenureRows = getArray(payload.tenure || payload.tenureBuckets || payload.tenureBreakdown)
        .map(normalizeTenure)
        .filter((item) => item.range);
      const employeeRows = getArray(payload.employees || payload.employeeReports || payload.records);
      const totalEmployees = Number(
        payload.totalEmployees ??
        payload.employeesCount ??
        employeeRows.length ??
        departmentRows.reduce((total, item) => total + item.count, 0)
      );

      setDepartments(departmentRows);
      setTenureBuckets(tenureRows);
      setSummary({
        totalEmployees,
        departments: Number(payload.totalDepartments ?? payload.departmentCount ?? departmentRows.length),
        avgTenure: payload.averageTenure || payload.avgTenure || 'N/A',
        generatedAt: formatDate(payload.generatedAt || payload.updatedAt)
      });
    } catch (err) {
      // debug error removed
      setDepartments([]);
      setTenureBuckets([]);
      setSummary({ totalEmployees: 0, departments: 0, avgTenure: 'N/A', generatedAt: 'Current' });
      setError('Unable to load employee analytics. Please refresh once the HR API is available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeReport();
  }, []);

  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return departments;
    return departments.filter((item) => item.name.toLowerCase().includes(query));
  }, [departments, searchQuery]);

  const maxDepartmentCount = Math.max(...departments.map((item) => item.count), 1);
  const maxTenureCount = Math.max(...tenureBuckets.map((item) => item.count), 1);

  const cards = [
    { label: 'Total Employees', value: summary.totalEmployees, icon: Users, color: 'text-blue-600' },
    { label: 'Departments', value: summary.departments, icon: Briefcase, color: 'text-emerald-600' },
    { label: 'Average Tenure', value: summary.avgTenure, icon: Calendar, color: 'text-violet-600' },
    { label: 'Generated', value: summary.generatedAt, icon: RefreshCw, color: 'text-slate-600' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-6 pt-4 overflow-hidden text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/analytics')}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Employee Reports</h1>
            <p className="text-sm text-slate-500 mt-1">Live headcount, department, and tenure analytics.</p>
          </div>
        </div>

        <button
          onClick={fetchEmployeeReport}
          disabled={loading}
          className="px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-60 flex items-center gap-2 self-start lg:self-center"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-4">{typeof card.value === 'number' ? formatNumber(card.value) : card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 flex-1 min-h-0">
        <div className="xl:col-span-3 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Department Headcount</h2>
              <p className="text-sm text-slate-500 mt-1">Only departments returned by the HR analytics API are shown.</p>
            </div>
            <div className="relative w-full lg:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search department"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="m-5 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3 text-sm font-semibold">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Employees</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-14 text-center text-sm font-bold text-slate-500">
                      Loading real employee analytics...
                    </td>
                  </tr>
                ) : filteredDepartments.length ? (
                  filteredDepartments.map((department) => (
                    <tr key={department.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-slate-900">{department.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatNumber(department.active)} active employee(s)</p>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-slate-900">{formatNumber(department.count)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-40 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-900 rounded-full"
                              style={{ width: `${Math.min((department.count / maxDepartmentCount) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500">
                            {summary.totalEmployees ? `${((department.count / summary.totalEmployees) * 100).toFixed(1)}%` : '0%'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-14 text-center">
                      <p className="text-sm font-black text-slate-700">No department data found</p>
                      <p className="text-xs text-slate-400 mt-1">This table only shows data returned by the HR API.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">Tenure Breakdown</h2>
            <p className="text-sm text-slate-500 mt-1">Employee count by tenure bucket.</p>
          </div>

          <div className="flex-1 overflow-auto p-5 space-y-4">
            {loading ? (
              <p className="py-12 text-center text-sm font-bold text-slate-500">Loading tenure data...</p>
            ) : tenureBuckets.length ? (
              tenureBuckets.map((bucket) => (
                <div key={bucket.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-800">{bucket.range}</span>
                    <span className="text-sm font-black text-slate-500">{formatNumber(bucket.count)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min((bucket.count / maxTenureCount) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm font-black text-slate-700">No tenure data found</p>
                <p className="text-xs text-slate-400 mt-1">Tenure buckets will appear when the API returns them.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReports;
