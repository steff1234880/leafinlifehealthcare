import express from 'express';
import {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  uploadImages,
  deleteImage,
  updateProduct,
  deleteProduct,
  updateStock,
  updateProductStatus,
} from '../controllers/productController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadProductImage } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Admin-only Image Upload & Management endpoints
router.post(
  '/upload-images',
  requireAuth,
  requireAdmin,
  uploadProductImage.array('images', 10),
  uploadImages
);
router.delete('/images/:filename', requireAuth, requireAdmin, deleteImage);

// Admin-only Product CRUD & Stock/Status Management
router.post(
  '/',
  requireAuth,
  requireAdmin,
  uploadProductImage.array('images', 10),
  createProduct
);
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  uploadProductImage.array('images', 10),
  updateProduct
);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);
router.patch('/:id/stock', requireAuth, requireAdmin, updateStock);
router.patch('/:id/status', requireAuth, requireAdmin, updateProductStatus);

export default router;
