import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  CreditCard,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react';


const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [manualEmployeesOpen, setManualEmployeesOpen] = useState(false);
  const employeesOpen = manualEmployeesOpen || location.pathname.startsWith('/admin/employees');

  const handleEmployeesClick = (e) => {
    e.preventDefault();
    navigate('/admin/employees');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Employees', icon: Users, path: '/admin/employees' },
    { name: 'Departments', icon: Building2, path: '/admin/departments' },
    { name: 'Payroll', icon: CreditCard, path: '/admin/payroll' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-slate-100 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Branding */}
      <div className="p-8 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-soft flex items-center justify-center border border-slate-50 transition-transform hover:scale-105">
            <img src="/logo.png" alt="InfiAP Logo" className="w-full h-full object-contain p-2" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none block">InfiAP</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Admin Hub</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto no-scrollbar pb-10">
        <p className="px-5 mt-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Menu</p>
        <ul className="space-y-1.5">
          {menuItems.map((item) => (
            <li key={item.name}>
              {item.hasDropdown ? (
                <div className="space-y-1">
                  <button
                    onClick={handleEmployeesClick}
                    className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 group ${location.pathname.startsWith(item.path)
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                  >
                    <item.icon size={18} className="transition-transform group-hover:scale-110" />
                    <span className="font-black text-[11px] tracking-widest uppercase">{item.name}</span>
                    <ChevronDown size={14} className={`ml-auto transition-transform duration-300 ${employeesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${employeesOpen ? 'max-h-40 opacity-100 mt-1 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                    <ul className="ml-4 border-l-2 border-slate-100 pl-4 space-y-1">
                      {item.subItems.map((sub) => (
                        <li key={sub.name}>
                          <NavLink
                            to={sub.path}
                            className={({ isActive }) =>
                              `block px-4 py-2 text-xs font-bold transition-all rounded-lg ${isActive
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                              }`
                            }
                          >
                            {sub.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 group ${isActive
                      ? 'bg-slate-900 text-white shadow-lg'
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

      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-50">
        <button className="flex items-center gap-3 px-5 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-black text-xs w-full text-left uppercase tracking-widest">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
