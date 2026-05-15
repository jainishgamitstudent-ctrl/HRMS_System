import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, RefreshCw, Undo2, AlertCircle, Loader2 } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../context/AuthContext';

const TwoFactor = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { pending2FA, verify2FA, error: authError, setError } = useAuth();
    
    const devOtp = location.state?.devOtp || pending2FA?.devOtp;
    const userRole = pending2FA?.role || 'User';
    
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');
    const inputRefs = useRef([]);

    // If no pending 2FA challenge, redirect back to login
    useEffect(() => {
        if (!pending2FA) {
            navigate('/login', { replace: true });
        }
    }, [pending2FA, navigate]);

    // Auto-fill dev OTP for testing
    useEffect(() => {
        if (devOtp) {
            setOtp(devOtp.split(''));
        }
    }, [devOtp]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
        setOtp(newOtp);
        setLocalError('');
        if (setError) setError(null);

        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        
        if (otpString.length !== 6) {
            setLocalError('Please enter all 6 digits');
            return;
        }

        setIsSubmitting(true);
        setLocalError('');

        const result = await verify2FA(otpString);

        setIsSubmitting(false);

        if (!result.success) {
            setLocalError(result.error || 'Verification failed. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            return;
        }

        // Redirect based on role
        const normalized = (result.role || '').toLowerCase();
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
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_16px_36px_-14px_rgba(38,20,91,0.28)] border border-[#EAE5F8] flex flex-col items-center">
                
                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-3">Check your device</h1>
                    <p className="text-sm font-medium text-gray-400 leading-relaxed max-w-[320px] mx-auto">
                        {userRole} access requires OTP verification. Enter the 6-digit code to continue.
                    </p>
                    {devOtp && (
                        <div className="mt-3 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl inline-block">
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                                Dev OTP: {devOtp}
                            </p>
                        </div>
                    )}
                </div>

                {/* Error Alert */}
                {displayError && (
                    <div className="w-full mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <p className="text-xs font-semibold text-red-600">{displayError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-8">
                    
                    {/* OTP Input Fields */}
                    <div className="flex justify-between gap-2 sm:gap-4">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                ref={el => inputRefs.current[index] = el}
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className="w-full aspect-2/3 max-w-16 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-center text-2xl font-black text-[#1A1A1A] focus:ring-4 focus:ring-[#6C5CE7]/5 focus:bg-white focus:border-[#6C5CE7] outline-none transition-all shadow-sm"
                            />
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-6">
                        <button 
                            type="submit"
                            disabled={otp.some(v => v === '') || isSubmitting}
                            className={`w-full py-4.5 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 ${
                                otp.some(v => v === '') || isSubmitting
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-linear-to-r from-[#6C5CE7] to-[#5A4BDA] text-white shadow-lg shadow-[#6C5CE7]/20 hover:shadow-xl active:scale-[0.98]'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Account'
                            )}
                        </button>

                        <div className="flex flex-col items-center gap-4">
                            <p className="text-xs font-medium text-gray-400">Didn't receive the code?</p>
                            <button type="button" className="flex items-center gap-2 text-xs font-bold text-[#6C5CE7] hover:underline transition-all group">
                                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                Resend Security Code
                            </button>
                        </div>
                    </div>

                    {/* Footer Nav */}
                    <div className="pt-8 border-t border-gray-50">
                        <button 
                            type="button" 
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 mx-auto text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Undo2 size={14} />
                            Back to Sign In
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
};

export default TwoFactor;
