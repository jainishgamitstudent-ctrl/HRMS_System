import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getHrProfile, updateProfile } from '../../../services/hrApi';
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
  Upload,
  Camera,
  Trash2
} from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    designation: '',
    employeeId: '',
    joiningDate: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id && !user?.id) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await getHrProfile();
        const apiData = response.data?.data || {};
        
        // Normalize HR profile data from API response
        const profileData = {
          name: apiData?.header?.name || apiData?.name || user?.name || '',
          email: apiData?.personalInfo?.emailId || apiData?.email || user?.email || '',
          phone: apiData?.personalInfo?.phoneNumber || apiData?.phone || user?.phone || '',
          address: apiData?.personalInfo?.address || apiData?.address || user?.address || '',
          department: apiData?.professionalInfo?.department || apiData?.department || user?.department || '',
          designation: apiData?.professionalInfo?.designation || apiData?.header?.post || apiData?.designation || user?.designation || '',
          employeeId: apiData?.professionalInfo?.employeeId || apiData?.header?.hrId || apiData?.employeeId || user?.employeeId || '',
          joiningDate: apiData?.personalInfo?.joiningDate || apiData?.joiningDate || user?.joiningDate || ''
        };

        setFormData({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          department: profileData.department,
          designation: profileData.designation,
          employeeId: profileData.employeeId || user?._id?.slice(0, 8).toUpperCase() || '',
          joiningDate: profileData.joiningDate ? profileData.joiningDate.split('T')[0] : ''
        });
      } catch (err) {
        // debug error removed
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          address: user?.address || '',
          department: user?.department || '',
          designation: user?.designation || user?.role || '',
          employeeId: user?.employeeId || user?._id?.slice(0, 8).toUpperCase() || '',
          joiningDate: user?.joiningDate ? user.joiningDate.split('T')[0] : ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should not exceed 5MB');
      return;
    }

    setProfilePicture(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      const profileData = {
        ...formData,
      };

      delete profileData.employeeId;

      await updateProfile(userId, profileData, profilePicture);

      // Refresh auth context user data so navbar shows updated info
      if (typeof fetchProfile === 'function') {
        await fetchProfile();
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
      // debug error removed
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-40 px-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current/Preview Avatar */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
                {profilePicturePreview ? (
                  <img src={profilePicturePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-white">
                    {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-600 text-center">Preview</p>
            </div>

            {/* Upload Area */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    dragActive ? 'bg-indigo-200' : 'bg-slate-200'
                  }`}>
                    <Upload size={24} className={dragActive ? 'text-indigo-600' : 'text-slate-600'} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              {profilePicture && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-200 hover:bg-red-100 transition-all"
                >
                  <Trash2 size={14} />
                  Remove Image
                </button>
              )}

              {/* File Info */}
              {profilePicture && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <Check size={16} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">{profilePicture.name}</p>
                    <p className="text-[10px] text-emerald-700">{(profilePicture.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}
            </div>
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
            onClick={() => navigate('/profile')}
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

export default EditProfile;
