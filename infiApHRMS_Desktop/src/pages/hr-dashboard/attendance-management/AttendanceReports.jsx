import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Calendar,
  BellRing,
  X,
  FileText,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAttendanceReports } from '../../../services/hrApi';

const STATUS_STYLES = {
  Ready: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Processing: 'bg-amber-50 text-amber-700 border-amber-100',
  Failed: 'bg-rose-50 text-rose-700 border-rose-100'
};

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const AttendanceReports = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceReports();
      // debug log removed
      // debug log removed
      // debug log removed
      // debug log removed
      
      // Handle different possible response structures
      let reportsData = [];
      
      // Check for reports array in various locations
      if (res?.data?.data?.reports && Array.isArray(res.data.data.reports)) {
        reportsData = res.data.data.reports;
      } else if (res?.data?.reports && Array.isArray(res.data.reports)) {
        reportsData = res.data.reports;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        reportsData = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        reportsData = res.data;
      } else if (Array.isArray(res)) {
        reportsData = res;
      } else {
        // Try to find an array in the response object
        const searchForArray = (obj) => {
          if (!obj || typeof obj !== 'object') return null;
          for (const key in obj) {
            if (Array.isArray(obj[key]) && obj[key].length > 0) {
              // debug log removed
              return obj[key];
            }
            const found = searchForArray(obj[key]);
            if (found) return found;
          }
          return null;
        };
        reportsData = searchForArray(res) || [];
      }
      
      // debug log removed
      
      if (Array.isArray(reportsData) && reportsData.length > 0) {
        const mappedReports = reportsData.map(r => ({
          id: r._id || r.id || Math.random().toString(36).substr(2, 9),
          title: r.title || r.name || r.reportName || 'Attendance Report',
          date: r.date || r.generatedDate || r.createdAt ? formatDate(r.date || r.generatedDate || r.createdAt) : 'N/A',
          type: r.type || r.category || r.reportType || 'Standard',
          status: r.status || 'Ready',
          size: r.size || r.fileSize || '—',
          path: r.path || r.url || r.downloadUrl || '#'
        }));
        setReports(mappedReports);
      } else {
        setReports([]);
      }
    } catch (err) {
      // debug error removed
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);


  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ['Title', 'Date', 'Type', 'Status', 'Size'];
      const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      const rows = reports.map(r => [
        r.title,
        r.date,
        r.type,
        r.status,
        r.size
      ].map(escapeCsv).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance-reports.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setIsExporting(false);
      showNotification('CSV exported successfully');
    }, 500);
  };

  const filteredReports = reports.filter(rep =>
    rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-6 pb-8 mt-4">

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl">
          <BellRing size={18} className="text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">Attendance Reports</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">View and manage attendance report archives</p>
        </div>
        <div className="flex items-center gap-3 self-start lg:self-center">
          <button
            onClick={handleExport}
            disabled={isExporting || reports.length === 0}
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
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-0">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by title or type..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <Loader2 size={24} className="animate-spin mr-2" />
              <span className="text-sm">Loading reports...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <FileText size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No reports found</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Report</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((rep) => (
                  <tr
                    key={rep.id}
                    onClick={() => rep.path !== '#' && navigate(rep.path)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                          <FileText size={18} />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{rep.title}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700">{rep.date}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{rep.type}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md border ${STATUS_STYLES[rep.status] || STATUS_STYLES.Ready}`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{rep.size}</td>
                    <td className="px-5 py-3">
                      <Calendar size={16} className="text-slate-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;
