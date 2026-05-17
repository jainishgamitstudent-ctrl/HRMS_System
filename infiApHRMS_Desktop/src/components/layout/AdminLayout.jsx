import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';

const AdminLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] w-full overflow-x-hidden">
      {/* Fixed Sidebar */}
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        <AdminNavbar setMobileMenuOpen={setMobileMenuOpen} />
        <main className="p-4 md:p-6 lg:p-10 w-full animate-in fade-in duration-500">
          <div className="w-full max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
