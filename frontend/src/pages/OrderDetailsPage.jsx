import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AccountSidebar from '../components/account/AccountSidebar';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ORDER_STEPS = [
  { key: 'Pending', label: 'Order Placed', desc: 'Order received & confirmed' },
  { key: 'Confirmed', label: 'Confirmed', desc: 'Order verified & approved' },
  { key: 'Processing', label: 'Processing', desc: 'Packed at Ayurvedic facility' },
  { key: 'Shipped', label: 'Shipped', desc: 'Handed over to express courier' },
  { key: 'Delivered', label: 'Delivered', desc: 'Delivered to your address' },
];

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch from backend API
    orderService
      .getOrderById(orderId)
      .then((ord) => {
        if (ord) {
          setOrder(ord);
        } else {
          setOrder(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching order:', err);
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleLogout = async () => {
    await logout();
    navigate('/account/login');
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      const res = await orderService.cancelOrder(orderId, 'Cancelled by customer from account dashboard');
      setOrder(res);
      setCancelMessage('Order has been cancelled successfully.');
    } catch (err) {
      setCancelMessage(err.response?.data?.message || err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Determine current step index for the tracker
  const getCurrentStepIndex = (status) => {
    switch (status) {
      case 'Delivered':
        return 3;
      case 'Shipped':
        return 2;
      case 'Processing':
        return 1;
      case 'Pending':
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStepIndex(order?.orderStatus || 'Processing');

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#586c38] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-heading font-medium text-stone-900 mb-2">
          Order Not Found
        </h1>
        <p className="text-stone-600 text-sm mb-6">
          We could not locate details for Order #{orderId}.
        </p>
        <Link
          to="/account/orders"
          className="px-6 py-2.5 bg-[#2f3e10] hover:bg-[#586c38] text-white text-xs uppercase tracking-wider font-semibold rounded transition"
        >
          Return to My Orders
        </Link>
      </div>
    );
  }

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
            <Link to="/account/orders" className="text-[#586c38] hover:underline">
              Orders
            </Link>
            <span>/</span>
            <span className="text-stone-800 font-semibold">#{order.orderId}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-medium text-stone-900">
                Order #{order.orderId}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Placed on{' '}
                {new Date(order.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Link
              to="/account/orders"
              className="inline-flex items-center text-xs font-semibold text-[#586c38] hover:underline self-start sm:self-auto"
            >
              ← Back to all orders
            </Link>
          </div>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountSidebar user={user} onLogout={handleLogout} />

          {/* Main Details Panel */}
          <div className="flex-1 w-full space-y-6">
            {/* 1. ORDER TRACKING STATUS TIMELINE */}
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-heading font-semibold text-stone-900 mb-6">
                Order Progress & Delivery Status
              </h2>

              <div className="relative">
                {/* Horizontal progress bar for desktop */}
                <div className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-stone-200 -z-0">
                  <div
                    className="h-full bg-[#586c38] transition-all duration-500"
                    style={{
                      width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
                  {ORDER_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div
                        key={step.key}
                        className="flex sm:flex-col items-center sm:text-center space-x-4 sm:space-x-0"
                      >
                        {/* Circle node */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 mb-0 sm:mb-2 ${
                            isCompleted
                              ? 'bg-[#586c38] text-white shadow-sm'
                              : 'bg-white border-2 border-stone-300 text-stone-400'
                          } ${isCurrent ? 'ring-4 ring-[#586c38]/20' : ''}`}
                        >
                          {isCompleted ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isCompleted ? 'text-stone-900' : 'text-stone-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. PURCHASED PRODUCTS TABLE */}
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-heading font-semibold text-stone-900 mb-6">
                Purchased Products ({order.items?.length || 0})
              </h2>

              <div className="space-y-4 divide-y divide-stone-100">
                {order.items?.map((item, idx) => (
                  <div
                    key={item.key || idx}
                    className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-md border border-stone-200 shrink-0"
                      />
                      <div>
                        <Link
                          to={item.url || `/products/${item.slug}`}
                          className="font-medium text-stone-900 hover:text-[#586c38] text-sm line-clamp-1 transition"
                        >
                          {item.title}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-stone-500 mt-0.5">Variant: {item.variant}</p>
                        )}
                        <p className="text-xs text-stone-600 mt-0.5">
                          Unit Price: {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end sm:space-x-8 text-sm">
                      <span className="text-xs text-stone-500">Qty: {item.quantity}</span>
                      <span className="font-semibold text-stone-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation breakdown */}
              <div className="mt-8 pt-6 border-t border-stone-200 max-w-sm ml-auto space-y-2 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.pricing?.subtotal)}</span>
                </div>
                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-[#586c38] font-medium">
                    <span>Discount ({order.pricing?.discountCode})</span>
                    <span>-{formatPrice(order.pricing?.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#586c38] font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-base pt-3 border-t border-stone-200">
                  <span>Total Paid</span>
                  <span>{formatPrice(order.pricing?.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* 3. SHIPPING & PAYMENT DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Address */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 shadow-sm text-sm">
                <h3 className="font-heading font-semibold text-stone-900 mb-3 text-base">
                  Delivery Address
                </h3>
                <p className="font-medium text-stone-800">
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                </p>
                <p className="text-stone-600 mt-1">{order.shippingAddress?.address}</p>
                {order.shippingAddress?.apartment && (
                  <p className="text-stone-600">{order.shippingAddress.apartment}</p>
                )}
                <p className="text-stone-600">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                  {order.shippingAddress?.pincode}
                </p>
                <p className="text-stone-600">{order.shippingAddress?.country || 'India'}</p>
                <p className="text-stone-600 mt-2 text-xs">
                  <span className="font-medium text-stone-700">Contact:</span>{' '}
                  {order.shippingAddress?.phone}
                </p>
              </div>

              {/* Payment Details */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 shadow-sm text-sm">
                <h3 className="font-heading font-semibold text-stone-900 mb-3 text-base">
                  Payment Information
                </h3>
                <p className="text-stone-600">
                  <span className="font-medium text-stone-800">Method:</span> {order.paymentMethod}
                </p>
                <p className="text-stone-600 mt-1">
                  <span className="font-medium text-stone-800">Payment Status:</span>{' '}
                  <span className="text-[#586c38] font-semibold">
                    {order.paymentDetails?.status || 'PAID'}
                  </span>
                </p>
                {order.paymentDetails?.razorpay_payment_id && (
                  <p className="text-xs text-stone-500 mt-1 font-mono">
                    Transaction ID: {order.paymentDetails.razorpay_payment_id}
                  </p>
                )}
                <p className="text-stone-600 mt-2 text-xs">
                  <span className="font-medium text-stone-800">Shipping Courier:</span>{' '}
                  {order.shippingMethod || 'Standard Express'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

