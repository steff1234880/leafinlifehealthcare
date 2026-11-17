import express from 'express';
import {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
} from '../controllers/customerController.js';
import {
  getDashboardStats,
  getSalesReport,
} from '../controllers/dashboardController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Guard all admin routes with JWT authentication and admin role verification
router.use(requireAuth, requireAdmin);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/sales-report', getSalesReport);

// Customer management routes
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.patch('/customers/:id/status', updateCustomerStatus);

export default router;

