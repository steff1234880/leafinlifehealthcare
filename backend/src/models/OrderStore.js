// In-memory data store with thread-safe persistence and duplicate protection
// Operates concurrently with MongoDB Mongoose models when the DB connection is established.

class OrderStore {
  constructor() {
    this.orders = new Map(); // orderId -> Order
    this.razorpayOrders = new Map(); // rzp_order_id -> { orderDetails, status, paymentId }
    this.processedPayments = new Set(); // razorpay_payment_id set to prevent duplicate capture/replay
  }

  createRazorpayOrderSession(rzpOrderId, metadata) {
    this.razorpayOrders.set(rzpOrderId, {
      ...metadata,
      status: 'created',
      createdAt: new Date().toISOString(),
    });
    return this.razorpayOrders.get(rzpOrderId);
  }

  getRazorpayOrderSession(rzpOrderId) {
    return this.razorpayOrders.get(rzpOrderId);
  }

  isPaymentProcessed(paymentId) {
    return this.processedPayments.has(paymentId);
  }

  markPaymentProcessed(paymentId) {
    this.processedPayments.add(paymentId);
  }

  createOrder(orderData) {
    if (this.orders.has(orderData.orderId)) {
      const err = new Error(`Order ${orderData.orderId} already exists! Duplicate order prevention triggered.`);
      err.statusCode = 409;
      throw err;
    }
    const orderWithDates = {
      ...orderData,
      createdAt: orderData.createdAt || new Date(),
      updatedAt: orderData.updatedAt || new Date(),
    };
    this.orders.set(orderData.orderId, orderWithDates);
    return orderWithDates;
  }

  getOrder(orderId) {
    return this.orders.get(orderId) || null;
  }

  getUserOrders(userId) {
    const list = [];
    for (const order of this.orders.values()) {
      if (String(order.userId) === String(userId)) {
        list.push(order);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getAllOrders() {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  updateOrderStatus(orderId, newStatus, reason = '') {
    const order = this.orders.get(orderId);
    if (!order) {
      const err = new Error(`Order ${orderId} not found`);
      err.statusCode = 404;
      throw err;
    }
    order.orderStatus = newStatus;
    if (newStatus === 'Cancelled') {
      order.cancelledAt = new Date();
      if (reason) order.cancellationReason = reason;
    }
    order.updatedAt = new Date();
    return order;
  }
}

export const orderStore = new OrderStore();
