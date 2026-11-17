import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All shopping cart routes require authenticated user JWT
router.use(requireAuth);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;

