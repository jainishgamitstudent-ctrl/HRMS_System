import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, Eye, EyeOff, FileText, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SecureDocument = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50/20">
      <div className="w-full max-w-[480px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header Branding */}
        <div className="text-center space-y-6">
           <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl shadow-indigo-100 mx-auto flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-indigo-500 rounded-[32px] opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <ShieldCheck className="text-indigo-600 group-hover:scale-110 transition-transform" size={48} strokeWidth={1.5} />
           </div>
            <div>
               <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">InfiAP Protocols</h1>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Secure Document Sharing Node</p>
            </div>
        </div>

        {/* Security Card */}
        <div className="bg-white p-12 rounded-[56px] border border-slate-50 shadow-soft relative overflow-hidden group">
           <div className="relative z-10">
              <div className="flex items-center gap-6 p-6 bg-indigo-50/50 rounded-[32px] border border-indigo-100/50 mb-10">
                 <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500">
                    <Lock size={24} />
                 </div>
                 <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">Password Protected</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Please enter the credentials provided to you to view this document.</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                    <div className="relative group">
                       <input 
                         type={showPassword ? "text" : "password"} 
                         placeholder="••••••••"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300"
                       />
                       <button 
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                       >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                 </div>

                  <button 
                    onClick={() => navigate('/admin/payroll-management/structure')}
                    className="w-full py-5.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-[24px] shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                     View Document
                     <ArrowRight size={16} />
                  </button>
              </div>
           </div>

           {/* Backdrop Detail */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
        </div>

        {/* Footer Protocol */}
        <div className="flex items-center justify-center gap-8 py-4">
           {['Privacy Policy', 'Terms of Service', 'Support'].map((link) => (
             <button key={link} className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-indigo-500 transition-colors">
                {link}
             </button>
           ))}
        </div>

        <div className="text-center pt-8">
           <p className="text-[8px] font-black text-slate-200 uppercase tracking-[0.4em]">Powered by InfiAP Secure Infrastructure</p>
        </div>

        <button 
          onClick={() => navigate('/admin/payroll-management/hub')}
          className="mx-auto flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-all group"
        >
           <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
           Back to Payroll Hub
        </button>

      </div>
    </div>
  );
};

export default SecureDocument;
