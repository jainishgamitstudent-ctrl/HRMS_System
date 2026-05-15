import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Edit3 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const ProfileSettings = () => {
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
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Profile Settings</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Manage your personal information</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-indigo-100 overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-indigo-600" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">{user?.name || 'Admin User'}</h2>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{user?.role || 'Administrator'}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
            <Edit3 size={14} /> Change Photo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Full Name', value: user?.name, icon: User },
            { label: 'Email Address', value: user?.email, icon: Mail },
            { label: 'Phone Number', value: user?.phone || 'Not set', icon: Phone },
            { label: 'Location', value: user?.address || 'Not set', icon: MapPin },
          ].map((field) => (
            <div key={field.label} className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-50 group focus-within:border-indigo-500/20 focus-within:bg-white transition-all">
                <field.icon size={18} className="text-slate-400 group-focus-within:text-indigo-600" />
                <input
                  type="text"
                  defaultValue={field.value}
                  className="bg-transparent border-none outline-none text-sm font-bold text-slate-800 w-full"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end">
          <button className="px-8 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
            Save Profile Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
