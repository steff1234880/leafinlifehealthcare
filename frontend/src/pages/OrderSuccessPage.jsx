import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">No Active Order Found</h1>
        <p className="text-stone-600 text-sm max-w-md mb-6">
          Looking for your previous orders? You can explore our authentic Ayurvedic healthcare collection.
        </p>
        <Link
          to="/collections/all"
          className="px-6 py-2.5 bg-[#586c38] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#46562d] transition"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-stone-200 p-6 sm:p-10">
        {/* Success Header */}
        <div className="text-center pb-8 border-b border-stone-200">
          <div className="w-16 h-16 bg-[#586c38]/10 text-[#586c38] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#586c38] mb-1">
            Order #{order.orderId}
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-2">
            Payment & Order Confirmed!
          </h1>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            Thank you for choosing Leaf In Life Healthcare. Your payment has been securely verified and your order is now in process.
            {order.customer?.emailOrPhone && (
              <> Confirmation sent to <span className="font-semibold text-stone-800">{order.customer.emailOrPhone}</span>.</>
            )}
          </p>
        </div>

        {/* Payment Verification Banner */}
        {order.paymentDetails?.razorpay_payment_id && (
          <div className="my-6 p-4 rounded-lg bg-green-50/70 border border-green-200 flex items-start space-x-3 text-xs text-stone-700">
            <svg className="w-5 h-5 text-[#586c38] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="font-semibold text-stone-900 mb-0.5">Secure Gateway Payment Verified</p>
              <p className="text-stone-600">
                Transaction ID: <span className="font-mono font-medium">{order.paymentDetails.razorpay_payment_id}</span>
                {order.paymentDetails.razorpay_order_id && (
                  <> • Gateway Order: <span className="font-mono font-medium">{order.paymentDetails.razorpay_order_id}</span></>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Order Details Grid */}
        <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-stone-200 text-sm">
          <div>
            <h3 className="font-semibold text-stone-900 mb-2">Delivery Address</h3>
            <p className="text-stone-700">
              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
            </p>
            <p className="text-stone-600">{order.shippingAddress?.address}</p>
            {order.shippingAddress?.apartment && (
              <p className="text-stone-600">{order.shippingAddress.apartment}</p>
            )}
            <p className="text-stone-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            <p className="text-stone-600">{order.shippingAddress?.country || 'India'}</p>
            <p className="text-stone-600 mt-1">Contact: {order.shippingAddress?.phone}</p>
          </div>

          <div>
            <h3 className="font-semibold text-stone-900 mb-2">Order Information</h3>
            <p className="text-stone-600">
              <span className="font-medium text-stone-700">Shipping method:</span> {order.shippingMethod || 'Standard Express Delivery'}
            </p>
            <p className="text-stone-600 mt-1">
              <span className="font-medium text-stone-700">Payment method:</span> {order.paymentMethod}
            </p>
            <p className="text-stone-600 mt-1">
              <span className="font-medium text-stone-700">Order date:</span>{' '}
              {new Date(order.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="text-stone-600 mt-1">
              <span className="font-medium text-stone-700">Status:</span>{' '}
              <span className="text-[#586c38] font-semibold">{order.status}</span>
            </p>
          </div>
        </div>

        {/* Items Summary */}
        <div className="py-6 border-b border-stone-200">
          <h3 className="font-semibold text-stone-900 mb-4 text-base">Purchased Items</h3>
          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={item.key || idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-md border border-stone-200 flex-shrink-0"
                  />
                  <div>
                    <p className="font-medium text-stone-900 line-clamp-1">{item.title}</p>
                    {item.variant && <p className="text-xs text-stone-500">{item.variant}</p>}
                    <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-medium text-stone-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="mt-6 pt-4 border-t border-stone-100 space-y-2 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.pricing?.subtotal)}</span>
            </div>
            {order.pricing?.discount > 0 && (
              <div className="flex justify-between text-[#586c38]">
                <span>Discount ({order.pricing?.discountCode})</span>
                <span>-{formatPrice(order.pricing?.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-[#586c38] font-medium">Free</span>
            </div>
            <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-200">
              <span>Total Paid</span>
              <span>{formatPrice(order.pricing?.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/collections/all"
            className="w-full sm:w-auto text-center px-6 py-3 bg-[#586c38] text-white rounded font-medium hover:bg-[#46562d] transition text-sm"
          >
            Continue Shopping
          </Link>
          <p className="text-xs text-stone-500 text-center sm:text-right">
            Have questions? Our support team is available at +91 95449 84444.
          </p>
        </div>
      </div>
    </div>
  );
}

