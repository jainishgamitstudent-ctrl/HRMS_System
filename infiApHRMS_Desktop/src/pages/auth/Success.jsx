import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';

const Success = () => {
    const navigate = useNavigate();

    return (
        <AuthLayout>
            <div className="bg-white p-8 lg:p-12 rounded-[32px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col items-center">
                
                {/* Success Animation Area */}
                <div className="flex flex-col items-center justify-center py-6 mb-10 w-full">
                    <div className="relative group">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="relative w-32 h-32 bg-emerald-50 border-4 border-white rounded-[40px] flex items-center justify-center text-emerald-500 shadow-xl group-hover:scale-110 transition-transform duration-700">
                            <CheckCircle2 size={64} strokeWidth={2.5} />
                            <div className="absolute -top-3 -right-3 p-2.5 bg-[#6C5CE7] rounded-2xl text-white shadow-xl animate-bounce">
                                <ShieldCheck size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography Container */}
                <div className="text-center space-y-3 mb-12">
                    <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Access Granted</h1>
                    <p className="text-sm font-medium text-gray-400 leading-relaxed max-w-[320px] mx-auto">
                        Your identity has been successfully synchronized across the InfiAP orchestration layer.
                    </p>
                </div>

                {/* Action Hub */}
                <div className="w-full space-y-6">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full py-4.5 bg-[#1A1A1A] text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-[0.98] flex items-center justify-center gap-4 group"
                    >
                        Enter Dashboard
                        <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </button>
                    
                    <div className="flex items-center justify-center gap-3 py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workspace ready for deployment</p>
                    </div>
                </div>

                {/* Diagnostic Footer */}
                <div className="mt-12 pt-8 border-t border-gray-50 text-center w-full">
                    <p className="text-[10px] font-medium text-gray-300 leading-relaxed uppercase tracking-wider">
                        Authenticated via Strategic Workforce Protocol <br/>
                        Node ID: INF-882-SYS-SYNC
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Success;
