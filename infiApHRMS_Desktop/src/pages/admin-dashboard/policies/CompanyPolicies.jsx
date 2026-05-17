import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, FileText, Clock, Loader2, X, ExternalLink, ShieldCheck, FileCheck, Scale } from 'lucide-react';
import api from '../../../utils/axios';
import { usePolicyContext } from '../../../context/PolicyContext';

const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  category: 'Legal',
  status: 'Active',
  content: `YourCompany Technologies Pvt. Ltd.
Effective Date: January 1, 2025 | Last Updated: April 2025

1. What Data We Collect
When you use YourCompany, we may collect the following types of information:
• Information you give us directly: Full name and email address (when you sign up), Company name and job title (optional), Billing information (processed securely via our payment partner — we never store your card details).
• Information collected automatically: IP address and approximate location (city-level), Browser type, device type, and operating system, Pages visited, features used, and time spent on the platform, Cookies and similar tracking technologies.

2. Why We Collect It
We use your data only for legitimate business purposes:
• To create and manage your account
• To deliver the product and features you signed up for
• To send you important account notices and product updates
• To analyze usage patterns and improve the platform
• To process billing and prevent fraud
• To respond to your support requests

3. Who We Share Data With
We do not sell your personal data. We share limited data with trusted third-party service providers:
• Cloud infrastructure (AWS, Google Cloud) — for hosting and storage
• Analytics tools (Google Analytics, Mixpanel) — for understanding usage
• Payment processors (Razorpay, Stripe) — for billing
• Email delivery providers (SendGrid) — for transactional emails

4. How Long We Keep Your Data
• Account data is retained for the duration of your account and deleted within 30 days of account closure
• Usage and analytics data is retained for up to 24 months in aggregated form
• Billing records are retained for 7 years as required by Indian tax law

5. Your Rights
You have full control over your personal data:
• Access — Request a copy of all personal data we hold about you
• Correct — Ask us to update any inaccurate or outdated information
• Delete — Request permanent deletion of your account and all associated data
• Portability — Request your data in a structured, machine-readable format
• Opt out — Unsubscribe from marketing emails at any time

6. Cookies & Tracking
• Essential cookies — Required for login, security, and core features. Cannot be disabled
• Analytics cookies — Help us understand which features people use. You can opt out
• Preference cookies — Remember your settings like language and display preferences

7. Data Security
• All data is encrypted in transit (TLS 1.2+) and at rest (AES-256)
• Access to production systems is restricted to authorized personnel only
• We perform regular security audits and vulnerability assessments
• In the event of a data breach, we will notify affected users within 72 hours

8. Contact & Privacy Requests
If you have any questions, concerns, or requests related to your privacy, please reach out to privacy@yourcompany.io`
};

const TERMS_OF_SERVICE = {
  title: 'Terms of Service',
  category: 'Legal',
  status: 'Active',
  content: `YourCompany Technologies Pvt. Ltd.
Effective Date: January 1, 2025 | Last Updated: April 2025

1. Who Can Use Our Services
Our services are available to individuals and businesses that meet the following criteria:
• You are at least 18 years of age (or the age of majority in your jurisdiction)
• You have the legal authority to enter into this agreement
• Your use of YourCompany services is not prohibited by any applicable law or regulation

2. Your Account
When you create an account with us, you are responsible for keeping it secure:
• Use a strong, unique password and don't share it with anyone
• Notify us immediately at security@yourcompany.io if you suspect unauthorized access
• You are responsible for all activity that happens under your account
• Each account is for one person or one company — no account sharing

3. Acceptable Use
The following are strictly prohibited:
• Using our platform for any illegal activity or to violate anyone's rights
• Attempting to scrape, copy, or bulk-extract data from our platform without written permission
• Impersonating any person, company, or entity
• Uploading malware, viruses, or any harmful code
• Attempting to gain unauthorized access to any part of our systems
• Sending spam, phishing messages, or unsolicited bulk communications

4. Your Content & Intellectual Property
• You keep full ownership of all content you create or upload
• By using our services, you grant YourCompany a limited, non-exclusive license to host, store, and display your content
• We will never sell your content to third parties
• Our platform, branding, code, and documentation belong to YourCompany

5. Payments & Billing
• All fees are listed in INR unless stated otherwise, and exclude applicable taxes
• Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date
• Refunds are handled on a case-by-case basis
• We reserve the right to update pricing with 30 days' notice via email

6. Limitation of Liability
• YourCompany is provided "as is" without warranties of any kind
• We are not liable for any indirect, incidental, or consequential damages
• Our total liability to you in any 12-month period shall not exceed the amount you paid us

7. Account Termination
• You may delete your account at any time from your account settings
• We may suspend or terminate your account if you violate these Terms
• Upon termination, your right to access the service ends immediately

8. Governing Law & Disputes
• These Terms are governed by the laws of India
• We encourage you to first contact us at legal@yourcompany.io to resolve matters amicably
• Disputes shall be subject to the exclusive jurisdiction of courts in India

Questions about these terms? legal@yourcompany.io`
};

