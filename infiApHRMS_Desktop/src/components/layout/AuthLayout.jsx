import React from 'react';
import { useNavigate } from 'react-router-dom';


const AuthLayout = ({ children }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-[#EEF1F7] font-sans">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
                <section className="relative hidden overflow-hidden lg:flex">
                    <div className="absolute inset-0 bg-linear-to-br from-[#3D43DE] via-[#5A54E8] to-[#7B64F2]"></div>
                    <div className="absolute -top-28 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-[#7BD3FF]/20 blur-3xl"></div>

                    <div className="relative z-10 flex h-full w-full flex-col justify-between p-14 text-white">
                        <button
                            type="button"
                            onClick={() => navigate('/splash')}
                            className="flex w-fit items-center gap-3"
                        >
                            <div className="h-20 w-20 rounded-3xl bg-white p-0 shadow-lg">
                                <img src="/logo.png" alt="InfiAP" className="h-full w-full object-contain" />
                            </div>
                            <div>
                                <p className="text-2xl font-black tracking-tight">InfiAP</p>
                                <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">HR Management Suite</p>
                            </div>
                        </button>

                        <div className="max-w-lg">
                            <h1 className="text-5xl font-black leading-[1.04] tracking-tight">People Operations, Reimagined For Enterprise Teams.</h1>
                            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80">
                                Manage departments, hiring pipelines, payroll, and leave workflows with one modern HR command center.
                            </p>
                        </div>

                        <div className="flex gap-4 text-xs uppercase tracking-widest text-white/75">
                            <span>Secure Access</span>
                            <span>Workforce Analytics</span>
                            <span>Role-Based Control</span>
                        </div>
                    </div>
                </section>

                <section className="relative flex items-center justify-center p-8 lg:p-12">
                    <div className="absolute inset-0 bg-linear-to-b from-white to-[#F6F8FD]"></div>
                    <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AuthLayout;
