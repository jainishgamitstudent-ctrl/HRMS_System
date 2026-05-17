import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff,
    Check,
    AlertCircle,
    Loader2,
    ShieldCheck,
    Users,
    UserCog
} from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
    { value: 'admin', label: 'Admin', icon: ShieldCheck },
    { value: 'hr', label: 'HR', icon: UserCog },
];

const Login = () => {
    const navigate = useNavigate();
    const { login, error: authError, setError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [selectedRole, setSelectedRole] = useState('admin');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setLocalError('');
        if (setError) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setIsSubmitting(true);

        const result = await login(formData.email, formData.password, selectedRole);

        setIsSubmitting(false);

        if (!result.success) {
            setLocalError(result.error || 'Login failed. Please check your credentials.');
            return;
        }

        if (result.requires2FA) {
            navigate('/2fa', { 
                state: { devOtp: result.devOtp } 
            });
            return;
        }

        redirectByRole(result.role);
    };

    const redirectByRole = (role) => {
        const normalized = (role || '').toLowerCase();
        if (normalized === 'main admin') {
            navigate('/main-admin/dashboard', { replace: true });
        } else if (normalized === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        } else {
            navigate('/dashboard', { replace: true });
        }
    };

    const displayError = localError || authError;

    return (
        <AuthLayout>
            <div className="bg-white p-8 rounded-2xl shadow-[0_24px_48px_-12px_rgba(45,55,110,0.18)] border border-[#E8EDF5] flex flex-col w-full">
                
                {/* Header */}
                <div className="text-center mb-7">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        Secure Login
                    </div>
                    <h1 className="text-3xl font-black text-[#1A2052] tracking-tight mb-1.5">Welcome Back</h1>
                    <p className="text-[13px] font-medium text-[#7C87AE] leading-relaxed">
                        Sign in to access your InfiAP HR dashboard
                    </p>
                </div>

                {/* Error Alert */}
                {displayError && (
                    <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-red-600 leading-relaxed">{displayError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#8E98BC] uppercase tracking-[0.18em] ml-0.5">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#93A0C7] group-focus-within:text-[#4E63F0] transition-colors" size={15} />
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange} 
                                    required
                                    placeholder="name@company.com"
                                    className="w-full bg-[#F4F7FC] border border-[#E8EDF5] rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-[#2D3865] placeholder:text-[#B0BBDB] focus:ring-4 focus:ring-[#4E63F0]/10 focus:bg-white focus:border-[#4E63F0] outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-0.5">
                                <label className="text-[11px] font-bold text-[#8E98BC] uppercase tracking-[0.18em]">Password</label>
                                <button 
                                    type="button"
                                    onClick={() => navigate('/reset-password')}
                                    className="text-[11px] font-semibold text-[#4E63F0] hover:text-[#3D4FD6] hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#93A0C7] group-focus-within:text-[#4E63F0] transition-colors" size={15} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-[#F4F7FC] border border-[#E8EDF5] rounded-xl pl-10 pr-11 py-3 text-sm font-medium text-[#2D3865] placeholder:text-[#B0BBDB] focus:ring-4 focus:ring-[#4E63F0]/10 focus:bg-white focus:border-[#4E63F0] outline-none"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#93A0C7] hover:text-[#4E63F0] p-0.5"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center px-0.5">
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                />
                                <div className="w-4 h-4 bg-white border border-[#CBD5E1] rounded peer-checked:bg-[#4E63F0] peer-checked:border-[#4E63F0] shadow-sm" />
                                <Check size={10} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                            </div>
                            <span className="text-[12px] font-semibold text-[#6D79A2] group-hover:text-[#4E63F0]">Remember me for 30 days</span>
                        </label>
                    </div>

                    {/* Role Selector — Premium Toggle Buttons */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#8E98BC] uppercase tracking-[0.18em] ml-0.5">Sign in as</label>
                        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#F4F7FC] rounded-xl border border-[#E8EDF5]">
                            {ROLES.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setSelectedRole(value)}
                                    className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-all duration-300 ease-in-out overflow-hidden ${
                                        selectedRole === value
                                            ? 'bg-white shadow-md border border-[#4E63F0]/20 text-[#4E63F0] transform scale-[1.02]'
                                            : 'text-[#94A3B8] hover:text-[#64748B] hover:bg-white/80'
                                    }`}
                                >
                                    {selectedRole === value && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#4E63F0]/5 to-transparent rounded-lg" />
                                    )}
                                    <Icon size={18} strokeWidth={selectedRole === value ? 2.5 : 2} className="relative z-10" />
                                    <span className={`text-[11px] font-black uppercase tracking-widest leading-none relative z-10 ${
                                        selectedRole === value ? 'text-[#4E63F0]' : 'text-[#94A3B8]'
                                    }`}>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            background: isSubmitting
                                ? 'linear-gradient(135deg, rgba(78,99,240,0.7), rgba(104,85,232,0.7))'
                                : 'linear-gradient(135deg, #4E63F0, #6855E8)',
                        }}
                        className="w-full py-3.5 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 flex items-center justify-center gap-2 mt-1 active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Sign In to InfiAP'
                        )}
                    </button>

                </form>
            </div>
        </AuthLayout>
    );
};

export default Login;
