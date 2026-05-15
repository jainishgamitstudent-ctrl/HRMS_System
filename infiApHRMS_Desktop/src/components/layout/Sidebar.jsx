import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useAuth();

  // Track open state for submenus
  const [openSubmenu, setOpenSubmenu] = useState(() => {
    if (location.pathname.startsWith('/attendance')) return 'attendance';
    if (location.pathname.startsWith('/leave')) return 'leave';
    if (location.pathname.startsWith('/recruitment')) return 'recruitment';
    if (location.pathname.startsWith('/payroll')) return 'payroll';
    if (location.pathname.startsWith('/performance')) return 'performance';
    if (location.pathname.startsWith('/analytics')) return 'analytics';
    if (location.pathname.startsWith('/resignation')) return 'resignation';
    if (location.pathname.startsWith('/employees')) return 'employees';
    if (location.pathname.startsWith('/admin/employees')) return 'employees';
    if (location.pathname.startsWith('/admin/department-management')) return 'departments';
    if (location.pathname.startsWith('/admin/payroll-management')) return 'payroll';
    return null;
  });

  const getActiveSubmenu = () => {
    if (location.pathname.startsWith('/attendance')) return 'attendance';
    if (location.pathname.startsWith('/leave')) return 'leave';
    if (location.pathname.startsWith('/recruitment')) return 'recruitment';
    if (location.pathname.startsWith('/admin/recruitment-control')) return 'recruitment';
    if (location.pathname.startsWith('/payroll')) return 'payroll';
    if (location.pathname.startsWith('/performance')) return 'performance';
    if (location.pathname.startsWith('/analytics')) return 'analytics';
    if (location.pathname.startsWith('/resignation')) return 'resignation';
    if (location.pathname.startsWith('/employees')) return 'employees';
    if (location.pathname.startsWith('/admin/employees')) return 'employees';
    if (location.pathname.startsWith('/admin/department-management')) return 'departments';
    if (location.pathname.startsWith('/admin/payroll-management')) return 'payroll';
    return null;
  };

  const activeSubmenu = getActiveSubmenu();

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
      name: role === 'HR' ? 'Departments' : 'Department ',
      icon: Building2,
      path: role === 'HR' ? '/departments' : '/admin/department-management',
      key: 'departments',
      hasSubmenu: true,
      roles: ['HR', 'Admin'],
      subItems: [
        { name: 'View Departments', icon: Building2, path: role === 'HR' ? '/departments' : '/admin/department-management' },
        { name: 'Create Department', icon: PlusCircle, path: role === 'HR' ? '/departments/create' : '/admin/department-management/create' },
        { name: 'Manage Teams', icon: LayoutGrid, path: role === 'HR' ? '/departments/teams' : '/admin/department-management/teams' },
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
        { name: 'Attendance Reports', icon: FileText, path: '/attendance-reports' },
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
      roles: ['HR']
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
      name: role === 'HR' ? 'Settings' : 'System Settings',
      icon: Settings,
      path: '/admin/settings',
      roles: ['Admin']
    },
  ];

  const filteredMenuItems = allMenuItems.filter(item => item.roles.includes(role));

  const getRoleLabel = () => {
    if (role === 'Main Admin') return 'Super Admin';
    if (role === 'Admin') return 'Company Admin';
    if (role === 'HR') return 'HR Manager';
    return 'User';
  };

  const getRoleColor = () => {
    if (role === 'Main Admin') return 'text-purple-600 bg-purple-50';
    if (role === 'Admin') return 'text-indigo-600 bg-indigo-50';
    if (role === 'HR') return 'text-emerald-600 bg-emerald-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className={`w-80 bg-white h-screen fixed left-0 top-0 border-r border-slate-200 flex flex-col z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Premium Logo Section */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-soft flex items-center justify-center overflow-hidden border border-slate-50 transition-transform hover:scale-105">
            <img src="/logo.png" alt="InfiAP Logo" className="w-full h-full object-contain p-2" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-800 tracking-tighter leading-none mb-1">InfiAP</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Solutions</span>
          </div>
        </div>

        {/* Dynamic Role Badge */}
        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-current/10 ${getRoleColor()}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{getRoleLabel()}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 overflow-y-auto no-scrollbar pb-10">
        <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Navigation</p>
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
                    className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 group ${location.pathname.startsWith(item.path)
                      ? (openSubmenu === item.key ? 'bg-slate-100 text-slate-900 border-l-4 border-slate-900 ml-0' : 'bg-slate-900 text-white shadow-xl shadow-slate-200')
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                  >
                    <item.icon size={18} className="transition-transform group-hover:scale-110" />
                    <span className="font-bold text-sm tracking-tight whitespace-nowrap">{item.name}</span>
                    <ChevronDown size={14} className={`ml-auto transition-transform duration-300 ${openSubmenu === item.key ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`grid transition-all duration-300 ease-in-out ${(openSubmenu === item.key || activeSubmenu === item.key) ? 'grid-rows-[1fr] opacity-100 pointer-events-auto' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                    <div className="overflow-hidden">
                      <ul className="mt-1 ml-4 border-l-2 border-slate-100 pl-2 space-y-1">
                        {item.subItems.map(sub => (
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
                              <span className="text-[12px] tracking-tight">{sub.name}</span>
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
                    `flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 group ${isActive
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <item.icon size={18} className="transition-transform group-hover:scale-110" />
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {/* Dynamic Action Button based on Role */}
        <div className="mt-8 px-5">
          {role === 'HR' ? (
            <button
              onClick={() => navigate('/employees/add')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 text-[10px] uppercase tracking-widest"
            >
              <PlusCircle size={16} />
              Add Employee
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin/department-management/create')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 text-[10px] uppercase tracking-widest"
            >
              <Building2 size={16} />
              New Dept
            </button>
          )}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-black text-xs w-full text-left uppercase tracking-widest group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
