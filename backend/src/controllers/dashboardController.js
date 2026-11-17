import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { orderStore } from '../models/OrderStore.js';
import { productStore } from '../models/ProductStore.js';
import { userStore } from '../models/UserStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Get Admin Dashboard key statistics, low-stock alerts, recent orders & best sellers
 * @route   GET /api/admin/dashboard/stats
 * @access  Private / Admin
 */
export async function getDashboardStats(req, res, next) {
  try {
    if (isDbConnected()) {
      const [
        totalCustomers,
        totalProducts,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        lowStockProducts,
        recentOrders,
        salesAggregation,
        bestSellersAggregation,
      ] = await Promise.all([
        User.countDocuments({ role: 'customer' }),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: 'Pending' }),
        Order.countDocuments({ orderStatus: 'Delivered' }),
        Product.find({ stock: { $lte: 10 } })
          .select('name sku stock price images')
          .limit(10),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('orderId pricing orderStatus paymentStatus paymentMethod createdAt shippingAddress'),
        Order.aggregate([
          { $match: { paymentStatus: 'Completed' } },
          { $group: { _id: null, totalRevenue: { $sum: '$pricing.grandTotal' } } },
        ]),
        Order.aggregate([
          { $match: { paymentStatus: 'Completed' } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.productId',
              name: { $first: '$items.name' },
              totalSold: { $sum: '$items.quantity' },
              revenue: { $sum: '$items.subtotal' },
            },
          },
          { $sort: { totalSold: -1 } },
          { $limit: 5 },
        ]),
      ]);

      const totalRevenue = salesAggregation[0]?.totalRevenue || 0;

      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          totalCustomers,
          totalProducts,
          pendingOrders,
          deliveredOrders,
        },
        lowStockProducts,
        recentOrders,
        bestSellers: bestSellersAggregation,
      });
    }

    // In-memory Store Mode
    const allUsers = userStore.getAllUsers();
    const totalCustomers = allUsers.filter((u) => u.role === 'customer').length;

    const allProducts = (await productStore.getProducts({ limit: 1000 })).products;
    const totalProducts = allProducts.length;
    const lowStockProducts = allProducts
      .filter((p) => p.stock <= 10)
      .slice(0, 10);

    const allOrders = orderStore.getAllOrders();
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.orderStatus === 'Pending').length;
    const deliveredOrders = allOrders.filter((o) => o.orderStatus === 'Delivered').length;

    const verifiedOrders = allOrders.filter((o) => o.paymentStatus === 'Completed');
    const totalRevenue = verifiedOrders.reduce(
      (sum, o) => sum + (o.pricing?.grandTotal || 0),
      0
    );

    const recentOrders = allOrders.slice(0, 5);

    // Compute best-selling products from verified orders
    const salesMap = new Map();
    for (const order of verifiedOrders) {
      for (const item of order.items || []) {
        const prodId = String(item.productId);
        const existing = salesMap.get(prodId) || {
          _id: prodId,
          name: item.name,
          totalSold: 0,
          revenue: 0,
        };
        existing.totalSold += item.quantity || 1;
        existing.revenue += item.subtotal || item.price * (item.quantity || 1);
        salesMap.set(prodId, existing);
      }
    }
    const bestSellers = Array.from(salesMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        deliveredOrders,
      },
      lowStockProducts,
      recentOrders,
      bestSellers,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get Sales Reports (Daily, Weekly, Monthly, or Date-Range Filtered)
 * @route   GET /api/admin/dashboard/sales-report
 * @access  Private / Admin
 */
export async function getSalesReport(req, res, next) {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    const now = new Date();
    let start = null;
    let end = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'daily') {
      start = new Date();
      start.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      start = new Date();
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else {
      // monthly (last 30 days)
      start = new Date();
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    }

    if (isDbConnected()) {
      const matchCriteria = {
        paymentStatus: 'Completed',
        createdAt: { $gte: start, $lte: end },
      };

      const [summary, timeline] = await Promise.all([
        Order.aggregate([
          { $match: matchCriteria },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$pricing.grandTotal' },
              totalOrders: { $sum: 1 },
              totalItemsSold: { $sum: { $sum: '$items.quantity' } },
            },
          },
        ]),
        Order.aggregate([
          { $match: matchCriteria },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$pricing.grandTotal' },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      return res.status(200).json({
        success: true,
        period,
        dateRange: { start: start.toISOString(), end: end.toISOString() },
        summary: {
          totalRevenue: Math.round((summary[0]?.totalRevenue || 0) * 100) / 100,
          totalOrders: summary[0]?.totalOrders || 0,
          totalItemsSold: summary[0]?.totalItemsSold || 0,
        },
        timeline,
      });
    }

    // In-memory Store Mode
    const allOrders = orderStore.getAllOrders();
    const filteredOrders = allOrders.filter((o) => {
      if (o.paymentStatus !== 'Completed') return false;
      const orderDate = new Date(o.createdAt);
      return orderDate >= start && orderDate <= end;
    });

    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + (o.pricing?.grandTotal || 0),
      0
    );
    const totalItemsSold = filteredOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, it) => iSum + (it.quantity || 1), 0),
      0
    );

    // Group by Day (YYYY-MM-DD)
    const timelineMap = new Map();
    for (const ord of filteredOrders) {
      const dateStr = new Date(ord.createdAt).toISOString().split('T')[0];
      const existing = timelineMap.get(dateStr) || { _id: dateStr, revenue: 0, orderCount: 0 };
      existing.revenue += ord.pricing?.grandTotal || 0;
      existing.orderCount += 1;
      timelineMap.set(dateStr, existing);
    }

    const timeline = Array.from(timelineMap.values()).sort((a, b) => a._id.localeCompare(b._id));

    return res.status(200).json({
      success: true,
      period,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders: filteredOrders.length,
        totalItemsSold,
      },
      timeline,
    });
  } catch (error) {
    next(error);
  }
}

