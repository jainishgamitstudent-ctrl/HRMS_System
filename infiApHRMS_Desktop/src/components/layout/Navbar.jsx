import React, { useEffect, useState, useRef } from 'react';
import { Search, Bell, User, Check, X, Clock, Shield, Key, Settings, LogOut, Menu, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getHrProfile } from '../../services/hrApi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Navbar = ({ setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [profile, setProfile] = useState(null);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const notificationDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
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

  useEffect(() => {
    let isMounted = true;

    // Always fetch fresh profile data to show updated info
    getHrProfile()
      .then((response) => {
        if (!isMounted) return;
        const apiData = response.data?.data;
        // Normalize HR profile data
        const normalizedProfile = {
          name: apiData?.header?.name || apiData?.name || user?.name || 'HR User',
          role: apiData?.administrativeAccess?.accessLevel || apiData?.role || user?.role || 'hr',
          profileImage: apiData?.header?.profileImage || apiData?.profileImage || user?.profileImage || user?.profilePicture,
        };
        setProfile(normalizedProfile);
      })
      .catch(() => {
        if (!isMounted) return;
        setProfile(null);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayName = profile?.name || user?.name || 'HR User';
  const displayRole = 'HR Panel';

  return (
    <div className="h-16 md:h-20 bg-white border-b border-[#E7EBF7] sticky top-0 z-[35] flex items-center justify-between px-3 md:px-8 w-full">
      
      <div className="flex items-center gap-4 md:gap-6 flex-1 max-w-2xl">
        <button 
          onClick={() => setMobileMenuOpen?.(true)}
          className="p-2 -ml-2 rounded-xl text-slate-400 hover:bg-[#F4F7FD] hover:text-[#4E63F0] lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>
        

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-6">

        <div className="relative" ref={notificationDropdownRef}>
          <button
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className={`p-2.5 rounded-xl relative transition-all group ${
              showNotificationDropdown ? 'bg-[#F4F7FD] text-[#4E63F0]' : 'text-[#7E8AB2] hover:text-[#4E63F0] hover:bg-[#F4F7FD]'
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
            <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-slate-600" />
                  <span className="font-black text-xs text-slate-800 uppercase tracking-tight">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No notifications yet</p>
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
                            if (cat === 'leave') navigate('/leave');
                            else if (cat === 'attendance') navigate('/attendance');
                            else if (cat === 'alert') navigate('/resignation');
                            else if (cat === 'job') navigate('/recruitment');
                            else if (cat === 'payroll') navigate('/payroll');
                            else navigate('/');
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
                      navigate('/notifications');
                    }}
                    className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View all notifications
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
                src={profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4E63F0&color=fff`}
                alt={displayName}
                onError={(event) => {
                  event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4E63F0&color=fff`;
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
                      src={profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4E63F0&color=fff`}
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
                    <p className="text-[10px] font-medium truncate">{user?.email || 'hr@infiAp.com'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={12} />
                    <p className="text-[10px] font-medium italic">Last login: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                {[
                  { label: 'View Profile', icon: User, path: user?.role === 'Employee' ? '/employee/profile' : '/profile' },
                  { label: 'Edit Profile', icon: Settings, path: user?.role === 'Employee' ? '/employee/profile/edit' : '/profile/edit' },
                  { label: 'Reset Password', icon: Key, path: user?.role === 'Employee' ? '/employee/profile/change-password' : '/profile/change-password' },
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
                  <span className="text-xs font-black text-red-600 uppercase tracking-widest group-hover:text-red-700 transition-colors">Logout Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;