import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function AccountSidebar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('leafinlife_user');
      localStorage.removeItem('leafinlife_user_token');
      navigate('/account/login');
    }
  };

  const navItems = [
    {
      to: '/account',
      label: 'My Profile',
      end: true,
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      to: '/account/orders',
      label: 'My Orders',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      to: '/pages/wishlist',
      label: 'My Wishlist',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-full lg:w-[260px] lg:min-w-[260px] bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-sm shrink-0">
      {/* User Greeting Block */}
      <div className="flex items-center space-x-3.5 pb-5 mb-5 border-b border-[#f0f0f0]">
        <div className="w-14 h-14 rounded-full bg-[#fef9ea] border border-[#586c38]/30 text-[#2f3e10] flex items-center justify-center font-serif text-2xl font-bold shrink-0">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="overflow-hidden min-w-0">
          <p className="text-xs text-[#888888] font-body uppercase tracking-wider font-medium">Hello,</p>
          <h2 className="text-base font-semibold text-stone-900 truncate font-heading leading-tight mt-0.5">
            {user?.name || 'Valued Customer'}
          </h2>
          <p className="text-xs text-stone-500 truncate mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#2f3e10] text-white shadow-sm'
                  : 'text-stone-700 hover:bg-[#f9f9eb] hover:text-[#2f3e10]'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Logout button */}
        <button
          type="button"
          onClick={handleLogoutClick}
          className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mt-4 text-left border-0 bg-transparent cursor-pointer"
        >
          <svg className="w-5 h-5 mr-3 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Log Out</span>
        </button>
      </nav>
    </aside>
  );
}

