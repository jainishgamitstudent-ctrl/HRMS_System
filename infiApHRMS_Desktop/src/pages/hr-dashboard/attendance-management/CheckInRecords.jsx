import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Download,
  MapPin,
  Clock,
  Calendar,
  ChevronDown,
  BellRing,
  X,
  Briefcase,
  Laptop,
  Loader2
} from 'lucide-react';
import { getAttendanceRecords } from '../../../services/hrApi';

const WORK_MODE_LABELS = {
  1: 'Office',
  2: 'WFH',
  3: 'Meeting',
  4: 'Offsite'
};

const STATUS_STYLES = {
  Present: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Late: 'bg-amber-50 text-amber-700 border-amber-100',
  Absent: 'bg-rose-50 text-rose-700 border-rose-100',
  'Checked Out': 'bg-blue-50 text-blue-700 border-blue-100'
};

function formatTime(dateStr) {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calcDuration(inTime, outTime) {
  if (!inTime || !outTime) return '--';
  const start = new Date(inTime);
  const end = new Date(outTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '--';
  const diffMs = end - start;
  if (diffMs < 0) return '--';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const CheckInRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isExporting, setIsExporting] = useState(false);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAttendanceRecords({ date: selectedDate, limit: 100 });
        const data = res.data?.data || [];
        // debug log removed

        const mapped = data.map((r, i) => ({
          id: r._id || r.employeeId || `rec-${i}`,
          name: r.name || 'Unknown',
          role: r.designation || r.team || 'Employee',
          checkIn: formatTime(r.inTime),
          checkOut: formatTime(r.outTime),
          inTimeRaw: r.inTime,
          outTimeRaw: r.outTime,
          duration: calcDuration(r.inTime, r.outTime),
          date: formatDate(r.inTime || selectedDate),
          status: r.status || 'Absent',
          mode: WORK_MODE_LABELS[r.workMode] || '—',
          device: r.device || '—',
          location: r.team || '—',
          ip: '—',
          latitude: r.latitude,
          longitude: r.longitude,
          isAway: r.isAway,
          avatar: r.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'U')}&background=e2e8f0&color=475569`
        }));

        setRecords(mapped);
        if (mapped.length > 0) setSelectedRecordId(mapped[0].id);
      } catch (err) {
        // debug error removed
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const filteredRecords = useMemo(() => {
    return records.filter(rec =>
      (rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       rec.role.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (activeFilter === 'All' || rec.status === activeFilter)
    );
  }, [searchQuery, records, activeFilter]);

  const selectedRecord = useMemo(() =>
    records.find(r => r.id === selectedRecordId) || records[0]
  , [selectedRecordId, records]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      const csv = [
        ['Name', 'Role', 'Date', 'Check In', 'Check Out', 'Duration', 'Status', 'Mode'].join(','),
        ...filteredRecords.map(r =>
          [r.name, r.role, r.date, r.checkIn, r.checkOut, r.duration, r.status, r.mode].map(escapeCsv).join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${selectedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setIsExporting(false);
      showNotification('CSV exported successfully');
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-6 pb-8 mt-4">

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowDatePicker(false)}></div>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full relative z-10 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">Select Date</h3>
              <button onClick={() => setShowDatePicker(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setShowDatePicker(false); }}
            />
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl">
          <BellRing size={18} className="text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-slate-400 hover:text-white"><X size={14} /></button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">Check-in Records</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">View employee attendance logs and punch details</p>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">

        {/* Left: Records Table */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or role..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {['All', 'Present', 'Late', 'Checked Out', 'Absent'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeFilter === filter
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <Loader2 size={24} className="animate-spin mr-2" />
                <span className="text-sm">Loading records...</span>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Clock size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No records found for this date</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check In</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check Out</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedRecordId(rec.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedRecordId === rec.id ? 'bg-indigo-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={rec.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover bg-slate-200"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.name)}&background=e2e8f0&color=475569`; }}
                          />
                          <div>
                            <p className={`text-sm font-semibold ${selectedRecordId === rec.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                              {rec.name}
                            </p>
                            <p className="text-xs text-slate-500">{rec.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-700">{rec.checkIn}</td>
                      <td className="px-5 py-3 text-sm text-slate-700">{rec.checkOut}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{rec.duration}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md border ${STATUS_STYLES[rec.status] || STATUS_STYLES.Absent}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{rec.mode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        </div>

        {/* Right: Detail Panel */}
        {selectedRecord && (
          <div className="w-full lg:w-[340px] flex flex-col gap-4 shrink-0 overflow-y-auto">

            {/* Profile Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedRecord.avatar}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover bg-slate-200"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedRecord.name)}&background=e2e8f0&color=475569`; }}
                />
                <div>
                  <h3 className="text-base font-bold text-slate-800">{selectedRecord.name}</h3>
                  <p className="text-xs text-slate-500">{selectedRecord.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Status</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded border ${STATUS_STYLES[selectedRecord.status] || STATUS_STYLES.Absent}`}>
                    {selectedRecord.status}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Work Mode</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{selectedRecord.mode}</p>
                </div>
              </div>
            </div>

            {/* Time Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={14} />
                    <span className="text-xs font-medium">Check In</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{selectedRecord.checkIn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={14} />
                    <span className="text-xs font-medium">Check Out</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{selectedRecord.checkOut}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Briefcase size={14} />
                    <span className="text-xs font-medium">Duration</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{selectedRecord.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span className="text-xs font-medium">Date</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{selectedRecord.date}</span>
                </div>
              </div>
            </div>

            {/* Location & Device */}
            {(selectedRecord.latitude || selectedRecord.longitude || selectedRecord.device !== '—') && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location & Device</h4>
                {selectedRecord.latitude && selectedRecord.longitude && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Coordinates</p>
                      <p className="text-sm font-mono text-slate-700">{selectedRecord.latitude.toFixed(6)}, {selectedRecord.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                )}
                {selectedRecord.device !== '—' && (
                  <div className="flex items-start gap-2">
                    <Laptop size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Device</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedRecord.device}</p>
                    </div>
                  </div>
                )}
                {selectedRecord.isAway && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                    <Clock size={14} className="text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Marked as away from office</span>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInRecords;
