import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * OrderStore.js
 * Persistent file & memory fallback order store supporting user-isolated order records.
 * Works seamlessly alongside Mongoose / MongoDB Order model with disk persistence.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const ORDER_DATA_FILE = path.join(DATA_DIR, 'order_store.json');

class OrderStore {
  constructor() {
    this.orders = new Map(); // orderId -> Order
    this.razorpayOrders = new Map(); // rzp_order_id -> { orderDetails, status, paymentId }
    this.processedPayments = new Set(); // razorpay_payment_id set to prevent duplicate capture/replay
    this.initPersistence();
  }

  initPersistence() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(ORDER_DATA_FILE)) {
        const raw = fs.readFileSync(ORDER_DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.orders)) {
          parsed.orders.forEach((ord) => {
            if (ord && ord.orderId) {
              this.orders.set(ord.orderId, ord);
            }
          });
        }
        if (Array.isArray(parsed.processedPayments)) {
          parsed.processedPayments.forEach((pid) => this.processedPayments.add(pid));
        }
      }
    } catch (err) {
      console.warn('Could not initialize order persistence file:', err.message);
    }
  }

  saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        ORDER_DATA_FILE,
        JSON.stringify(
          {
            orders: Array.from(this.orders.values()),
            processedPayments: Array.from(this.processedPayments),
            updatedAt: new Date(),
          },
          null,
          2
        ),
        'utf8'
      );
    } catch (err) {
      console.warn('Failed to save orders to disk:', err.message);
    }
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
    this.saveToFile();
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
    this.saveToFile();
    return orderWithDates;
  }

  getOrder(orderId) {
    return this.orders.get(orderId) || null;
  }

  getUserOrders(userId, userEmail = '') {
    const list = [];
    const targetId = String(userId || '').trim().toLowerCase();
    const targetEmail = String(userEmail || '').trim().toLowerCase();

    for (const order of this.orders.values()) {
      const orderUserId = String(order.userId || '').trim().toLowerCase();
      const orderEmail = String(order.shippingAddress?.email || order.customer?.emailOrPhone || '').trim().toLowerCase();

      if ((targetId && orderUserId === targetId) || (targetEmail && orderEmail === targetEmail)) {
        list.push(order);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }

  getAllOrders() {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
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
    this.saveToFile();
    return order;
  }
}

export const orderStore = new OrderStore();
