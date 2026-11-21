import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // If already authenticated, redirect to Profile or target
  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from || '/account', { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password UI toggle
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState({ type: '', message: '' });
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Validation & status states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // Validation function
  const validateLoginForm = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Please enter your password.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateForgotForm = () => {
    if (!forgotEmail.trim()) {
      setForgotStatus({
        type: 'error',
        message: 'Please enter your email address.',
      });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      });
      return false;
    }
    return true;
  };

  // Submit handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateLoginForm()) return;

    setIsSubmitting(true);
    try {
      const res = await login({ email: email.trim(), password });
      if (res && res.success) {
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate(location.state?.from || '/account');
        }, 800);
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || err.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotStatus({ type: '', message: '' });

    if (!validateForgotForm()) return;

    setIsForgotSubmitting(true);
    try {
      const { data } = await apiClient.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotStatus({
        type: 'success',
        message:
          data.message ||
          'Reset instructions have been sent to your email address.',
      });
    } catch (err) {
      setForgotStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to process request. Please try again.',
      });
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-[40px] px-[15px] sm:px-[20px] bg-[#fafafa]">
      <div className="w-full max-w-[510px] bg-white border border-[#e5e5e5] shadow-sm p-[30px] sm:p-[45px] transition-all">
        {/* Breadcrumb back link */}
        <div className="mb-[20px]">
          <Link
            to="/"
            className="inline-flex items-center text-[1.3rem] text-[#666666] hover:text-[#2f3e10] transition-colors"
          >
            <svg
              className="w-[1.4rem] h-[1.4rem] mr-[0.6rem]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* FORGOT PASSWORD VIEW */}
        {showForgotPassword ? (
          <div>
            <h1 className="font-heading text-[2.6rem] sm:text-[3.2rem] font-medium text-black text-center mb-[1rem]">
              Reset Your Password
            </h1>
            <p className="text-[1.4rem] text-[#666666] font-body text-center mb-[2.5rem]">
              We will send you an email with instructions to reset your password.
            </p>

            {forgotStatus.message && (
              <div
                className={`p-[1.2rem] text-[1.3rem] mb-[2rem] rounded text-center ${
                  forgotStatus.type === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-[#f9f9eb] text-[#2f3e10] border border-[#586c38]/30'
                }`}
              >
                {forgotStatus.message}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} noValidate>
              <div className="mb-[2rem]">
                <label
                  htmlFor="forgot-email"
                  className="block text-[1.3rem] font-medium text-[#333333] mb-[0.6rem]"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (forgotStatus.message) setForgotStatus({ type: '', message: '' });
                  }}
                  placeholder="Enter your registered email"
                  className="w-full h-[50px] px-[18px] border border-[#e5e5e5] focus:border-[#586c38] text-[1.5rem] font-body text-black outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isForgotSubmitting}
                className="lil-button w-full mb-[1.5rem] disabled:opacity-60"
              >
                {isForgotSubmitting ? 'Sending...' : 'Submit'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotStatus({ type: '', message: '' });
                  }}
                  className="text-[1.4rem] font-body text-[#666666] hover:text-[#2f3e10] underline cursor-pointer bg-transparent border-0"
                >
                  Cancel and return to Sign In
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* LOGIN FORM VIEW */
          <div>
            <div className="text-center mb-[2.5rem]">
              <h1 className="font-heading text-[2.8rem] sm:text-[3.6rem] font-medium text-black m-0 mb-[0.8rem]">
                Sign In
              </h1>
              <p className="text-[1.4rem] text-[#666666] font-body">
                Access your orders, saved addresses and healthcare recommendations
              </p>
            </div>

            {/* Server Error / Success Message Alert */}
            {serverError && (
              <div className="p-[1.2rem] text-[1.3rem] mb-[2rem] bg-red-50 text-red-600 border border-red-200 rounded flex items-center">
                <svg
                  className="w-[1.6rem] h-[1.6rem] mr-[0.8rem] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{serverError}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-[1.2rem] text-[1.3rem] mb-[2rem] bg-[#f9f9eb] text-[#2f3e10] border border-[#586c38]/30 rounded flex items-center">
                <svg
                  className="w-[1.6rem] h-[1.6rem] mr-[0.8rem] shrink-0 text-[#586c38]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} noValidate>
              {/* Email field */}
              <div className="mb-[2rem]">
                <label
                  htmlFor="login-email"
                  className="block text-[1.3rem] font-medium text-[#333333] mb-[0.6rem]"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="name@example.com"
                  className={`w-full h-[50px] px-[18px] border ${
                    errors.email ? 'border-red-500 bg-red-50/10' : 'border-[#e5e5e5]'
                  } focus:border-[#586c38] text-[1.5rem] font-body text-black outline-none transition-colors`}
                />
                {errors.email && (
                  <p className="text-red-500 text-[1.2rem] mt-[0.5rem] font-body">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password field with Show/Hide toggle */}
              <div className="mb-[1.5rem]">
                <div className="flex justify-between items-center mb-[0.6rem]">
                  <label
                    htmlFor="login-password"
                    className="block text-[1.3rem] font-medium text-[#333333]"
                  >
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotEmail(email);
                    }}
                    className="text-[1.3rem] text-[#666666] hover:text-[#2f3e10] transition-colors underline bg-transparent border-0 cursor-pointer p-0"
                  >
                    Forgot your password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="Enter your password"
                    className={`w-full h-[50px] pl-[18px] pr-[45px] border ${
                      errors.password ? 'border-red-500 bg-red-50/10' : 'border-[#e5e5e5]'
                    } focus:border-[#586c38] text-[1.5rem] font-body text-black outline-none transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#888888] hover:text-black bg-transparent border-0 cursor-pointer p-[4px]"
                  >
                    {showPassword ? (
                      /* Eye Off */
                      <svg
                        className="w-[1.8rem] h-[1.8rem]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      /* Eye Open */
                      <svg
                        className="w-[1.8rem] h-[1.8rem]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[1.2rem] mt-[0.5rem] font-body">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="lil-button w-full my-[2rem] disabled:opacity-60"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Navigation to Signup */}
              <div className="pt-[1.5rem] border-t border-[#f0f0f0] text-center text-[1.4rem] font-body text-[#666666]">
                Don't have an account?{' '}
                <Link
                  to="/account/register"
                  className="font-semibold text-[#2f3e10] hover:text-[#586c38] transition-colors ml-[0.4rem] underline"
                >
                  Create one now
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

