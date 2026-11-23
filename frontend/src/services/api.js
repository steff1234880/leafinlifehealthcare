// Centralized API Service for Leaf In Life Healthcare Backend (Node.js + Express + MongoDB)
// Powered by apiClient (axios with JWT bearer tokens & environment base URL)

import apiClient from './apiClient';
import { getProductImageUrl } from '../utils/imageUtils';
import {
  initialProducts,
  initialTestimonials,
  initialBlogs,
  initialVideoReels,
  heroData,
  bentoData,
  specificationData,
  richTextData,
  slidingRibbon1Data,
  slidingRibbon2Data,
} from '../data/homeData';

/**
 * 1. Product & Category Services
 */
export const productService = {
  // Get featured products for homepage
  getFeaturedProducts: async () => {
    try {
      const { data } = await apiClient.get('/products?limit=6');
      if (data && data.products && data.products.length > 0) {
        return data.products.map((p) => {
          const rawPrimary = (p.images && p.images[0]) || p.primaryImage || '/assets/images/prod-p2.jpg';
          const rawSecondary = (p.images && p.images[1]) || (p.images && p.images[0]) || '/assets/images/prod-pp2.jpg';
          const sellingPrice = p.price;
          const comparePrice = p.comparePrice !== undefined && p.comparePrice !== null
            ? p.comparePrice
            : (p.discountPrice && p.discountPrice < p.price ? p.price : undefined);

          return {
            ...p,
            _id: p._id || p.id,
            title: p.name || p.title,
            price: sellingPrice,
            comparePrice: comparePrice,
            formattedPrice: `Rs. ${Number(sellingPrice).toFixed(2)}`,
            formattedComparePrice: comparePrice ? `Rs. ${Number(comparePrice).toFixed(2)}` : undefined,
            primaryImage: getProductImageUrl(rawPrimary),
            secondaryImage: getProductImageUrl(rawSecondary),
            inStock: p.stock !== undefined ? Number(p.stock) > 0 : true,
          };
        });
      }
      return initialProducts;
    } catch {
      return initialProducts;
    }
  },

  // Get all public products with filters, sorting, and pagination
  getProducts: async (params = {}) => {
    const { category, search, sort, page, limit } = params;
    const query = new URLSearchParams();
    if (category && category !== 'all') query.set('category', category);
    if (search) query.set('search', search);
    if (sort) query.set('sort', sort);
    if (page) query.set('page', page);
    if (limit) query.set('limit', limit);

    const { data } = await apiClient.get(`/products?${query.toString()}`);
    return data;
  },

  // Search products by name, description, or SKU
  searchProducts: async (q) => {
    const { data } = await apiClient.get(`/products/search?q=${encodeURIComponent(q)}`);
    return data;
  },

  // Get single product by ID or Slug
  getProductById: async (idOrSlug) => {
    const { data } = await apiClient.get(`/products/${idOrSlug}`);
    return data.product || data;
  },

  getProductBySlug: async (slug) => {
    const { data } = await apiClient.get(`/products/${slug}`);
    return data.product || data;
  },

  // Get all categories
  getCategories: async () => {
    const { data } = await apiClient.get('/categories');
    return data.categories || data;
  },

  // Get single category by ID or Slug
  getCategoryById: async (idOrSlug) => {
    const { data } = await apiClient.get(`/categories/${idOrSlug}`);
    return data.category || data;
  },
};

/**
 * 2. Static Home Content & Newsletter Service
 */
export const contentService = {
  getHomeContent: async () => {
    return {
      hero: heroData,
      ribbon1: slidingRibbon1Data,
      bento: bentoData,
      testimonials: initialTestimonials,
      ribbon2: slidingRibbon2Data,
      specification: specificationData,
      richText: richTextData,
      videoReels: initialVideoReels,
      blogs: initialBlogs,
    };
  },

  subscribeNewsletter: async (email) => {
    return { success: true, message: 'Thank you for subscribing to Leaf In Life updates!' };
  },
};

/**
 * 3. Shopping Cart Services (Authenticated)
 */
export const cartService = {
  // Get current user's cart from backend
  getCart: async () => {
    const { data } = await apiClient.get('/cart');
    return data.cart || data;
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    const { data } = await apiClient.post('/cart', { productId, quantity });
    return data.cart || data;
  },

  // Update item quantity
  updateItemQuantity: async (productId, quantity) => {
    const { data } = await apiClient.put(`/cart/${productId}`, { quantity });
    return data.cart || data;
  },

  // Remove item from cart
  removeItem: async (productId) => {
    const { data } = await apiClient.delete(`/cart/${productId}`);
    return data.cart || data;
  },

  // Clear entire cart
  clearCart: async () => {
    const { data } = await apiClient.delete('/cart');
    return data.cart || data;
  },

  validateDiscount: async (code, subtotal) => {
    const upper = (code || '').trim().toUpperCase();
    if (upper === 'LEAF10' || upper === 'AYURVEDA10') {
      const discountAmount = Math.round(subtotal * 0.1 * 100) / 100;
      return {
        valid: true,
        code: upper,
        discountType: 'percentage',
        discountPercent: 10,
        discountAmount,
        message: '10% discount applied successfully!',
      };
    }
    return { valid: false, message: 'Invalid or expired coupon code' };
  },
};

