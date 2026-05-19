import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCandidateTracking, scheduleCandidateInterview, getEmployees } from '../../../services/hrApi';

const ScheduleInterview = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        candidate: '',
        candidateId: '',
        role: '',
        type: 'Video Call',
        stage: '',
        interviewer: '',
        date: '',
        time: '',
        meetLink: '',
        location: '',
        phoneNumber: '',
        assignedHRs: []
    });

    const [candidates, setCandidates] = useState([]);
    const [employees, setEmployees] = useState([]);
    const stages = ['Screening', 'Technical Round', 'System Design', 'Culture Fit', 'HR Round'];
    const types = ['Video Call', 'On-site', 'Phone Call'];

    useEffect(() => {
        let isMounted = true;

        const loadCandidates = async () => {
            try {
                const res = await getCandidateTracking();
                const payload = Array.isArray(res.data?.data) ? res.data.data : [];
                const mapped = payload.map((item, index) => ({
                    id: item._id || item.id || item.candidateId || item.code || `CAN-${index + 1}`,
                    name: item.applicantName || item.name || item.fullName || item.candidateName || `Candidate ${index + 1}`,
                    role: item.jobTitle || item.role || item.position || 'Role Pending',
                    email: item.email || ''
                }));
                if (isMounted) setCandidates(mapped);
            } catch (err) {
                // ignore
            }
        };

        const loadEmployees = async () => {
            try {
                const res = await getEmployees();
                const payload = Array.isArray(res.data?.data) ? res.data.data : [];
                const mapped = payload.map((emp) => ({
                    id: emp._id || emp.id || '',
                    name: emp.name || 'Unknown',
                    designation: emp.designation || emp.role || ''
                }));
                if (isMounted && mapped.length) setEmployees(mapped);
            } catch (err) {
                // ignore
            }
        };

        loadCandidates();
        loadEmployees();

        return () => { isMounted = false; };
    }, []);

    const update = (field, value) => {
        if (field === 'candidate') {
            const selected = candidates.find((c) => c.id === value);
            setFormData((prev) => ({
                ...prev,
                candidateId: value,
                candidate: selected?.name || '',
                role: selected?.role || prev.role
            }));
        } else if (field === 'type') {
            setFormData((prev) => ({
                ...prev,
                type: value,
                meetLink: value === 'Video Call' ? prev.meetLink : '',
                location: value === 'On-site' ? prev.location : '',
                phoneNumber: value === 'Phone Call' ? prev.phoneNumber : ''
            }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    const toggleHR = (name) => {
        setFormData((prev) => {
            const exists = prev.assignedHRs.includes(name);
            return {
                ...prev,
                assignedHRs: exists
                    ? prev.assignedHRs.filter((n) => n !== name)
                    : [...prev.assignedHRs, name]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.candidateId) {
                await scheduleCandidateInterview(formData.candidateId, {
                    role: formData.role,
                    type: formData.type,
                    stage: formData.stage,
                    interviewer: formData.interviewer,
                    date: formData.date,
                    time: formData.time,
                    meetLink: formData.meetLink,
                    location: formData.location,
                    phoneNumber: formData.phoneNumber,
                    assignedHRs: formData.assignedHRs
                });
            }
            setSubmitted(true);
        } catch (err) {
            // ignore
        }
    };

    if (submitted) {
        return (
            <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
                <div className="max-w-md w-full bg-white p-10 rounded-xl shadow text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Interview Scheduled!</h2>
                    <p className="text-gray-500 text-sm mb-8">
                        Interview for <span className="font-medium text-gray-700">{formData.candidate || 'the candidate'}</span> has been scheduled.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/recruitment/interviews')}
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                        >
                            View Interviews
                        </button>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Schedule Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] w-full overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/recruitment/interviews')}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Schedule Interview</h1>
                    <p className="text-sm text-gray-400">Set up an interview with a candidate</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                {/* Candidate */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Candidate</label>
                    <select
                        required
                        value={formData.candidateId}
                        onChange={(e) => update('candidate', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="">Select a candidate</option>
                        {candidates.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Role */}
                {formData.role && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Applied Role</label>
                        <div className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-500">
                            {formData.role}
                        </div>
                    </div>
                )}

                {/* Stage & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Interview Stage</label>
                        <select
                            required
                            value={formData.stage}
                            onChange={(e) => update('stage', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Select stage</option>
                            {stages.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => update('type', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                            {types.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="date"
                                required
                                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                onChange={(e) => update('date', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                        <div className="relative">
                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="time"
                                required
                                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                onChange={(e) => update('time', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Conditional fields */}
                {formData.type === 'Video Call' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meet Link</label>
                        <input
                            type="url"
                            placeholder="https://meet.google.com/..."
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            value={formData.meetLink}
                            onChange={(e) => update('meetLink', e.target.value)}
                        />
                    </div>
                )}
                {formData.type === 'On-site' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                            type="text"
                            placeholder="Office address"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            value={formData.location}
                            onChange={(e) => update('location', e.target.value)}
                        />
                    </div>
                )}
                {formData.type === 'Phone Call' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            placeholder="Candidate phone number"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            value={formData.phoneNumber}
                            onChange={(e) => update('phoneNumber', e.target.value)}
                        />
                    </div>
                )}

                {/* Interviewer */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Interviewer</label>
                    <select
                        value={formData.interviewer}
                        onChange={(e) => update('interviewer', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="">Select interviewer</option>
                        {employees.map((e) => (
                            <option key={e.id} value={e.name}>{e.name}</option>
                        ))}
                    </select>
                </div>

                {/* Additional HRs */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional HRs</label>
                    <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                        {employees.length ? employees
                            .filter((e) => e.name !== formData.interviewer)
                            .map((e) => (
                                <label
                                    key={e.id}
                                    className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.assignedHRs.includes(e.name)}
                                        onChange={() => toggleHR(e.name)}
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">{e.name}</span>
                                </label>
                            )) : (
                            <div className="text-sm text-gray-400 px-2 py-2">No employees found</div>
                        )}
                    </div>
                    {formData.assignedHRs.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.assignedHRs.map((name) => (
                                <span
                                    key={name}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
                >
                    Schedule Interview
                </button>
            </form>
        </div>
    );
};

export default ScheduleInterview;
