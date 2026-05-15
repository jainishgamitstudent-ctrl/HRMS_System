import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Building2,
  AlertCircle,
  Loader2,
  Check,
  Camera
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getAdminProfile, updateAdminProfile } from '../../../services/adminApi';

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const normalizeRoleLabel = (role) => {
  if (!role) return 'Admin';
  return String(role)
    .split(' ')
    .filter(Boolean)
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
    createdAt: raw.createdAt || authUser?.createdAt,
    updatedAt: raw.updatedAt || authUser?.updatedAt,
    _id: raw._id || raw.id || authUser?._id || authUser?.id,
  };
};

const AdminProfileEdit = () => {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    designation: '',
    employeeId: '',
    joiningDate: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await getAdminProfile();
        const data = normalizeAdminProfile(response.data?.data, user) || {};

        if (!isMounted) return;

        setProfile(response.data?.data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          department: data.department || '',
          designation: data.designation || data.role || '',
          employeeId: data.employeeId || data._id?.slice(0, 8).toUpperCase() || '',
          joiningDate: data.joiningDate ? data.joiningDate.split('T')[0] : '',
          profileImage: data.profileImage || ''
        });
      } catch (err) {
        if (!isMounted) return;
        const fallback = normalizeAdminProfile({}, user);
        setProfile({});
        setFormData({
          name: fallback.name || '',
          email: fallback.email || '',
          phone: fallback.phone || '',
          address: fallback.address || '',
          department: fallback.department || '',
          designation: fallback.designation || fallback.role || '',
          employeeId: fallback.employeeId || fallback._id?.slice(0, 8).toUpperCase() || '',
          joiningDate: fallback.joiningDate ? fallback.joiningDate.split('T')[0] : '',
          profileImage: fallback.profileImage || ''
        });
        setError(err.response?.data?.error || 'Failed to load admin profile');
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

  const initials = useMemo(() => {
    const parts = String(formData.name || 'Admin')
      .split(' ')
      .filter(Boolean);
    if (!parts.length) return 'A';
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }, [formData.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Profile image must be 2MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profileImage: String(reader.result || '') }));
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, profileImage: '' }));
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = { ...formData };
      delete payload.employeeId;

      const response = await updateAdminProfile(payload);
      const updatedProfile = response.data?.data || profile || {};

      setProfile(updatedProfile);
      setSuccess(true);

      if (typeof fetchProfile === 'function') {
        await fetchProfile();
      }

      setTimeout(() => {
        navigate('/admin/employees/view');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update admin profile');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-40 px-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/profile')}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Back to profile"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Edit Profile</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Update your personal and professional information</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-in slide-in-from-top">
          <Check className="w-5 h-5 text-emerald-600" />
          <p className="text-emerald-800 font-medium">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded">
            <X size={18} className="text-red-600" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Camera size={18} className="text-indigo-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Profile Picture</h3>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
              {formData.profileImage ? (
                <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-white">{initials}</span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-600 text-center">Current Avatar</p>
            <div className="mt-4 flex items-center gap-2">
              <input
                ref={avatarInputRef}
                id="admin-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label
                htmlFor="admin-avatar-upload"
                className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Change
              </label>
              {formData.profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">PNG or JPG up to 2MB</p>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full bg-white border border-slate-100 hover:border-slate-200 focus:border-indigo-500 outline-none rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full bg-white border border-slate-100 hover:border-slate-200 focus:border-indigo-500 outline-none rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Phone Number</label>
              <div className="flex items-center gap-3 bg-white border border-slate-100 hover:border-slate-200 focus-within:border-indigo-500 rounded-xl px-4 py-3.5 transition-all">
                <Phone size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Email Address</label>
              <div className="flex items-center gap-3 bg-white border border-slate-100 hover:border-slate-200 focus-within:border-indigo-500 rounded-xl px-4 py-3.5 transition-all">
                <Mail size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Address</label>
              <div className="flex items-start gap-3 bg-white border border-slate-100 hover:border-slate-200 focus-within:border-indigo-500 rounded-xl px-4 py-3.5 transition-all">
                <MapPin size={16} className="text-slate-400 mt-1.5 flex-shrink-0" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="3"
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Briefcase size={18} className="text-indigo-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Professional Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Department</label>
              <div className="flex items-center gap-3 bg-white border border-slate-100 hover:border-slate-200 focus-within:border-indigo-500 rounded-xl px-4 py-3.5 transition-all">
                <Building2 size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Human Resources"
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Role / Designation */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Role / Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g., Senior Developer"
                className="w-full bg-white border border-slate-100 hover:border-slate-200 focus:border-indigo-500 outline-none rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all"
              />
            </div>

            {/* Employee ID (Read-only) */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                disabled
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/employees/view')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
          >
            <X size={16} />
            Cancel
          </button>
        </div>

        {/* Help Text */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">
            <span className="font-bold">Tip:</span> Employee ID is automatically assigned and cannot be changed. Update your contact information to stay connected.
          </p>
        </div>
      </form>
    </div>
  );
};

export default AdminProfileEdit;