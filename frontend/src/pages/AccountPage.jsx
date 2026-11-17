import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountSidebar from '../components/account/AccountSidebar';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();

  const [recentOrders, setRecentOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }

    // Fetch user's orders from backend API
    orderService.getUserOrders().then((orders) => {
      if (Array.isArray(orders)) {
        setRecentOrders(orders.slice(0, 3));
      }
    }).catch((err) => {
      console.warn('Could not load user recent orders:', err);
      setRecentOrders([]);
    });
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/account/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateEditForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Please enter your name.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Please enter your phone number.';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\s+/g, ''))) {
      errs.phone = 'Please enter a valid 10-digit Indian phone number.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!validateEditForm()) return;

    setIsSaving(true);
    try {
      const res = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim().replace(/\s+/g, ''),
      });

      if (res && res.success) {
        setIsEditing(false);
        setStatusMessage({
          type: 'success',
          text: 'Profile details updated successfully.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadge = (order) => {
    const status = order.orderStatus || 'Processing';
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-xs text-stone-400 mb-2 font-medium">
            <Link to="/" className="text-[#586c38] hover:underline">
              Home
            </Link>
            <span>/</span>
            <span className="text-stone-800 font-semibold">My Account</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-heading font-medium text-stone-900">
            Account Dashboard
          </h1>
        </div>

        {/* Dashboard Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <AccountSidebar user={user} onLogout={handleLogout} />

          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-6">
            {/* Status Feedback banner */}
            {statusMessage.text && (
              <div
                className={`p-4 rounded-md text-sm flex items-center justify-between ${
                  statusMessage.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-[#f9f9eb] text-[#2f3e10] border border-[#586c38]/30'
                }`}
              >
                <span>{statusMessage.text}</span>
                <button
                  type="button"
                  onClick={() => setStatusMessage({ type: '', text: '' })}
                  className="text-stone-400 hover:text-stone-700 ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Profile Information Card */}
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f0]">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-stone-900">
                    Personal Information
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage your personal contact details
                  </p>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setFormData({
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                      });
                      setStatusMessage({ type: '', text: '' });
                    }}
                    className="inline-flex items-center px-4 py-2 border border-[#586c38] text-[#586c38] hover:bg-[#586c38] hover:text-white rounded text-xs uppercase tracking-wider font-semibold transition-all duration-200"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                /* Edit Profile Form */
                <form onSubmit={handleSaveProfile} noValidate className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full h-11 px-3.5 border rounded text-sm ${
                        formErrors.name ? 'border-red-500' : 'border-stone-300'
                      } focus:outline-none focus:border-[#586c38]`}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Email Address (Cannot be modified)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full h-11 px-3.5 border border-stone-200 bg-stone-100 rounded text-sm text-stone-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      maxLength="10"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full h-11 px-3.5 border rounded text-sm ${
                        formErrors.phone ? 'border-red-500' : 'border-stone-300'
                      } focus:outline-none focus:border-[#586c38]`}
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-[#2f3e10] hover:bg-[#586c38] text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-60"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded text-xs uppercase tracking-wider font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Profile Display */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Full Name</p>
                    <p className="font-medium text-stone-900">{user.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Email Address</p>
                    <p className="font-medium text-stone-900">{user.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Phone Number</p>
                    <p className="font-medium text-stone-900">
                      {user.phone ? `+91 ${user.phone}` : '—'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f0]">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-stone-900">
                    Recent Orders
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Track and review your most recent healthcare purchases
                  </p>
                </div>
                <Link
                  to="/account/orders"
                  className="text-xs font-semibold text-[#586c38] hover:underline"
                >
                  View All Orders →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3 text-stone-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-sm text-stone-600 mb-4">You haven't placed any orders yet.</p>
                  <Link
                    to="/collections/all"
                    className="inline-block px-5 py-2 bg-[#586c38] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#46562d] transition"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider">
                        <th className="py-3 font-semibold">Order ID</th>
                        <th className="py-3 font-semibold">Date</th>
                        <th className="py-3 font-semibold">Status</th>
                        <th className="py-3 font-semibold">Total</th>
                        <th className="py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {recentOrders.map((ord) => (
                        <tr key={ord.orderId} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 font-medium text-stone-900">
                            #{ord.orderId}
                          </td>
                          <td className="py-3.5 text-stone-600">
                            {new Date(ord.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                                ord
                              )}`}
                            >
                              {ord.orderStatus || 'Processing'}
                            </span>
                          </td>
                          <td className="py-3.5 font-semibold text-stone-900">
                            {formatPrice(ord.pricing?.grandTotal)}
                          </td>
                          <td className="py-3.5 text-right">
                            <Link
                              to={`/account/orders/${ord.orderId}`}
                              className="text-xs text-[#586c38] font-semibold hover:underline"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

