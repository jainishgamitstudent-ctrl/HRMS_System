import React from 'react';
import { useNavigate } from 'react-router-dom';


const AuthLayout = ({ children }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-[#EEF1F7] font-sans">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
                {/* ── Left Hero Panel ── */}
                <section className="relative hidden overflow-hidden lg:flex">
                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2D3BE0] via-[#4A53E8] to-[#7B64F2]" />

                    {/* Decorative blobs */}
                    <div className="absolute -top-32 -right-28 h-[480px] w-[480px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-32 -left-28 h-[420px] w-[420px] rounded-full bg-[#7BD3FF]/15 blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

                    {/* Grid dot overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                        }}
                    />

                    <div className="relative z-10 flex h-full w-full flex-col justify-between p-14 text-white">
                        {/* Logo */}
                        <div
                            onClick={() => navigate('/splash')}
                            className="flex w-fit items-center gap-4 cursor-pointer group"
                        >
                            <div className="h-[68px] w-[68px] rounded-[20px] bg-white/15 border border-white/20 p-1 shadow-xl backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                                <img src="/logo.png" alt="InfiAP" className="h-full w-full object-contain" />
                            </div>
                            <div>
                                <p className="text-[26px] font-black tracking-tight leading-none">InfiAP</p>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60 mt-0.5">HR Management Suite</p>
                            </div>
                        </div>

                        {/* Hero copy */}
                        <div className="max-w-lg">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-white/70 mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Enterprise Platform
                            </div>
                            <h1 className="text-[52px] font-black leading-[1.03] tracking-tight text-balance">
                                People Operations,{' '}
                                <span className="text-white/80">Reimagined</span> For Enterprise Teams.
                            </h1>
                            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/70 font-medium">
                                Manage departments, hiring pipelines, payroll, and leave workflows with one modern HR command center.
                            </p>
                        </div>

                        {/* Feature pills */}
                        <div className="flex flex-wrap gap-3">
                            {['Secure Access', 'Workforce Analytics', 'Role-Based Control'].map((label) => (
                                <span
                                    key={label}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 text-[11px] font-bold uppercase tracking-widest text-white/75 backdrop-blur-sm"
                                >
                                    <span className="w-1 h-1 rounded-full bg-white/60" />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Right Login Panel ── */}
                <section className="relative flex items-center justify-center p-8 lg:p-12">
                    <div className="absolute inset-0 bg-gradient-to-b from-white to-[#F4F7FD]" />
                    <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AuthLayout;
