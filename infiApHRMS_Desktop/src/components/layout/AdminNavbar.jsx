import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Check, X, Clock, Users, Building2, Briefcase, ChevronRight, User, Shield, Key, Settings, LogOut, Mail, Menu } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAdminDashboard } from '../../context/AdminDashboardContext';
import { useSettings } from '../../context/SettingsContext';


const AdminNavbar = ({ setMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, clearNotifications, markAllAsRead } = useNotifications();
  const { staffDirectory, departments, jobs } = useAdminDashboard();
  const { t, formatRelativeTime, formatDateTime } = useSettings();
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const notificationDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Search Logic
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase();

    const employeeResults = (staffDirectory || [])
      .filter(emp => emp.name?.toLowerCase().includes(query) || emp.employeeId?.toLowerCase().includes(query))
      .slice(0, 4)
      .map(emp => ({ ...emp, type: 'employee', icon: Users, path: `/admin/employees/profile/${emp._id || emp.id}` }));

    const departmentResults = (departments || [])
      .filter(dept => (dept.name || '').toLowerCase().includes(query))
      .slice(0, 3)
      .map(dept => ({ ...dept, type: 'department', icon: Building2, path: '/admin/department-management' }));

    const jobResults = (jobs || [])
      .filter(job => (job.title || '').toLowerCase().includes(query))
      .slice(0, 3)
      .map(job => ({ ...job, type: 'job', icon: Briefcase, path: '/admin/recruitment-control/hub' }));

    return [...employeeResults, ...departmentResults, ...jobResults];
  }, [searchTerm, staffDirectory, departments, jobs]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp) => {
    return formatRelativeTime(timestamp);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'leave_approved':
        return <Check className="w-4 h-4 text-emerald-600" />;
      case 'error':
      case 'leave_rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return t('Dashboard');
    if (path.includes('/department-management')) return t('Department Management');
    if (path.includes('/payroll-management')) return t('Payroll');
    if (path.includes('/recruitment-control')) return t('Recruitment');
    if (path.includes('/policies')) return t('Company Policies');
    if (path.includes('/settings')) return t('System Settings');
    if (path.includes('/departments')) return t('Departments');
    if (path.includes('/employees')) return t('Employees');
    return t('Institutional Hub');
  };

  const displayName = user?.name || 'Admin User';
  const displayRole = user?.role
    ? String(user.role)
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')
    : 'Admin';
  const profileImage = user?.profileImage || user?.profilePicture || user?.avatar || '';
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4E63F0&color=fff`;

  return (
    <div className="h-16 md:h-[60px] bg-white border-b border-slate-100 sticky top-0 z-[35] flex items-center justify-between px-4 md:px-8 w-full gap-4">
      {/* Left: Menu + Page Title */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <button 
          onClick={() => setMobileMenuOpen?.(true)}
          className="p-2 -ml-1.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 lg:hidden"
        >
          <Menu size={22} />
        </button>
        <div className="min-w-0 hidden sm:block">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">{t('Admin Workspace')}</p>
          <h1 className="text-base font-black text-slate-900 tracking-tight truncate leading-tight">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-sm hidden md:block" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder={t('Search employees, departments...')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowSearchResults(e.target.value.length > 0); }}
            onFocus={() => searchTerm && setShowSearchResults(true)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-[13px] font-medium text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/8 focus:border-indigo-300 focus:bg-white outline-none"
          />
          {showSearchResults && filteredResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              {filteredResults.map((result, idx) => (
                <div
                  key={idx}
                  onClick={() => { navigate(result.path); setShowSearchResults(false); setSearchTerm(''); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <result.icon size={13} className="text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">{result.name || result.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{result.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Dropdown */}
        <div className="relative" ref={notificationDropdownRef}>
          <button
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className={`p-2.5 rounded-xl relative transition-all group ${
              showNotificationDropdown ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="absolute right-0 top-full mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-4 py-4 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Bell size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-black text-xs text-slate-800 uppercase tracking-tight">{t('Notifications')}</span>
                    {unreadCount > 0 && (
                      <p className="text-[10px] text-indigo-600 font-bold">{unreadCount} {t('new alerts')}</p>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-indigo-100 transition-all"
                  >
                    {t('Clear All')}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">{t('No notifications yet')}</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id || notification._id}
                      onClick={() => {
                        const id = notification.id || notification._id;
                        markAsRead(id);
                        setShowNotificationDropdown(false);
                        Swal.fire({
                          title: notification.headline || notification.title || 'Notification',
                          html: `<div class="text-left"><p class="text-sm text-slate-600 mb-2">${notification.details || notification.message || ''}</p><p class="text-xs text-slate-400">Category: ${notification.category || 'general'} &bull; ${formatTime(notification.timestamp || notification.createdAt)}</p></div>`,
                          icon: 'info',
                          showCancelButton: true,
                          confirmButtonText: 'Go to Request',
                          cancelButtonText: 'Close',
                          confirmButtonColor: '#4E63F0',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            const cat = notification.category;
                            if (cat === 'leave') navigate('/admin/leave-management');
                            else if (cat === 'attendance') navigate('/admin/wfh-access');
                            else if (cat === 'alert') navigate('/admin/resignation');
                            else if (cat === 'job') navigate('/admin/recruitment-control/hub');
                            else if (cat === 'payroll') navigate('/admin/payroll-management');
                            else navigate('/admin/dashboard');
                          }
                        });
                      }}
                      className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-lg ${notification.read ? 'bg-slate-100' : 'bg-indigo-100'}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {notification.title || notification.message?.slice(0, 30) || 'Notification'}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-400">
                              {formatTime(notification.timestamp || notification.createdAt)}
                            </span>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 10 && (
                <div className="px-4 py-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowNotificationDropdown(false);
                      navigate('/admin/notifications');
                    }}
                    className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {t('View all notifications')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`flex items-center gap-3 pl-4 border-l border-slate-100 group cursor-pointer transition-all ${
              showProfileDropdown ? 'opacity-80' : ''
            }`}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-black text-slate-800 leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                {displayName}
              </p>
              <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                {displayRole}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl overflow-hidden border p-0.5 bg-white transition-all shadow-sm ${
              showProfileDropdown ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100 group-hover:border-indigo-200'
            }`}>
              <img
                src={profileImage || fallbackAvatar}
                alt={displayName}
                onError={(event) => {
                  event.currentTarget.src = fallbackAvatar;
                }}
                className="w-full h-full object-cover rounded-[8px]"
              />
            </div>
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-50">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-indigo-50">
                    <img
                      src={profileImage || fallbackAvatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{displayName}</p>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{displayRole}</p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-3 border-t border-slate-100/50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail size={12} />
                    <p className="text-[10px] font-medium truncate">{user?.email || 'admin@institutional.com'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={12} />
                    <p className="text-[10px] font-medium italic">Last login: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                {[
                  { label: t('View Profile'), icon: User, path: '/admin/profile' },
                  { label: t('Edit Profile'), icon: Settings, path: '/admin/profile/edit' },
                  { label: t('Reset Password'), icon: Key, path: '/admin/profile/change-password' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                      <item.icon size={16} className="text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.label}</span>
                    <ChevronRight size={12} className="ml-auto text-slate-200 group-hover:text-slate-400 transition-all opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-slate-50 bg-slate-50/30">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-all group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50/50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all text-red-500">
                    <LogOut size={16} />
                  </div>
                  <span className="text-xs font-black text-red-600 uppercase tracking-widest group-hover:text-red-700 transition-colors">{t('Logout Account')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
