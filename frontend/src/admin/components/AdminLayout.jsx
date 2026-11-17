import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../AdminContext';
import AdminSidebar from './AdminSidebar';

function AdminLayoutInner() {
  const { adminUser } = useAdmin();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // If not authenticated, redirect to /admin/login
  if (!adminUser) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans text-stone-800">
      {/* Sidebar */}
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#e5e5e5] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-1.5 text-stone-600 hover:text-black rounded hover:bg-stone-100"
              aria-label="Open Navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
                Healthcare Management Console
              </span>
            </div>
          </div>

          {/* User profile right menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2f3e10] text-white flex items-center justify-center font-bold text-xs font-serif">
                A
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-stone-900 leading-tight">Admin User</p>
                <p className="text-[11px] text-[#586c38] font-medium leading-tight">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return <AdminLayoutInner />;
}

