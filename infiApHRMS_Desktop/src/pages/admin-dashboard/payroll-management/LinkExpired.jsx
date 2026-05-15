import React, { useState } from 'react';
import { ShieldAlert, Clock, Mail, ChevronRight, LogIn, ExternalLink, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LinkExpired = () => {
  const navigate = useNavigate();
  const [requestSent, setRequestSent] = useState(false);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-50/10">
      <div className="w-full max-w-[420px] space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header Branding */}
        <div className="text-center space-y-6">
           <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl shadow-indigo-100 mx-auto flex items-center justify-center relative group">
              <ShieldCheck className="text-indigo-600 group-hover:scale-110 transition-transform" size={48} strokeWidth={1.5} />
           </div>
            <div>
               <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">InfiAP Protocols</h1>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Institutional Secure Gate</p>
            </div>
        </div>

        {/* Security Card */}
        <div className="bg-white p-12 rounded-[64px] border border-slate-50 shadow-soft relative overflow-hidden group">
           <div className="relative z-10 text-center">
              {!requestSent ? (
                /* SCREEN 5: LINK EXPIRED */
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                   <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[28px] mx-auto flex items-center justify-center shadow-lg shadow-rose-100 animate-pulse">
                      <Clock size={36} />
                   </div>
                   
                   <div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4 uppercase leading-none">Link Expired</h2>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto">For security reasons, this link is no longer active. Please contact the sender to request a new link or sign in to your portal.</p>
                   </div>

                    <div className="space-y-4">
                       <button 
                         onClick={() => setRequestSent(true)}
                         className="w-full py-5.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[24px] shadow-3xl shadow-indigo-100 hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-4"
                       >
                          Request New Link
                          <ChevronRight size={18} />
                       </button>
                       <button className="w-full py-5.5 bg-white border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-[24px] hover:bg-slate-50 transition-all flex items-center justify-center gap-4">
                          Contact Support
                       </button>
                    </div>
                </div>
              ) : (
                /* SCREEN 6: REQUEST SENT */
                <div className="space-y-10 animate-in fade-in slide-in-from-right-12 duration-700">
                   <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[28px] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-100">
                      <Mail size={36} />
                   </div>
                   
                   <div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4 uppercase leading-none">Request Sent Successfully!</h2>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto">We've sent a new secure link to your email address. Please check your inbox (and spam folder) to access your document.</p>
                   </div>

                   <div className="space-y-6 pt-6 border-t border-slate-50">
                      <button 
                        onClick={() => setRequestSent(false)}
                        className="flex items-center justify-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline mx-auto"
                      >
                         <ChevronLeft size={16} />
                         Back to Login
                      </button>
                       <button className="w-full py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-[20px] shadow-3xl shadow-slate-200">
                         Sign In to Portal
                       </button>
                   </div>
                </div>
              )}
           </div>

           {/* Decorative Design Elements */}
           <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] transition-all duration-1000 ${requestSent ? 'bg-indigo-500/10 scale-150' : 'bg-rose-500/5'}`}></div>
        </div>

        <div className="flex items-center justify-center gap-8 pt-8">
           <button 
             onClick={() => navigate('/admin/payroll-management')}
             className="text-[10px] font-black text-slate-200 uppercase tracking-widest hover:text-slate-800 transition-all font-bold"
           >
              Help Center
           </button>
           <div className="w-1 h-1 bg-slate-100 rounded-full"></div>
           <button className="text-[10px] font-black text-slate-200 uppercase tracking-widest hover:text-slate-800 transition-all font-bold">Privacy Policy</button>
        </div>

      </div>
    </div>
  );
};

export default LinkExpired;
