import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DoorOpen,
  FileSignature,
  RefreshCw,
  Search,
  UserX,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getResignationRegister } from '../../../services/hrApi';

const getPayloadArray = (response) => {
  const payload = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.requests)) return payload.requests;
  if (Array.isArray(payload.resignations)) return payload.resignations;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const normalizeResignation = (item, index) => {
  const employee = item.employee || item.user || {};
  const employeeName = item.employeeName || item.name || employee.name || employee.fullName || 'Unknown Employee';
  const originalStatus = item.status || item.exitStatus || item.approvalStatus || 'Pending';
  const status = item.redirectedToAdmin ? 'Redirected to Admin' : originalStatus;

  return {
    id: item._id || item.id || item.resignationId || `RES-${index + 1}`,
    employeeName,
    employeeId: item.employeeId || employee.employeeId || employee.empId || 'N/A',
    department: item.department || employee.department || item.dept || 'N/A',
    role: item.role || item.designation || employee.role || employee.designation || 'N/A',
    reason: item.reason || item.exitReason || item.primaryReason || 'No reason provided',
    resignationDate: item.resignationDate || item.submittedAt || item.createdAt,
    lastWorkingDate: item.lastWorkingDate || item.noticeEndDate || item.exitDate,
    originalStatus,
    status,
    clearanceStatus: item.clearanceStatus || item.exitProcessStatus || item.clearance || 'Pending',
    profileImage: item.userId?.profileImage || item.employee?.profileImage || item.profileImage || null,
    redirectedToAdmin: item.redirectedToAdmin || false,
    actionedBy: item.actionedBy || null,
    redirectedByName: item.redirectedBy?.name || null
  };
};

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  InProgress: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'Redirected to Admin': 'bg-amber-50 text-amber-700 border-amber-200'
};

