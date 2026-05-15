import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  Check,
  X,
  Eye,
  Home,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/axios';

const PendingApproval = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [approval, setApproval] = useState({ approved: null, remarks: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const tabs = [
    { id: 'all', label: 'All Requests', icon: Clock, color: 'blue' },
    { id: 'leave', label: 'Leave Requests', icon: Calendar, color: 'green' },
    { id: 'wfh', label: 'Work From Home', icon: Home, color: 'purple' },
    { id: 'attendance', label: 'Attendance Correction', icon: AlertCircle, color: 'orange' },
  ];

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const [leaveRes, attendanceRes] = await Promise.all([
        api.get('/hr/leaves/pending-detailed'),
        api.get('/hr/attendance/correction/requests', { params: { status: 'Pending' } }),
      ]);

      const leaveRequests = (leaveRes.data?.data || []).map(leave => ({
        id: leave.id || leave._id,
        type: String(leave.type || '').toLowerCase().includes('wfh') || String(leave.type || '').toLowerCase().includes('work from home') ? 'wfh' : 'leave',
        category: leave.type || 'Leave Request',
        employeeName: leave.employeeName || 'Unknown',
        employeeId: leave.employeeId,
        department: leave.department || 'N/A',
        startDate: leave.fromDate,
        endDate: leave.toDate,
        days: leave.days || 1,
        reason: leave.reason || leave.Reason || '',
        status: leave.status || 'Pending',
        remarks: leave.remarks || leave.AdminRemarks || '',
        requestedAt: leave.requestedAt,
      }));

      const attendanceRequests = (attendanceRes.data?.data || []).map(attendance => ({
        id: attendance.id || attendance._id,
        type: 'attendance',
        category: 'Attendance Correction',
        employeeName: attendance.employeeName || 'Unknown',
        employeeId: attendance.employeeId,
        department: attendance.department || 'N/A',
        correctionDate: attendance.date || attendance.correctionDate,
        correctionType: attendance.correctionType || 'Attendance Correction',
        reason: attendance.reason || '',
        status: attendance.status || 'Pending',
        remarks: attendance.remarks || attendance.AdminRemarks || '',
        requestedAt: attendance.submittedAt || attendance.requestedAt,
      }));

      setRequests([...leaveRequests, ...attendanceRequests]);
    } catch (err) {
      // debug error removed
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request, approved) => {
    try {
      setActionLoading(true);
      const status = approved ? 'Approved' : 'Rejected';
      if (request.type === 'leave' || request.type === 'wfh') {
        await api.put('/hr/leaves/approve', {
          leaveId: request.id,
          status,
          reviewNote: approval.remarks,
        });
      } else if (request.type === 'attendance') {
        await api.put('/hr/attendance/correction/review', {
          correctionId: request.id,
          status,
          reviewNote: approval.remarks,
        });
      }
      
      setRequests(prev => prev.filter(r => r.id !== request.id));
      setShowModal(false);
      setApproval({ approved: null, remarks: '' });
      navigate('/leave');
    } catch (err) {
      // debug error removed
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (selectedTab === 'all') return requests;
    return requests.filter(r => r.type === selectedTab);
  };

  const getTypeIcon = (type) => {
    const icons = {
      leave: <Calendar className="w-4 h-4" />,
      wfh: <Home className="w-4 h-4" />,
      attendance: <AlertCircle className="w-4 h-4" />,
    };
    return icons[type] || null;
  };

  const getTypeColor = (type) => {
    const colors = {
      leave: 'bg-green-50 border-green-200 text-green-700',
      wfh: 'bg-purple-50 border-purple-200 text-purple-700',
      attendance: 'bg-orange-50 border-orange-200 text-orange-700',
    };
    return colors[type] || 'bg-gray-50';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = getFilteredRequests();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-500 mt-1">Manage all pending employee requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-blue-600">{requests.length}</span>
          </div>
          <button
            onClick={fetchPendingRequests}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          const count = tab.id === 'all' 
            ? requests.length 
            : requests.filter(r => r.type === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? `text-${tab.color}-600 border-${tab.color}-500`
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isActive ? `bg-${tab.color}-100 text-${tab.color}-700` : 'bg-gray-100 text-gray-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No pending approvals</p>
          <p className="text-gray-500 text-sm">All requests have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(request => (
            <div
              key={request.id}
              className={`p-4 rounded-lg border-2 ${getTypeColor(request.type)} hover:shadow-md transition-all cursor-pointer`}
              onClick={() => {
                setSelectedRequest(request);
                setShowModal(true);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getTypeIcon(request.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{request.employeeName}</h3>
                      <span className="text-xs font-medium bg-white px-2 py-1 rounded border">
                        {request.department}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      {(request.type === 'leave' || request.type === 'wfh') && (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                          <span className="text-xs bg-white px-2 py-1 rounded">({request.days} days)</span>
                        </>
                      )}
                      {request.type === 'attendance' && (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>{formatDate(request.correctionDate)}</span>
                          <span className="text-xs bg-white px-2 py-1 rounded">{request.correctionType}</span>
                        </>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 font-medium">{request.category}</p>
                    {request.reason && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    )}
                    {request.requestedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Requested: {formatDateTime(request.requestedAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(request);
                      setApproval({ approved: true, remarks: '' });
                      setShowModal(true);
                    }}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(request);
                      setApproval({ approved: false, remarks: '' });
                      setShowModal(true);
                    }}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(request);
                      setApproval({ approved: null, remarks: '' });
                      setShowModal(true);
                    }}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                {getTypeIcon(selectedRequest.type)}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedRequest.employeeName}</h2>
                  <p className="text-sm text-gray-500">{selectedRequest.category}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Employee</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedRequest.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Department</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedRequest.department}</p>
                </div>
              </div>

              {(selectedRequest.type === 'leave' || selectedRequest.type === 'wfh') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Start Date</p>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(selectedRequest.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">End Date</p>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(selectedRequest.endDate)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Days Requested</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedRequest.days} days</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Request Type</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedRequest.category}</p>
                    </div>
                  </div>
                </>
              )}

              {selectedRequest.type === 'attendance' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Correction Date</p>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(selectedRequest.correctionDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Correction Type</p>
                    <p className="text-sm text-gray-900 mt-1">{selectedRequest.correctionType}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Reason/Message</p>
                <p className="text-sm text-gray-900 mt-2 p-3 bg-gray-50 rounded border">{selectedRequest.reason || 'No reason provided'}</p>
              </div>

              {selectedRequest.requestedAt && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Requested On</p>
                  <p className="text-sm text-gray-900 mt-1">{formatDateTime(selectedRequest.requestedAt)}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Your Remarks</label>
                <textarea
                  value={approval.remarks}
                  onChange={(e) => setApproval({ ...approval, remarks: e.target.value })}
                  placeholder="Add your remarks for approval/rejection..."
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                Close
              </button>
              <button
                onClick={() => handleApprove(selectedRequest, false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedRequest, true)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApproval;
