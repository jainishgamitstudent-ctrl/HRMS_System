import React, { useState } from 'react';
import { X, User, Mail, Phone, Briefcase, Globe, Star, Upload, Rocket, ChevronDown } from 'lucide-react';
import { createCandidate } from '../../../services/hrApi';

const AddCandidateModal = ({ isOpen, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        applicantName: '',
        email: '',
        phone: '',
        jobTitle: '',
        yearsOfExperience: 0,
        location: '',
        source: 'LinkedIn',
        rating: 4.0
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCandidate(formData);
            onRefresh();
            onClose();
        } catch (err) {
            alert("Failed to add candidate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-left">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Add New Candidate</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Enter candidate details below</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-slate-900">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input 
                                    required
                                    type="text" 
                                    placeholder="e.g. Alex Rivers"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    value={formData.applicantName}
                                    onChange={(e) => setFormData({...formData, applicantName: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input 
                                    required
                                    type="email" 
                                    placeholder="alex@work.com"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Target Role</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input 
                                    required
                                    type="text" 
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Experience (Years)</label>
                            <div className="relative group">
                                <Star className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input 
                                    required
                                    type="number" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    value={formData.yearsOfExperience}
                                    onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Location</label>
                            <div className="relative group">
                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="e.g. New York, Remote"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Candidate Source</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none"
                                    value={formData.source}
                                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                                >
                                    <option>LinkedIn</option>
                                    <option>Referral</option>
                                    <option>Indeed</option>
                                    <option>Career Page</option>
                                    <option>Other</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Rocket size={16} />
                                Add Candidate
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCandidateModal;
