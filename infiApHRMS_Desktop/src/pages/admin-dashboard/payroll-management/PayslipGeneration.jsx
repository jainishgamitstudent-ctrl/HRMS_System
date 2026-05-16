import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  ChevronDown, 
  Zap, 
  Clock, 
  Download, 
  FileText, 
  CheckCircle2, 
  Share2, 
  Eye, 
  Mail, 
  MessageCircle, 
  Copy, 
  X,
  ShieldCheck,
  ChevronRight,
  Info,
  MoreVertical,
  ArrowRight,
  Trash2,
  Lock,
  RefreshCw,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

const PayslipGeneration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // 'select', 'preview', 'success', 'shared'
  const [showShareModal, setShowShareModal] = useState(false);

  const history = [
    { month: 'July 2023', date: 'Generated on Jul 31' },
    { month: 'June 2023', date: 'Generated on Jun 30' },
  ];

  const handleGenerate = () => {
    setStep('preview-loading');
    setTimeout(() => {
       setStep('success');
    }, 1500); // Simulate processing
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Payslip', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text('August 2023', 105, 30, null, null, 'center');
    
    doc.setFontSize(14);
    doc.text('Employee details', 20, 50);
    doc.setFontSize(10);
    doc.text('Name: John Doe', 20, 60);
    doc.text('Position: Software Engineer', 20, 70);
    
    doc.setFontSize(14);
    doc.text('Earnings & Deductions', 20, 90);
    doc.setFontSize(10);
    doc.text('Gross Pay: $5,400.00', 20, 100);
    doc.text('Total Deductions: $840.50', 20, 110);
    
    doc.setFontSize(16);
    doc.text('Net Pay: $4,559.50', 20, 130);
    
    doc.save('Payslip_Aug_2023.pdf');
    setShowShareModal(false);
  };

  const handleFinalShare = () => {
    setShowShareModal(false);
    navigate('/admin/payroll-management/verify'); // Leads to Screen 8 (OTP)
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      
      {/* Premium Header */}
      <div className="flex items-center justify-between px-2 pb-6 border-b border-slate-100">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin/payroll-management')}
              className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-soft active:scale-90"
            >
               <ArrowLeft size={20} />
            </button>
            <div>
               <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 underline decoration-indigo-300 underline-offset-4 uppercase">
                  {step === 'success' ? 'Confirmation' : step === 'shared' ? 'Success' : 'Payslip Generation'}
               </h1>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 leading-none">Lifecycle Management Index</p>
            </div>
         </div>
         <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-soft active:rotate-90">
            <Info size={20} />
         </button>
      </div>

      <div className="flex items-center justify-center min-h-[70vh] px-4">
         <div className="w-full max-w-[500px] space-y-10">
            
            {step === 'select' && (
               <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-white p-12 rounded-[56px] border border-slate-50 shadow-soft space-y-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Select Payroll Period</label>
                        <div className="relative group cursor-pointer">
                           <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-5 text-sm font-black text-slate-800 flex items-center justify-between group-hover:bg-white group-hover:shadow-lg transition-all text-left">
                              August 2023
                              <ChevronDown size={20} className="text-slate-300" />
                           </div>
                        </div>
                     </div>

                      <button 
                        onClick={handleGenerate}
                        className="w-full py-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-[28px] shadow-3xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-4"
                      >
                        <Zap size={18} strokeWidth={2.5} />
                        Generate Payslip
                     </button>
                  </div>

                  {/* HIGH FIDELITY PREVIEW DETAILS (Screen 2) */}
                  <div className="bg-white p-12 rounded-[56px] border border-slate-50 shadow-soft space-y-10">
                     <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                         <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Preview Details Nodes</h4>
                        <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-slate-100">Draft</span>
                     </div>
                     <div className="space-y-6">
                        <div className="flex justify-between items-center text-left">
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Gross Pay</p>
                           <p className="text-xl font-black text-slate-800 tracking-tight">$5,400.00</p>
                        </div>
                        <div className="flex justify-between items-center text-left">
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Deductions</p>
                           <p className="text-xl font-black text-rose-500 tracking-tight">-$840.50</p>
                        </div>
                        <div className="pt-6 border-t border-slate-50 flex justify-between items-center text-left">
                           <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Net Pay</p>
                           <div>
                              <p className="text-3xl font-black text-indigo-600 tracking-tighter leading-none">$4,559.50</p>
                              <p className="text-[9px] font-bold text-slate-300 uppercase text-right mt-1 tracking-widest">Estimated Amount</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* History Ledger */}
                  <div className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-soft">
                     <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                         <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Recent Status Nodes</h4>
                         <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Global Audit</button>
                     </div>
                     <div className="space-y-6 text-left">
                        {history.map((h, i) => (
                           <div key={i} className="flex items-center justify-between group cursor-pointer p-4 hover:bg-slate-50/50 rounded-2xl transition-all">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-all shrink-0">
                                    <FileText size={20} />
                                 </div>
                                 <div className="text-left">
                                    <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight leading-none">{h.month}</h4>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{h.date}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <button className="p-2.5 bg-white border border-slate-100 rounded-lg text-slate-300 hover:text-indigo-600 transition-all active:scale-90">
                                    <Eye size={16} />
                                 </button>
                                 <button className="p-2.5 bg-white border border-slate-100 rounded-lg text-slate-300 hover:text-indigo-600 transition-all active:scale-90">
                                    <Download size={16} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {step === 'preview-loading' && (
               <div className="bg-white p-12 rounded-[56px] border border-slate-50 shadow-soft space-y-12 animate-in fade-in zoom-in-95 duration-500 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[32px] mx-auto flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner">
                     <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-4 uppercase">Compiling Protocol...</h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Auditing ledger accuracy & security</p>
                  </div>
               </div>
            )}

            {step === 'success' && (
               <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-white p-14 rounded-[64px] border border-slate-50 shadow-soft text-center relative overflow-hidden group">
                     <div className="relative z-10">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[36px] mx-auto flex items-center justify-center shadow-xl shadow-emerald-100/50 mb-10 group-hover:scale-110 transition-transform duration-700">
                           <CheckCircle2 size={48} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4 uppercase leading-none">Payslip Generated Successfully!</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[300px] mx-auto">Your payslip for <span className="text-slate-800 font-black">August 2023</span> is now available for download and viewing.</p>

                        <div className="mt-12 p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex items-center justify-between group/file cursor-pointer hover:bg-white hover:shadow-2xl transition-all duration-500 text-left">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500">
                                 <FileText size={28} />
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase">Payslip_Aug_2023.pdf</h4>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">248 KB • PDF Document</p>
                              </div>
                           </div>
                           <button className="p-3 text-slate-200 hover:text-slate-500 transition-colors">
                              <MoreVertical size={22} />
                           </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-12">
                            <button 
                              onClick={() => navigate('/admin/payroll-management/secure-sharing')}
                              className="w-full py-5.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-[24px] shadow-3xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-4"
                            >
                               <Eye size={18} />
                               View Payslip
                            </button>
                            <button onClick={handleDownloadPDF} className="w-full py-5.5 bg-white border-2 border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-[0.4em] rounded-[24px] hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-4">
                               <Download size={18} />
                               Download PDF
                            </button>
                        </div>

                        <button 
                          onClick={() => setStep('select')}
                          className="mt-10 mx-auto flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-indigo-600 transition-all font-bold"
                        >
                           <ArrowLeft size={14} />
                           Back to Payroll
                        </button>
                        
                        <button 
                          onClick={() => setShowShareModal(true)}
                          className="absolute top-10 right-10 p-4 bg-slate-50 text-slate-400 rounded-[24px] hover:bg-indigo-50 hover:text-indigo-600 transition-all hover:rotate-12"
                        >
                           <Share2 size={20} />
                        </button>
                     </div>
                     
                     {/* Backdrop Reveal */}
                     <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50/20 rounded-full blur-[100px] pointer-events-none"></div>
                  </div>
               </div>
            )}

            {/* SCREEN 9: PAYSLIP SHARED SUCCESSFULLY */}
            {step === 'shared' && (
               <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-white p-14 rounded-[64px] border border-slate-50 shadow-soft text-center relative overflow-hidden group">
                     <div className="relative z-10">
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[40px] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-100/50 mb-10 group-hover:scale-110 transition-transform duration-700">
                           <ShieldCheck size={48} strokeWidth={2} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4 uppercase leading-none">Payslip Shared Successfully!</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[340px] mx-auto mb-10">Your payslip for the month of October has been sent and is now accessible to the recipient.</p>

                        <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col items-center gap-5 text-center mb-10 group/recipient">
                           <div className="w-20 h-20 bg-white rounded-[28px] shadow-sm flex items-center justify-center text-slate-400 group-hover/recipient:scale-110 duration-500 transition-transform">
                              <Mail size={32} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 leading-none">Recipient</p>
                              <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">sarah.jenkins@infi-ap.com</h4>
                           </div>
                           <div className="px-6 py-2 bg-emerald-50 text-emerald-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                              Delivered
                           </div>
                           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Shared on Oct 24, 2:15 PM</p>
                        </div>

                        <div className="space-y-4">
                           <button 
                             onClick={() => navigate('/admin/payroll-management')}
                             className="w-full py-5.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[24px] shadow-3xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center"
                           >
                              Back to Payroll
                           </button>
                           <button 
                             onClick={() => setStep('success')}
                             className="w-full py-5.5 bg-white border-2 border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] rounded-[24px] hover:bg-slate-50 transition-all flex items-center justify-center gap-4 group"
                           >
                              <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
                              Share Again
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}

         </div>
      </div>

      {/* Share Payslip Dialog Overlay (Screen 4) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/10 animate-in fade-in duration-300">
           <div className="w-full max-w-[440px] bg-white rounded-[64px] shadow-[0_48px_120px_-24px_rgba(0,0,0,0.1)] border border-slate-50 p-12 relative overflow-hidden animate-in slide-in-from-bottom-24 duration-700 text-center">
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute top-10 right-10 p-4 bg-slate-50 text-slate-300 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all hover:rotate-90 shadow-sm"
              >
                 <X size={20} />
              </button>

              <div className="text-center mb-12">
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-3 uppercase">Share Payslip</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Select distribution protocol</p>
              </div>

              <div className="space-y-4 relative z-10 flex flex-col items-center">
                 {[
                   { label: 'Share via Email', detail: 'Send to a verified recipient', icon: Mail, color: 'indigo-500', action: handleFinalShare },
                   { label: 'Send to Slack', detail: 'Post to a channel or DM', icon: MessageCircle, color: 'purple-500', action: handleFinalShare },
                   { label: 'Copy Link', detail: 'Share secure document link', icon: Copy, color: 'blue-500', action: handleFinalShare },
                   { label: 'Download PDF', detail: 'Save file to your device', icon: Download, color: 'slate-400', action: handleDownloadPDF }
                 ].map((opt, i) => (
                   <button 
                     key={i} 
                     onClick={opt.action}
                     className="w-full p-6 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-[32px] flex items-center justify-between transition-all duration-500 group"
                   >
                      <div className="flex items-center gap-6 text-left">
                         <div className={`w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <opt.icon size={22} className={opt.color} />
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none">{opt.label}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{opt.detail}</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                   </button>
                 ))}
              </div>

              <div className="mt-12 p-8 bg-indigo-50/50 rounded-[40px] border border-indigo-100/50 flex flex-col items-center gap-4 text-center">
                 <ShieldCheck className="text-indigo-600" size={32} />
                 <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest leading-none">Security Protocol Active</p>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default PayslipGeneration;
