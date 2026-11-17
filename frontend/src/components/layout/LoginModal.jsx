import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

export default function LoginModal() {
  const { isLoginOpen, setIsLoginOpen } = useStore();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mode: 'login' | 'forgot'
  const [mode, setMode] = useState('login');

  // Login form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Forgot password form fields
  const [forgotEmail, setForgotEmail] = useState('');

  // Messages & Loading state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isLoginOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setIsSubmitting(false);
      setMode('login');
    }
  }, [isLoginOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLoginOpen) {
        setIsLoginOpen(false);
      }
    };
    if (isLoginOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginOpen, setIsLoginOpen]);

  if (!isLoginOpen) return null;

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login({ email: email.trim(), password });
      if (res && res.success) {
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          setIsLoginOpen(false);
          setEmail('');
          setPassword('');
          // Redirect to account dashboard
          navigate('/account');
        }, 600);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password submission
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/auth/forgot-password', {
        email: forgotEmail.trim(),
      });
      setSuccessMsg(
        data.message || 'Password reset instructions have been sent to your email.'
      );
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || 'Failed to request password reset. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="login-modal__window"
      className="details-modal login-modal-active fixed inset-0 z-[9999] flex items-center justify-center p-[15px]"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(1px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer--login"
      onClick={(e) => {
        if (e.target.id === 'login-modal__window') {
          setIsLoginOpen(false);
        }
      }}
    >
      <div
        className="detial-login relative bg-white max-w-[510px] w-full text-center"
        style={{
          padding: '40px 30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          animation: 'LoginzoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button matching reference design */}
        <button
          type="button"
          onClick={() => setIsLoginOpen(false)}
          aria-label="Close"
          className="details-modal-close dt-close-x !absolute right-[12px] top-[12px] z-10"
        />

        {mode === 'login' ? (
          /* ================= SIGN IN FORM ================= */
          <form
            id="customer_login"
            onSubmit={handleLoginSubmit}
            noValidate
            className="w-full"
          >
            <h1
              id="customer--login"
              tabIndex="-1"
              className="text-black text-[2.6rem] md:text-[3.2rem] font-medium leading-tight mb-[2rem] tracking-tight"
              style={{
                fontFamily: 'var(--font-heading-family)',
              }}
            >
              Sign In
            </h1>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="mb-[1.5rem] p-[1rem] text-[1.3rem] text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] text-left leading-snug">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-[1.5rem] p-[1rem] text-[1.3rem] text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] text-left leading-snug">
                {successMsg}
              </div>
            )}

            {/* Email Field */}
            <div className="field mb-[2rem] text-left">
              <label htmlFor="CustomerEmail" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="CustomerEmail"
                name="customer[email]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                autoCapitalize="off"
                autoCorrect="off"
                required
                className="w-full h-[50px] leading-[50px] px-[20px] border border-[#e5e5e5] bg-white text-black text-[1.4rem] md:text-[1.5rem] focus:border-black focus:outline-none transition-colors"
                style={{ fontFamily: 'var(--font-body-family)' }}
              />
            </div>

            {/* Password Field */}
            <div className="field mb-[2rem] text-left">
              <label htmlFor="CustomerPassword" className="sr-only">
                Password
              </label>
              <input
                type="password"
                id="CustomerPassword"
                name="customer[password]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
                className="w-full h-[50px] leading-[50px] px-[20px] border border-[#e5e5e5] bg-white text-black text-[1.4rem] md:text-[1.5rem] focus:border-black focus:outline-none transition-colors"
                style={{ fontFamily: 'var(--font-body-family)' }}
              />
            </div>

            {/* Link Wrapper: Forgot Password & Sign Up */}
            <div className="link-wrapper flex justify-between items-center my-[2rem] text-[1.4rem] md:text-[1.5rem]">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setMode('forgot');
                  setForgotEmail(email);
                }}
                className="text-black hover:text-[#586c38] transition-colors underline-offset-4 hover:underline cursor-pointer bg-transparent border-0 p-0 text-left"
              >
                Forgot your password?
              </button>
              <Link
                to="/account/register"
                onClick={() => setIsLoginOpen(false)}
                className="text-black hover:text-[#586c38] transition-colors underline-offset-4 hover:underline"
              >
                Sign Up
              </Link>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="button button--primary lil-button w-full justify-center transition-all disabled:opacity-60 cursor-pointer"
              style={{
                borderRadius: '0px',
                height: '50px',
                minHeight: '50px',
                letterSpacing: '2px',
                fontWeight: 600,
                fontSize: '1.3rem',
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          /* ================= FORGOT PASSWORD FORM ================= */
          <form
            id="recover_customer_password"
            onSubmit={handleForgotSubmit}
            noValidate
            className="w-full"
          >
            <h1
              id="customer--recover"
              tabIndex="-1"
              className="text-black text-[2.4rem] md:text-[3rem] font-medium leading-tight mb-[1rem] tracking-tight"
              style={{
                fontFamily: 'var(--font-heading-family)',
              }}
            >
              Reset your password
            </h1>
            <p className="text-[#666666] text-[1.3rem] md:text-[1.4rem] mb-[2rem] leading-relaxed">
              We will send you an email to reset your password.
            </p>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="mb-[1.5rem] p-[1rem] text-[1.3rem] text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] text-left leading-snug">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-[1.5rem] p-[1rem] text-[1.3rem] text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] text-left leading-snug">
                {successMsg}
              </div>
            )}

            {/* Email Field */}
            <div className="field mb-[2rem] text-left">
              <label htmlFor="RecoverEmail" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="RecoverEmail"
                name="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                autoCapitalize="off"
                autoCorrect="off"
                required
                className="w-full h-[50px] leading-[50px] px-[20px] border border-[#e5e5e5] bg-white text-black text-[1.4rem] md:text-[1.5rem] focus:border-black focus:outline-none transition-colors"
                style={{ fontFamily: 'var(--font-body-family)' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-[1rem] mt-[2rem]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="button button--primary lil-button w-full justify-center transition-all disabled:opacity-60 cursor-pointer"
                style={{
                  borderRadius: '0px',
                  height: '50px',
                  minHeight: '50px',
                  letterSpacing: '2px',
                  fontWeight: 600,
                  fontSize: '1.3rem',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setMode('login');
                }}
                className="text-black hover:text-[#586c38] text-[1.4rem] py-[10px] underline-offset-4 hover:underline cursor-pointer bg-transparent border-0"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
