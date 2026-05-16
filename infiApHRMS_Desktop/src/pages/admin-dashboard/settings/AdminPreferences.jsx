import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Bell, Palette, Layout } from 'lucide-react';

const AdminPreferences = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b border-slate-50 pb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Preferences</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Customize your administrative experience</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Palette size={18} className="text-indigo-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Appearance</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Theme Mode</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button className="px-3 py-1.5 bg-white text-[10px] font-black uppercase rounded shadow-sm">Light</button>
                <button className="px-3 py-1.5 text-slate-400 text-[10px] font-black uppercase">Dark</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Compact View</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Bell size={18} className="text-amber-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            {['Email Alerts', 'System Push', 'Mobile SMS'].map((notif) => (
              <div key={notif} className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">{notif}</span>
                <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Layout size={18} className="text-emerald-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Dashboard Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Performance Focus', 'Attendance Focus', 'Standard HR'].map((layout, idx) => (
              <button key={layout} className={`p-4 rounded-2xl border-2 transition-all text-left ${idx === 2 ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-50 bg-slate-50 hover:border-slate-100'}`}>
                <p className="text-xs font-black text-slate-800 uppercase mb-1">{layout}</p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">Optimized for quick access to {layout.toLowerCase()} metrics.</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPreferences;
