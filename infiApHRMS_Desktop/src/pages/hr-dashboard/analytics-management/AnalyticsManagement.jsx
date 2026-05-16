import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  RefreshCw,
  Search,
  TrendingUp,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getAnalyticsAttendance,
  getAnalyticsPerformance,
  getAnalyticsReport
} from '../../../services/hrApi';

const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

const getArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.records)) return value.records;
  if (Array.isArray(value?.summary)) return value.summary;
  return [];
};

const formatNumber = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) return '0';
  return number.toLocaleString();
};

const AnalyticsManagement = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    employees: 0,
    attendanceRecords: 0,
    performanceRecords: 0,
    averageAttendance: 0
  });
  const [datasets, setDatasets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [reportRes, attendanceRes, performanceRes] = await Promise.all([
        getAnalyticsReport(),
        getAnalyticsAttendance(),
        getAnalyticsPerformance()
      ]);

      const report = getPayload(reportRes);
      const attendance = getPayload(attendanceRes);
      const performance = getPayload(performanceRes);
      const employeeRows = getArray(report.employees || report.employeeReports || report);
      const attendanceRows = getArray(attendance.records || attendance.attendance || attendance);
      const performanceRows = getArray(performance.records || performance.performance || performance);
      const attendanceValues = attendanceRows
        .map((item) => Number(item.value ?? item.attendance ?? item.percentage ?? item.presentPercentage))
        .filter((value) => !Number.isNaN(value));
      const averageAttendance = attendanceValues.length
        ? attendanceValues.reduce((total, value) => total + value, 0) / attendanceValues.length
        : Number(attendance.averageAttendance || attendance.presentPercentage || 0);

      setSummary({
        employees: Number(report.totalEmployees ?? report.employeesCount ?? employeeRows.length ?? 0),
        attendanceRecords: Number(attendance.totalRecords ?? attendance.count ?? attendanceRows.length ?? 0),
        performanceRecords: Number(performance.totalRecords ?? performance.count ?? performanceRows.length ?? 0),
        averageAttendance
      });

      setDatasets([
        {
          title: 'Employee Analytics',
          description: 'Headcount, department, tenure, and employee lifecycle data.',
          records: Number(report.totalEmployees ?? report.employeesCount ?? employeeRows.length ?? 0),
          status: employeeRows.length || report.totalEmployees || report.employeesCount ? 'Ready' : 'No data',
          updated: report.updatedAt || report.generatedAt || 'Current',
          path: '/analytics/employees',
          icon: Users
        },
        {
          title: 'Attendance Analytics',
          description: 'Attendance trends, presence ratios, and absence patterns.',
          records: Number(attendance.totalRecords ?? attendance.count ?? attendanceRows.length ?? 0),
          status: attendanceRows.length || attendance.totalRecords || attendance.count ? 'Ready' : 'No data',
          updated: attendance.updatedAt || attendance.generatedAt || 'Current',
          path: '/analytics/attendance',
          icon: Activity
        },
        {
          title: 'Performance Analytics',
          description: 'Review ratings, performance trends, and risk indicators.',
          records: Number(performance.totalRecords ?? performance.count ?? performanceRows.length ?? 0),
          status: performanceRows.length || performance.totalRecords || performance.count ? 'Ready' : 'No data',
          updated: performance.updatedAt || performance.generatedAt || 'Current',
          path: '/analytics/performance',
          icon: TrendingUp
        }
      ]);
    } catch (err) {
      // debug error removed
      setError('Unable to load analytics data. Please refresh once the HR API is available.');
      setSummary({ employees: 0, attendanceRecords: 0, performanceRecords: 0, averageAttendance: 0 });
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const filteredDatasets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return datasets;

    return datasets.filter((dataset) => [
      dataset.title,
      dataset.description,
      dataset.status,
      dataset.updated
    ].some((value) => String(value).toLowerCase().includes(query)));
  }, [datasets, searchQuery]);

  const cards = [
    { label: 'Employees', value: summary.employees, icon: Users, color: 'text-blue-600' },
    { label: 'Attendance Records', value: summary.attendanceRecords, icon: Activity, color: 'text-emerald-600' },
    { label: 'Performance Records', value: summary.performanceRecords, icon: TrendingUp, color: 'text-violet-600' },
    { label: 'Avg Attendance', value: `${Number(summary.averageAttendance || 0).toFixed(1)}%`, icon: BarChart3, color: 'text-amber-600' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-6 pt-4 overflow-hidden text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Live HR analytics from employee, attendance, and performance data.</p>
        </div>

        <button
          onClick={fetchAnalytics}
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
            <p className="text-3xl font-black text-slate-900 mt-4">{typeof card.value === 'number' ? formatNumber(card.value) : card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Analytics Workspaces</h2>
            <p className="text-sm text-slate-500 mt-1">Open a workspace to view detailed live analytics.</p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search analytics"
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
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Workspace</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Records</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Updated</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center text-sm font-bold text-slate-500">
                    Loading real analytics data...
                  </td>
                </tr>
              ) : filteredDatasets.length ? (
                filteredDatasets.map((dataset) => (
                  <tr key={dataset.title} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                          <dataset.icon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{dataset.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{dataset.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-slate-900">{formatNumber(dataset.records)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Calendar size={16} className="text-slate-400" />
                        {dataset.updated}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-black ${
                        dataset.status === 'Ready'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {dataset.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => navigate(dataset.path)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-900 hover:text-white transition-all"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center">
                    <p className="text-sm font-black text-slate-700">No analytics data found</p>
                    <p className="text-xs text-slate-400 mt-1">This page only shows data returned by the HR analytics APIs.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 text-xs font-bold text-slate-500">
          {filteredDatasets.length} visible analytics workspace(s)
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManagement;
