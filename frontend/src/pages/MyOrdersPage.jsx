import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountSidebar from '../components/account/AccountSidebar';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    orderService
      .getUserOrders()
      .then((backendOrders) => {
        if (Array.isArray(backendOrders)) {
          setOrders(backendOrders);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load user orders:', err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/account/login');
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
      case 'Pending':
        return 'bg-purple-100 text-purple-800 border-purple-200';
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
            <Link to="/account" className="text-[#586c38] hover:underline">
              My Account
            </Link>
            <span>/</span>
            <span className="text-stone-800 font-semibold">My Orders</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-heading font-medium text-stone-900">
            Order History
          </h1>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountSidebar user={user} onLogout={handleLogout} />

          {/* Orders Content */}
          <div className="flex-1 w-full bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f0]">
              <div>
                <h2 className="text-lg font-heading font-semibold text-stone-900">
                  All Orders ({orders.length})
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  View tracking status and items for each purchase
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-stone-500">
                <div className="w-6 h-6 border-2 border-[#586c38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#fef9ea] rounded-full flex items-center justify-center mx-auto mb-4 text-[#586c38]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-medium text-stone-900 mb-2">
                  No orders found
                </h3>
                <p className="text-sm text-stone-600 max-w-sm mx-auto mb-6">
                  You haven't placed any orders yet. Discover authentic Ayurvedic wellness from Kerala.
                </p>
                <Link
                  to="/collections/all"
                  className="inline-block px-6 py-2.5 bg-[#2f3e10] hover:bg-[#586c38] text-white text-xs uppercase tracking-wider font-semibold rounded transition"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="border border-stone-200 rounded-lg p-5 sm:p-6 hover:border-stone-300 transition-colors bg-white shadow-xs"
                  >
                    {/* Top order summary header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-100 text-sm">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-stone-900 text-base">
                          #{order.orderId}
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-600 text-xs sm:text-sm">
                          {new Date(order.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-stone-400">•</span>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                            order
                          )}`}
                        >
                          {order.orderStatus || 'Processing'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-stone-900 text-base">
                          {formatPrice(order.pricing?.grandTotal)}
                        </span>
                        <Link
                          to={`/account/orders/${order.orderId}`}
                          className="px-4 py-1.5 bg-[#f9f9eb] hover:bg-[#f0f0d6] text-[#2f3e10] text-xs font-semibold rounded border border-[#586c38]/30 transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Order items preview row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items?.map((item, idx) => (
                        <div key={item.key || idx} className="flex items-center space-x-3 text-xs">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded border border-stone-200 flex-shrink-0"
                          />
                          <div className="overflow-hidden">
                            <p className="font-medium text-stone-900 truncate">{item.title}</p>
                            {item.variant && <p className="text-stone-500">{item.variant}</p>}
                            <p className="text-stone-600 mt-0.5">
                              Qty: {item.quantity} • {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order bottom line: payment method & tracking status note */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-stone-500 gap-2">
                      <p>
                        <span className="font-medium text-stone-700">Payment:</span> {order.paymentMethod} (
                        <span className="text-[#586c38] font-semibold">
                          {order.paymentDetails?.status || 'PAID'}
                        </span>
                        )
                      </p>
                      <p className="text-stone-400">
                        Shipping via {order.shippingMethod || 'Standard Express'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

