import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Download,
  Calendar,
  AlertCircle,
  Clock,
  Search,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Wallet,
  Loader2,
  Briefcase
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getSalaryList, getPayroll, processSalary, getEmployees } from '../../../services/hrApi';
import { useAuth } from '../../../context/AuthContext';

const TABS = ['All', 'Pending', 'Processed', 'Not Assigned'];
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

const formatCurrency = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusColor = (status) => {
  const s = String(status).toLowerCase();
  if (s === 'processed' || s === 'paid' || s === 'completed') return 'bg-emerald-50 text-emerald-600';
  if (s === 'pending') return 'bg-orange-50 text-orange-600';
  if (s === 'not assigned') return 'bg-slate-100 text-slate-500';
  if (s === 'rejected' || s === 'failed') return 'bg-rose-50 text-rose-600';
  return 'bg-slate-100 text-slate-600';
};

const normalizeAccountRole = (value) => {
  const role = String(value || '').trim().toLowerCase();
  if (role === 'main admin' || role === 'main_admin') return 'main_admin';
  if (role === 'superadmin' || role === 'super admin') return 'superadmin';
  if (role === 'admin') return 'admin';
  if (role === 'hr') return 'hr';
  if (role === 'employee') return 'employee';
  return role;
};

const PayrollManagement = () => {
  const navigate = useNavigate();
  const { role: viewerRole } = useAuth();
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [payrollEntries, setPayrollEntries] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignForm, setAssignForm] = useState({
    basicSalary: '',
    deductions: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const currentMonthLabel = MONTHS.find((m) => m.value === (new Date().getMonth() + 1))?.label || 'January';
  const currentYear = new Date().getFullYear();
  const currentViewerRole = normalizeAccountRole(viewerRole);

  const canAssignSalary = useCallback((entry) => {
    const targetRole = normalizeAccountRole(entry?.accountRole);

    if (currentViewerRole === 'admin') {
      return targetRole === 'employee';
    }

    if (currentViewerRole === 'hr') {
      return !['admin', 'main_admin', 'superadmin'].includes(targetRole);
    }

    return false;
  }, [currentViewerRole]);

  const fetchPayrollData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, salaryRes, payrollRes] = await Promise.all([
        getEmployees(),
        getSalaryList({ month: currentMonthLabel, year: currentYear }).catch(() => null),
        getPayroll({ month: currentMonthLabel, year: currentYear }).catch(() => null)
      ]);

      const employees = empRes?.data?.data || empRes?.data || [];
      const salaryList = salaryRes?.data?.data || salaryRes?.data || [];
      const payrollList = payrollRes?.data?.data || payrollRes?.data || [];

      // debug log removed
      // debug log removed
      // debug log removed

      // Build map of salary and payroll by userId for fast lookup
      const salaryMap = new Map();
      salaryList.forEach((s) => {
        const key = s.userId?._id || s.userId?.id || s.userId || s.employeeId || s.id;
        if (key) salaryMap.set(String(key), s);
      });
      const payrollMap = new Map();
      payrollList.forEach((p) => {
        const key = p.userId?._id || p.userId?.id || p.userId || p.employeeId || p.id;
        if (key) payrollMap.set(String(key), p);
      });

      // Merge: start with real employee list, overlay salary/payroll data
      const merged = employees.map((emp, index) => {
        const empId = String(emp._id || emp.id || emp.employeeId || emp.employeeCode || '');
        const salary = salaryMap.get(empId) || {};
        const payroll = payrollMap.get(empId) || {};
        // Only consider it a real salary record if it has a MongoDB _id.
        // getSalaryProcessingList returns fallback data without _id when no records exist.
        const hasSalary = !!(salary._id || payroll._id);

        return {
          id: empId || `EMP-${index + 1}`,
          name: emp.name || emp.fullName || emp.employeeName || 'Employee',
          email: emp.email || '',
          employeeId: emp.employeeId || emp.employeeCode || '—',
          department: emp.department || emp.dept || '—',
          role: emp.designation || emp.jobTitle || emp.role || '—',
          accountRole: emp.role || '',
          month: salary.month || payroll.month || '—',
          year: salary.year || payroll.year || '—',
          basicSalary: salary.basicSalary || salary.basic || salary.salary || 0,
          deductions: salary.deductions || salary.totalDeductions || 0,
          netSalary: salary.netSalary || salary.netPay || salary.finalSalary || 0,
          status: hasSalary ? (salary.status || payroll.status || 'Pending') : 'Not Assigned',
          processedAt: salary.processedAt || payroll.processedAt || null,
          avatar: emp.profileImage || emp.profilePicture || emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name || emp.fullName || 'E')}&background=random`
        };
      });

      setPayrollEntries(merged);

      // Department expense breakdown (only for assigned salaries)
      const deptExpenses = merged.reduce((acc, item) => {
        const dept = item.department || 'Other';
        if (Number(item.netSalary) > 0 && String(item.status).toLowerCase() !== 'not assigned') {
          acc[dept] = (acc[dept] || 0) + Number(item.netSalary);
        }
        return acc;
      }, {});

      const chartData = Object.entries(deptExpenses).map(([name, value]) => ({ name, value }));
      setExpenseData(chartData.length ? chartData : []);
    } catch (err) {
      // debug error removed
      setError('Failed to load payroll data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  const stats = useMemo(() => {
    const total = payrollEntries.length;
    const totalPayroll = payrollEntries.reduce((sum, e) => sum + (Number(e.netSalary) || 0), 0);
    const processed = payrollEntries.filter((e) => {
      const s = String(e.status).toLowerCase();
      return s === 'processed' || s === 'paid' || s === 'completed';
    }).length;
    const pending = payrollEntries.filter((e) => {
      const s = String(e.status).toLowerCase();
      return s === 'pending';
    }).length;
    const notAssigned = total - processed - pending;
    return { total, totalPayroll, processed, pending, notAssigned };
  }, [payrollEntries]);

  const tabCounts = useMemo(() => ({
    All: stats.total,
    Pending: stats.pending,
    Processed: stats.processed,
    'Not Assigned': stats.notAssigned
  }), [stats]);

  const filteredEntries = payrollEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = [entry.name, entry.employeeId, entry.department, entry.role].some(
      (field) => String(field).toLowerCase().includes(query)
    );
    const tab = activeTab.toLowerCase();
    const status = String(entry.status).toLowerCase();
    const matchesTab =
      tab === 'all' ? true :
      tab === 'pending' ? status === 'pending' :
      tab === 'processed' ? ['processed', 'paid', 'completed'].includes(status) :
      tab === 'not assigned' ? status === 'not assigned' :
      true;
    return matchesSearch && matchesTab;
  });

  const openAssignModal = (entry) => {
    if (!canAssignSalary(entry)) {
      showNotification('You do not have permission to assign salary for this account.');
      return;
    }

    setSelectedEmployee(entry);
    setAssignForm({
      basicSalary: '',
      deductions: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleAssignSalary = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    if (!canAssignSalary(selectedEmployee)) {
      showNotification('You do not have permission to assign salary for this account.');
      closeAssignModal();
      return;
    }

    setProcessingId(selectedEmployee.id);
    try {
      const monthLabel = MONTHS.find((m) => m.value === Number(assignForm.month))?.label || 'January';
      const payload = {
        userId: selectedEmployee.id,
        basicSalary: Number(assignForm.basicSalary),
        bonus: 0,
        deductions: Number(assignForm.deductions),
        month: monthLabel,
        year: Number(assignForm.year),
        status: 'Pending'
      };
      // debug log removed
      await processSalary(payload);
      const net = (Number(assignForm.basicSalary) || 0) - (Number(assignForm.deductions) || 0);
      setPayrollEntries((prev) =>
        prev.map((item) =>
          item.id === selectedEmployee.id
            ? {
                ...item,
                basicSalary: Number(assignForm.basicSalary),
                deductions: Number(assignForm.deductions),
                netSalary: net,
                month: monthLabel,
                year: Number(assignForm.year),
                status: 'Pending'
              }
            : item
        )
      );
      showNotification(`Salary assigned to ${selectedEmployee.name}`);
      closeAssignModal();
      // Re-fetch to confirm persistence in DB
      await fetchPayrollData();
    } catch (err) {
      // debug error removed
      const msg = err?.response?.data?.message || err?.message || 'Failed to assign salary';
      showNotification(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessSalary = async (id) => {
    const entry = payrollEntries.find((e) => e.id === id);
    if (!entry || !entry.month || entry.month === '—' || !entry.year || entry.year === '—') {
      showNotification('Salary details incomplete. Assign salary first.');
      return;
    }
    setProcessingId(id);
    try {
      const payload = {
        userId: id,
        month: entry.month,
        year: Number(entry.year),
        basicSalary: Number(entry.basicSalary),
        bonus: 0,
        deductions: Number(entry.deductions),
        status: 'Processed'
      };
      // debug log removed
      await processSalary(payload);
      setPayrollEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'Processed', processedAt: new Date().toISOString() } : e))
      );
      showNotification('Salary processed successfully');
      // Re-fetch to confirm persistence in DB
      await fetchPayrollData();
    } catch (err) {
      // debug error removed
      const msg = err?.response?.data?.message || err?.message || 'Failed to process salary';
      showNotification(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadPayslip = (entry) => {
    const csvContent = `Company Name,InfiAP HRMS\nEmployee,${entry.name}\nRole,${entry.role}\nDepartment,${entry.department}\nPeriod,${entry.month}/${entry.year}\n\nBasic Salary,${entry.basicSalary}\nDeductions,${entry.deductions}\nNet Salary,${entry.netSalary}\nStatus,${entry.status}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${entry.name.replace(/\s+/g, '_')}_${entry.month}_${entry.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`Downloaded payslip for ${entry.name}`);
  };

  const handleExportAll = () => {
    if (!filteredEntries.length) {
      showNotification("No payroll data to export.");
      return;
    }

    const headers = ["Name", "Employee ID", "Department", "Role", "Month/Year", "Basic Salary", "Deductions", "Net Salary", "Status"];
    const rows = filteredEntries.map(e => [
      e.name,
      e.employeeId,
      e.department,
      e.role,
      `${e.month}/${e.year}`,
      e.basicSalary,
      e.deductions,
      e.netSalary,
      e.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Payroll_Export_${currentMonthLabel}_${currentYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Payroll data exported successfully.");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-6 pt-4 overflow-hidden">

      {/* Assign Salary Modal */}
      {assignModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeAssignModal} />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <img src={selectedEmployee.avatar} className="w-10 h-10 rounded-lg object-cover border border-slate-100" alt="" />
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Assign Salary</h3>
                  <p className="text-xs text-slate-400">{selectedEmployee.name}</p>
                  <p className="text-[11px] text-slate-400">Role: {selectedEmployee.role}</p>
                </div>
              </div>
              <button onClick={closeAssignModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAssignSalary} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Month</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors bg-white"
                    value={assignForm.month}
                    onChange={(e) => setAssignForm((prev) => ({ ...prev, month: Number(e.target.value) }))}
                    required
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
                  <input
                    type="number" min={2000} max={2100}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors"
                    value={assignForm.year}
                    onChange={(e) => setAssignForm((prev) => ({ ...prev, year: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Basic Salary (₹)</label>
                <input
                  type="number" min={0}
                  placeholder="e.g. 50000"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors"
                  value={assignForm.basicSalary}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, basicSalary: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Deductions (₹)</label>
                <input
                  type="number" min={0}
                  placeholder="e.g. 5000"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors"
                  value={assignForm.deductions}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, deductions: e.target.value }))}
                  required
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400 mb-0.5">Net Salary</p>
                <p className="text-lg font-bold text-slate-800">
                  {formatCurrency((Number(assignForm.basicSalary) || 0) - (Number(assignForm.deductions) || 0))}
                </p>
              </div>
              <button
                type="submit"
                disabled={processingId === selectedEmployee.id}
                className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {processingId === selectedEmployee.id ? 'Saving...' : 'Assign Salary'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg">
          <Check size={16} className="text-emerald-400" />
          <span className="text-sm">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage salaries, deductions, and disbursements</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 overflow-hidden min-h-0">

        {/* Sidebar Stats */}
        <div className="xl:col-span-1 flex flex-col gap-4 overflow-y-auto pb-4">

          {/* Expense Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Expense by Department</h3>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="h-28 w-full">
              {expenseData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  No assigned salaries yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={expenseData}>
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Total Payroll</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalPayroll)}</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded">
                {stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}% done
              </span>
            </div>
          </div>

          {/* Stat Cards */}
          {[
            { label: 'Total Employees', value: stats.total, icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: 'Processed', value: stats.processed, icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Not Assigned', value: stats.notAssigned, icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3 hover:border-slate-200 transition-colors">
              <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}

          {/* Alert Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-auto">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="text-orange-500 shrink-0" size={16} />
              <div>
                <h4 className="text-sm font-medium text-slate-700">Payroll Alert</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {stats.pending} employee{stats.pending !== 1 ? 's' : ''} pending salary processing.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('Pending')}
              className="w-full py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
            >
              View Pending
            </button>
          </div>
        </div>

        {/* Main Table Area */}
        <div className="xl:col-span-3 flex flex-col min-h-0 bg-white border border-slate-100 rounded-xl overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
            <div className="flex items-center gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {tab} {tabCounts[tab] > 0 && `(${tabCounts[tab]})`}
                </button>
              ))}
            </div>
            <div className="relative max-w-sm w-full sm:w-56">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search employees, IDs..."
                className="w-full bg-white border border-slate-200 focus:border-slate-400 outline-none rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-700 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto no-scrollbar relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 size={28} className="text-slate-400 animate-spin" />
                <p className="text-sm text-slate-400">Loading payroll data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <AlertCircle size={28} className="text-rose-400" />
                <p className="text-sm text-slate-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <Wallet size={28} className="text-slate-300" />
                <p className="text-sm text-slate-400">No payroll entries found</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium text-slate-400">Employee</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400">Period</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400">Basic Salary</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400">Deductions</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400">Net Salary</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400">Status</th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="group hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.avatar}
                            className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                            alt={entry.name}
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=random`; }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{entry.name}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {entry.employeeId !== '—' ? `${entry.employeeId} · ${entry.department}` : entry.department}
                              {entry.role !== '—' ? ` · ${entry.role}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar size={13} className="text-slate-400" />
                          {entry.month !== '—' && entry.year !== '—' ? `${entry.month}/${entry.year}` : 'Current'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {String(entry.status).toLowerCase() === 'not assigned' ? '—' : formatCurrency(entry.basicSalary)}
                      </td>
                      <td className="px-4 py-4 text-sm text-rose-500">
                        {String(entry.status).toLowerCase() === 'not assigned' ? '—' : formatCurrency(entry.deductions)}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                        {String(entry.status).toLowerCase() === 'not assigned' ? '—' : formatCurrency(entry.netSalary)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(() => {
                            const status = String(entry.status).toLowerCase();
                            if (status === 'processed' || status === 'paid' || status === 'completed') {
                              return null;
                            }
                            const isAssign = status === 'not assigned';
                            const allowAssign = canAssignSalary(entry);

                            if (isAssign && !allowAssign) {
                              return (
                                <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-100 text-slate-500">
                                  Restricted
                                </span>
                              );
                            }

                            return (
                              <button
                                onClick={() => isAssign ? openAssignModal(entry) : handleProcessSalary(entry.id)}
                                disabled={processingId === entry.id}
                                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                              >
                                {processingId === entry.id ? 'Processing...' : isAssign ? 'Assign' : 'Process'}
                              </button>
                            );
                          })()}
                          {String(entry.status).toLowerCase() !== 'not assigned' && (
                              <button
                                onClick={() => handleDownloadPayslip(entry)}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Download size={16} />
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <p className="text-xs text-slate-500">Payroll system active</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-slate-400">Last updated: {formatDate(new Date())}</p>
              <button
                onClick={handleExportAll}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors"
              >
                <Download size={14} />
                Export CSV
              </button>
              <button
                onClick={() => { showNotification('Refreshing...'); fetchPayrollData(); }}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;
