import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  Briefcase,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  PlusCircle,
  ChevronDown,
  History,
  Calendar,
  FileText,
  UserPlus,
  BarChart,
  ClipboardList,
  CheckCircle2,
  Target,
  FileSignature,
  DoorOpen,
  PieChart,
  Activity,
  Building2,
  ShieldAlert,
  LayoutGrid,
  AlertCircle,
  Lock,
  Mail,
  ShieldCheck,
  Globe,
  Home,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useAuth();
  const { t } = useSettings();

  // Track open state for submenus
  const [openSubmenu, setOpenSubmenu] = useState(() => {
    if (location.pathname.startsWith('/attendance')) return 'attendance';
    if (location.pathname.startsWith('/employee/attendance')) return 'attendance';
    if (location.pathname.startsWith('/leave')) return 'leave';
    if (location.pathname.startsWith('/employee/leave')) return 'leave';
    if (location.pathname.startsWith('/recruitment')) return 'recruitment';
    if (location.pathname.startsWith('/payroll')) return 'payroll';
    if (location.pathname.startsWith('/performance')) return 'performance';
    if (location.pathname.startsWith('/analytics')) return 'analytics';
    if (location.pathname.startsWith('/resignation')) return 'resignation';
    if (location.pathname.startsWith('/employee/resignation')) return 'resignation';
    if (location.pathname.startsWith('/employees')) return 'employees';
    if (location.pathname.startsWith('/admin/employees')) return 'employees';
    if (location.pathname.startsWith('/admin/department-management')) return 'departments';
    if (location.pathname.startsWith('/admin/payroll-management')) return 'payroll';
    if (location.pathname.startsWith('/wfh-access')) return 'wfh-access';
    if (location.pathname.startsWith('/admin/wfh-access')) return 'wfh-access';
    return null;
  });

  const getActiveSubmenu = () => {
    if (location.pathname.startsWith('/attendance')) return 'attendance';
    if (location.pathname.startsWith('/employee/attendance')) return 'attendance';
    if (location.pathname.startsWith('/leave')) return 'leave';
    if (location.pathname.startsWith('/employee/leave')) return 'leave';
    if (location.pathname.startsWith('/recruitment')) return 'recruitment';
    if (location.pathname.startsWith('/admin/recruitment-control')) return 'recruitment';
    if (location.pathname.startsWith('/payroll')) return 'payroll';
    if (location.pathname.startsWith('/performance')) return 'performance';
    if (location.pathname.startsWith('/analytics')) return 'analytics';
    if (location.pathname.startsWith('/resignation')) return 'resignation';
    if (location.pathname.startsWith('/employee/resignation')) return 'resignation';
    if (location.pathname.startsWith('/employees')) return 'employees';
    if (location.pathname.startsWith('/admin/employees')) return 'employees';
    if (location.pathname.startsWith('/admin/department-management')) return 'departments';
    if (location.pathname.startsWith('/admin/payroll-management')) return 'payroll';
    if (location.pathname.startsWith('/wfh-access')) return 'wfh-access';
    if (location.pathname.startsWith('/admin/wfh-access')) return 'wfh-access';
    return null;
  };

  const activeSubmenu = getActiveSubmenu();

  useEffect(() => {
    setOpenSubmenu(getActiveSubmenu());
  }, [location.pathname]);

  const toggleSubmenu = (key) => {
    setOpenSubmenu(prev => prev === key ? null : key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Master Menu List with Role Mapping
  const allMenuItems = [
    // --- MAIN ADMIN (SUPER ADMIN) PORTAL ---
    {
      name: 'Platform Hub',
      icon: LayoutDashboard,
      path: '/main-admin/dashboard',
      roles: ['Main Admin']
    },
    {
      name: 'Company Setup',
      icon: Building2,
      path: '/main-admin/company-setup',
      roles: ['Main Admin']
    },
    {
      name: 'Global User Mgnt',
      icon: Users,
      path: '/main-admin/user-management',
      key: 'user-management',
      hasSubmenu: true,
      roles: ['Main Admin'],
      subItems: [
        { name: 'Add Admin', icon: ShieldCheck, path: '/main-admin/user-management?view=add-admin' },
        { name: 'Add HR', icon: UserPlus, path: '/main-admin/user-management?view=add-hr' },
        { name: 'Manage Permissions', icon: Lock, path: '/main-admin/user-management?view=permissions' },
      ]
    },
    {
      name: 'Platform Configuration',
      icon: Settings,
      path: '/main-admin/platform-config',
      roles: ['Main Admin']
    },
    {
      name: 'System Integrations',
      icon: Activity,
      path: '/main-admin/integrations',
      key: 'integrations',
      hasSubmenu: true,
      roles: ['Main Admin'],
      subItems: [
        { name: 'Cloud Services', icon: Globe, path: '/main-admin/integrations?view=cloud' },
        { name: 'Email System', icon: Mail, path: '/main-admin/integrations?view=email' },
        { name: 'Security Controls', icon: ShieldAlert, path: '/main-admin/integrations?view=security' },
      ]
    },
    {
      name: 'Global Reports & Analytics',
      icon: BarChart3,
      path: '/main-admin/reports',
      roles: ['Main Admin']
    },
    {
      name: 'System Monitoring',
      icon: AlertCircle,
      path: '/main-admin/monitoring',
      roles: ['Main Admin']
    },

    // --- SHARED / COMPANY ADMIN TOOLS ---
    {
      name: role === 'HR' ? 'Dashboard' : 'Management Hub',
      icon: LayoutDashboard,
      path: role === 'HR' ? '/dashboard' : '/admin/dashboard',
      roles: ['HR', 'Admin']
    },
    {
      name: 'Employees',
      icon: Users,
      path: role === 'HR' ? '/employees' : '/admin/employees',
      roles: ['HR', 'Admin']
    },
    {
      name: role === 'HR' ? 'Departments' : 'Department',
      icon: Building2,
      path: role === 'HR' ? '/departments' : '/admin/department-management',
      key: 'departments',
      hasSubmenu: true,
      roles: ['HR', 'Admin'],
      subItems: [
        { name: 'View Departments', icon: Building2, path: role === 'HR' ? '/departments' : '/admin/department-management', roles: ['HR', 'Admin'] },
        { name: 'Create Department', icon: PlusCircle, path: role === 'HR' ? '/departments/create' : '/admin/department-management/create', roles: ['HR', 'Admin'] },
        { name: 'Manage Teams', icon: LayoutGrid, path: role === 'HR' ? '/departments/teams' : '/admin/department-management/teams', roles: ['HR', 'Admin'] },
      ]
    },
    {
      name: 'Attendance',
      icon: CalendarCheck,
      path: '/attendance',
      key: 'attendance',
      hasSubmenu: true,
      roles: ['HR'],
      subItems: [
        { name: 'Hub', icon: LayoutDashboard, path: '/attendance' },
        { name: 'Check-in Records', icon: History, path: '/attendance/records' },
        { name: 'Monthly Attendance', icon: Calendar, path: '/attendance/monthly' },
      ]
    },
    {
      name: 'Leave',
      icon: Clock,
      path: '/leave',
      roles: ['HR']
    },
    {
      name: role === 'HR' ? 'Recruitment' : 'Recruitment',
      icon: Briefcase,
      path: role === 'HR' ? '/recruitment' : '/admin/recruitment-control/hub',
      roles: ['HR', 'Admin']
    },
    {
      name: role === 'HR' ? 'Payroll' : 'Payroll',
      icon: CreditCard,
      path: role === 'HR' ? '/payroll' : '/admin/payroll-management',
      roles: ['HR', 'Admin']
    },
    {
      name: 'Company Policies',
      icon: FileText,
      path: '/admin/policies',
      roles: ['Admin']
    },
    {
      name: 'Performance',
      icon: BarChart3,
      path: '/performance',
      roles: ['HR']
    },
    {
      name: 'Analytics',
      icon: BarChart,
      path: '/analytics',
      roles: ['HR']
    },
    {
      name: 'Resignation',
      icon: DoorOpen,
      path: role === 'HR' ? '/resignation' : '/admin/resignation',
      roles: ['HR', 'Admin']
    },
    {
      name: 'WFH Access',
      icon: Home,
      path: role === 'HR' ? '/wfh-access' : '/admin/wfh-access',
      roles: ['HR', 'Admin']
    },
    {
      name: role === 'HR' ? 'Settings' : 'System Settings',
      icon: Settings,
      path: '/admin/settings',
      roles: ['Admin']
    },

    // --- EMPLOYEE SELF-SERVICE PORTAL ---
    {
      name: 'My Profile',
      icon: Users,
      path: '/employee/profile',
      roles: ['Employee']
    },
    {
      name: 'Attendance',
      icon: CalendarCheck,
      path: '/employee/attendance',
      key: 'attendance',
      hasSubmenu: true,
      roles: ['Employee'],
      subItems: [
        { name: 'Hub', icon: LayoutDashboard, path: '/employee/attendance' },
        { name: 'My Records', icon: History, path: '/employee/attendance/records' },
      ]
    },
    {
      name: 'Leave',
      icon: Clock,
      path: '/employee/leave',
      key: 'leave',
      hasSubmenu: true,
      roles: ['Employee'],
      subItems: [
        { name: 'Requests', icon: FileText, path: '/employee/leave/requests' },
        { name: 'History', icon: History, path: '/employee/leave/history' },
      ]
    },
    {
      name: 'Payroll',
      icon: CreditCard,
      path: '/employee/payroll',
      roles: ['Employee']
    },
    {
      name: 'Performance',
      icon: BarChart3,
      path: '/employee/performance',
      roles: ['Employee']
    },
    {
      name: 'Internal Jobs',
      icon: Briefcase,
      path: '/employee/jobs',
      roles: ['Employee']
    },
    {
      name: 'Resignation',
      icon: DoorOpen,
      path: '/employee/resignation/submit',
      roles: ['Employee']
    },
  ];

  const filteredMenuItems = allMenuItems.filter(item => item.roles.includes(role));

  const getRoleLabel = () => {
    if (role === 'Main Admin') return t('Super Admin');
    if (role === 'Admin') return t('Company Admin');
    if (role === 'HR') return t('HR Manager');
    if (role === 'Employee') return t('Employee');
    return t('User');
  };

  const getRoleColor = () => {
    if (role === 'Main Admin') return 'text-purple-600 bg-purple-50';
    if (role === 'Admin') return 'text-indigo-600 bg-indigo-50';
    if (role === 'HR') return 'text-emerald-600 bg-emerald-50';
    if (role === 'Employee') return 'text-blue-600 bg-blue-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className={`w-72 bg-white h-screen fixed left-0 top-0 border-r border-slate-100 flex flex-col z-40 shadow-[4px_0_20px_rgba(0,0,0,0.04)] transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo Section */}
      <div className="px-6 py-6 mb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center overflow-hidden shadow-md shadow-indigo-200">
            <img src="/logo.png" alt="InfiAP Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-800 tracking-tighter leading-none">InfiAP</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.18em] leading-none mt-0.5">HRMS</span>
          </div>
        </div>

        {/* Role Badge */}
        <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-current/10 ${getRoleColor()}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{getRoleLabel()}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto no-scrollbar pb-10">
        <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-[0.22em] mb-3">{t('Navigation')}</p>
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.name}>
              {item.hasSubmenu ? (
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      if (item.key === 'employees' && role === 'Admin') {
                        navigate('/admin/employees');
                        return;
                      }
                      toggleSubmenu(item.key);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl group ${location.pathname.startsWith(item.path)
                      ? (openSubmenu === item.key ? 'bg-indigo-50 text-indigo-700' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200')
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                  >
                    <item.icon size={16} className="shrink-0" />
                    <span className="font-semibold text-[13px] tracking-tight whitespace-nowrap">{t(item.name)}</span>
                    <ChevronDown size={14} className={`ml-auto transition-transform duration-300 ${openSubmenu === item.key ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`grid transition-all duration-300 ease-in-out ${(openSubmenu === item.key || activeSubmenu === item.key) ? 'grid-rows-[1fr] opacity-100 pointer-events-auto' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                    <div className="overflow-hidden">
                      <ul className="mt-1 ml-4 border-l-2 border-slate-100 pl-2 space-y-1">
                        {item.subItems
                          .filter(sub => !sub.roles || sub.roles.includes(role))
                          .map(sub => (
                            <li key={sub.name}>
                              <NavLink
                                to={sub.path}
                                onClick={() => setMobileMenuOpen?.(false)}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 font-black'
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
                                  }`
                                }
                              >
                                <sub.icon size={14} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[12px] tracking-tight">{t(sub.name)}</span>
                              </NavLink>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={() => setMobileMenuOpen?.(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl group ${isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <item.icon size={16} className="shrink-0" />
                  <span className="font-semibold text-[13px] tracking-tight">{t(item.name)}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {/* Quick Action */}
        <div className="mt-6 px-3">
          {role === 'HR' ? (
            <button
              onClick={() => navigate('/employees/add')}
              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
              className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 active:scale-95 text-[11px] uppercase tracking-wider"
            >
              <PlusCircle size={14} />
              {t('Add Employee')}
            </button>
          ) : role === 'Employee' ? (
            <button
              onClick={() => navigate('/employee/profile/edit')}
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
              className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 text-[11px] uppercase tracking-wider"
            >
              <Users size={14} />
              {t('Edit Profile')}
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin/department-management/create')}
              style={{ background: 'linear-gradient(135deg, #1E293B, #334155)' }}
              className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold rounded-xl shadow-lg shadow-slate-200 active:scale-95 text-[11px] uppercase tracking-wider"
            >
              <Building2 size={14} />
              {t('New Department')}
            </button>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-semibold text-xs w-full text-left uppercase tracking-wider group"
        >
          <LogOut size={16} className="group-hover:-translate-x-0.5" />
          <span>{t('Sign Out')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
