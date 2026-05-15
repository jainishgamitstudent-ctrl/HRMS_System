import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Search,
  Star,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getFeedbackStats,
  getPerformanceDashboard,
  getPerformanceList
} from '../../../services/hrApi';

const getPayloadArray = (response) => {
  const payload = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.performance)) return payload.performance;
  if (Array.isArray(payload.employees)) return payload.employees;
  return [];
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatRating = (value) => {
  const rating = Number(value);
  if (Number.isNaN(rating)) return 'N/A';
  return `${rating.toFixed(1)} / 5`;
};

const normalizePerformance = (item, index) => {
  const employee = item.employee || item.user || {};
  const rating = item.rating ?? item.score ?? item.overallRating ?? item.averageRating;

  return {
    id: item._id || item.id || item.employeeId || employee.employeeId || `PERF-${index + 1}`,
    employeeName: item.employeeName || item.name || employee.name || employee.fullName || 'Unknown Employee',
    employeeId: item.employeeId || employee.employeeId || employee.empId || 'N/A',
    department: item.department || employee.department || item.dept || 'N/A',
    role: item.role || item.designation || employee.designation || 'N/A',
    period: item.period || item.month || item.quarter || item.reviewCycle || 'Current Cycle',
    status: item.status || item.reviewStatus || 'Pending',
    rating,
    ratingLabel: formatRating(rating),
    updatedAt: item.updatedAt || item.reviewedAt || item.createdAt,
    reviewer: item.reviewer || item.managerName || item.reviewerName || 'N/A'
  };
};

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200'
};

const PerformanceManagement = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    pendingReviews: 0,
    averageMeritScore: 0,
    evolutionIndex: 0,
    feedbackPending: 0
  });
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError('');

      const [dashboardRes, listRes, feedbackRes] = await Promise.all([
        getPerformanceDashboard(),
        getPerformanceList(),
        getFeedbackStats()
      ]);

      const dashboard = dashboardRes.data?.data || dashboardRes.data || {};
      const feedback = feedbackRes.data?.data || feedbackRes.data || {};
      const list = getPayloadArray(listRes).map(normalizePerformance);
      const ratings = list.map((item) => Number(item.rating)).filter((value) => !Number.isNaN(value));
      const averageRating = ratings.length
        ? ratings.reduce((total, value) => total + value, 0) / ratings.length
        : Number(dashboard.averageMeritScore || dashboard.averageRating || 0);

      setRows(list);
      setSummary({
        pendingReviews: Number(dashboard.pendingReviews ?? feedback.pending ?? list.filter((item) => item.status === 'Pending').length),
        averageMeritScore: averageRating,
        evolutionIndex: Number(dashboard.evolutionIndex ?? dashboard.growthIndex ?? 0),
        feedbackPending: Number(feedback.pending ?? feedback.pendingFeedback ?? 0)
      });
    } catch (err) {
      // debug error removed
      setRows([]);
      setSummary({ pendingReviews: 0, averageMeritScore: 0, evolutionIndex: 0, feedbackPending: 0 });
      setError('Unable to load performance data. Please refresh once the HR API is available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesStatus = activeStatus === 'All' || row.status === activeStatus;
      const matchesSearch = !query || [
        row.employeeName,
        row.employeeId,
        row.department,
        row.role,
        row.period,
        row.status,
        row.reviewer
      ].some((value) => String(value).toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, rows, searchQuery]);

  const statuses = ['All', ...Array.from(new Set(rows.map((row) => row.status).filter(Boolean)))];

  const cards = [
    { label: 'Pending Reviews', value: summary.pendingReviews, icon: ClipboardList, color: 'text-amber-600' },
    { label: 'Average Rating', value: formatRating(summary.averageMeritScore), icon: Star, color: 'text-violet-600' },
    { label: 'Evolution Index', value: `${summary.evolutionIndex}%`, icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Pending Feedback', value: summary.feedbackPending, icon: CheckCircle2, color: 'text-blue-600' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-6 pt-4 overflow-hidden text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performance Management</h1>
          <p className="text-sm text-slate-500 mt-1">Live review status, ratings, and employee performance records.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/performance/reports')}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <BarChart3 size={16} />
            Reports
          </button>
          <button
            onClick={fetchPerformanceData}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-60 flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-4">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                  activeStatus === status
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search employee, role, reviewer"
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
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Review Cycle</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Rating</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center text-sm font-bold text-slate-500">
                    Loading real performance data...
                  </td>
                </tr>
              ) : filteredRows.length ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-900">{row.employeeName}</p>
                      <p className="text-xs text-slate-500 mt-1">{row.department} • {row.role}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Calendar size={16} className="text-slate-400" />
                        {row.period}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Updated {formatDate(row.updatedAt)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-900">{row.ratingLabel}</p>
                      <p className="text-xs text-slate-500 mt-1">Reviewer: {row.reviewer}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-black ${statusStyles[row.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => navigate('/performance/feedback')}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-900 hover:text-white transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center">
                    <p className="text-sm font-black text-slate-700">No performance records found</p>
                    <p className="text-xs text-slate-400 mt-1">This table only shows records returned by the HR API.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
          <span>{filteredRows.length} visible of {rows.length} performance record(s)</span>
          <button
            onClick={() => navigate('/performance/monthly')}
            className="text-slate-700 hover:text-slate-900"
          >
            Monthly metrics
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceManagement;