const CompanyPolicies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    policies = [], 
    loading, 
    fetchPolicies, 
    addPolicy, 
    removePolicy, 
    updatePolicy 
  } = usePolicyContext();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [newPolicyData, setNewPolicyData] = useState({
    title: '',
    category: 'Legal',
    status: 'Draft',
    content: ''
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const builtInDocs = [PRIVACY_POLICY, TERMS_OF_SERVICE];

  useEffect(() => {
    fetchPolicies();
  }, []);

  const openCreateModal = () => {
    setEditingPolicyId(null);
    setNewPolicyData({ title: '', category: 'Legal', status: 'Draft', content: '' });
    setCreateModalOpen(true);
  };

  const handleEditPolicy = (e, policy) => {
    e.stopPropagation();
    setEditingPolicyId(policy._id || policy.title);
    setNewPolicyData({
      title: policy.title,
      category: policy.category || 'General',
      status: policy.status || 'Active',
      content: policy.content || policy.description || ''
    });
    setCreateModalOpen(true);
  };

  const handleDeletePolicy = async (e, policyId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this policy?')) {
      const result = await removePolicy(policyId);
      if (!result.success) {
        alert(result.error || 'Failed to delete policy.');
      }
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    if (!newPolicyData.title.trim() || !newPolicyData.content.trim()) return;

    if (editingPolicyId) {
      const result = await updatePolicy(editingPolicyId, newPolicyData);
      if (!result.success) {
        alert(result.error || 'Failed to update policy.');
        return;
      }
    } else {
      const result = await addPolicy(newPolicyData);
      if (!result.success) {
        alert(result.error || 'Failed to create policy.');
        return;
      }
    }

    setCreateModalOpen(false);
    setEditingPolicyId(null);
    setNewPolicyData({ title: '', category: 'Legal', status: 'Draft', content: '' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(true);
    
    // Simulate reading the file
    setTimeout(() => {
      setNewPolicyData(prev => ({
        ...prev,
        content: prev.content + `\n\n[Attached Document: ${file.name}]`
      }));
      setUploadingDoc(false);
    }, 800);
  };

  const allPolicies = [...builtInDocs, ...policies];

  const stats = useMemo(() => ({
    total: allPolicies.length,
    active: allPolicies.filter(p => String(p.status).toLowerCase() === 'active').length,
    draft: allPolicies.filter(p => String(p.status).toLowerCase() === 'draft').length,
  }), [allPolicies]);

  const filteredPolicies = allPolicies.filter((policy) => {
    const query = searchQuery.toLowerCase();
    return [policy.title, policy.status, policy.description, policy.category]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const getStatusStyle = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'active') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'draft') return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  const isBuiltIn = (policy) => builtInDocs.some(b => b.title === policy.title);

  const getCategoryIcon = (category) => {
    const cat = String(category).toLowerCase();
    if (cat.includes('legal')) return Scale;
    if (cat.includes('security')) return ShieldCheck;
    return FileCheck;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">Company Policies</h1>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Manage legal documents and corporate governance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-100 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all w-[240px] shadow-sm"
            />
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Policy
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Documents</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Policies</p>
            <p className="text-2xl font-black text-emerald-600 leading-none">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Drafts</p>
            <p className="text-2xl font-black text-amber-600 leading-none">{stats.draft}</p>
          </div>
        </div>
      </div>

      {/* Policy Grid */}
      <div className="px-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading documents...</span>
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm gap-4">
            <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">No policies found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search query.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPolicies.map((policy, idx) => {
              const Icon = getCategoryIcon(policy.category);
              return (
                <div
                  key={policy._id || idx}
                  onClick={() => setSelectedPolicy(policy)}
                  className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 cursor-pointer transition-all duration-300 group flex flex-col"
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Icon size={20} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(policy.status)}`}>
                      {policy.status || 'Active'}
                    </span>
                  </div>
                  
                  <div className="mb-6 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{policy.title}</h3>
                      {isBuiltIn(policy) && (
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md shrink-0">Default</span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{policy.category || 'General'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto relative z-10">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">
                        {policy.updatedAt ? new Date(policy.updatedAt).toLocaleDateString('en-IN') : 'Recently'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isBuiltIn(policy) && (
                        <>
                          <button 
                            onClick={(e) => handleEditPolicy(e, policy)}
                            className="text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={(e) => handleDeletePolicy(e, policy._id || policy.title)}
                            className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors ml-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Policy Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedPolicy(null)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 border-b border-slate-100 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(selectedPolicy.status)}`}>
                    {selectedPolicy.status || 'Active'}
                  </span>
                  {isBuiltIn(selectedPolicy) && (
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">Built-in Document</span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">{selectedPolicy.title}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedPolicy.category || 'General'}</p>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto prose prose-slate prose-sm sm:prose-base prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-indigo-600 prose-a:font-bold prose-p:text-slate-600 prose-p:font-medium prose-p:leading-relaxed">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 leading-relaxed font-medium">
                  {selectedPolicy.content || selectedPolicy.description || 'No content available.'}
                </pre>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button
                  onClick={() => setSelectedPolicy(null)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
               >
                  Close Document
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Policy Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
                  {editingPolicyId ? 'Edit Policy' : 'Create Policy'}
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  {editingPolicyId ? 'Modify existing document' : 'Add a new company policy or document'}
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Policy Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Remote Work Policy 2025"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner"
                    value={newPolicyData.title}
                    onChange={(e) => setNewPolicyData({...newPolicyData, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category</label>
                    <div className="relative">
                      <select
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner appearance-none"
                        value={newPolicyData.category}
                        onChange={(e) => setNewPolicyData({...newPolicyData, category: e.target.value})}
                      >
                        <option value="Legal">Legal</option>
                        <option value="Security">Security</option>
                        <option value="HR">HR</option>
                        <option value="General">General</option>
                        <option value="Operations">Operations</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Initial Status</label>
                    <div className="relative">
                      <select
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner appearance-none"
                        value={newPolicyData.status}
                        onChange={(e) => setNewPolicyData({...newPolicyData, status: e.target.value})}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Upload Document (Optional)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-white border-2 border-dashed border-slate-200 rounded-2xl px-5 py-6 text-center group-hover:border-indigo-400 group-hover:bg-indigo-50/50 transition-all">
                      {uploadingDoc ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-indigo-500">
                          <Loader2 size={24} className="animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-500 group-hover:text-indigo-500">
                          <FileText size={24} className="opacity-50" />
                          <span className="text-sm font-bold">Click to browse or drag file here</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">PDF, DOCX, TXT up to 10MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Policy Content / Description *</label>
                  <textarea
                    required
                    placeholder="Write or paste the policy content here..."
                    rows={8}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner resize-y min-h-[150px]"
                    value={newPolicyData.content}
                    onChange={(e) => setNewPolicyData({...newPolicyData, content: e.target.value})}
                  />
                </div>

              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPolicyData.title.trim() || !newPolicyData.content.trim()}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingPolicyId ? 'Save Changes' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyPolicies;