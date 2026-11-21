import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  // If already authenticated, redirect to Profile
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/account', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Please enter your full name.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Please enter your 10-digit mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\s+/g, ''))) {
      errs.phone = 'Please enter a valid 10-digit Indian phone number.';
    }

    if (!formData.password) {
      errs.password = 'Please create a password.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim().replace(/\s+/g, ''),
        password: formData.password,
      });

      if (res && res.success) {
        navigate('/account/login', {
          state: {
            email: formData.email.trim(),
            message: 'Your account was created successfully! Please sign in.',
          },
        });
      }
    } catch (err) {
      setServerError(err.response?.data?.message || err.message || 'Unable to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-[40px] px-[15px] sm:px-[20px] bg-[#fafafa]">
      <div className="w-full max-w-[530px] bg-white border border-[#e5e5e5] shadow-sm p-[30px] sm:p-[45px] transition-all">
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

        <div className="text-center mb-[2.5rem]">
          <h1 className="font-heading text-[2.8rem] sm:text-[3.6rem] font-medium text-black m-0 mb-[0.8rem]">
            Create Account
          </h1>
          <p className="text-[1.4rem] text-[#666666] font-body">
            Join the Leaf In Life community for authentic Ayurvedic health and wellness
          </p>
        </div>

        {/* Server Error Alert */}
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

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name field */}
          <div className="mb-[1.8rem]">
            <label
              htmlFor="signup-name"
              className="block text-[1.3rem] font-medium text-[#333333] mb-[0.6rem]"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="signup-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className={`w-full h-[50px] px-[18px] border ${
                errors.name ? 'border-red-500 bg-red-50/10' : 'border-[#e5e5e5]'
              } focus:border-[#586c38] text-[1.5rem] font-body text-black outline-none transition-colors`}
            />
            {errors.name && (
              <p className="text-red-500 text-[1.2rem] mt-[0.5rem] font-body">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email field */}
          <div className="mb-[1.8rem]">
            <label
              htmlFor="signup-email"
              className="block text-[1.3rem] font-medium text-[#333333] mb-[0.6rem]"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="signup-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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

          {/* Phone field */}
          <div className="mb-[1.8rem]">
            <label
              htmlFor="signup-phone"
              className="block text-[1.3rem] font-medium text-[#333333] mb-[0.6rem]"
            >
              Phone Number *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-[14px] bg-[#f5f5f5] border border-r-0 border-[#e5e5e5] text-[#555555] text-[1.4rem]">
                +91
              </span>
              <input
                type="tel"
                id="signup-phone"
                name="phone"
                maxLength="10"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className={`w-full h-[50px] px-[18px] border ${
                  errors.phone ? 'border-red-500 bg-red-50/10' : 'border-[#e5e5e5]'
                } focus:border-[#586c38] text-[1.5rem] font-body text-black outline-none transition-colors`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-[1.2rem] mt-[0.5rem] font-body">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Password field with Show/Hide toggle */}
          <div className="mb-[2.2rem]">
            <label
              htmlFor="signup-password"
              className="block text-[1.3rem] font-medium text-[#333333] mb-[0.6rem]"
            >
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="signup-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="lil-button w-full mb-[2rem] disabled:opacity-60"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Navigation to Login */}
          <div className="pt-[1.5rem] border-t border-[#f0f0f0] text-center text-[1.4rem] font-body text-[#666666]">
            Already have an account?{' '}
            <Link
              to="/account/login"
              className="font-semibold text-[#2f3e10] hover:text-[#586c38] transition-colors ml-[0.4rem] underline"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

