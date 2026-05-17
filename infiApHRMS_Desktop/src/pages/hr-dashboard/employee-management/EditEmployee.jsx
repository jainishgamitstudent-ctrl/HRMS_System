import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    MapPin,
    Briefcase,
    DollarSign,
    ShieldCheck,
    CheckCircle,
    Sparkles,
    ArrowRight,
    Save,
    AlertCircle,
    Activity,
    Shield,
    TrendingUp,
    Clock,
    UserPlus,
    Camera,
    X,
    Upload,
    Moon
} from 'lucide-react';
import { useEmployeeContext } from '../../../context/EmployeeContext';

const EditEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';
    const { employees, updateEmployee } = useEmployeeContext();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        department: '',
        manager: '',
        location: '',
        status: '',
        profilePicture: '',
        joiningDate: '',
        doubleShiftAllowed: false
    });

    // --- IDENTITY FETCH ---
    useEffect(() => {
        const employee = employees.find(emp => emp.id === id || emp._id === id);
        if (employee) {
            setFormData({
                name: employee.name,
                email: employee.email,
                role: employee.role,
                department: employee.department,
                manager: employee.manager,
                location: employee.location || 'Mumbai Office',
                status: employee.status,
                profilePicture: employee.profileImage || employee.profilePicture || '',
                joiningDate: employee.joiningDate ? employee.joiningDate.slice(0, 10) : '',
                doubleShiftAllowed: employee.doubleShiftAllowed ?? false
            });
            // Set existing profile image preview
            if (employee.profileImage || employee.profilePicture) {
                setProfileImagePreview(employee.profileImage || employee.profilePicture);
            }
        } else if (employees.length > 0) {
            setError("Employee Identity Not Found");
        }
    }, [id, employees]);

    // --- IMAGE UPLOAD HANDLER ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setSubmitError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setSubmitError('Image size must be less than 5MB');
                return;
            }
            setProfileImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setSubmitError('');
        }
    };

    const removeImage = () => {
        setProfileImageFile(null);
        setProfileImagePreview(null);
        setFormData(prev => ({ ...prev, profilePicture: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        // Include profile image file in form data if selected
        const submitData = {
            ...formData,
            ...(profileImageFile && { profilePicture: profileImageFile })
        };

        const result = await updateEmployee(id, submitData);

        setIsSubmitting(false);

        if (result?.success === false) {
            setSubmitError(result.error || 'Failed to update employee');
        } else {
            setShowModal(true);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-in fade-in zoom-in-95">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">Error</h2>
                <p className="text-slate-500 text-sm mb-8">{error}</p>
                <button 
                         onClick={() => navigate(`${basePath}/employees`)}
                   className="px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                >
                    Back to Employees
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pt-4 overflow-hidden">

            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"></div>
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full relative z-10 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                            <CheckCircle size={32} strokeWidth={2} />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">Employee Updated</h2>
                        <p className="text-slate-500 text-sm mb-6">
                            Employee record has been successfully updated.
                        </p>
                        <button
                            onClick={() => navigate(`${basePath}/employees`)}
                            className="w-full py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Back to Employees
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(`${basePath}/employees`)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">
                            Edit Employee
                        </h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">
                            Update Employee Information
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 self-start lg:self-center">
                    <button
                        onClick={() => navigate(`${basePath}/employees`)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center gap-2"
                    >
                       {isSubmitting ? (
                           <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                       ) : <Save size={16} />}
                       Save Changes
                    </button>
                </div>
            </div>

            {/* Main Workspace Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden min-h-0">
                
                {/* Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6">
                   <div className="bg-white border border-slate-200 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-indigo-500" />
                            Status
                        </h3>
                        <div className="space-y-2">
                            {['New Hire', 'Onboarding', 'Active', 'On Leave', 'Resigned', 'Terminated'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, status }))}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                                        formData.status === status 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-sm font-medium">{status}</span>
                                    <div className={`w-2 h-2 rounded-full ${
                                        status === 'Active' ? 'bg-emerald-500' : 
                                        status === 'On Leave' ? 'bg-amber-500' : 
                                        (status === 'Resigned' || status === 'Terminated') ? 'bg-red-500' :
                                        'bg-indigo-500'
                                    }`} />
                                </button>
                            ))}
                        </div>
                   </div>

                   {/* Shift Permissions */}
                   <div className="bg-white border border-slate-200 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Moon size={16} className="text-indigo-500" />
                            Shift Permissions
                        </h3>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, doubleShiftAllowed: !prev.doubleShiftAllowed }))}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                                    formData.doubleShiftAllowed
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Moon size={16} />
                                    <span className="text-sm font-medium">Double Shift</span>
                                </div>
                                <div className={`w-10 h-5 rounded-full transition-colors relative ${
                                    formData.doubleShiftAllowed ? 'bg-indigo-500' : 'bg-slate-300'
                                }`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                        formData.doubleShiftAllowed ? 'translate-x-5' : 'translate-x-0.5'
                                    }`} />
                                </div>
                            </button>
                            <p className="text-xs text-slate-500">
                                {formData.doubleShiftAllowed
                                    ? 'Employee can enable double shift on the mobile app.'
                                    : 'Employee cannot use double shift. Toggle to grant permission.'}
                            </p>
                        </div>
                   </div>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-3 flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl overflow-hidden">
                   <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                         
                         <section className="space-y-4">
                            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <User size={16} className="text-indigo-500" />
                                Personal Information
                            </h2>

                            {/* Profile Image Upload */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="relative">
                                    {profileImagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={profileImagePreview}
                                                alt="Profile Preview"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-md">
                                            <User size={32} className="text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800 mb-1">Profile Picture</p>
                                    <p className="text-xs text-slate-500 mb-3">Upload a photo (JPEG, PNG, GIF, WebP - max 5MB)</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="profile-image-upload"
                                    />
                                    <label
                                        htmlFor="profile-image-upload"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                                    >
                                        <Camera size={16} />
                                        {profileImagePreview ? 'Change Photo' : 'Upload Photo'}
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                   <label className="text-xs font-medium text-slate-600">Full Name</label>
                                   <input
                                       name="name"
                                       value={formData.name}
                                       onChange={handleChange}
                                       required
                                       type="text"
                                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                   />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-xs font-medium text-slate-600">Email</label>
                                   <input
                                       name="email"
                                       value={formData.email}
                                       onChange={handleChange}
                                       required
                                       type="email"
                                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                   />
                               </div>
                            </div>
                         </section>

                         <section className="space-y-4">
                            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <Briefcase size={16} className="text-indigo-500" />
                                Work Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                   <label className="text-xs font-medium text-slate-600">Role</label>
                                   <input
                                       name="role"
                                       value={formData.role}
                                       onChange={handleChange}
                                       required
                                       type="text"
                                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                   />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-xs font-medium text-slate-600">Department</label>
                                   <select
                                       name="department"
                                       value={formData.department}
                                       onChange={handleChange}
                                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all"
                                   >
                                       <option>Engineering</option>
                                       <option>Product & Design</option>
                                       <option>Operations</option>
                                       <option>Marketing</option>
                                       <option>Human Resources</option>
                                   </select>
                               </div>
                               <div className="space-y-2">
                                   <label className="text-xs font-medium text-slate-600">Manager</label>
                                   <input
                                       name="manager"
                                       value={formData.manager}
                                       onChange={handleChange}
                                       required
                                       type="text"
                                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                   />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-xs font-medium text-slate-600">Location</label>
                                   <div className="relative">
                                       <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                       <input
                                           name="location"
                                           value={formData.location}
                                           onChange={handleChange}
                                           type="text"
                                           className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                       />
                                   </div>
                               </div>
                               <div className="space-y-2">
                                   <label className="text-xs font-medium text-slate-600">Joining Date</label>
                                   <input
                                       name="joiningDate"
                                       value={formData.joiningDate}
                                       onChange={handleChange}
                                       type="date"
                                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                   />
                               </div>
                            </div>
                         </section>

                         {submitError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                {submitError}
                            </div>
                         )}

                      </form>
                   </div>
                </div>
            </div>

        </div>
    );
};

export default EditEmployee;
