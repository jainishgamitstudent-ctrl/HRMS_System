import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { authService } from '../../services/auth.service';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const res = await authService.forgotPassword(email);
            setIsSuccess(true);
            setMessage(res.message || 'If an account exists with this email, you will receive a reset link shortly.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_16px_36px_-14px_rgba(38,20,91,0.28)] border border-[#EAE5F8] flex flex-col items-center">
                
                {/* Success State */}
                {isSuccess ? (
                    <div className="text-center w-full py-10 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-50">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Email Sent!</h2>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10 px-6">
                            {message}
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-xl"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header Section */}
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Mail size={32} />
                            </div>
                            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight mb-3 uppercase">Reset password</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-relaxed max-w-[320px] mx-auto">
                                Enter your corporate email address to receive a password recovery link.
                            </p>
                        </div>

                        {error && (
                            <div className="w-full mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-500">
                                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                                <p className="text-xs font-bold text-rose-700">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="w-full space-y-8">
                            
                            {/* Input Field */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Corporate Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#6C5CE7] transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium text-gray-800 focus:ring-4 focus:ring-[#6C5CE7]/5 focus:bg-white focus:border-[#6C5CE7] transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4.5 bg-linear-to-r from-[#6C5CE7] to-[#5A4BDA] text-white font-bold rounded-2xl shadow-lg shadow-[#6C5CE7]/20 hover:shadow-xl hover:shadow-[#6C5CE7]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>

                            {/* Navigation */}
                            <div className="pt-8 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="flex items-center gap-2 mx-auto text-xs font-bold text-gray-400 hover:text-[#6C5CE7] transition-colors group"
                                >
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    Back to Sign In
                                </button>
                            </div>

                            {/* Advisory */}
                            <div className="text-center px-4">
                                <p className="text-[10px] font-medium text-gray-300 leading-relaxed uppercase tracking-wider">
                                    If you do not receive a recovery link within 5 minutes, please contact your IT administrator.
                                </p>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </AuthLayout>
    );
};

export default ResetPassword;
