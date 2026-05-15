import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getHrProfile } from '../../../services/hrApi';
import {
  ArrowLeft,
  Edit,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Building2,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Helper function to safely format dates
const formatDisplayDate = (dateValue) => {
  if (!dateValue) return 'Just now';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'Just now';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const MyProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getHrProfile();
        // debug log removed
        
        // Check if response has data
        if (!response.data || !response.data.data) {
          throw new Error('No profile data received');
        }
        
        const apiData = response.data.data;
        
        // Normalize HR profile data from API response
        const normalizedProfile = {
          name: apiData?.header?.name || apiData?.personalInfo?.fullName || 'Not specified',
          email: apiData?.personalInfo?.emailId || '',
          phone: apiData?.personalInfo?.phoneNumber || 'Not provided',
          address: apiData?.personalInfo?.address || 'No address added',
          department: apiData?.professionalInfo?.department || 'Not assigned',
          designation: apiData?.professionalInfo?.designation || apiData?.header?.post || 'HR Administrator',
          role: apiData?.administrativeAccess?.accessLevel || 'HR',
          employeeId: apiData?.professionalInfo?.employeeId || apiData?.header?.hrId || 'EMP-' + (user?._id?.slice(0, 6).toUpperCase() || '000'),
          joiningDate: apiData?.personalInfo?.joiningDate || null,
          profilePicture: apiData?.header?.profileImage || null,
          updatedAt: apiData?.updatedAt || new Date().toISOString()
        };
        
        // debug log removed
        setProfile(normalizedProfile);
      } catch (err) {
        // debug error removed
        setError(err.message || 'Failed to load profile');
        // Fallback to user data from auth context
        if (user) {
          setProfile({
            name: user.name || 'Not specified',
            email: user.email || '',
            phone: user.phone || 'Not provided',
            address: user.address || 'No address added',
            department: user.department || 'Not assigned',
            designation: user.designation || 'HR Administrator',
            role: user.role || 'HR',
            employeeId: user.employeeId || 'EMP-' + (user._id?.slice(0, 6).toUpperCase() || '000'),
            joiningDate: user.joiningDate || null,
            profilePicture: user.profileImage || null,
            updatedAt: new Date().toISOString()
          });
        }
      } finally {
        setLoading(false);
      }
    };

    // Always fetch profile - API will handle auth via cookies
    fetchProfile();
  }, []); // Remove dependency - fetch once on mount

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  const displayData = profile || user || {};
  const initials = displayData.name ? displayData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">My Profile</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Personal Information & Professional Details</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/profile/edit')}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Edit size={14} /> Edit Profile
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
                {displayData.profilePicture || displayData.avatar ? (
                  <img 
                    src={displayData.profilePicture || displayData.avatar} 
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
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl">
                  {displayData.joiningDate
                    ? new Date(displayData.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Not set'}
                </p>
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

              {/* Role */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Role</label>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl">{displayData.designation || displayData.role || 'Not set'}</p>
              </div>

              {/* Employee ID (Professional) */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Employee ID</label>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl">{displayData.employeeId || 'N/A'}</p>
              </div>

              {/* System Role */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">System Role</label>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl">{displayData.role || 'employee'}</p>
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
              {displayData.updatedAt
                ? formatDisplayDate(displayData.updatedAt)
                : 'Just now'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
