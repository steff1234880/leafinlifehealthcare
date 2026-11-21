import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AccountSidebar from '../components/account/AccountSidebar';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getProductImageUrl } from '../utils/imageUtils';

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
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!authLoading && !isAuthenticated) {
      navigate('/account/login');
      return;
    }

    if (isAuthenticated) {
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
    }
  }, [orderId, authLoading, isAuthenticated, navigate]);

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

  const formatDate = (rawDate) => {
    if (!rawDate) return 'Recent Order';
    const parsed = new Date(rawDate);
    if (isNaN(parsed.getTime())) {
      return 'Recent Order';
    }
    return parsed.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Determine current step index for the tracker
  const getCurrentStepIndex = (status) => {
    switch (status) {
      case 'Delivered':
        return 4;
      case 'Shipped':
        return 3;
      case 'Processing':
        return 2;
      case 'Confirmed':
        return 1;
      case 'Pending':
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStepIndex(order?.orderStatus || order?.status || 'Pending');

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

  // Derive order values safely
  const orderDate = order.createdAt || order.date || order.updatedAt;
  const rawItems = Array.isArray(order.items) ? order.items : [];

  // Normalize pricing values
  const rawSubtotal =
    order.pricing?.subtotal ??
    order.subtotal ??
    rawItems.reduce((acc, it) => acc + Number(it.price || it.unitPrice || 0) * Number(it.quantity || it.qty || 1), 0);

  const rawShipping =
    order.pricing?.shippingCharge ??
    order.pricing?.shipping ??
    order.shippingCharge ??
    order.shipping ??
    0;

  const rawDiscount =
    order.pricing?.discountAmount ??
    order.pricing?.discount ??
    order.discountAmount ??
    order.discount ??
    0;

  const rawGrandTotal =
    order.pricing?.grandTotal ??
    order.grandTotal ??
    order.totalAmount ??
    order.total ??
    (rawSubtotal + Number(rawShipping) - Number(rawDiscount));

  const discountCode = order.pricing?.discountCode || order.discountCode;
  const paymentStatus = order.paymentStatus || order.paymentDetails?.status || (order.paymentMethod === 'cod' ? 'PENDING' : 'PAID');
  const isCancelled = (order.orderStatus || order.status) === 'Cancelled';

  return (
    <div className="account-scope min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1200px] mx-auto">
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
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-heading font-medium text-stone-900">
                  Order #{order.orderId}
                </h1>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                    isCancelled
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : (order.orderStatus || order.status) === 'Delivered'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-emerald-50 text-[#586c38] border-emerald-200'
                  }`}
                >
                  {order.orderStatus || order.status || 'Confirmed'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Placed on {formatDate(orderDate)}
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
            {/* Cancel banner if cancelled or button if cancellable */}
            {cancelMessage && (
              <div className="p-4 rounded-lg bg-stone-100 border border-stone-300 text-sm text-stone-800">
                {cancelMessage}
              </div>
            )}

            {isCancelled ? (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <div>
                  <p className="font-semibold text-red-900">This order has been cancelled</p>
                  {order.cancellationReason && (
                    <p className="text-xs text-red-700 mt-0.5">Reason: {order.cancellationReason}</p>
                  )}
                </div>
              </div>
            ) : (
              /* 1. ORDER TRACKING STATUS TIMELINE */
              <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-heading font-semibold text-stone-900">
                    Order Progress & Delivery Status
                  </h2>
                  {['Pending', 'Confirmed'].includes(order.orderStatus || order.status) && (
                    <button
                      type="button"
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="text-xs text-red-600 hover:text-red-700 font-medium underline disabled:opacity-50"
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>

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

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
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
            )}

            {/* 2. PURCHASED PRODUCTS TABLE */}
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-heading font-semibold text-stone-900 mb-6">
                Purchased Products ({rawItems.length})
              </h2>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs font-semibold uppercase tracking-wider text-stone-500">
                      <th className="pb-3 text-left w-1/2">Product</th>
                      <th className="pb-3 text-right w-1/6">Unit Price</th>
                      <th className="pb-3 text-center w-1/6">Qty</th>
                      <th className="pb-3 text-right w-1/6">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {rawItems.map((item, idx) => {
                      const itemName =
                        item.name ||
                        item.title ||
                        item.productName ||
                        item.product?.name ||
                        item.product?.title ||
                        'Ayurvedic Formulation';
                      const itemPrice = Number(item.price ?? item.unitPrice ?? item.product?.price ?? 0);
                      const itemQty = Number(item.quantity ?? item.qty ?? 1);
                      const itemSubtotal = Number(item.subtotal ?? (itemPrice * itemQty));
                      const rawImage =
                        item.image ||
                        (Array.isArray(item.images) && item.images[0]) ||
                        item.primaryImage ||
                        item.product?.primaryImage ||
                        (Array.isArray(item.product?.images) && item.product?.images[0]) ||
                        '/assets/images/prod-p2.jpg';
                      const imageUrl = getProductImageUrl(rawImage);
                      const itemSlug = item.slug || item.productId || item._id;
                      const productLink = item.url || (itemSlug ? `/products/${itemSlug}` : null);

                      return (
                        <tr key={item.key || item.productId || idx} className="hover:bg-stone-50/50">
                          {/* Product: Thumbnail + Name + Details */}
                          <td className="py-5 pr-4 align-middle">
                            <div className="flex items-center space-x-4">
                              <img
                                src={imageUrl}
                                alt={itemName}
                                className="w-20 h-20 min-w-20 min-h-20 sm:w-20 sm:h-20 sm:min-w-20 sm:min-h-20 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-50 shadow-xs"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/assets/images/prod-p2.jpg';
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                {productLink ? (
                                  <Link
                                    to={productLink}
                                    className="font-semibold text-stone-900 hover:text-[#586c38] text-base transition line-clamp-2 block leading-snug"
                                  >
                                    {itemName}
                                  </Link>
                                ) : (
                                  <span className="font-semibold text-stone-900 text-base line-clamp-2 block leading-snug">
                                    {itemName}
                                  </span>
                                )}
                                {(item.sku || item.variant) && (
                                  <div className="flex flex-wrap items-center gap-x-2 mt-1.5 text-xs text-stone-500">
                                    {item.sku && <span>SKU: {item.sku}</span>}
                                    {item.sku && item.variant && <span>•</span>}
                                    {item.variant && <span>Variant: {item.variant}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-5 text-right align-middle font-medium text-stone-800 whitespace-nowrap text-base">
                            {formatPrice(itemPrice)}
                          </td>
                          <td className="py-5 text-center align-middle font-medium text-stone-800 whitespace-nowrap text-base">
                            {itemQty}
                          </td>
                          <td className="py-5 text-right align-middle font-bold text-stone-900 whitespace-nowrap text-base">
                            {formatPrice(itemSubtotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="sm:hidden space-y-4 divide-y divide-stone-100">
                {rawItems.map((item, idx) => {
                  const itemName =
                    item.name ||
                    item.title ||
                    item.productName ||
                    item.product?.name ||
                    item.product?.title ||
                    'Ayurvedic Formulation';
                  const itemPrice = Number(item.price ?? item.unitPrice ?? item.product?.price ?? 0);
                  const itemQty = Number(item.quantity ?? item.qty ?? 1);
                  const itemSubtotal = Number(item.subtotal ?? (itemPrice * itemQty));
                  const rawImage =
                    item.image ||
                    (Array.isArray(item.images) && item.images[0]) ||
                    item.primaryImage ||
                    item.product?.primaryImage ||
                    (Array.isArray(item.product?.images) && item.product?.images[0]) ||
                    '/assets/images/prod-p2.jpg';
                  const imageUrl = getProductImageUrl(rawImage);
                  const itemSlug = item.slug || item.productId || item._id;
                  const productLink = item.url || (itemSlug ? `/products/${itemSlug}` : null);

                  return (
                    <div
                      key={item.key || item.productId || idx}
                      className="pt-4 first:pt-0 flex flex-col gap-3"
                    >
                      <div className="flex items-start space-x-3.5">
                        <img
                          src={imageUrl}
                          alt={itemName}
                          className="w-20 h-20 min-w-20 min-h-20 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-50 shadow-xs"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/images/prod-p2.jpg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          {productLink ? (
                            <Link
                              to={productLink}
                              className="font-semibold text-stone-900 hover:text-[#586c38] text-[15px] block leading-snug line-clamp-2"
                            >
                              {itemName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-stone-900 text-[15px] block leading-snug line-clamp-2">
                              {itemName}
                            </span>
                          )}
                          {(item.sku || item.variant) && (
                            <div className="flex flex-wrap items-center gap-x-2 mt-1.5 text-xs text-stone-500">
                              {item.sku && <span>SKU: {item.sku}</span>}
                              {item.sku && item.variant && <span>•</span>}
                              {item.variant && <span>Variant: {item.variant}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom badge row: Price, Qty & Subtotal */}
                      <div className="flex items-center justify-between text-xs bg-stone-50/80 p-3 rounded-lg border border-stone-100">
                        <div className="flex items-center space-x-3 text-stone-600">
                          <span>Price: <strong className="text-stone-800 font-semibold">{formatPrice(itemPrice)}</strong></span>
                          <span>•</span>
                          <span>Qty: <strong className="text-stone-800 font-semibold">{itemQty}</strong></span>
                        </div>
                        <div className="text-right">
                          <span className="text-stone-500 mr-1.5">Subtotal:</span>
                          <strong className="font-bold text-stone-900 text-sm">
                            {formatPrice(itemSubtotal)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculation breakdown */}
              <div className="mt-8 pt-6 border-t border-stone-200 max-w-sm ml-auto space-y-2.5 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-stone-800">{formatPrice(rawSubtotal)}</span>
                </div>
                {Number(rawDiscount) > 0 && (
                  <div className="flex justify-between text-[#586c38] font-medium">
                    <span>Discount {discountCode ? `(${discountCode})` : ''}</span>
                    <span>-{formatPrice(rawDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  {Number(rawShipping) === 0 ? (
                    <span className="text-[#586c38] font-medium">Free</span>
                  ) : (
                    <span className="font-medium text-stone-800">{formatPrice(rawShipping)}</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-base pt-3 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="text-lg text-[#2f3e10]">{formatPrice(rawGrandTotal)}</span>
                </div>
              </div>
            </div>

            {/* 3. SHIPPING & PAYMENT DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Address */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 shadow-sm text-sm">
                <h3 className="font-heading font-semibold text-stone-900 mb-3 text-base flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#586c38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Delivery Address</span>
                </h3>
                <p className="font-semibold text-stone-800">
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
                {order.shippingAddress?.phone && (
                  <p className="text-stone-600 mt-2 text-xs">
                    <span className="font-medium text-stone-700">Phone:</span>{' '}
                    {order.shippingAddress?.phone}
                  </p>
                )}
                {order.shippingAddress?.email && (
                  <p className="text-stone-600 text-xs">
                    <span className="font-medium text-stone-700">Email:</span>{' '}
                    {order.shippingAddress?.email}
                  </p>
                )}
              </div>

              {/* Payment Details */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 shadow-sm text-sm">
                <h3 className="font-heading font-semibold text-stone-900 mb-3 text-base flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#586c38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Payment & Dispatch</span>
                </h3>
                <p className="text-stone-600">
                  <span className="font-medium text-stone-800">Payment Method:</span>{' '}
                  <span className="uppercase font-semibold text-stone-700">
                    {order.paymentMethod || 'Online'}
                  </span>
                </p>
                <p className="text-stone-600 mt-1.5">
                  <span className="font-medium text-stone-800">Payment Status:</span>{' '}
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-xs ml-1 ${
                      paymentStatus.toUpperCase() === 'COMPLETED' || paymentStatus.toUpperCase() === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </p>
                {(order.paymentDetails?.razorpayPaymentId || order.paymentDetails?.razorpay_payment_id) && (
                  <p className="text-xs text-stone-500 mt-2 font-mono">
                    Gateway ID: {order.paymentDetails.razorpayPaymentId || order.paymentDetails.razorpay_payment_id}
                  </p>
                )}
                <p className="text-stone-600 mt-2 text-xs">
                  <span className="font-medium text-stone-800">Shipping Courier:</span>{' '}
                  {order.shippingMethod || 'Kerala Ayurvedic Standard Express'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
