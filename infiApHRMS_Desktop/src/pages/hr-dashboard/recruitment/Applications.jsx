import React, { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    Clock,
    Calendar,
    ArrowRight,
    ShieldCheck,
    AlertCircle,
    Undo2,
    Check,
    LayoutGrid,
    List,
    MapPin,
    Briefcase,
    UserPlus,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCandidateReview, shortlistCandidate, rejectCandidate } from '../../../services/hrApi';

const TABS = ['New', 'Shortlisted', 'Interview', 'Rejected', 'All'];

const STATUS_COLORS = {
    New: 'bg-indigo-50 text-indigo-600',
    Shortlisted: 'bg-emerald-50 text-emerald-600',
    Interview: 'bg-orange-50 text-orange-600',
    Rejected: 'bg-rose-50 text-rose-600',
    default: 'bg-slate-100 text-slate-600'
};

const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.default;

const formatDate = (value) => {
    if (!value || value === '—') return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const Applications = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('New');
    const [viewMode, setViewMode] = useState('Grid');
    const [notification, setNotification] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadApplicants = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getCandidateReview();
                const payload = Array.isArray(res.data?.data) ? res.data.data : [];
                const mapped = payload.map((item, index) => ({
                    id: item.id || item.candidateId || item._id || item.code || `CAN-${index + 1}`,
                    name: item.name || item.fullName || item.candidateName || `Candidate ${index + 1}`,
                    role: item.role || item.jobTitle || item.position || 'Role Pending',
                    dept: item.department || item.dept || item.team || '—',
                    location: item.location || item.city || item.workLocation || '—',
                    appliedAt: formatDate(item.appliedAt || item.createdAt || item.submittedAt),
                    status: item.status || item.stage || 'New',
                    avatar: item.avatar || item.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || item.fullName || 'C')}&background=random`
                }));

                if (isMounted) {
                    setApplicants(mapped);
                }
            } catch (err) {
                // debug error removed
                if (isMounted) setError('Failed to load applications. Please try again.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadApplicants();
        return () => { isMounted = false; };
    }, []);

    const tabCounts = TABS.reduce((acc, tab) => {
        acc[tab] = tab === 'All' ? applicants.length : applicants.filter((a) => a.status === tab).length;
        return acc;
    }, {});

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAction = async (id, newStatus) => {
        const action = newStatus === 'Shortlisted' ? shortlistCandidate : newStatus === 'Rejected' ? rejectCandidate : null;
        try {
            if (action) {
                await action(id, { status: newStatus });
            }
            setApplicants((prev) => prev.map((app) => app.id === id ? { ...app, status: newStatus } : app));
            showNotification(`Candidate moved to ${newStatus}`);
        } catch (err) {
            // debug error removed
            showNotification(`Failed to update candidate`);
        }
    };

    const filteredApplicants = applicants.filter((app) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = app.name.toLowerCase().includes(query) || app.role.toLowerCase().includes(query);
        const matchesTab = activeTab === 'All' || app.status === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-6 pt-4 overflow-hidden">

            {/* Notification */}
            {notification && (
                <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg">
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-sm">{notification}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/recruitment')}
                        className="p-2.5 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Undo2 size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Applications</h1>
                        <p className="text-sm text-slate-400 mt-0.5">Review and manage candidate applications</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-slate-100 rounded-lg">
                        <button
                            onClick={() => setViewMode('List')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'List' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('Grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'Grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => showNotification('Synchronizing candidate pool...')}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Sync
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-5 py-3 bg-white border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-56">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search applicants..."
                            className="w-full bg-white border border-slate-200 focus:border-primary-300 outline-none rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-700 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Loader2 size={28} className="text-slate-400 animate-spin" />
                        <p className="text-sm text-slate-400">Loading applications...</p>
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
                ) : filteredApplicants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-2">
                        <UserPlus size={28} className="text-slate-300" />
                        <p className="text-sm text-slate-400">No applications found</p>
                    </div>
                ) : (
                    <>
                        <div className={`grid ${viewMode === 'Grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-4`}>
                            {filteredApplicants.map((applicant) => (
                                <div key={applicant.id} className="bg-white p-5 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={applicant.avatar}
                                                className="w-12 h-12 rounded-lg object-cover border border-slate-100"
                                                alt={applicant.name}
                                            />
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">{applicant.name}</h3>
                                                <p className="text-xs text-slate-400">Applied {applicant.appliedAt}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(applicant.status)}`}>
                                            {applicant.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Briefcase size={13} className="text-slate-400" />
                                            {applicant.role}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <MapPin size={13} className="text-slate-400" />
                                            {applicant.location}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => navigate(`/recruitment/candidate/${applicant.id}`)}
                                            className="py-2 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <ShieldCheck size={13} />
                                            Review
                                        </button>
                                        <button
                                            onClick={() => handleAction(applicant.id, 'Shortlisted')}
                                            disabled={applicant.status === 'Shortlisted'}
                                            className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                                                applicant.status === 'Shortlisted'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 cursor-default'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                            }`}
                                        >
                                            Shortlist
                                        </button>
                                        <button
                                            onClick={() => navigate('/recruitment/interviews/schedule')}
                                            className="py-2 bg-orange-50 text-orange-600 border border-orange-100 text-xs font-medium rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Calendar size={13} />
                                            Schedule
                                        </button>
                                        <button
                                            onClick={() => handleAction(applicant.id, 'Rejected')}
                                            disabled={applicant.status === 'Rejected'}
                                            className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                                                applicant.status === 'Rejected'
                                                    ? 'bg-rose-50 text-rose-600 border-rose-100 cursor-default'
                                                    : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                                            }`}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Showing {filteredApplicants.length} of {applicants.length} applications
                            </p>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3].map((p) => (
                                    <button key={p} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                        p === 1 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 border border-slate-100'
                                    }`}>
                                        {p}
                                    </button>
                                ))}
                                <button className="w-8 h-8 rounded-lg border border-slate-100 text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center">
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Applications;
