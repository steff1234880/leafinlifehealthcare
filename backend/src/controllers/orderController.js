import crypto from 'crypto';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { orderStore } from '../models/OrderStore.js';
import { productStore } from '../models/ProductStore.js';
import { cartStore } from '../models/CartStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Helper to fetch product details from DB or store
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
 * Calculate pricing strictly from trusted product catalog
 * Free shipping on orders over ₹499, otherwise standard ₹50 shipping charge
 */
function calculateOrderPricing(validatedItems) {
  const subtotal = Math.round(
    validatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0) * 100
  ) / 100;

  const shippingCharge = subtotal >= 499 ? 0 : 50;
  const discountAmount = 0; // Configurable coupon/promotional discount
  const grandTotal = Math.round((subtotal + shippingCharge - discountAmount) * 100) / 100;

  return {
    subtotal,
    shippingCharge,
    discountAmount,
    grandTotal,
  };
}

/**
 * @desc    Validate checkout requirements and return calculated pricing summary
 * @route   POST /api/orders/checkout-summary
 * @access  Private
 */
export async function getCheckoutSummary(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch user's cart
    let items = [];
    if (isDbConnected()) {
      const cart = await Cart.findOne({ userId });
      if (cart && cart.items) items = cart.items;
    } else {
      const cart = cartStore.getCart(userId);
      if (cart && cart.items) items = cart.items;
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your shopping cart is empty. Add products before proceeding to checkout.',
      });
    }

    // Validate every item against current stock & price
    const validatedItems = [];
    for (const item of items) {
      const product = await fetchProduct(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name}" no longer exists in catalog`,
        });
      }
      if (product.status && product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is currently unavailable`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units of "${product.name}" are in stock, but ${item.quantity} are in your cart`,
        });
      }

      const unitPrice = product.discountPrice ? product.discountPrice : product.price;
      validatedItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku || '',
        image: item.image || (product.images && product.images[0]) || '',
        price: unitPrice,
        quantity: item.quantity,
        subtotal: Math.round(unitPrice * item.quantity * 100) / 100,
      });
    }

    const pricing = calculateOrderPricing(validatedItems);

    return res.status(200).json({
      success: true,
      checkout: {
        items: validatedItems,
        pricing,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create new order (supports COD directly or creates Pending order for Online Payment)
 * @route   POST /api/orders
 * @access  Private
 */
export async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod = 'online', customItems } = req.body;

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required to place an order',
      });
    }

    const requiredFields = ['firstName', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!shippingAddress[field] || !String(shippingAddress[field]).trim()) {
        return res.status(400).json({
          success: false,
          message: `Shipping address field "${field}" is required`,
        });
      }
    }

    // Determine cart items (either from active user cart or custom checkout items list)
    let cartItems = [];
    if (customItems && Array.isArray(customItems) && customItems.length > 0) {
      cartItems = customItems;
    } else if (isDbConnected()) {
      const cart = await Cart.findOne({ userId });
      if (cart && cart.items) cartItems = cart.items;
    } else {
      const cart = cartStore.getCart(userId);
      if (cart && cart.items) cartItems = cart.items;
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place order with an empty cart',
      });
    }

    // Verify stock, availability, and calculate prices strictly from database
    const validatedItems = [];
    for (const item of cartItems) {
      const product = await fetchProduct(item.productId || item._id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name || item.productId}" is not available`,
        });
      }

      if (product.status && product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is currently inactive`,
        });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product "${product.name}"`,
        });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${qty}`,
        });
      }

      const unitPrice = product.discountPrice ? product.discountPrice : product.price;
      validatedItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku || '',
        image: item.image || (product.images && product.images[0]) || '',
        price: unitPrice,
        quantity: qty,
        subtotal: Math.round(unitPrice * qty * 100) / 100,
        productRef: product,
      });
    }

    const pricing = calculateOrderPricing(validatedItems);

    // Generate unique Order ID
    const uniqueOrderId = `LIL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const normalizedPaymentMethod = paymentMethod.toLowerCase() === 'cod' ? 'cod' : 'online';
    const isCod = normalizedPaymentMethod === 'cod';

    const orderPayload = {
      orderId: uniqueOrderId,
      userId,
      items: validatedItems.map(({ productRef, ...rest }) => rest),
      shippingAddress: {
        firstName: shippingAddress.firstName.trim(),
        lastName: (shippingAddress.lastName || '').trim(),
        email: (shippingAddress.email || req.user.email || '').trim().toLowerCase(),
        phone: shippingAddress.phone.trim(),
        address: shippingAddress.address.trim(),
        apartment: (shippingAddress.apartment || '').trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
        country: shippingAddress.country || 'India',
      },
      pricing,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: isCod ? 'Pending' : 'Pending', // Pending until COD delivery or online gateway verification
      orderStatus: isCod ? 'Confirmed' : 'Pending', // COD orders are immediately Confirmed, Online requires payment
    };

    if (isDbConnected()) {
      // Create Mongoose Order
      const newOrder = await Order.create(orderPayload);

      // If COD order, reduce stock immediately and clear user cart
      if (isCod) {
        for (const item of validatedItems) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }
        await Cart.findOneAndUpdate({ userId }, { $set: { items: [], totalQuantity: 0, totalAmount: 0 } });
      }

      return res.status(201).json({
        success: true,
        message: isCod ? 'Order placed successfully (Cash on Delivery)' : 'Order initiated. Awaiting payment.',
        order: newOrder,
      });
    }

    // Memory store mode
    const createdOrder = orderStore.createOrder(orderPayload);

    // If COD, adjust stock in productStore and clear user cart
    if (isCod) {
      for (const item of validatedItems) {
        const currentProd = await productStore.getProductById(item.productId);
        if (currentProd) {
          await productStore.updateStock(item.productId, Math.max(0, currentProd.stock - item.quantity));
        }
      }
      cartStore.clearCart(userId);
    }

    return res.status(201).json({
      success: true,
      message: isCod ? 'Order placed successfully (Cash on Delivery)' : 'Order initiated. Awaiting payment.',
      order: createdOrder,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/orders
 * @access  Private
 */
export async function getUserOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const userEmail = (req.user.email || '').trim().toLowerCase();

    if (isDbConnected()) {
      const query = {
        $or: [
          { userId },
          ...(userEmail ? [{ 'shippingAddress.email': userEmail }] : []),
        ],
      };
      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    }

    const orders = orderStore.getUserOrders(userId, userEmail);
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get order details by orderId (restricted to owner or admin)
 * @route   GET /api/orders/:orderId
 * @access  Private
 */
export async function getOrderById(req, res, next) {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let order = null;
    if (isDbConnected()) {
      if (mongoose.isValidObjectId(orderId)) {
        order = await Order.findById(orderId);
      }
      if (!order) {
        order = await Order.findOne({ orderId });
      }
    } else {
      order = orderStore.getOrder(orderId);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with ID ${orderId}`,
      });
    }

    // Ensure user is authorized to view this order
    const userEmail = (req.user.email || '').trim().toLowerCase();
    const orderEmail = (order.shippingAddress?.email || order.customer?.emailOrPhone || '').trim().toLowerCase();
    const isOwner = String(order.userId) === String(userId) || (userEmail && orderEmail === userEmail);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this order',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Cancel an eligible order
 * @route   PATCH /api/orders/:orderId/cancel
 * @access  Private
 */
export async function cancelOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let order = null;
    if (isDbConnected()) {
      if (mongoose.isValidObjectId(orderId)) {
        order = await Order.findById(orderId);
      }
      if (!order) {
        order = await Order.findOne({ orderId });
      }
    } else {
      order = orderStore.getOrder(orderId);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with ID ${orderId}`,
      });
    }

    // Ensure user is authorized
    const userEmail = (req.user.email || '').trim().toLowerCase();
    const orderEmail = (order.shippingAddress?.email || order.customer?.emailOrPhone || '').trim().toLowerCase();
    const isOwner = String(order.userId) === String(userId) || (userEmail && orderEmail === userEmail);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to cancel this order',
      });
    }

    // Only allow cancellation if order status is 'Pending' or 'Confirmed'
    const nonCancellable = ['Shipped', 'Delivered', 'Cancelled'];
    if (nonCancellable.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus}`,
      });
    }

    if (isDbConnected()) {
      order.orderStatus = 'Cancelled';
      order.cancellationReason = reason;
      order.cancelledAt = new Date();
      await order.save();

      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        order,
      });
    }

    // Memory Store Mode
    const updated = orderStore.updateOrderStatus(order.orderId, 'Cancelled', reason);

    // Restore stock
    for (const item of order.items) {
      const prod = await productStore.getProductById(item.productId);
      if (prod) {
        await productStore.updateStock(item.productId, prod.stock + item.quantity);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Admin: View all orders across all customers
 * @route   GET /api/orders/admin/all
 * @access  Private / Admin
 */
export async function getAllOrdersAdmin(req, res, next) {
  try {
    if (isDbConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    }

    const orders = orderStore.getAllOrders();
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Admin: Update order status (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
 * @route   PATCH /api/orders/admin/:orderId/status
 * @access  Private / Admin
 */
export async function updateOrderStatusAdmin(req, res, next) {
  try {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    if (isDbConnected()) {
      let order = null;
      if (mongoose.isValidObjectId(orderId)) {
        order = await Order.findById(orderId);
      }
      if (!order) {
        order = await Order.findOne({ orderId });
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          message: `Order not found with ID ${orderId}`,
        });
      }

      const previousStatus = order.orderStatus;
      order.orderStatus = status;
      if (status === 'Cancelled') {
        order.cancelledAt = new Date();
        if (reason) order.cancellationReason = reason;

        // Restore stock if it was not already cancelled
        if (previousStatus !== 'Cancelled') {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: item.quantity },
            });
          }
        }
      }

      await order.save();

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        order,
      });
    }

    // Memory Store
    const order = orderStore.getOrder(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with ID ${orderId}`,
      });
    }

    const previousStatus = order.orderStatus;
    const updated = orderStore.updateOrderStatus(orderId, status, reason);

    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        const prod = await productStore.getProductById(item.productId);
        if (prod) {
          await productStore.updateStock(item.productId, prod.stock + item.quantity);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updated,
    });
  } catch (error) {
    next(error);
  }
}

