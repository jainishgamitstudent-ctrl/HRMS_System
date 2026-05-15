import React, { useState, useRef } from 'react';
import {
   Building2,
   Globe,
   ShieldCheck,
   Mail,
   CheckCircle2,
   ChevronLeft,
   ChevronRight,
   Plus,
   Layers,
   Settings,
   X,
   PlusCircle,
   Users,
   Camera,
   Search,
   Check,
   Zap,
   Lock,
   MessageSquare,
   UploadCloud,
   Palette,
   RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FormSection = ({ title, desc, icon: Icon, children }) => (
   <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-soft space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:shadow-2xl hover:shadow-slate-100 transition-all">
      <div className="flex items-start gap-4 pb-8 border-b border-slate-50">
         <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center flex-shrink-0 border border-indigo-100/50">
            <Icon size={20} />
         </div>
         <div>
            <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em] leading-none mb-2">{title}</h3>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{desc}</p>
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         {children}
      </div>
   </div>
);

const FormInput = ({ label, name, value, onChange, placeholder, type = "text", icon: Icon, prefix }) => (
   <div className="space-y-4">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative group">
         {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />}
         {prefix && <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">{prefix}</span>}
         <input
            name={name}
            value={value}
            onChange={onChange}
            type={type}
            placeholder={placeholder}
            autoComplete="off"
            className={`w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all
             ${Icon || prefix ? 'pl-16 pr-8' : 'px-8'}`}
         />
      </div>
   </div>
);

const CompanySetup = () => {
   const navigate = useNavigate();
   const fileInputRef = useRef(null);

   const [formData, setFormData] = useState({
      companyName: 'InfiAP Solutions',
      companySize: '1-50 Employees',
      headquarters: 'San Francisco, CA',
      entityId: 'US-NY-2024-001',
      primaryColor: '#4F46E5',
      accentColor: '#10B981',
      enforce2FA: true,
      ssoLogin: false,
      logoPreview: null
   });

   const [notification, setNotification] = useState(null);
   const [isSaving, setIsSaving] = useState(false);

   const showNotification = (msg) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 3000);
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleToggle = (key) => {
      setFormData(prev => ({ ...prev, [key]: !prev[key] }));
      showNotification(`Security Policy: ${key.replace(/([A-Z])/g, ' $1').trim()} updated.`);
   };

   const handleLogoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setFormData(prev => ({ ...prev, logoPreview: reader.result }));
            showNotification('Institutional Branding: Logo updated successfully.');
         };
         reader.readAsDataURL(file);
      }
   };

   const handleSave = () => {
      setIsSaving(true);
      showNotification('Institutional Synchronizer: Deploying configuration to master nodes...');
      setTimeout(() => {
         setIsSaving(false);
         navigate('/main-admin/success');
      }, 2000);
   };

   return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-40 relative">

         {/* Premium Notification Toast */}
         {notification && (
            <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-8 fade-in flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[24px] shadow-3xl border border-white/10">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification}</span>
            </div>
         )}

         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-slate-50 pb-12 px-2">
            <div>
               <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-3">Company Setup</h1>
               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Institutional Node Configuration & Branding</p>
            </div>
            <button
               onClick={() => navigate('/main-admin/dashboard')}
               className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] hover:bg-indigo-600 transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 group"
            >
               <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
            </button>
         </div>

         {/* 1. General Information */}
         <FormSection
            title="General Information"
            desc="Primary institutional identity and scale"
            icon={Building2}
         >
            <FormInput 
               label="Company Legal Name" 
               name="companyName"
               value={formData.companyName}
               onChange={handleInputChange}
               placeholder="e.g. Acme Corp" 
            />
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Company Size</label>
               <div className="relative">
                  <select 
                     name="companySize"
                     value={formData.companySize}
                     onChange={handleInputChange}
                     className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                  >
                     <option>1-50 Employees</option>
                     <option>51-200 Employees</option>
                     <option>201-1000 Employees</option>
                     <option>1000+ Employees</option>
                  </select>
                  <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" />
               </div>
            </div>
            <FormInput 
               label="Headquarters" 
               name="headquarters"
               value={formData.headquarters}
               onChange={handleInputChange}
               placeholder="San Francisco, CA" 
               icon={Globe} 
            />
            <FormInput 
               label="Legal Entity ID" 
               name="entityId"
               value={formData.entityId}
               onChange={handleInputChange}
               placeholder="US-NY-2024-001" 
               icon={ShieldCheck} 
            />
         </FormSection>

         {/* 2. Branding & Logo */}
         <FormSection
            title="Branding & Logo"
            desc="Visual identity across the platform"
            icon={Layers}
         >
            <div className="md:col-span-2 flex items-center gap-10 p-10 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200 group/upload hover:border-indigo-400 hover:bg-indigo-50/30 transition-all transition-duration-500">
               <div 
                  onClick={() => fileInputRef.current.click()}
                  className="w-28 h-28 bg-white rounded-[32px] border border-slate-200 flex items-center justify-center text-slate-300 shadow-soft relative group cursor-pointer overflow-hidden transition-all group-hover/upload:scale-105"
               >
                  {formData.logoPreview ? (
                     <img src={formData.logoPreview} alt="Logo" className="w-full h-full object-contain p-4" />
                  ) : (
                     <Camera size={24} />
                  )}
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                     <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Update</span>
                  </div>
                  <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleLogoUpload} 
                     className="hidden" 
                     accept="image/*"
                  />
               </div>
               <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">Institutional Logo</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 leading-relaxed">System-wide branding node.<br/>PNG or JPG (Min 400x400px)</p>
                  <button 
                     onClick={() => fileInputRef.current.click()}
                     className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-[0.1em] hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                  >
                     Upload New Asset
                  </button>
               </div>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Primary Institutional Color</label>
               <div className="flex items-center gap-4">
                  <div 
                     className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-lg hover:scale-110 transition-transform flex-shrink-0" 
                     style={{ backgroundColor: formData.primaryColor }}
                  ></div>
                  <div className="relative flex-1">
                     <Palette size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                     <input 
                        type="text" 
                        name="primaryColor"
                        value={formData.primaryColor}
                        onChange={handleInputChange}
                        autoComplete="off"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all tracking-widest uppercase" 
                     />
                  </div>
               </div>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Accent Accent Color</label>
               <div className="flex items-center gap-4">
                  <div 
                     className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-lg hover:scale-110 transition-transform flex-shrink-0" 
                     style={{ backgroundColor: formData.accentColor }}
                  ></div>
                  <div className="relative flex-1">
                     <Palette size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                     <input 
                        type="text" 
                        name="accentColor"
                        value={formData.accentColor}
                        onChange={handleInputChange}
                        autoComplete="off"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all tracking-widest uppercase" 
                     />
                  </div>
               </div>
            </div>
         </FormSection>

         {/* 3. Structure & Policies */}
         <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="p-10 pb-6 border-b border-slate-50">
               <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em] leading-none mb-2">Structure & Master Policies</h3>
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Organisational nodes and compliance vectors</p>
            </div>
            <div className="divide-y divide-slate-50">
               {[
                  { title: 'Organization Structure', desc: 'Departments and Teams', icon: Users },
                  { title: 'Work Policies', desc: 'Days Off, Shifts, WFH', icon: Zap }
               ].map((node, i) => (
                  <div key={i} className="flex items-center justify-between p-8 hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => showNotification(`Accessing Institutional ${node.title} Cluster...`)}>
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                           <node.icon size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">{node.title}</p>
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{node.desc}</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
               ))}
            </div>
         </div>

         {/* 4. Connected Apps */}
         <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="p-10 pb-6 border-b border-slate-50">
               <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em] leading-none mb-2">Integrated Platforms</h3>
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Institutional service interconnects</p>
            </div>
            <div className="divide-y divide-slate-50">
               {[
                  { name: 'Slack', desc: 'NOT CONNECTED', icon: MessageSquare, color: 'text-slate-300' },
                  { name: 'Google Workspace', desc: 'NOT CONNECTED', icon: Globe, color: 'text-slate-300' }
               ].map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-8 hover:bg-slate-50 transition-all group">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                           <app.icon size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">{app.name}</p>
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">{app.desc}</p>
                        </div>
                     </div>
                     <button className="px-5 py-2.5 bg-white border border-slate-100 rounded-[14px] text-[10px] font-black uppercase tracking-[0.1em] hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95 shadow-sm" onClick={() => showNotification(`Protocol Hub: Initiating ${app.name} link sequence...`)}>Connect Node</button>
                  </div>
               ))}
            </div>
         </div>

         {/* 5. Security & Privacy */}
         <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-soft space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="flex items-start gap-4 pb-8 border-b border-slate-50">
               <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-[20px] flex items-center justify-center flex-shrink-0 border border-rose-100/50">
                  <Lock size={20} />
               </div>
               <div>
                  <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em] leading-none mb-2">Security & Privacy Architecture</h3>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Infrastructural protection and authentication protocols</p>
               </div>
            </div>
            <div className="space-y-10">
               <div className="flex items-center justify-between group cursor-pointer" onClick={() => handleToggle('enforce2FA')}>
                  <div>
                     <p className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">Enforce Mandatory 2FA</p>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Global requirement for all administrative entities</p>
                  </div>
                  <div className={`w-14 h-8 rounded-full relative p-1 transition-all duration-300 ${formData.enforce2FA ? 'bg-indigo-600 shadow-indigo-100 shadow-lg' : 'bg-slate-200 shadow-inner'}`}>
                     <div className={`absolute w-6 h-6 bg-white rounded-full transition-all duration-300 ${formData.enforce2FA ? 'ml-6' : 'ml-0'}`}></div>
                  </div>
               </div>
               <div className="flex items-center justify-between group cursor-pointer" onClick={() => handleToggle('ssoLogin')}>
                  <div>
                     <p className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">SSO Institutional Login</p>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Synchronize access via SAML/Okta gateways</p>
                  </div>
                  <div className={`w-14 h-8 rounded-full relative p-1 transition-all duration-300 ${formData.ssoLogin ? 'bg-indigo-600 shadow-indigo-100 shadow-lg' : 'bg-slate-200 shadow-inner'}`}>
                     <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${formData.ssoLogin ? 'ml-6' : 'ml-0'}`}></div>
                  </div>
               </div>
            </div>
         </div>

         {/* Actions Bar */}
         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-10 flex items-center gap-6 z-30 animate-in slide-in-from-right-8 duration-700">
            <button
               onClick={() => navigate('/main-admin/dashboard')}
               className="px-10 py-5 bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-[24px] shadow-3xl hover:text-slate-800 hover:border-slate-300 transition-all flex items-center gap-2 active:scale-95"
            >
               Discard Changes
            </button>
            <button
               disabled={isSaving}
               onClick={handleSave}
               className={`px-12 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[24px] shadow-3xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-4 active:scale-95 group relative overflow-hidden ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
               {isSaving ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Deploying...
                  </>
               ) : (
                  <>
                    Save Changes
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </>
               )}
            </button>
         </div>

      </div>
   );
};

export default CompanySetup;
