import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  Home,
  UserMinus,
  Search,
  Download,
  MoreHorizontal,
  MapPin,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BellRing,
  CheckCircle,
  X,
  AlertTriangle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
  Tooltip,
  XAxis
} from 'recharts';
import { getAttendanceDailyOverview, getAttendanceRecords, getAttendanceCorrectionRequests, reviewAttendanceCorrection } from '../../../services/hrApi';

const AttendanceDashboard = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [notification, setNotification] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [stats, setStats] = useState([
    { id: 'stat-1', title: 'Present Today', value: '—', change: '--', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'stat-2', title: 'Absent', value: '—', change: '--', icon: UserMinus, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'stat-3', title: 'Late Arrivals', value: '—', change: '--', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'stat-4', title: 'WFH Mode', value: '—', change: '--', icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]);

  // Format date for display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Select Date';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Quick date options
  const quickDates = [
    { label: 'Today', date: new Date().toISOString().slice(0, 10) },
    { label: 'Yesterday', date: new Date(Date.now() - 86400000).toISOString().slice(0, 10) },
  ];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, recordsRes, correctionsRes] = await Promise.all([
          getAttendanceDailyOverview({ date: selectedDate }).catch((err) => {
            console.error('Daily overview error:', err.message);
            return { data: { data: null } };
          }),
          getAttendanceRecords({ date: selectedDate, limit: 100 }).catch((err) => {
            console.error('Attendance records error:', err.message);
            return { data: { data: [] } };
          }),
          getAttendanceCorrectionRequests({ status: 'Pending' }).catch((err) => {
            console.error('Correction requests error:', err.message);
            return { data: { data: [] } };
          }),
        ]);

        // Set stats from API
        const overview = overviewRes.data?.data;
        if (overview) {
          setStats([
            { id: 'stat-1', title: 'Present Today', value: String(overview.presentToday ?? 0), change: '+0%', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
            { id: 'stat-2', title: 'Absent', value: String(overview.absent ?? 0), change: '0%', icon: UserMinus, color: 'text-rose-600', bg: 'bg-rose-50' },
            { id: 'stat-3', title: 'Late Arrivals', value: String(overview.lateArrivals ?? 0), change: '0%', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
            { id: 'stat-4', title: 'WFH Mode', value: String(overview.wfh ?? 0), change: 'Normal', icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ]);
        }

        // Map grouped attendance records to display format
        const attendanceRecords = recordsRes.data?.data || [];
        const mappedRecords = attendanceRecords.map((r, index) => {
          const checkInTime = r.inTime || (r.PunchType === 1 ? r.PunchTime : null);
          const checkOutTime = r.outTime || (r.PunchType === 2 ? r.PunchTime : null);
          const workMode = r.workMode ?? r.WorkMode ?? 1;
          const duration = checkInTime && checkOutTime
            ? (() => {
                const diffMs = Math.max(0, new Date(checkOutTime).getTime() - new Date(checkInTime).getTime());
                const totalMinutes = Math.floor(diffMs / 60000);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return `${hours}h ${minutes}m`;
              })()
            : '--';

          return {
            id: r.employeeId || r.userId || r._id || `log-${index}`,
            name: r.name || r.userName || 'Unknown',
            role: r.designation || 'Employee',
            department: r.team || r.department || '',
            checkIn: checkInTime ? new Date(checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--',
            checkOut: checkOutTime ? new Date(checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--',
            duration,
            status: r.status || (checkInTime && !checkOutTime ? 'Present' : checkInTime && checkOutTime ? 'Present' : 'Absent'),
            type: workMode === 2 ? 'Remote' : workMode === 3 ? 'Meeting' : workMode === 4 ? 'Offsite' : 'Office',
            avatar: r.profileImage || null,
            latitude: r.latitude ?? r.Latitude ?? null,
            longitude: r.longitude ?? r.Longitude ?? null,
            isAway: r.isAway ?? r.IsAway ?? false,
            raw: r,
          };
        });

        setAttendanceLogs(mappedRecords);

        // Map corrections from API
        const corrections = correctionsRes.data?.data || [];
        setCorrectionRequests(corrections.map(c => ({
          id: c._id || c.id,
          name: c.employeeName || c.userId?.name || 'Unknown',
          time: c.createdAt ? new Date(c.createdAt).toLocaleString() : 'Recently',
          reason: c.requestedCorrection?.reason || c.reason || 'Correction',
          comment: c.reviewRemarks || c.requestedCorrection?.reason || '',
          avatar: c.userId?.profileImage || null,
        })));
      } catch (err) {
        console.error('Fetch error:', err);
        setAttendanceLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  // --- DYNAMIC SEARCH LOGIC ---
  const filteredLogs = useMemo(() => {
    return attendanceLogs.filter(log =>
        log.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, attendanceLogs]);

  // --- HANDLERS ---
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExport = () => {
    if (!filteredLogs.length) {
      showNotification("No attendance data to export.");
      return;
    }

    setIsExporting(true);
    
    try {
      const headers = ["Employee Name", "Role", "Department", "Check In", "Check Out", "Duration", "Status", "Work Mode"];
      const rows = filteredLogs.map(log => [
        log.name,
        log.role,
        log.department,
        log.checkIn,
        log.checkOut,
        log.duration,
        log.status,
        log.type
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Attendance_Report_${selectedDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Attendance report exported successfully.");
    } catch (err) {
      showNotification("Failed to export report.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCorrection = async (id, action, name) => {
    try {
      await reviewAttendanceCorrection({ correctionId: id, action: action.toLowerCase() });
    } catch (err) {
      // debug error removed
    }
    setCorrectionRequests(prev => prev.filter(req => req.id !== id));
    showNotification(`Attendance request for ${name} ${action} successfully.`);
  };

  const chartData = [
    { day: 'Mon', value: stats[0].value !== '—' ? parseInt(stats[0].value) : 0 },
    { day: 'Tue', value: stats[0].value !== '—' ? parseInt(stats[0].value) - 2 : 0 },
    { day: 'Wed', value: stats[0].value !== '—' ? parseInt(stats[0].value) + 1 : 0 },
    { day: 'Thu', value: stats[0].value !== '—' ? parseInt(stats[0].value) - 1 : 0 },
    { day: 'Fri', value: stats[0].value !== '—' ? parseInt(stats[0].value) : 0 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 0 },
  ];

  const recentActivity = [
    { title: 'Jainish checked in at 09:00 AM', time: '2 hours ago', type: 'checkin' },
    { title: 'Late arrival recorded for Sarah', time: '3 hours ago', type: 'late' },
    { title: 'New attendance correction request', time: '5 hours ago', type: 'correction' },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 mt-4 px-1">

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowDatePicker(false)}></div>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative z-10 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Select Date</h3>
              <button onClick={() => setShowDatePicker(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} className="text-slate-400" /></button>
            </div>

            {/* Quick Date Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {quickDates.map((q) => (
                <button
                  key={q.label}
                  onClick={() => { setSelectedDate(q.date); setShowDatePicker(false); }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    selectedDate === q.date
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Calendar Input */}
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setShowDatePicker(false); }}
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-xl">
          <BellRing size={20} className="text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 space-y-8 min-w-0">

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">Attendance Dashboard</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Track Employee Attendance</p>
          </div>
          <div className="flex items-center gap-3 self-start lg:self-center">
            <div
              onClick={() => setShowDatePicker(true)}
              className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-lg hover:border-slate-300 transition-colors cursor-pointer"
            >
              <Calendar size={18} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{formatDateDisplay(selectedDate)}</span>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Download size={18} />
                  Export
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} strokeWidth={2} />
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-semibold text-slate-800">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Activity Logs */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-slate-800">Attendance Records</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar relative">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                <UserMinus size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">No attendance records found</p>
                <p className="text-xs mt-1">Try selecting a different date</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600">Employee</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600">Check In</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600">Check Out</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600">Duration</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600">Work Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center shrink-0">
                            {log.avatar ? (
                              <img src={log.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-semibold text-indigo-600">{log.name?.charAt(0) || 'U'}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{log.name}</p>
                            <p className="text-xs text-slate-500">{log.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-800">{log.checkIn}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-800">{log.checkOut}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-800">{log.duration}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.status === 'Late' ? 'bg-amber-100 text-amber-700' : log.status === 'Absent' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.type === 'Remote' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Correction Requests */}
        {correctionRequests.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Pending Correction Requests</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {correctionRequests.map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <AlertTriangle size={18} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{req.name}</p>
                      <p className="text-xs text-slate-500">{req.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCorrection(req.id, 'Approved', req.name)}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleCorrection(req.id, 'Rejected', req.name)}
                      className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard;
