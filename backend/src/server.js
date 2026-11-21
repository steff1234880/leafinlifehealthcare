import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB, getDbConnectionStatus } from './config/db.js';
import { seedAdminUser } from './config/seedAdmin.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB & Seed Admin
connectDB().then(() => {
  seedAdminUser();
});

// Dynamic CORS configuration supporting Vite dev server, preview, and Cloudflare Tunnels
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or matching origins, including Cloudflare tunnel domains
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.trycloudflare.com')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in development for smooth local testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Retain raw body buffer for Razorpay cryptographic webhook verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images securely via public static route
app.use('/uploads', express.static(path.resolve('uploads')));

/**
 * 8. API Health-Check Endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  const dbStatus = getDbConnectionStatus();

  res.status(200).json({
    status: 'ok',
    service: 'Leaf In Life Healthcare Backend API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: {
      type: 'MongoDB',
      status: dbStatus.state,
      isConnected: dbStatus.isConnected,
      host: dbStatus.host,
      name: dbStatus.name,
    },
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// Mount Core API Route Handlers
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Root Index Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Leaf In Life Healthcare Node.js Express Backend API',
    healthCheck: '/api/health',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'PUT /api/auth/profile',
        forgotPassword: 'POST /api/auth/forgot-password',
      },
      payment: {
        createOrder: 'POST /api/payment/create-order',
        verifyPayment: 'POST /api/payment/verify-payment',
        codOrder: 'POST /api/payment/cod-order',
        orders: 'GET /api/payment/orders',
      },
    },
  });
});

// Centralized 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Leaf In Life Backend Server running on http://127.0.0.1:${PORT}`);
  console.log(`🩺 Health check accessible at: http://127.0.0.1:${PORT}/api/health`);
});

export default app;
