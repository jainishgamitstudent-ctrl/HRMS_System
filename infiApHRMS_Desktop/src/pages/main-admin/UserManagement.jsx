import React, { useState, useEffect, useRef } from 'react';
import {
   Users,
   ShieldCheck,
   UserPlus,
   Lock,
   ChevronLeft,
   Plus,
   Search,
   MoreVertical,
   CheckCircle2,
   AlertCircle,
   Building2,
   Mail,
   ShieldAlert,
   Edit3,
   ArrowRight,
   Filter,
   Phone,
   Calendar,
   MapPin,
   Briefcase,
   FileText,
   Box,
   MessageSquare,
   Activity,
   Settings,
   PlusCircle,
   ChevronRight,
   Contact,
   Eye,
   TrendingUp,
   EyeOff,
   Info,
   Trash2,
   ChevronDown,
   DollarSign,
   BarChart3,
   RefreshCw,
   Check,
   X as CloseIcon,
   Clock,
   Loader2
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Externalized Sub-components to prevent focus loss
const HubView = ({ setView, searchTerm, setSearchTerm, filterStatus, setFilterStatus, filteredUsers, setSelectedUser }) => (
   <div className="space-y-10 animate-in fade-in duration-1000 pb-32">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-50 pb-12">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-[20px] flex items-center justify-center shadow-3xl shadow-indigo-100 animate-in zoom-in duration-500">
               <Users size={28} />
            </div>
            <div>
               <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">Global Identity Hub</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] leading-none">Platform Resource Directory & Access Nodes</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={() => setView('add-admin')} className="px-8 py-4 bg-white border border-slate-100 text-indigo-600 rounded-[20px] hover:bg-slate-900 hover:text-white transition-all shadow-soft flex items-center gap-3 active:scale-95 group">
               <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest">Add Admin</span>
            </button>
            <button className="w-14 h-14 bg-slate-50 text-slate-400 rounded-[20px] hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center active:scale-95">
               <MoreVertical size={22} />
            </button>
         </div>
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
            { label: 'Master Admins', val: '12', icon: ShieldCheck, bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'group-hover:bg-indigo-600' },
            { label: 'HR Directors', val: '35', icon: UserPlus, bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'group-hover:bg-emerald-600' },
            { label: 'Active Seats', val: '1,200+', icon: Activity, bg: 'bg-amber-50', text: 'text-amber-500', hover: 'group-hover:bg-amber-500' },
            { label: 'Pending Access', val: '04', icon: AlertCircle, bg: 'bg-rose-50', text: 'text-rose-500', hover: 'group-hover:bg-rose-500' }
         ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-soft space-y-3 group hover:shadow-2xl transition-all">
               <div className={`w-10 h-10 ${stat.bg} ${stat.text} rounded-xl flex items-center justify-center ${stat.hover} group-hover:text-white transition-all`}>
                  <stat.icon size={20} />
               </div>
               <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.val}</h3>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.label}</p>
            </div>
         ))}
      </div>

      {/* Filtering & Live Feed */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-soft space-y-10">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="relative group flex-1">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter nodes by identity, role, or access level..." 
                  autoComplete="off"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all tracking-tight"
               />
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
               {['All Users', 'Admins', 'HR Managers', 'Internal'].map((pill) => (
                  <button 
                     key={pill}
                     onClick={() => setFilterStatus(pill)}
                     className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap active:scale-95
                        ${filterStatus === pill
                           ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200' 
                           : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                     {pill}
                  </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {filteredUsers.map((user) => (
               <div 
                  key={user.id} 
                  onClick={() => { setSelectedUser(user); setView('profile'); }}
                  className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-soft group hover:border-indigo-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
               >
                  <div className="flex items-center gap-6">
                     <div className="relative">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[24px] flex items-center justify-center font-black text-xl text-slate-300 shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 overflow-hidden">
                           {user.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm 
                           ${user.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : user.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                     </div>
                     <div>
                        <h3 className="text-[15px] font-black text-slate-800 tracking-tight leading-none mb-2 group-hover:text-indigo-600 transition-colors uppercase">{user.name}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none bg-slate-50 px-2 py-1 rounded">{user.role}</p>
                           <span className="hidden sm:block text-[10px] text-slate-100">|</span>
                           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">{user.email}</p>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-6 self-end md:self-auto">
                     <div className="text-right hidden xl:block">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Status Access</p>
                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]
                           ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                             user.status === 'PENDING' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 
                             'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                           {user.status}
                        </span>
                     </div>
                     <div className="w-12 h-12 border border-slate-50 rounded-2xl flex items-center justify-center text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all duration-300">
                        <ChevronRight size={22} />
                     </div>
                  </div>
               </div>
            ))}
            {filteredUsers.length === 0 && (
               <div className="py-20 text-center space-y-4">
                  <Search size={48} className="mx-auto text-slate-100" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No matching nodes identified in master directory</p>
               </div>
            )}
         </div>
      </div>

      {/* Floating Action Menu */}
      <div className="fixed bottom-12 right-12 flex flex-col items-end gap-4 z-40 transform animate-in slide-in-from-bottom-8 duration-700">
         <button onClick={() => setView('add-admin')} className="px-8 py-4 bg-white border border-slate-100 text-indigo-600 rounded-[20px] shadow-3xl flex items-center gap-4 hover:bg-slate-900 hover:text-white transition-all group active:scale-95 border-r-8 border-r-indigo-600">
            <ShieldCheck size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Provision Admin</span>
         </button>
         <button onClick={() => setView('add-hr')} className="px-8 py-4 bg-white border border-slate-100 text-emerald-600 rounded-[20px] shadow-3xl flex items-center gap-4 hover:bg-slate-900 hover:text-white transition-all group active:scale-95 border-r-8 border-r-emerald-500">
            <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">New HR Director</span>
         </button>
      </div>
   </div>
);

const AddAdminView = ({ setView, adminForm, setAdminForm, handleCreateAdmin }) => (
   <div className="max-w-xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-50 pb-12">
         <div className="flex items-center gap-6">
            <button onClick={() => setView('hub')} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">
               <ChevronLeft size={24} />
            </button>
            <div>
               <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">Admin Provisioning</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">HCM Global Management Node</p>
            </div>
         </div>
         <button onClick={() => setView('hub')} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90">
            <CloseIcon size={20} />
         </button>
      </div>

      <form onSubmit={handleCreateAdmin} className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-soft space-y-10">
         <div className="p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-[10px] font-black text-slate-400 leading-relaxed uppercase tracking-[0.2em] text-center">Identity synchronization protocol initialized. Please input administrative credentials for master node authorization.</p>
         </div>
         
         <div className="space-y-8">
            {[
              { label: 'Full Institution Name', name: 'fullName', type: 'text', icon: UserPlus, placeholder: 'e.g. Jonathan Steele' },
              { label: 'Master Access Email', name: 'email', type: 'email', icon: Mail, placeholder: 'admin@infiap.com' },
              { label: 'Direct Protocol Node (Phone)', name: 'phone', type: 'text', icon: Phone, placeholder: 'Direct Contact Number' }
            ].map((field) => (
               <div key={field.name} className="space-y-3">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.25em] ml-1">{field.label}</label>
                  <div className="relative group">
                     <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                     <input 
                        type={field.type} 
                        value={adminForm[field.name]}
                        onChange={(e) => setAdminForm({...adminForm, [field.name]: e.target.value})}
                        placeholder={field.placeholder} 
                        autoComplete="off"
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all tracking-tight" 
                     />
                  </div>
               </div>
            ))}
            
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.25em] ml-1">Access Tier Logic</label>
               <div className="grid grid-cols-2 gap-6">
                  <button 
                     type="button" 
                     onClick={() => setAdminForm({...adminForm, role: 'Full Admin'})}
                     className={`flex flex-col items-center gap-4 p-8 rounded-[32px] border-2 transition-all active:scale-95
                        ${adminForm.role === 'Full Admin' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-xl shadow-indigo-100' : 'border-slate-50 bg-slate-50 text-slate-300'}`}
                  >
                     <ShieldCheck size={32} />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Master Admin</span>
                  </button>
                  <button 
                     type="button" 
                     onClick={() => setAdminForm({...adminForm, role: 'Read-only'})}
                     className={`flex flex-col items-center gap-4 p-8 rounded-[32px] border-2 transition-all active:scale-95
                        ${adminForm.role === 'Read-only' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-xl shadow-indigo-100' : 'border-slate-50 bg-slate-50 text-slate-300'}`}
                  >
                     <Eye size={32} />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Audit Node</span>
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6">
               <button type="submit" className="flex-1 py-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[24px] shadow-3xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4">
                  Deploy Node <ArrowRight size={18} />
               </button>
               <button type="button" onClick={() => setView('hub')} className="px-8 py-6 bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] rounded-[24px] hover:bg-slate-50 transition-all">
                  Abort
               </button>
            </div>
         </div>
      </form>
   </div>
);

const PermissionsView = ({ setView, selectedUser, togglePermission, showNotification }) => (
   <div className="max-w-xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000 pb-40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-50 pb-12">
         <div className="flex items-center gap-6">
            <button onClick={() => setView('profile')} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">
               <ChevronLeft size={24} />
            </button>
            <div>
               <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">Access Governance</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Security Matrix Control / {selectedUser?.name}</p>
            </div>
         </div>
         <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-[20px] flex items-center justify-center text-xl font-black text-indigo-400 shadow-xl">
            {selectedUser?.avatar}
         </div>
      </div>

      <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-soft space-y-10">
         <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-start gap-5">
            <ShieldAlert size={20} className="text-indigo-600 shrink-0 mt-1" />
            <p className="text-[10px] font-black text-indigo-600 leading-relaxed uppercase tracking-[0.2em]">Administrative Governance Override: Modifying global HCM node access levels will trigger an immediate instance synchronization event.</p>
         </div>

         <div className="space-y-8">
            {[
               { key: 'empMgmt', label: 'HCM Personnel Control', desc: 'Onboard, modify, and terminate staff nodes', icon: Users },
               { key: 'payroll', label: 'Financial Disbursement', desc: 'Salary architecture, taxation, and audit logs', icon: DollarSign },
               { key: 'recruitment', label: 'Talent Acquisition Flow', desc: 'Job pipeline and candidate tracking master', icon: Briefcase },
               { key: 'reports', label: 'Intelligence Analytics', desc: 'Executive dashboards and throughput reports', icon: BarChart3 },
               { key: 'settings', label: 'Global Node Configuration', desc: 'Core system parameters and organization setup', icon: Settings }
            ].map((perm) => (
               <div key={perm.key} className="flex items-center justify-between group cursor-pointer" onClick={() => togglePermission(perm.key)}>
                  <div className="flex items-center gap-6">
                     <div className={`w-14 h-14 ${selectedUser?.permissions?.[perm.key] ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300'} rounded-[20px] shadow-sm flex items-center justify-center transition-all duration-500 group-hover:scale-110`}>
                        <perm.icon size={24} />
                     </div>
                     <div>
                        <p className="text-[13px] font-black text-slate-800 tracking-tight uppercase group-hover:text-indigo-600 transition-colors leading-none mb-2">{perm.label}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{perm.desc}</p>
                     </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full relative transition-all duration-500 p-1 ${selectedUser?.permissions?.[perm.key] ? 'bg-indigo-600' : 'bg-slate-200 shadow-inner'}`}>
                     <div className={`absolute w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-500 ${selectedUser?.permissions?.[perm.key] ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </div>
            ))}
         </div>

         <div className="pt-6">
            <button 
               onClick={() => {
                  showNotification('Encryption Suite: Access keys signed and deployed.');
                  setView('profile');
               }}
               className="w-full py-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.45em] rounded-[24px] shadow-3xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4"
            >
               Authorize Changes <Check size={18} />
            </button>
         </div>
      </div>
   </div>
);

const ProfileView = ({ setView, selectedUser, handleDeleteUser, showNotification, onEditNode }) => (
   <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000 pb-40">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-50 pb-12 px-4">
         <div className="flex items-center gap-6">
            <button onClick={() => setView('hub')} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">
               <ChevronLeft size={24} />
            </button>
            <div>
               <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">Resource Master</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Institutional Profile Directory</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={() => setView('permissions')} className="px-8 py-4 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-[20px] hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-3 shadow-sm group">
               <Lock size={16} className="group-hover:rotate-12 transition-transform" /> Permissions
            </button>
            <button 
               onClick={() => handleDeleteUser(selectedUser?.id)}
               className="p-4 bg-rose-50 text-rose-500 rounded-[20px] hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
               <Trash2 size={22} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
         <div className="lg:col-span-8 space-y-10">
            <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-soft text-center space-y-8 relative overflow-hidden group">
               <div className="relative mx-auto w-40 h-40">
                  <div className="w-full h-full bg-slate-50 rounded-[48px] border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden font-black text-5xl text-slate-200 uppercase group-hover:scale-110 transition-transform duration-500">
                     {selectedUser?.avatar}
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
               </div>
               <div>
                  <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">{selectedUser?.name}</h2>
                  <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6">{selectedUser?.role}</p>
                  <div className="flex items-center justify-center gap-6">
                     <span className="px-5 py-2 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-emerald-100">PLATFORM NODE ACTIVE</span>
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">SID: {selectedUser?.empId}</span>
                  </div>
               </div>
               <div className="flex items-center justify-center gap-4 pt-6">
                  <button
                     onClick={onEditNode}
                     className="flex-1 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                     <Edit3 size={16} /> Edit Node Identity
                  </button>
                  <button className="flex-1 py-4 bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                     <Mail size={16} /> Contact Node
                  </button>
               </div>
               <div className="absolute -left-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-50/50 transition-colors"></div>
            </div>

            <div className="bg-white rounded-[48px] border border-slate-100 shadow-soft overflow-hidden">
               <div className="flex border-b border-slate-50 px-10">
                  {['Master Overview', 'Encrypted Documents', 'Allocated Assets'].map((tab) => (
                     <button key={tab} className={`px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] border-b-4 transition-all active:scale-95
                        ${tab === 'Master Overview' ? 'border-indigo-600 text-slate-800' : 'border-transparent text-slate-300 hover:text-slate-500'}`}>
                        {tab}
                     </button>
                  ))}
               </div>
               <div className="p-10 space-y-12">
                  <div className="space-y-10">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-400">
                           <Users size={20} />
                        </div>
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">Resource Infrastructure</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {[
                           { label: 'Cloud Address', value: selectedUser?.email, sub: 'Work Identity' },
                           { label: 'Protocol Line', value: selectedUser?.phone, sub: 'Mobile Direct' },
                           { label: 'Origin Date', value: selectedUser?.dob, sub: 'Date of Birth' },
                           { label: 'Physical Terminal', value: selectedUser?.address, sub: 'Home Base' },
                           { label: 'Department Cluster', value: selectedUser?.dept, sub: 'HCM Node' },
                           { label: 'Superior Agent', value: selectedUser?.manager, sub: 'Admin' }
                        ].map((item, idx) => (
                           <div key={idx} className="group cursor-default">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3 leading-none">{item.label}</p>
                              <p className="text-sm font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{item.value}</p>
                              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-all">{item.sub}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-10">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-soft space-y-8">
               <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">Compliance Assets</h3>
               <div className="space-y-4">
                  {[
                     { label: 'Master Contract', icon: FileText, sub: 'Digital Signature v2' },
                     { label: 'Workstation Node', icon: Box, sub: 'Serial: M1-INF902' }
                  ].map((asset, i) => (
                     <div key={i} className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:border-indigo-100 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                              <asset.icon size={18} />
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1.5">{asset.label}</p>
                              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">{asset.sub}</p>
                           </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-600 transition-all" />
                     </div>
                  ))}
               </div>
            </div>
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-soft space-y-8">
               <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">Historical Vectors</h3>
               <div className="space-y-6">
                  {[
                     { label: 'Performance Node', icon: TrendingUp, color: 'text-amber-500' },
                     { label: 'Attendance Stream', icon: Calendar, color: 'text-indigo-500' },
                     { label: 'Salary Ledger', icon: DollarSign, color: 'text-emerald-500' }
                  ].map((action, i) => (
                     <button key={i} className="w-full flex items-center justify-between group py-2 text-left active:scale-95 transition-transform" onClick={() => showNotification(`Access Audit: Accessing ${selectedUser?.name}'s historical ${action.label} sync point...`)}>
                        <div className="flex items-center gap-5">
                           <div className={`w-10 h-10 bg-slate-50 ${action.color} rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                              <action.icon size={18} />
                           </div>
                           <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{action.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                     </button>
                  ))}
               </div>
            </div>
         </div>
      </div>
   </div>
);

const AddHRView = ({ setView, hrForm, setHrForm, handleCreateHR }) => (
   <div className="max-w-xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000 pb-40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-50 pb-12">
         <div className="flex items-center gap-6">
            <button onClick={() => setView('hub')} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">
               <ChevronLeft size={24} />
            </button>
            <div>
               <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">New HR Director Profile</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Global HCM Leadership Node</p>
            </div>
         </div>
         <button onClick={() => setView('hub')} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90">
            <CloseIcon size={20} />
         </button>
      </div>

      <form onSubmit={handleCreateHR} className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-soft space-y-10">
         <div className="p-6 bg-emerald-50/50 rounded-3xl border border-dashed border-emerald-200">
            <p className="text-[10px] font-black text-emerald-600 leading-relaxed uppercase tracking-[0.2em] text-center">Identity synchronization protocol initialized. Please input administrative credentials for HR node authorization.</p>
         </div>
         
         <div className="space-y-8">
            {[
              { label: 'Full Institution Name', name: 'fullName', type: 'text', icon: UserPlus, placeholder: 'e.g. Jane Doe' },
              { label: 'Master Access Email', name: 'email', type: 'email', icon: Mail, placeholder: 'hr@infiap.com' },
              { label: 'Direct Protocol Node (Phone)', name: 'phone', type: 'text', icon: Phone, placeholder: 'Direct Contact Number' }
            ].map((field) => (
               <div key={field.name} className="space-y-3">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.25em] ml-1">{field.label}</label>
                  <div className="relative group">
                     <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                     <input 
                        type={field.type} 
                        value={hrForm[field.name]}
                        onChange={(e) => setHrForm({...hrForm, [field.name]: e.target.value})}
                        placeholder={field.placeholder} 
                        autoComplete="off"
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:bg-white outline-none transition-all tracking-tight" 
                     />
                  </div>
               </div>
            ))}

            <div className="grid grid-cols-2 gap-6 pt-6">
               <button type="submit" className="flex-1 py-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[24px] shadow-3xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 border border-slate-800">
                  Deploy Node <ArrowRight size={18} />
               </button>
               <button type="button" onClick={() => setView('hub')} className="px-8 py-6 bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] rounded-[24px] hover:bg-slate-50 transition-all">
                  Abort
               </button>
            </div>
         </div>
      </form>
   </div>
);


const EditNodeView = ({ setView, editForm, setEditForm, selectedUser, handleUpdateHR, performUpdateHR, showOtpModal, setShowOtpModal, otp, setOtp, otpError, setOtpError, otpLoading, devOtp, handleOtpChange, handleOtpKeyDown, handleOtpPaste, otpInputRefs }) => (
   <div className="max-w-xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000 pb-40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-50 pb-12">
         <div className="flex items-center gap-6">
            <button onClick={() => setView('profile')} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">
               <ChevronLeft size={24} />
            </button>
            <div>
               <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">Edit Node Identity</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">{selectedUser?.name}</p>
            </div>
         </div>
         <button onClick={() => setView('profile')} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90">
            <CloseIcon size={20} />
         </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); performUpdateHR(); }} className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-soft space-y-10">
         <div className="p-6 bg-indigo-50/50 rounded-3xl border border-dashed border-indigo-200">
            <p className="text-[10px] font-black text-indigo-600 leading-relaxed uppercase tracking-[0.2em] text-center">OTP will be sent to the HR's registered email for verification.</p>
         </div>
         <div className="space-y-8">
            {[
              { label: 'Full Institution Name', name: 'fullName', type: 'text', icon: UserPlus, placeholder: 'e.g. Jane Doe' },
              { label: 'Master Access Email', name: 'email', type: 'email', icon: Mail, placeholder: 'hr@infiap.com' },
              { label: 'Direct Protocol Node (Phone)', name: 'phone', type: 'text', icon: Phone, placeholder: 'Direct Contact Number' }
            ].map((field) => (
               <div key={field.name} className="space-y-3">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.25em] ml-1">{field.label}</label>
                  <div className="relative group">
                     <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                     <input
                        type={field.type}
                        value={editForm[field.name]}
                        onChange={(e) => setEditForm({...editForm, [field.name]: e.target.value})}
                        placeholder={field.placeholder}
                        autoComplete="off"
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all tracking-tight"
                     />
                  </div>
               </div>
            ))}
            <div className="grid grid-cols-2 gap-6 pt-6">
               <button type="submit" className="flex-1 py-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[24px] shadow-3xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 border border-slate-800">
                  Save Changes <ArrowRight size={18} />
               </button>
               <button type="button" onClick={() => setView('profile')} className="px-8 py-6 bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] rounded-[24px] hover:bg-slate-50 transition-all">
                  Abort
               </button>
            </div>
         </div>
      </form>

      {/* OTP Modal */}
      {showOtpModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"></div>
            <div className="bg-white rounded-2xl p-8 max-w-md w-full relative z-10 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-300 text-center">
               <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-6">
                  <ShieldCheck size={32} strokeWidth={2} />
               </div>
               <h2 className="text-xl font-semibold text-slate-800 mb-2">Profile Update Verification</h2>
               <p className="text-slate-500 text-sm mb-6">
                  A verification code has been sent to the HR's registered email. Please enter it below to confirm the profile changes.
               </p>
               {devOtp && (
                  <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl inline-block">
                     <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                        Dev OTP: {devOtp}
                     </p>
                  </div>
               )}
               {otpError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                     <AlertCircle size={14} className="text-red-500 shrink-0" />
                     <p className="text-xs font-semibold text-red-600">{otpError}</p>
                  </div>
               )}
               <div className="flex justify-between gap-2 mb-6">
                  {otp.map((data, index) => (
                     <input
                        key={index}
                        type="text"
                        maxLength="1"
                        ref={el => otpInputRefs.current[index] = el}
                        value={data}
                        onChange={e => handleOtpChange(e.target, index)}
                        onKeyDown={e => handleOtpKeyDown(e, index)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="w-full aspect-square max-w-12 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl font-black text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                     />
                  ))}
               </div>
               <div className="flex flex-col gap-3">
                  <button
                     onClick={handleUpdateHR}
                     disabled={otpLoading || otp.some(v => v === '')}
                     className={`w-full py-3 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        otpLoading || otp.some(v => v === '')
                           ? 'bg-slate-300 cursor-not-allowed'
                           : 'bg-indigo-600 hover:bg-indigo-700'
                     }`}
                  >
                     {otpLoading ? (
                        <>
                           <Loader2 size={16} className="animate-spin" />
                           Verifying...
                        </>
                     ) : (
                        <>
                           <ShieldCheck size={16} />
                           Verify & Save
                        </>
                     )}
                  </button>
                  <button
                     onClick={performUpdateHR}
                     disabled={otpLoading}
                     className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                     <RefreshCw size={14} className={otpLoading ? 'animate-spin' : ''} />
                     {otpLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                  <button
                     onClick={() => { setShowOtpModal(false); setOtpError(''); setOtp(['','','','','','']); }}
                     className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                  >
                     Cancel
                  </button>
               </div>
            </div>
         </div>
      )}
   </div>
);

const UserManagement = () => {
   const navigate = useNavigate();
   const [searchParams, setSearchParams] = useSearchParams();
   const viewParam = searchParams.get('view') || 'hub';

   const { fetchAllUsers, deleteUser, createAdmin, createHR, updateHR, verifyHRProfileUpdate, createEmployee, requestEditOTP, loading: authLoading } = useAuth();
   
   const [view, setViewInternal] = useState(viewParam);
   const [notification, setNotification] = useState(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [filterStatus, setFilterStatus] = useState('All Users');
   const [users, setUsers] = useState([]);
   const [isLoading, setIsLoading] = useState(true);

   // Sync local view state with search params
   useEffect(() => {
      setViewInternal(viewParam);
   }, [viewParam]);

   // Fetch users from backend
   const loadUsers = async () => {
      setIsLoading(true);
      const res = await fetchAllUsers();
      if (res.success) {
         // Map backend users to UI expected fields
         const mappedUsers = res.data.map(u => ({
            id: u._id,
            name: u.name,
            role: u.role,
            email: u.email,
            status: u.role === 'Main Admin' ? 'ACTIVE' : 'ACTIVE', // Simple logic for now
            lastLogin: 'Active',
            avatar: u.name.split(' ').map(n=>n[0]).join('').toUpperCase(),
            empId: u._id.substring(0, 8).toUpperCase(),
            phone: '+Internal',
            dept: u.role === 'hr' ? 'HR' : 'Engineering',
            permissions: { empMgmt: true, payroll: true, recruitment: true, reports: true, settings: true }
         }));
         setUsers(mappedUsers);
      } else {
         showNotification('Identity Error: Failed to synchronize master directory.');
      }
      setIsLoading(false);
   };

   useEffect(() => {
      loadUsers();
   }, []);

   const showNotification = (msg) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 3000);
   };

   const setView = (newView) => {
      if (newView === 'hub') {
         setSearchParams({});
      } else {
         setSearchParams({ view: newView });
      }
      setViewInternal(newView);
      window.scrollTo(0, 0);
   };

   const [selectedUser, setSelectedUser] = useState(null);
   const [showPassword, setShowPassword] = useState(false);

   const [adminForm, setAdminForm] = useState({ fullName: '', email: '', phone: '', company: '', role: 'Full Admin' });
   const [hrForm, setHrForm] = useState({ fullName: '', email: '', phone: '', department: 'HR', role: 'HR Director' });
   const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '', department: 'HR', role: 'HR Director' });

   // OTP modal state for editing HR
   const [showOtpModal, setShowOtpModal] = useState(false);
   const [otp, setOtp] = useState(['', '', '', '', '', '']);
   const [otpError, setOtpError] = useState('');
   const [otpLoading, setOtpLoading] = useState(false);
   const [devOtp, setDevOtp] = useState(null);
   const otpInputRefs = useRef([]);

   const filteredUsers = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'All Users' || 
                           (filterStatus === 'Admins' && user.dept === 'Engineering') || 
                           (filterStatus === 'HR Managers' && user.dept === 'HR') ||
                           (filterStatus === 'Internal' && user.type === 'FULL-TIME');
      return matchesSearch && matchesFilter;
   });

   const togglePermission = (key) => {
      if (!selectedUser) return;
      const updatedUser = {
         ...selectedUser,
         permissions: {
            ...selectedUser.permissions,
            [key]: !selectedUser.permissions[key]
         }
      };
      setSelectedUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      showNotification(`Identity Hub: ${key} access level updated for node ${updatedUser.avatar}.`);
   };

   const handleDeleteUser = async (id) => {
      if (window.confirm('Institutional Security Alert: Are you absolutely certain you want to terminate this resource access? This action is irreversible.')) {
         const res = await deleteUser(id);
         if (res.success) {
            showNotification('Resource Protocol: Node access permanently decommissioned.');
            loadUsers();
            setView('hub');
         } else {
            showNotification('Security Breach: Failed to decommission access node.');
         }
      }
   };

   const handleCreateAdmin = async (e) => {
      e.preventDefault();
      if (!adminForm.fullName || !adminForm.email) return;
      showNotification('Provisioning Engine: Synergizing administrative credentials...');
      
      const res = await createAdmin({
         name: adminForm.fullName,
         email: adminForm.email,
         password: 'TemporaryPassword123!', // Admin created users should reset this
         role: 'admin'
      });

      if (res.success) {
         showNotification(`Access Protocol: Node successfully provisioned.`);
         loadUsers();
         setView('hub');
      } else {
         showNotification(`Access Denied: ${res.error}`);
      }
   };

   const handleCreateHR = async (e) => {
      e.preventDefault();
      if (!hrForm.fullName || !hrForm.email) return;
      showNotification('Provisioning Engine: Synergizing HR credentials...');
      
      const res = await createHR({
         name: hrForm.fullName,
         email: hrForm.email,
         password: 'TemporaryPassword123!', // HR created users should reset this
         role: 'hr'
      });

      if (res.success) {
         showNotification(`Access Protocol: HR Node successfully provisioned.`);
         loadUsers();
         setView('hub');
      } else {
         showNotification(`Access Denied: ${res.error}`);
      }
   };

   const handleEditNodeClick = () => {
      if (!selectedUser) return;
      setEditForm({
         fullName: selectedUser.name || '',
         email: selectedUser.email || '',
         phone: selectedUser.phone || '',
         department: selectedUser.dept || 'HR',
         role: selectedUser.role || 'HR Director'
      });
      setView('edit-node');
   };

   const handleOtpChange = (element, index) => {
      if (isNaN(element.value)) return;
      const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
      setOtp(newOtp);
      setOtpError('');
      if (element.nextSibling && element.value !== '') {
         element.nextSibling.focus();
      }
   };

   const handleOtpKeyDown = (e, index) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
         otpInputRefs.current[index - 1].focus();
      }
   };

   const handleOtpPaste = (e) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      if (pasted.length === 6) {
         setOtp(pasted.split(''));
         otpInputRefs.current[5]?.focus();
      }
   };

   const performUpdateHR = async () => {
      setOtpLoading(true);
      setOtpError('');

      const res = await updateHR(selectedUser.id, {
         name: editForm.fullName,
         email: editForm.email,
         phone: editForm.phone,
         department: editForm.department
      });

      setOtpLoading(false);

      if (res?.otpRequired) {
         setShowOtpModal(true);
         if (res.devOtp) setDevOtp(res.devOtp);
         return false;
      }

      if (res.success) {
         showNotification('Identity Protocol: HR Node identity updated successfully.');
         setShowOtpModal(false);
         setOtp(['', '', '', '', '', '']);
         setDevOtp(null);
         loadUsers();
         setView('profile');
         return true;
      } else {
         setOtpError(res.error || 'Failed to update HR profile');
         return false;
      }
   };

   const handleUpdateHR = async (e) => {
      e.preventDefault();
      const otpString = otp.join('');
      if (otpString.length !== 6) {
         setOtpError('Please enter all 6 digits');
         return;
      }
      setOtpLoading(true);
      setOtpError('');

      const res = await verifyHRProfileUpdate(selectedUser.id, otpString);

      setOtpLoading(false);

      if (res.success) {
         showNotification('Identity Protocol: HR Node identity updated successfully.');
         setShowOtpModal(false);
         setOtp(['', '', '', '', '', '']);
         setDevOtp(null);
         loadUsers();
         setView('profile');
      } else {
         setOtpError(res.error || 'Failed to verify OTP');
         setOtp(['', '', '', '', '', '']);
         otpInputRefs.current[0]?.focus();
      }
   };

   return (
      <div className="min-h-screen relative">
         {/* Premium Notification Toast */}
         {notification && (
            <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[24px] shadow-3xl border border-white/10">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification}</span>
            </div>
         )}

         <div className="animate-in fade-in zoom-in-95 duration-1000">
            {view === 'hub' && (
               <HubView 
                  setView={setView} 
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm} 
                  filterStatus={filterStatus} 
                  setFilterStatus={setFilterStatus} 
                  filteredUsers={filteredUsers} 
                  setSelectedUser={setSelectedUser} 
               />
            )}
            {view === 'profile' && (
               <ProfileView
                  setView={setView}
                  selectedUser={selectedUser}
                  handleDeleteUser={handleDeleteUser}
                  showNotification={showNotification}
                  onEditNode={handleEditNodeClick}
               />
            )}
            {view === 'add-admin' && (
               <AddAdminView
                  setView={setView}
                  adminForm={adminForm}
                  setAdminForm={setAdminForm}
                  handleCreateAdmin={handleCreateAdmin}
               />
            )}
            {view === 'add-hr' && (
               <AddHRView
                  setView={setView}
                  hrForm={hrForm}
                  setHrForm={setHrForm}
                  handleCreateHR={handleCreateHR}
               />
            )}
            {view === 'edit-node' && (
               <EditNodeView
                  setView={setView}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  selectedUser={selectedUser}
                  handleUpdateHR={handleUpdateHR}
                  performUpdateHR={performUpdateHR}
                  showOtpModal={showOtpModal}
                  setShowOtpModal={setShowOtpModal}
                  otp={otp}
                  setOtp={setOtp}
                  otpError={otpError}
                  setOtpError={setOtpError}
                  otpLoading={otpLoading}
                  devOtp={devOtp}
                  handleOtpChange={handleOtpChange}
                  handleOtpKeyDown={handleOtpKeyDown}
                  handleOtpPaste={handleOtpPaste}
                  otpInputRefs={otpInputRefs}
               />
            )}
            {view === 'permissions' && (
               <PermissionsView
                  setView={setView}
                  selectedUser={selectedUser}
                  togglePermission={togglePermission}
                  showNotification={showNotification}
               />
            )}
         </div>
      </div>
   );
};

export default UserManagement;
