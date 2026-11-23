import crypto from 'crypto';
import mongoose from 'mongoose';
import { razorpayInstance, RAZORPAY_CONFIG } from '../config/razorpay.js';
import { orderStore } from '../models/OrderStore.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { productStore } from '../models/ProductStore.js';
import { cartStore } from '../models/CartStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Helper to fetch a product
 */
async function fetchProduct(productId) {
  if (isDbConnected()) {
    let prod = null;
    if (mongoose.isValidObjectId(productId)) {
      prod = await Product.findById(productId);
    }
    if (!prod) {
      prod = await Product.findOne({ slug: String(productId).toLowerCase() });
    }
    return prod;
  }
  return await productStore.getProductById(productId);
}

/**
 * 1. Create Razorpay Payment Order
 * POST /api/payment/create-order
 * Body: { orderId } OR { items, shippingAddress, billingAddress, customer }
 */
export async function createPaymentOrder(req, res) {
  try {
    const userId = req.user?.id || 'guest';
    const { orderId, items, shippingAddress, billingAddress, customer } = req.body;

    let targetOrder = null;
    let finalAmount = 0;
    let calculatedItems = [];

    // Case A: Create Razorpay session for an existing created Order (e.g. from /api/orders)
    if (orderId) {
      if (isDbConnected()) {
        if (mongoose.isValidObjectId(orderId)) {
          targetOrder = await Order.findById(orderId);
        }
        if (!targetOrder) {
          targetOrder = await Order.findOne({ orderId });
        }
      } else {
        targetOrder = orderStore.getOrder(orderId);
      }

      if (!targetOrder) {
        return res.status(404).json({
          success: false,
          message: `Order not found with ID ${orderId}`,
        });
      }

      if (targetOrder.paymentStatus === 'Completed') {
        return res.status(400).json({
          success: false,
          message: 'This order has already been paid and completed.',
        });
      }

      finalAmount = targetOrder.pricing.grandTotal;
      calculatedItems = targetOrder.items;
    } else {
      // Case B: Create Razorpay session directly from checkout items/cart
      let rawItems = items;
      if (!rawItems || rawItems.length === 0) {
        if (isDbConnected()) {
          const cart = await Cart.findOne({ userId });
          if (cart) rawItems = cart.items;
        } else {
          const cart = cartStore.getCart(userId);
          if (cart) rawItems = cart.items;
        }
      }

      if (!rawItems || rawItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create payment order with empty items',
        });
      }

      // Verify each product and validate price from trusted database
      for (const item of rawItems) {
        const product = await fetchProduct(item.productId || item._id);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product "${item.name || item.productId}" is not available`,
          });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Product "${product.name}" only has ${product.stock} units in stock.`,
          });
        }

        const price = product.discountPrice ? product.discountPrice : product.price;
        calculatedItems.push({
          productId: product._id,
          name: product.name,
          sku: product.sku || '',
          price,
          quantity: item.quantity,
          subtotal: Math.round(price * item.quantity * 100) / 100,
        });
      }

      const subtotal = Math.round(
        calculatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0) * 100
      ) / 100;
      const shipping = subtotal >= 499 ? 0 : 50;
      finalAmount = Math.round((subtotal + shipping) * 100) / 100;
    }

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount calculated for order',
      });
    }

    const amountInPaise = Math.round(finalAmount * 100);
    const receiptId = `rcpt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    let rzpOrder;
    try {
      rzpOrder = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          customer_email: customer?.emailOrPhone || customer?.email || req.user?.email || '',
          order_id: targetOrder?.orderId || '',
        },
      });
    } catch (rzpErr) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Razorpay Error] Failed to create order in production:', rzpErr);
        return res.status(502).json({
          success: false,
          message: 'Payment gateway communication failed. Please try again or contact support.',
          error: rzpErr.error?.description || rzpErr.message || 'Gateway error',
        });
      }

      console.warn('Razorpay API direct call offline fallback (development only):', rzpErr.message);
      rzpOrder = {
        id: `order_${crypto.randomBytes(10).toString('hex')}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    // Save session in orderStore for signature & amount verification
    orderStore.createRazorpayOrderSession(rzpOrder.id, {
      amount: finalAmount,
      amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      items: calculatedItems,
      customer: customer || (shippingAddress ? { email: shippingAddress.email, phone: shippingAddress.phone } : {}),
      shippingAddress,
      billingAddress,
      orderId: targetOrder?.orderId || null,
      userId,
    });

    // If existing order exists, attach razorpayOrderId
    if (targetOrder) {
      if (isDbConnected()) {
        targetOrder.paymentDetails.razorpayOrderId = rzpOrder.id;
        await targetOrder.save();
      } else {
        targetOrder.paymentDetails = targetOrder.paymentDetails || {};
        targetOrder.paymentDetails.razorpayOrderId = rzpOrder.id;
      }
    }

    return res.status(200).json({
      success: true,
      keyId: RAZORPAY_CONFIG.keyId,
      order: rzpOrder,
      associatedOrderId: targetOrder?.orderId || null,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
}

/**
 * 2. Cryptographic Payment Verification (HMAC SHA256)
 * POST /api/payment/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails, orderId }
 */
export async function verifyPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
      orderId,
    } = req.body;
    const userId = req.user?.id || 'guest';

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory payment verification parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature)',
      });
    }

    // A. Prevent Duplicate Payments / Replay Attacks
    if (orderStore.isPaymentProcessed(razorpay_payment_id)) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate payment detected. This transaction has already been verified and processed.',
      });
    }

    // B. Cryptographic HMAC SHA256 Signature Verification
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_CONFIG.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid cryptographic signature! Transaction cannot be trusted.',
      });
    }

    // C. Mark payment as processed to permanently prevent replay
    orderStore.markPaymentProcessed(razorpay_payment_id);

    // D. Fetch Razorpay Session
    const session = orderStore.getRazorpayOrderSession(razorpay_order_id);

    // Check if matching Order already exists
    const targetOrderId = orderId || session?.orderId;
    let existingOrder = null;

    if (targetOrderId) {
      if (isDbConnected()) {
        existingOrder = await Order.findOne({
          $or: [{ orderId: targetOrderId }, { 'paymentDetails.razorpayOrderId': razorpay_order_id }],
        });
      } else {
        existingOrder = orderStore.getOrder(targetOrderId);
      }
    }

    let completedOrder = null;

    if (existingOrder) {
      // Validate currency and amount against original order
      if (session && Math.abs(session.amount - existingOrder.pricing.grandTotal) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount mismatch detected. Transaction flagged.',
        });
      }

      existingOrder.paymentStatus = 'Completed';
      existingOrder.orderStatus = 'Confirmed';
      existingOrder.paymentDetails = {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date(),
      };

      if (isDbConnected()) {
        await existingOrder.save();

        // Reduce stock safely after verified payment
        for (const item of existingOrder.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }

        // Clear cart after successful payment
        await Cart.findOneAndUpdate(
          { userId: existingOrder.userId },
          { $set: { items: [], totalQuantity: 0, totalAmount: 0 } }
        );
      } else {
        // Memory store update
        for (const item of existingOrder.items) {
          const prod = await productStore.getProductById(item.productId);
          if (prod) {
            await productStore.updateStock(item.productId, Math.max(0, prod.stock - item.quantity));
          }
        }
        cartStore.clearCart(existingOrder.userId);
      }

      completedOrder = existingOrder;
    } else {
      // Generate new Order for this verified transaction
      const finalItems = session ? session.items : orderDetails?.items || [];
      const finalShipping = session?.shippingAddress || orderDetails?.shippingAddress || {
        firstName: 'Customer',
        phone: session?.customer?.phone || '9876543210',
        email: session?.customer?.email || 'customer@leafinlifehealthcare.com',
        address: 'Direct Checkout Address',
        city: 'Kochi',
        state: 'Kerala',
        pincode: '682001',
      };
      const finalAmount = session ? session.amount : orderDetails?.pricing?.grandTotal || 0;

      const subtotal = Math.round(
        finalItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0) * 100
      ) / 100;
      const shippingCharge = subtotal >= 499 ? 0 : 50;

      const newOrderPayload = {
        orderId: `LIL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: session?.userId || userId,
        items: finalItems,
        shippingAddress: finalShipping,
        pricing: {
          subtotal,
          shippingCharge,
          discountAmount: 0,
          grandTotal: finalAmount,
        },
        paymentMethod: 'razorpay',
        paymentStatus: 'Completed',
        paymentDetails: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paidAt: new Date(),
        },
        orderStatus: 'Confirmed',
      };

      if (isDbConnected()) {
        completedOrder = await Order.create(newOrderPayload);

        // Reduce stock
        for (const item of finalItems) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }

        // Clear cart
        await Cart.findOneAndUpdate(
          { userId: newOrderPayload.userId },
          { $set: { items: [], totalQuantity: 0, totalAmount: 0 } }
        );
      } else {
        completedOrder = orderStore.createOrder(newOrderPayload);

        for (const item of finalItems) {
          const prod = await productStore.getProductById(item.productId);
          if (prod) {
            await productStore.updateStock(item.productId, Math.max(0, prod.stock - item.quantity));
          }
        }
        cartStore.clearCart(newOrderPayload.userId);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully and order confirmed.',
      order: completedOrder,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification encountered an internal error',
    });
  }
}

/**
 * 3. Razorpay Webhook Handler
 * POST /api/payment/webhook
 * Headers: x-razorpay-signature
 * Body: Raw JSON webhook payload
 */
export async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing x-razorpay-signature header',
      });
    }

    // Raw body verification
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_CONFIG.webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('[Razorpay Webhook] Invalid webhook signature detected!');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook Received] Event: ${event}`);

    // Prevent duplicate webhook execution
    const eventId = req.headers['x-razorpay-event-id'] || payload?.payment?.entity?.id;
    if (eventId && orderStore.isPaymentProcessed(`webhook_${eventId}`)) {
      return res.status(200).json({ success: true, message: 'Webhook event already processed' });
    }
    if (eventId) {
      orderStore.markPaymentProcessed(`webhook_${eventId}`);
    }

    // Handle payment.captured
    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const rzpOrderId = payment.order_id;
      const paymentId = payment.id;

      // Update matching order in DB or Store
      if (isDbConnected()) {
        const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': rzpOrderId });
        if (order && order.paymentStatus !== 'Completed') {
          order.paymentStatus = 'Completed';
          order.orderStatus = 'Confirmed';
          order.paymentDetails.razorpayPaymentId = paymentId;
          order.paymentDetails.paidAt = new Date();
          await order.save();

          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: -item.quantity },
            });
          }
          await Cart.findOneAndUpdate({ userId: order.userId }, { $set: { items: [], totalQuantity: 0, totalAmount: 0 } });
        }
      } else {
        const allOrders = orderStore.getAllOrders();
        const order = allOrders.find(
          (o) => o.paymentDetails?.razorpayOrderId === rzpOrderId
        );
        if (order && order.paymentStatus !== 'Completed') {
          order.paymentStatus = 'Completed';
          order.orderStatus = 'Confirmed';
          order.paymentDetails.razorpayPaymentId = paymentId;
          order.paymentDetails.paidAt = new Date();
          for (const item of order.items) {
            const prod = await productStore.getProductById(item.productId);
            if (prod) await productStore.updateStock(item.productId, Math.max(0, prod.stock - item.quantity));
          }
          cartStore.clearCart(order.userId);
        }
      }
    } else if (event === 'payment.failed') {
      const payment = payload.payment.entity;
      const rzpOrderId = payment.order_id;

      if (isDbConnected()) {
        const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': rzpOrderId });
        if (order && order.paymentStatus !== 'Completed') {
          order.paymentStatus = 'Failed';
          await order.save();
        }
      } else {
        const allOrders = orderStore.getAllOrders();
        const order = allOrders.find(
          (o) => o.paymentDetails?.razorpayOrderId === rzpOrderId
        );
        if (order && order.paymentStatus !== 'Completed') {
          order.paymentStatus = 'Failed';
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Webhook processed for event: ${event}`,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 4. Payment Failure Notification
 * POST /api/payment/failure
 */
export async function handlePaymentFailure(req, res) {
  try {
    const { razorpay_order_id, error, orderId } = req.body;
    console.warn(`[Payment Gateway Alert] Payment failed for Razorpay Order ${razorpay_order_id}:`, error);

    const targetOrderId = orderId;
    if (targetOrderId) {
      if (isDbConnected()) {
        await Order.findOneAndUpdate(
          { orderId: targetOrderId },
          { $set: { paymentStatus: 'Failed' } }
        );
      } else {
        const ord = orderStore.getOrder(targetOrderId);
        if (ord) ord.paymentStatus = 'Failed';
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment failure recorded. Cart and order state safely preserved.',
      error: error || 'Payment was cancelled or rejected by the issuing bank.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 5. COD Order placement
 * POST /api/payment/cod-order
 */
export async function createCodOrder(req, res) {
  try {
    const { items, customer, shippingAddress, billingAddress, pricing } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot place order with empty items' });
    }

    const orderId = `LIL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      orderId,
      date: new Date().toISOString(),
      customer,
      shippingAddress,
      billingAddress,
      shippingMethod: 'Standard Express Delivery',
      paymentMethod: 'Cash on Delivery (COD)',
      paymentDetails: {
        status: 'PENDING',
      },
      items,
      pricing,
      orderStatus: 'Confirmed',
      paymentStatus: 'Pending',
    };

    orderStore.createOrder(newOrder);

    return res.status(200).json({
      success: true,
      message: 'COD Order placed successfully.',
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 6. Get orders inquiry
 * GET /api/payment/orders
 */
export async function getOrders(req, res) {
  try {
    const { email } = req.query;
    let list = orderStore.getAllOrders();

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      list = list.filter((ord) => {
        const ordEmail = ord.customer?.emailOrPhone?.trim()?.toLowerCase() || ord.shippingAddress?.email?.trim()?.toLowerCase() || '';
        return ordEmail === cleanEmail;
      });
    }

    return res.status(200).json({
      success: true,
      orders: list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 7. Get single order inquiry
 * GET /api/payment/orders/:orderId
 */
export async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;
    const order = orderStore.getOrder(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
