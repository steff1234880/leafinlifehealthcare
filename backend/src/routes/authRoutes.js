import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  logout,
  updateProfile,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequestBody, validationRules } from '../middleware/validator.js';

const router = Router();

// 1. User Registration with request validation
router.post(
  '/register',
  validateRequestBody({
    name: validationRules.required('Full Name'),
    email: validationRules.email(),
    phone: validationRules.phone(),
    password: validationRules.passwordMinLength(6),
  }),
  register
);

// 2. User Login with request validation
router.post(
  '/login',
  validateRequestBody({
    email: validationRules.email(),
    password: validationRules.required('Password'),
  }),
  login
);

// 3. Get Current Authenticated User (Protected via JWT middleware)
router.get('/me', requireAuth, getCurrentUser);

// 4. Forgot Password Flow
router.post(
  '/forgot-password',
  validateRequestBody({
    email: validationRules.email(),
  }),
  forgotPassword
);

// 5. Logout
router.post('/logout', logout);

// Profile Update (Supports protected session or explicit payload)
router.put('/profile', updateProfile);

export default router;
