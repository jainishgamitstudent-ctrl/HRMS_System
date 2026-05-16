import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Lock,
    ChevronDown,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { register, error: authError, setError } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin',
    });

    const roles = [
        { name: 'admin', label: 'Admin', desc: 'Standard administrative node' },
        { name: 'hr', label: 'HR', desc: 'Personnel lifecycle management' }
    ];

    const selectedRoleObj = roles.find(r => r.name === formData.role);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setLocalError('');
        if (setError) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);

        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        });

        setIsSubmitting(false);

        if (result.success) {
            navigate('/auth-success', { replace: true });
        } else {
            setLocalError(result.error || 'Registration failed');
        }
    };

    const displayError = localError || authError;

    return (
        <AuthLayout>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_16px_36px_-14px_rgba(38,20,91,0.28)] border border-[#EAE5F8] flex flex-col">
                
                {/* Header Cluster */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-3">Create account</h1>
                    <p className="text-sm font-medium text-gray-400 leading-relaxed max-w-[320px] mx-auto">
                        Join InfiAP and begin your workforce orchestration journey.
                    </p>
                </div>

                {/* Error Alert */}
                {displayError && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <p className="text-xs font-semibold text-red-600">{displayError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Input Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#6C5CE7] transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                    className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium text-gray-800 focus:ring-4 focus:ring-[#6C5CE7]/5 focus:bg-white focus:border-[#6C5CE7] transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#6C5CE7] transition-colors" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="name@company.com"
                                    className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium text-gray-800 focus:ring-4 focus:ring-[#6C5CE7]/5 focus:bg-white focus:border-[#6C5CE7] transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2 relative">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Your Role</label>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full bg-[#F8FAFC] border ${isDropdownOpen ? 'border-[#6C5CE7] ring-4 ring-[#6C5CE7]/5 shadow-sm' : 'border-gray-100'} rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all hover:bg-white group`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#6C5CE7] shadow-sm border border-gray-50">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#1A1A1A] leading-none mb-1">{selectedRoleObj?.label}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{selectedRoleObj?.desc}</span>
                                </div>
                            </div>
                            <ChevronDown size={18} className={`text-gray-300 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-50 rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-1">
                                    {roles.map((role) => (
                                        <div
                                            key={role.name}
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, role: role.name }));
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all cursor-pointer group ${formData.role === role.name ? 'bg-[#6C5CE7]/5' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${formData.role === role.name ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-[#6C5CE7]'}`}>
                                                <ShieldCheck size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-xs font-bold text-[#1A1A1A]">{role.label}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{role.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Password Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#6C5CE7] transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl pl-12 pr-12 py-4 text-sm font-medium text-gray-800 focus:ring-4 focus:ring-[#6C5CE7]/5 focus:bg-white focus:border-[#6C5CE7] transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#6C5CE7] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#6C5CE7] transition-colors" size={18} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl pl-12 pr-12 py-4 text-sm font-medium text-gray-800 focus:ring-4 focus:ring-[#6C5CE7]/5 focus:bg-white focus:border-[#6C5CE7] transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#6C5CE7] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TOS */}
                    <label className="flex items-start gap-4 cursor-pointer group text-left px-1 mt-2">
                        <div className="relative mt-1">
                            <input type="checkbox" className="sr-only peer" required />
                            <div className="w-5 h-5 bg-gray-50 border border-gray-200 rounded-lg peer-checked:bg-[#6C5CE7] peer-checked:border-[#6C5CE7] transition-all shadow-sm"></div>
                            <CheckCircle2 size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
                            I synchronize with the <span className="text-[#6C5CE7] font-bold hover:underline">InfiAP Protocol</span> and Terms of Deployment.
                        </span>
                    </label>

                    {/* Action Hub */}
                    <div className="space-y-6 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4.5 font-bold rounded-2xl shadow-lg shadow-[#6C5CE7]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                                isSubmitting
                                    ? 'bg-[#6C5CE7]/70 text-white cursor-wait'
                                    : 'bg-linear-to-r from-[#6C5CE7] to-[#5A4BDA] text-white hover:shadow-xl hover:shadow-[#6C5CE7]/30'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                        <p className="text-center text-sm font-medium text-gray-500">
                            Already have an identity?
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-[#6C5CE7] font-bold ml-2 hover:underline"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>

                </form>
            </div>
        </AuthLayout>
    );
};

export default Signup;
