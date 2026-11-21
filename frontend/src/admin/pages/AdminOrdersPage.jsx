import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { getProductImageUrl } from '../../utils/imageUtils';

export default function AdminOrdersPage() {
  const { orders, products, updateOrderStatus, cancelOrder } = useAdmin();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'all' || (o.orderStatus || 'Processing') === filterStatus;
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.emailOrPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
    }
  };

  const handleConfirmCancel = () => {
    if (selectedOrder) {
      cancelOrder(selectedOrder.orderId, cancelReason);
      setSelectedOrder((prev) => ({
        ...prev,
        orderStatus: 'Cancelled',
        cancellationReason: cancelReason,
      }));
      setCancelModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-sm">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-stone-900">
          Order Management ({orders.length})
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Review orders, inspect customer shipping details, update statuses and process cancellations
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order ID, customer or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-sm border border-stone-300 rounded focus:outline-none focus:border-[#586c38]"
          />
          <svg className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-stone-600 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 text-sm border border-stone-300 rounded focus:outline-none focus:border-[#586c38] bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider font-semibold text-xs">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-stone-500 text-sm">
                    No orders match your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900 text-sm">
                      #{ord.orderId}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 text-sm">
                      {new Date(ord.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-sm">
                      <p className="font-semibold text-stone-900">
                        {ord.shippingAddress?.firstName} {ord.shippingAddress?.lastName}
                      </p>
                      <p className="text-xs text-stone-400">{ord.shippingAddress?.phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-stone-700 block font-medium">
                        {ord.paymentMethod?.includes('Razorpay') ? 'Razorpay Prepaid' : 'COD'}
                      </span>
                      <span className="text-xs text-[#586c38] font-semibold">
                        {ord.paymentDetails?.status || 'PAID'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900 text-sm">
                      {formatPrice(ord.pricing?.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus || 'Processing'}
                        onChange={(e) => handleStatusChange(ord.orderId, e.target.value)}
                        className={`text-xs font-bold py-1 px-2.5 rounded border focus:outline-none ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : ord.orderStatus === 'Shipped'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#586c38] hover:bg-[#586c38]/10 rounded border border-[#586c38]/30 transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Slide-over / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 sm:p-8 z-10 text-sm">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
              <div>
                <h2 className="text-xl font-heading font-bold text-stone-900">
                  Order Details #{selectedOrder.orderId}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Placed on {new Date(selectedOrder.date).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-50 rounded-lg border border-stone-200 mb-6">
              <div>
                <span className="text-stone-600 mr-2 font-medium text-sm">Update Status:</span>
                <select
                  value={selectedOrder.orderStatus || 'Processing'}
                  onChange={(e) => handleStatusChange(selectedOrder.orderId, e.target.value)}
                  className="font-bold text-sm py-1 px-2.5 rounded border border-stone-300 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {selectedOrder.orderStatus !== 'Cancelled' && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded font-semibold text-xs"
                >
                  Cancel Order
                </button>
              )}
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-stone-100 text-sm">
              <div className="space-y-1">
                <p className="font-bold text-stone-900 text-sm mb-1">Shipping Details</p>
                <p className="font-semibold text-stone-800">
                  {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}
                </p>
                <p className="text-stone-600">{selectedOrder.shippingAddress?.address}</p>
                <p className="text-stone-600">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{' '}
                  {selectedOrder.shippingAddress?.pincode}
                </p>
                <p className="text-stone-600">Phone: {selectedOrder.shippingAddress?.phone}</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-stone-900 text-sm mb-1">Payment & Dispatch</p>
                <p className="text-stone-600">
                  <span className="font-semibold text-stone-700">Payment:</span>{' '}
                  {selectedOrder.paymentMethod}
                </p>
                <p className="text-stone-600">
                  <span className="font-semibold text-stone-700">Status:</span>{' '}
                  <span className="text-[#586c38] font-bold">
                    {selectedOrder.paymentDetails?.status || 'PAID'}
                  </span>
                </p>
                {selectedOrder.paymentDetails?.razorpay_payment_id && (
                  <p className="text-stone-500 font-mono text-xs">
                    Gateway ID: {selectedOrder.paymentDetails.razorpay_payment_id}
                  </p>
                )}
                {selectedOrder.cancellationReason && (
                  <p className="text-red-600 font-medium mt-2 text-xs">
                    Reason: {selectedOrder.cancellationReason}
                  </p>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="py-5 border-b border-stone-100 space-y-3">
              <p className="font-bold text-stone-900 text-sm mb-2">Purchased Items</p>
              {selectedOrder.items?.map((item, i) => {
                // Resolve product name reliably across all schema variations
                const matchedProduct = products.find(
                  (p) => String(p._id || p.id) === String(item.productId || item._id || item.id)
                );
                const itemName =
                  item.name ||
                  item.title ||
                  item.productName ||
                  item.product?.name ||
                  item.product?.title ||
                  matchedProduct?.name ||
                  matchedProduct?.title ||
                  'Ayurvedic Product';

                const itemPrice = Number(item.price ?? item.unitPrice ?? matchedProduct?.price ?? 0);
                const itemQty = Number(item.quantity ?? item.qty ?? 1);
                const itemSubtotal = Number(item.subtotal ?? (itemPrice * itemQty));

                const rawImage =
                  item.image ||
                  item.primaryImage ||
                  (Array.isArray(item.images) && item.images[0]) ||
                  item.product?.primaryImage ||
                  matchedProduct?.primaryImage ||
                  (Array.isArray(matchedProduct?.images) && matchedProduct?.images[0]) ||
                  '/assets/images/prod-p2.jpg';
                const imageUrl = getProductImageUrl(rawImage);

                return (
                  <div key={item.key || item.productId || i} className="flex items-center justify-between text-sm py-2">
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-4">
                      <img
                        src={imageUrl}
                        alt={itemName}
                        className="w-14 h-14 min-w-14 min-h-14 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-50"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/prod-p2.jpg';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">
                          {itemName}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-stone-500 mt-1">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.sku && item.variant && <span>•</span>}
                          {item.variant && <span>Variant: {item.variant}</span>}
                          {(item.sku || item.variant) && <span>•</span>}
                          <span>Qty: <strong className="text-stone-700">{itemQty}</strong></span>
                          <span>•</span>
                          <span>{formatPrice(itemPrice)} each</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 text-sm whitespace-nowrap pl-2">
                      {formatPrice(itemSubtotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Totals */}
            <div className="pt-4 max-w-xs ml-auto space-y-1.5 text-stone-600 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.pricing?.subtotal)}</span>
              </div>
              {selectedOrder.pricing?.discount > 0 && (
                <div className="flex justify-between text-[#586c38]">
                  <span>Discount</span>
                  <span>-{formatPrice(selectedOrder.pricing?.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-[#586c38] font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-base pt-2 border-t border-stone-200">
                <span>Grand Total</span>
                <span>{formatPrice(selectedOrder.pricing?.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setCancelModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl z-10 text-sm">
            <h3 className="font-bold text-base text-stone-900 mb-2">Cancel Order</h3>
            <p className="text-stone-600 mb-4 text-sm">
              Are you sure you want to mark Order #{selectedOrder?.orderId} as cancelled?
            </p>
            <div className="mb-4">
              <label className="block text-stone-700 font-semibold mb-1 text-sm">Reason for cancellation</label>
              <textarea
                rows="2"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-3.5 py-1.5 border border-stone-300 rounded text-stone-700 text-sm"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

