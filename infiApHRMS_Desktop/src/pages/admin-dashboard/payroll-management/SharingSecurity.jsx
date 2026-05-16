import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, ArrowLeft, ChevronLeft, CheckCircle2, Delete, StepBack } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SharingSecurity = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(114);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (num) => {
    const nextIndex = otp.findIndex(v => v === '');
    if (nextIndex !== -1) {
      const newOtp = [...otp];
      newOtp[nextIndex] = num;
      setOtp(newOtp);
      
      // If full, simulate verification and redirect
      if (nextIndex === 5) {
        setTimeout(() => {
           // We pass a state to tell PayslipGeneration to show the shared success state
           navigate('/admin/payroll-management/generate', { state: { shared: true } });
        }, 1000);
      }
    }
  };

  const handleDelete = () => {
    const lastFilledIndex = [...otp].reverse().findIndex(v => v !== '');
    if (lastFilledIndex !== -1) {
      const actualIndex = 5 - lastFilledIndex;
      const newOtp = [...otp];
      newOtp[actualIndex] = '';
      setOtp(newOtp);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-50/10">
      <div className="w-full max-w-[420px] space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header Branding */}
        <div className="flex items-center gap-6 px-4">
           <button 
             onClick={() => navigate(-1)}
             className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-soft active:scale-90"
           >
              <ArrowLeft size={18} />
           </button>
            <div>
               <h1 className="text-2xl font-black text-slate-800 tracking-tight underline decoration-indigo-300 underline-offset-4 uppercase leading-none mb-1">InfiAP Security</h1>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Identity Verification Protocol</p>
            </div>
        </div>

        {/* Verification Card */}
        <div className="bg-white p-12 rounded-[64px] border border-slate-50 shadow-soft text-center group">
           <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[28px] mx-auto flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700">
              <Mail size={36} />
           </div>
           
           <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4 uppercase leading-none">Check your email</h2>
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto mb-10">We've sent a 6-digit verification code to <span className="text-indigo-600 font-black">alex.jt@infi-ap-tech.com</span></p>

           {/* OTP Inputs */}
           <div className="flex justify-center gap-3 mb-10">
              {otp.map((digit, i) => (
                <div 
                  key={i}
                  className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all duration-300
                    ${digit !== '' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 scale-105 shadow-xl shadow-indigo-100' : 'border-slate-100 bg-slate-50 text-slate-300'}`}
                >
                   {digit}
                </div>
              ))}
           </div>

           <div className="flex items-center justify-center gap-4 mb-10">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{formatTime(timer)}</span>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] hover:underline ml-4">Resend Link</button>
           </div>

           <button className="w-full py-5.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[24px] shadow-3xl shadow-indigo-100 hover:bg-slate-900 active:scale-95 transition-all mb-4">
              Verify Identity
           </button>
        </div>

        {/* Custom Numeric Keypad (Desktop Optimized) */}
        <div className="grid grid-cols-3 gap-8 px-10">
           {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num, i) => (
             <button 
               key={num}
               onClick={() => handleKeyPress(num.toString())}
               className={`w-16 h-16 bg-white border border-slate-50 rounded-full flex items-center justify-center text-xl font-black text-slate-600 hover:bg-slate-900 hover:text-white hover:scale-110 transition-all shadow-soft active:scale-95 ${num === 0 ? 'col-start-2' : ''}`}
             >
                {num}
             </button>
           ))}
           <button 
              onClick={handleDelete}
              className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95 shadow-inner"
           >
              <StepBack size={24} />
           </button>
        </div>

        <div className="text-center pt-8">
           <p className="text-[8px] font-black text-slate-200 uppercase tracking-[0.4em] mb-4">InfiAP Secure Access Infrastructure</p>
        </div>

      </div>
    </div>
  );
};

export default SharingSecurity;
