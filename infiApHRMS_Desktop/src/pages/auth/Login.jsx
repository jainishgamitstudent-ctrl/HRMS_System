import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';

import { useAuth } from '../../context/AuthContext';

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
            // Navigate to 2FA page — the pending2FA state is in AuthContext
            navigate('/2fa', { 
                state: { devOtp: result.devOtp } 
            });
            return;
        }

        // Direct login (no 2FA) — redirect based on role
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
            <div className="bg-white p-7 rounded-2xl shadow-[0_22px_40px_-20px_rgba(45,55,110,0.35)] border border-[#E4E9F5] flex flex-col w-full">
                
                {/* Header Cluster */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-black text-[#1F2754] tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-[10px] font-black text-[#7C87AE] uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
                        Sign in to access your InfiAP HR dashboard.
                    </p>
                </div>

                {/* Error Alert */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <p className="text-xs font-semibold text-red-600">{displayError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Form Fields */}
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#8E98BC] uppercase tracking-[0.2em] ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93A0C7] group-focus-within:text-[#4E63F0] transition-colors" size={16} />
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange} 
                                    required
                                    placeholder="name@company.com"
                                    className="w-full bg-[#F3F6FC] border border-[#E4E9F5] rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-[#2D3865] placeholder:text-[#A2AED0] focus:ring-4 focus:ring-[#4E63F0]/10 focus:bg-white focus:border-[#4E63F0] transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-[#8E98BC] uppercase tracking-[0.2em]">Password</label>
                                <button 
                                    type="button"
                                    onClick={() => navigate('/reset-password')}
                                    className="text-[10px] font-bold text-[#4E63F0] hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93A0C7] group-focus-within:text-[#4E63F0] transition-colors" size={16} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-[#F3F6FC] border border-[#E4E9F5] rounded-xl pl-11 pr-11 py-3 text-sm font-medium text-[#2D3865] placeholder:text-[#A2AED0] focus:ring-4 focus:ring-[#4E63F0]/10 focus:bg-white focus:border-[#4E63F0] transition-all outline-none"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#93A0C7] hover:text-[#4E63F0] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center px-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                />
                                <div className="w-4 h-4 bg-white border border-[#D5CDED] rounded peer-checked:bg-[#6C5CE7] peer-checked:border-[#6C5CE7] transition-all"></div>
                                <Check size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity stroke-4" />
                            </div>
                            <span className="text-[11px] font-semibold text-[#6D79A2] group-hover:text-[#4E63F0] transition-colors">Remember me</span>
                        </label>
                    </div>

                    {/* Role select */}
                    <div className="mt-2">
                        <label className="text-[10px] font-black text-[#8E98BC] uppercase tracking-[0.2em] ml-1">Role</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full mt-2 bg-[#F3F6FC] border border-[#E4E9F5] rounded-xl py-3 px-4 text-sm font-medium text-[#2D3865]"
                        >
                            <option value="admin">Admin</option>
                            <option value="hr">HR</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>

                    {/* Sign In Button */}
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#4E63F0]/20 flex items-center justify-center gap-2 ${
                            isSubmitting 
                                ? 'bg-[#4E63F0]/70 cursor-wait' 
                                : 'bg-linear-to-r from-[#4E63F0] to-[#6855E8] hover:shadow-xl hover:shadow-[#4E63F0]/20'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>


                </form>
            </div>
        </AuthLayout>
    );
};

export default Login;
