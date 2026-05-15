import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { authService } from '../../services/auth.service';

const ConfirmResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!token) {
            setError('Invalid reset link. Please request a new one.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authService.resetPassword(token, formData.password);
            setIsSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <AuthLayout>
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Invalid Link</h1>
                    <p className="text-sm text-gray-500 text-center mb-8">
                        The password reset link is missing or invalid.
                    </p>
                    <button
                        onClick={() => navigate('/reset-password')}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
                    >
                        Request New Link
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_16px_36px_-14px_rgba(38,20,91,0.28)] border border-[#EAE5F8] flex flex-col items-center">
                
                {isSuccess ? (
                    <div className="text-center w-full py-10 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-50">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Success!</h2>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10 px-6">
                            Your password has been reset successfully. You can now login with your new password.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-xl"
                        >
                            Login Now
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight mb-3 uppercase">New Password</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-relaxed max-w-[320px] mx-auto">
                                Set a strong password for your InfiAP account.
                            </p>
                        </div>

                        {error && (
                            <div className="w-full mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-500">
                                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                                <p className="text-xs font-bold text-rose-700">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="w-full space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#6C5CE7] transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#6C5CE7] transition-colors" size={18} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4.5 bg-linear-to-r from-[#6C5CE7] to-[#5A4BDA] text-white font-bold rounded-2xl shadow-lg shadow-[#6C5CE7]/20 hover:shadow-xl hover:shadow-[#6C5CE7]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${isLoading ? 'opacity-70' : ''}`}
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                {isLoading ? 'Resetting...' : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </AuthLayout>
    );
};

export default ConfirmResetPassword;
