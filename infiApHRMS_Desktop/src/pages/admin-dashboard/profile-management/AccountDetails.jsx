import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Smartphone, Globe, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AccountDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Account Details</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Security & Account Identity</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-emerald-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Security Status</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Two-Factor Auth</span>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Password Health</span>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full">Strong</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Globe size={18} className="text-indigo-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Login History</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { device: 'Chrome on Windows', time: 'Just now', status: 'Current Session' },
              { device: 'Safari on iPhone', time: '2 hours ago', status: 'Success' },
              { device: 'Chrome on macOS', time: 'Yesterday', status: 'Success' },
            ].map((login, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-xs font-bold text-slate-800">{login.device}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{login.time}</p>
                </div>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tight">{login.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
