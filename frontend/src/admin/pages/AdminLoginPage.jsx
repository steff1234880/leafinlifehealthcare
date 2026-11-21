import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../AdminContext';

function AdminLoginInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, adminLogin } = useAdmin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect immediately
  if (adminUser) {
    navigate('/admin', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await adminLogin(username.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      const target = location.state?.from || '/admin';
      navigate(target, { replace: true });
    } else {
      setErrorMsg(result.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="admin-scope min-h-screen bg-[#fafafa] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans text-sm">
      <div className="w-full max-w-md bg-white border border-[#e5e5e5] rounded-xl shadow-sm p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="font-heading text-3xl font-bold text-[#2f3e10]">Leaf In Life</span>
          </Link>
          <div className="inline-block ml-2 px-2.5 py-0.5 rounded bg-[#fef9ea] border border-[#586c38]/30 text-xs font-bold text-[#586c38] uppercase tracking-wider">
            Admin Portal
          </div>
          <p className="text-sm text-stone-500 mt-2">
            Secure administrative control panel for Leaf In Life Healthcare
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm flex items-center">
            <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Admin Email / Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@leafinlifehealthcare.com"
              required
              className="w-full h-11 px-3.5 border border-[#e5e5e5] rounded text-sm text-stone-900 focus:outline-none focus:border-[#586c38] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 pl-3.5 pr-10 border border-[#e5e5e5] rounded text-sm text-stone-900 focus:outline-none focus:border-[#586c38] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 bg-[#2f3e10] hover:bg-[#586c38] text-white text-sm uppercase tracking-widest font-bold rounded shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-100 text-center">
          <Link to="/" className="text-sm text-stone-500 hover:text-[#2f3e10] transition-colors">
            ← Return to Leaf In Life Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return <AdminLoginInner />;
}