const ResignationHub = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const baseRoute = role === 'HR' ? '' : '/admin';
  const [requests, setRequests] = useState([]);
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchResignations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getResignationRegister();
      setRequests(getPayloadArray(response).map(normalizeResignation));
    } catch (err) {
      // debug error removed
      setRequests([]);
      setError('Unable to load resignation data. Please refresh once the HR API is available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignations();
  }, []);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus = activeStatus === 'All' || request.status === activeStatus;
      const matchesSearch = !query || [
        request.employeeName,
        request.employeeId,
        request.department,
        request.role,
        request.reason,
        request.status,
        request.clearanceStatus
      ].some((value) => String(value).toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, requests, searchQuery]);

  const statuses = ['All', ...Array.from(new Set(requests.map((request) => request.status).filter(Boolean)))];
  const pendingCount = requests.filter((request) => request.status === 'Pending').length;
  const activeCount = requests.filter((request) => !['Completed', 'Rejected'].includes(request.status)).length;
  const completedCount = requests.filter((request) => request.status === 'Completed').length;
  const clearancePending = requests.filter((request) => String(request.clearanceStatus).toLowerCase() !== 'completed').length;

  const cards = [
    { label: 'Active Exits', value: activeCount, icon: UserX, color: 'text-rose-600' },
    { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'text-amber-600' },
    { label: 'Clearance Pending', value: clearancePending, icon: DoorOpen, color: 'text-blue-600' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-emerald-600' }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] w-full gap-8 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-20">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-rose-300 underline-offset-8">Resignation</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-4 leading-none">Offboarding Lifecycle & Compliance Node Management</p>
        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={fetchResignations}
            disabled={loading}
            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Analytics Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-50 rounded-[32px] p-8 shadow-soft hover:shadow-3xl transition-all group border-b-4" style={{ borderBottomColor: card.color.includes('rose') ? '#f43f5e' : card.color.includes('amber') ? '#f59e0b' : card.color.includes('blue') ? '#3b82f6' : '#10b981' }}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <div className={`p-3 rounded-2xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                <card.icon size={20} />
              </div>
            </div>
            <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{card.value}</p>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Nodes</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Repository Area */}
      <div className="bg-white border border-slate-50 rounded-[44px] shadow-soft overflow-hidden flex-1 min-h-[500px] flex flex-col">
        
        {/* Table Toolbar */}
        <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/20">
          <div className="flex flex-wrap items-center gap-3">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  activeStatus === status
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                    : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search employee register..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[20px] text-xs font-black text-slate-600 outline-none focus:border-rose-200 transition-all shadow-sm uppercase tracking-tight placeholder:text-slate-300"
            />
          </div>
        </div>

        {error && (
          <div className="m-8 p-6 bg-rose-50 border border-rose-100 text-rose-700 rounded-3xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest shadow-sm">
            <div className="p-2 bg-white rounded-xl shadow-sm">
                <AlertCircle size={18} className="text-rose-500" />
            </div>
            {error}
          </div>
        )}

        {/* Data Grid */}
        <div className="flex-1 overflow-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 border-b border-slate-100">
              <tr>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Node</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resignation Intelligence</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chronology</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!selectedRequest ? (
                loading ? (
                  <tr>
                    <td colSpan="5" className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                          <RefreshCw size={32} className="text-slate-200 animate-spin" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing offboarding repository...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length ? (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => setSelectedRequest(request)}>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform overflow-hidden">
                                {request.profileImage ? (
                                  <img src={request.profileImage} alt={request.employeeName} className="w-full h-full object-cover" />
                                ) : (
                                  request.employeeName.split(' ').map(n=>n[0]).join('')
                                )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 group-hover:text-rose-600 transition-colors uppercase leading-none mb-1.5">{request.employeeName}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{request.department} • {request.role}</p>
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-600 max-w-xs truncate">{request.reason}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clearance: <span className="text-slate-600">{request.clearanceStatus}</span></p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tight">
                              <Clock size={13} className="text-slate-300" />
                              {formatDate(request.resignationDate)}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-tight">
                              <DoorOpen size={13} className="text-rose-300" />
                              Last Day: {formatDate(request.lastWorkingDate)}
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${statusStyles[request.status] || 'bg-slate-50 text-slate-600 border-slate-100 shadow-sm'}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); }}
                          className="px-6 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all uppercase tracking-widest active:scale-95 shadow-sm"
                        >
                          {['Approved', 'Rejected', 'Completed'].includes(request.status) ? 'View Node' : 'Review Node'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                          <DoorOpen size={40} className="text-slate-100" />
                          <div className="text-center">
                              <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">Zero Resignation Records Identified</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">The system repository is currently at maximum retention.</p>
                          </div>
                      </div>
                    </td>
                  </tr>
                )
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedRequest(null)} />
            <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-left">
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[20px] bg-slate-900 text-white flex items-center justify-center text-[11px] font-black overflow-hidden">
                    {selectedRequest.profileImage ? (
                      <img src={selectedRequest.profileImage} alt={selectedRequest.employeeName} className="w-full h-full object-cover" />
                    ) : (
                      selectedRequest.employeeName.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <div>
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${statusStyles[selectedRequest.status] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                      {selectedRequest.status}
                    </span>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{selectedRequest.employeeName}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedRequest.department} • {selectedRequest.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto space-y-6">
                {/* Previous Approval Banner */}
                {selectedRequest.redirectedToAdmin && selectedRequest.originalStatus === 'Approved' && selectedRequest.actionedBy && (
                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Previous Approval</p>
                    <p className="text-sm font-bold text-slate-700">Approved by HR: {selectedRequest.actionedBy}</p>
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-2">Redirected to Admin for Re-approval</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Employee ID</p>
                    <p className="text-sm font-black text-slate-700">{selectedRequest.employeeId}</p>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Clearance Status</p>
                    <p className="text-sm font-black text-slate-700">{selectedRequest.clearanceStatus}</p>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Resignation Date</p>
                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                      <Clock size={14} className="text-slate-300" />
                      {formatDate(selectedRequest.resignationDate)}
                    </div>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Working Day</p>
                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                      <DoorOpen size={14} className="text-rose-300" />
                      {formatDate(selectedRequest.lastWorkingDate)}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Resignation</p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedRequest.reason}</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
                >
                  Close
                </button>
                {!['Approved', 'Rejected', 'Completed'].includes(selectedRequest.status) && (
                  <button
                    onClick={() => { setSelectedRequest(null); navigate(`${baseRoute}/resignation/requests`); }}
                    className="px-8 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md active:scale-95"
                  >
                    Open Full Queue
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytical Footer */}
        <div className="px-10 py-6 bg-slate-900 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-6">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Audit: {filteredRequests.length} / {requests.length} Nodes Resolved</p>
              <div className="w-px h-4 bg-white/10 hidden md:block"></div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Compliance Engine Active</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResignationHub;