/**
 * 3.5. Wishlist Services (Authenticated)
 */
export const wishlistService = {
  // Get current user's wishlist from backend
  getWishlist: async () => {
    const { data } = await apiClient.get('/wishlist');
    return data.wishlist || data;
  },

  // Add item to wishlist
  addToWishlist: async (productId, product) => {
    const { data } = await apiClient.post('/wishlist', { productId, product });
    return data.wishlist || data;
  },

  // Remove item from wishlist
  removeFromWishlist: async (productId) => {
    const { data } = await apiClient.delete(`/wishlist/${productId}`);
    return data.wishlist || data;
  },
};

/**
 * 4. Checkout & Order Services (Authenticated)
 */
export const orderService = {
  // Fetch verified checkout pricing summary calculated by server
  getCheckoutSummary: async () => {
    const { data } = await apiClient.post('/orders/checkout-summary');
    return data.checkout || data;
  },

  // Create an order (COD or Online)
  createOrder: async ({ shippingAddress, paymentMethod = 'online', customItems }) => {
    const { data } = await apiClient.post('/orders', {
      shippingAddress,
      paymentMethod,
      customItems,
    });
    return data;
  },

  // Get logged-in user's orders
  getUserOrders: async () => {
    const { data } = await apiClient.get('/orders');
    return data.orders || [];
  },

  // Get single order details
  getOrderById: async (orderId) => {
    const { data } = await apiClient.get(`/orders/${orderId}`);
    return data.order || data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const { data } = await apiClient.patch(`/orders/${orderId}/cancel`, { reason });
    return data.order || data;
  },
};

/**
 * 5. Razorpay Payment Gateway Services
 */
export const paymentService = {
  // Create Razorpay payment order
  createPaymentOrder: async (payload) => {
    const { data } = await apiClient.post('/payment/create-order', payload);
    return data;
  },

  // Verify Razorpay payment signature
  verifyPayment: async (paymentPayload) => {
    const { data } = await apiClient.post('/payment/verify-payment', paymentPayload);
    return data;
  },

  // Notify backend of payment cancellation/failure
  notifyFailure: async (failureData) => {
    const { data } = await apiClient.post('/payment/failure', failureData);
    return data;
  },

  reportFailure: async (failureData) => {
    const { data } = await apiClient.post('/payment/failure', failureData);
    return data;
  },
};

/**
 * 6. Admin Panel Management Services
 */
export const adminService = {
  // Dashboard metrics
  getDashboardStats: async () => {
    const { data } = await apiClient.get('/admin/dashboard/stats');
    return data;
  },

  // Sales reports
  getSalesReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const { data } = await apiClient.get(`/admin/dashboard/sales-report?${query}`);
    return data;
  },

  // Customer Management
  getCustomers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const { data } = await apiClient.get(`/admin/customers?${query}`);
    return data;
  },

  getCustomerById: async (id) => {
    const { data } = await apiClient.get(`/admin/customers/${id}`);
    return data;
  },

  updateCustomerStatus: async (id, isActive) => {
    const { data } = await apiClient.patch(`/admin/customers/${id}/status`, { isActive });
    return data;
  },

  // Product Management (Admin)
  getAdminProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const { data } = await apiClient.get(`/products?${query}`);
    return data;
  },

  createProduct: async (productData) => {
    const { data } = await apiClient.post('/products', productData);
    return data.product || data;
  },

  updateProduct: async (id, productData) => {
    const { data } = await apiClient.put(`/products/${id}`, productData);
    return data.product || data;
  },

  deleteProduct: async (id) => {
    const { data } = await apiClient.delete(`/products/${id}`);
    return data;
  },

  updateStock: async (id, stock) => {
    const { data } = await apiClient.patch(`/products/${id}/stock`, { stock });
    return data;
  },

  updateProductStatus: async (id, status) => {
    const { data } = await apiClient.patch(`/products/${id}/status`, { status });
    return data;
  },

  // Category Management (Admin)
  createCategory: async (categoryData) => {
    const { data } = await apiClient.post('/categories', categoryData);
    return data.category || data;
  },

  updateCategory: async (id, categoryData) => {
    const { data } = await apiClient.put(`/categories/${id}`, categoryData);
    return data.category || data;
  },

  deleteCategory: async (id) => {
    const { data } = await apiClient.delete(`/categories/${id}`);
    return data;
  },

  // Order Management (Admin)
  getAllOrders: async () => {
    const { data } = await apiClient.get('/orders/admin/all');
    return data.orders || [];
  },

  updateOrderStatus: async (orderId, status, reason = '') => {
    const { data } = await apiClient.patch(`/orders/admin/${orderId}/status`, {
      status,
      reason,
    });
    return data.order || data;
  },

  // Image Upload
  uploadImages: async (formData) => {
    const { data } = await apiClient.post('/products/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteImage: async (filename) => {
    const { data } = await apiClient.delete(`/products/images/${filename}`);
    return data;
  },
};
