import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  handleWebhook,
  createCodOrder,
  getOrders,
  getOrderById,
} from '../controllers/paymentController.js';

const router = Router();

// Create Razorpay order
router.post('/create-order', createPaymentOrder);

// Verify signature and capture payment
router.post('/verify-payment', verifyPayment);

// Razorpay Webhook Handler
router.post('/webhook', handleWebhook);

// Handle payment failures
router.post('/failure', handlePaymentFailure);

// COD order placement
router.post('/cod-order', createCodOrder);

// Order inquiry endpoints
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrderById);

export default router;
