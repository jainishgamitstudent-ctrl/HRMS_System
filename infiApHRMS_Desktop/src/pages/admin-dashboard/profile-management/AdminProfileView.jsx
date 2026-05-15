import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Building2,
  Briefcase,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getAdminProfile } from '../../../services/adminApi';

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-IN', {
    day: 'short',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const normalizeRoleLabel = (role) => {
  if (!role) return 'Admin';
  const value = String(role).trim();
  if (!value) return 'Admin';
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const normalizeAdminProfile = (apiData, authUser) => {
  const raw = apiData?.profile || apiData || {};
  return {
    name: raw.adminName || raw.name || authUser?.name || '',
    email: raw.email || authUser?.email || '',
    phone: raw.phone || authUser?.phone || '',
    address: raw.address || authUser?.address || '',
    department: raw.department || authUser?.department || '',
    designation: raw.designation || authUser?.designation || '',
    role: raw.role || authUser?.role || '',
    employeeId: raw.employeeId || authUser?.employeeId || '',
    joiningDate: raw.joiningDate || authUser?.joiningDate || '',
    profileImage: raw.profileImage || authUser?.profileImage || authUser?.profilePicture || authUser?.avatar || '',
    dob: raw.dob || authUser?.dob || '',
    createdAt: raw.createdAt || authUser?.createdAt,
    updatedAt: raw.updatedAt || authUser?.updatedAt,
    _id: raw._id || raw.id || authUser?._id || authUser?.id,
  };
};

const AdminProfileView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await getAdminProfile();
        if (!isMounted) return;
        setProfile(response.data?.data || null);
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.error || 'Failed to load admin profile');
        setProfile(user || null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayData = useMemo(() => normalizeAdminProfile(profile, user), [profile, user]);

  const initials = useMemo(() => {
    const parts = String(displayData.name || 'Admin')
      .split(' ')
      .filter(Boolean);
    if (!parts.length) return 'A';
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }, [displayData.name]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-600 font-medium">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  if (error && !displayData.name) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">My Profile</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Personal Information & Professional Details</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/employees/edit')}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Edit3 size={14} /> Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Avatar & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-xl border-4 border-white overflow-hidden">
                {displayData.profileImage ? (
                  <img
                    src={displayData.profileImage}
                    alt={displayData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-white">{initials}</span>
                )}
              </div>
            </div>

            {/* Name & Title */}
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{displayData.name || 'N/A'}</h2>
              <p className="text-sm font-black text-indigo-600 uppercase tracking-wider mb-1">{displayData.designation || displayData.role || 'N/A'}</p>
              <p className="text-xs text-slate-500 font-medium">{displayData.department || 'Department not set'}</p>
            </div>

            {/* Employee ID */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Employee ID</span>
                <span className="text-sm font-black text-slate-800">{displayData.employeeId || displayData._id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Active</span>
            </div>
          </div>
        </div>

        {/* Right Side - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <User size={18} className="text-indigo-600" />
              </div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl">{displayData.name || 'Not set'}</p>
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Joining Date</label>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl">{formatDate(displayData.joiningDate)}</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                  <Phone size={16} className="text-slate-400" />
                  <p className="text-sm font-bold text-slate-800">{displayData.phone || 'Not set'}</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                  <Mail size={16} className="text-slate-400" />
                  <p className="text-sm font-bold text-slate-800">{displayData.email || 'Not set'}</p>
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Address</label>
                <div className="flex items-start gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                  <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-bold text-slate-800">{displayData.address || 'Not added yet'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Briefcase size={18} className="text-indigo-600" />
              </div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Professional Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Department</label>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                  <Building2 size={16} className="text-slate-400" />
                  <p className="text-sm font-bold text-slate-800">{displayData.department || 'Not set'}</p>
                </div>
              </div>

              {/* Role / Designation */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Role</label>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl">{displayData.designation || displayData.role || 'Not set'}</p>
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Employee ID</label>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl">{displayData.employeeId || 'N/A'}</p>
              </div>

              {/* System Role */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">System Role</label>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl">{normalizeRoleLabel(displayData.role)}</p>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-xs text-slate-600">Last updated</span>
            </div>
            <span className="text-xs font-bold text-slate-700">
              {displayData.updatedAt ? formatDateTime(displayData.updatedAt) : 'Just now'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileView;