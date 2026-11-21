import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getProductImageUrl } from '../utils/imageUtils';

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

  const formatDate = (rawDate) => {
    if (!rawDate) return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const parsed = new Date(rawDate);
    if (isNaN(parsed.getTime())) {
      return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return parsed.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          Looking for your previous orders? You can explore your order history or discover our authentic Ayurvedic healthcare collection.
        </p>
        <div className="flex items-center space-x-4">
          <Link
            to="/account/orders"
            className="px-6 py-2.5 bg-[#2f3e10] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#586c38] transition"
          >
            My Orders
          </Link>
          <Link
            to="/collections/all"
            className="px-6 py-2.5 bg-stone-200 text-stone-800 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-300 transition"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  // Normalize order properties
  const rawItems = Array.isArray(order.items) ? order.items : [];
  const rawDate = order.createdAt || order.date || order.paidAt || order.updatedAt;
  const formattedOrderDate = formatDate(rawDate);

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
  const orderStatus = order.orderStatus || order.status || 'Confirmed';

  return (
    <div className="account-scope min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[900px] mx-auto bg-white rounded-xl shadow-sm border border-stone-200 p-6 sm:p-10">
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
            Order Confirmed!
          </h1>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            Thank you for choosing Leaf In Life Healthcare. Your order has been placed and is now being processed by our Ayurvedic fulfillment team.
            {(order.shippingAddress?.email || order.customer?.emailOrPhone) && (
              <> Confirmation details sent to <span className="font-semibold text-stone-800">{order.shippingAddress?.email || order.customer?.emailOrPhone}</span>.</>
            )}
          </p>
        </div>

        {/* Payment Verification Banner (if Razorpay / online) */}
        {(order.paymentDetails?.razorpay_payment_id || order.paymentDetails?.razorpayPaymentId) && (
          <div className="my-6 p-4 rounded-lg bg-green-50/70 border border-green-200 flex items-start space-x-3 text-xs text-stone-700">
            <svg className="w-5 h-5 text-[#586c38] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="font-semibold text-stone-900 mb-0.5">Secure Gateway Payment Verified</p>
              <p className="text-stone-600">
                Transaction ID:{' '}
                <span className="font-mono font-medium">
                  {order.paymentDetails.razorpay_payment_id || order.paymentDetails.razorpayPaymentId}
                </span>
                {(order.paymentDetails.razorpay_order_id || order.paymentDetails.razorpayOrderId) && (
                  <> • Gateway Order: <span className="font-mono font-medium">{order.paymentDetails.razorpay_order_id || order.paymentDetails.razorpayOrderId}</span></>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Order Details Grid */}
        <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-stone-200 text-sm">
          <div>
            <h3 className="font-semibold text-stone-900 mb-2.5 text-base flex items-center space-x-2">
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
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            <p className="text-stone-600">{order.shippingAddress?.country || 'India'}</p>
            {order.shippingAddress?.phone && (
              <p className="text-stone-600 mt-2 text-xs">
                <span className="font-medium text-stone-700">Phone:</span> {order.shippingAddress.phone}
              </p>
            )}
            {order.shippingAddress?.email && (
              <p className="text-stone-600 text-xs">
                <span className="font-medium text-stone-700">Email:</span> {order.shippingAddress.email}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-stone-900 mb-2.5 text-base flex items-center space-x-2">
              <svg className="w-4 h-4 text-[#586c38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Order Information</span>
            </h3>
            <p className="text-stone-600">
              <span className="font-medium text-stone-700">Order ID:</span> #{order.orderId}
            </p>
            <p className="text-stone-600 mt-1">
              <span className="font-medium text-stone-700">Order Date:</span> {formattedOrderDate}
            </p>
            <p className="text-stone-600 mt-1">
              <span className="font-medium text-stone-700">Shipping method:</span>{' '}
              {order.shippingMethod || 'Standard Express Delivery'}
            </p>
            <p className="text-stone-600 mt-1">
              <span className="font-medium text-stone-700">Payment method:</span>{' '}
              <span className="uppercase font-semibold text-stone-700">{order.paymentMethod || 'Online'}</span>
            </p>
            <p className="text-stone-600 mt-1 flex items-center space-x-2">
              <span className="font-medium text-stone-700">Status:</span>
              <span className="text-[#586c38] font-semibold bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                {orderStatus}
              </span>
            </p>
          </div>
        </div>

        {/* Items Summary */}
        <div className="py-6 border-b border-stone-200">
          <h3 className="font-semibold text-stone-900 mb-5 text-lg">
            Purchased Items ({rawItems.length})
          </h3>

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
                    'Ayurvedic Product';
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
                      {/* Product: Thumbnail + Name + Details (SKU/Variant) */}
                      <td className="py-5 pr-4 align-middle">
                        <div className="flex items-center space-x-4">
                          <img
                            src={imageUrl}
                            alt={itemName}
                            className="w-20 h-20 sm:w-20 sm:h-20 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-50 shadow-xs"
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

                      {/* Unit Price */}
                      <td className="py-5 text-right align-middle font-medium text-stone-800 whitespace-nowrap text-base">
                        {formatPrice(itemPrice)}
                      </td>

                      {/* Quantity */}
                      <td className="py-5 text-center align-middle font-medium text-stone-800 whitespace-nowrap text-base">
                        {itemQty}
                      </td>

                      {/* Subtotal */}
                      <td className="py-5 text-right align-middle font-bold text-stone-900 whitespace-nowrap text-base">
                        {formatPrice(itemSubtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden space-y-4 divide-y divide-stone-100">
            {rawItems.map((item, idx) => {
              const itemName =
                item.name ||
                item.title ||
                item.productName ||
                item.product?.name ||
                item.product?.title ||
                'Ayurvedic Product';
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
                <div key={item.key || item.productId || idx} className="pt-4 first:pt-0 flex flex-col gap-3">
                  {/* Top row: Image + Name + SKU/Variant */}
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={imageUrl}
                      alt={itemName}
                      className="w-20 h-20 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-50 shadow-xs"
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

                  {/* Bottom row: Unit Price, Quantity & Subtotal */}
                  <div className="flex items-center justify-between text-xs bg-stone-50/80 p-3 rounded-lg border border-stone-100">
                    <div className="flex items-center space-x-3 text-stone-600">
                      <span>Price: <strong className="text-stone-800 font-semibold">{formatPrice(itemPrice)}</strong></span>
                      <span>•</span>
                      <span>Qty: <strong className="text-stone-800 font-semibold">{itemQty}</strong></span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-500 mr-1.5">Subtotal:</span>
                      <strong className="font-bold text-stone-900 text-sm">{formatPrice(itemSubtotal)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing breakdown */}
          <div className="mt-6 pt-4 border-t border-stone-200 max-w-sm ml-auto space-y-2 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-stone-800">{formatPrice(rawSubtotal)}</span>
            </div>
            {Number(rawDiscount) > 0 && (
              <div className="flex justify-between text-[#586c38] font-medium">
                <span>Discount {discountCode ? `(${discountCode})` : ''}</span>
                <span>-{formatPrice(rawDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Charge</span>
              {Number(rawShipping) === 0 ? (
                <span className="text-[#586c38] font-medium">Free</span>
              ) : (
                <span className="font-medium text-stone-800">{formatPrice(rawShipping)}</span>
              )}
            </div>
            <div className="flex justify-between font-bold text-stone-900 text-base pt-3 border-t border-stone-200">
              <span>Total Paid</span>
              <span className="text-lg text-[#2f3e10]">{formatPrice(rawGrandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              to="/collections/all"
              className="w-full sm:w-auto text-center px-6 py-2.5 bg-[#586c38] text-white rounded font-medium hover:bg-[#46562d] transition text-sm"
            >
              Continue Shopping
            </Link>
            <Link
              to={`/account/orders/${order.orderId}`}
              className="w-full sm:w-auto text-center px-6 py-2.5 bg-stone-100 text-stone-800 rounded font-medium hover:bg-stone-200 transition text-sm border border-stone-300"
            >
              View Order Tracking
            </Link>
          </div>
          <p className="text-xs text-stone-500 text-center sm:text-right">
            Have questions? Our support team is available at +91 95449 84444.
          </p>
        </div>
      </div>
    </div>
  );
}
