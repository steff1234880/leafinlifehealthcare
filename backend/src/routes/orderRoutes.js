import express from 'express';
import {
  getCheckoutSummary,
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All order routes require authenticated user
router.use(requireAuth);

// Checkout & User Order Routes
router.post('/checkout-summary', getCheckoutSummary);
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/cancel', cancelOrder);

// Admin Order Management Routes
router.get('/admin/all', requireAdmin, getAllOrdersAdmin);
router.patch('/admin/:orderId/status', requireAdmin, updateOrderStatusAdmin);

export default router;

