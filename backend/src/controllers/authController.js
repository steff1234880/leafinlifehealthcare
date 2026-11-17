import crypto from 'crypto';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { userStore } from '../models/UserStore.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

// Helper to determine if real MongoDB Mongoose connection is actively connected
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * 1. User Registration API
 * POST /api/auth/register
 * Body: { name, email, phone, password }
 */
export async function register(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanName = name.trim();

    // If MongoDB is connected, use Mongoose User model
    if (isDbConnected()) {
      const existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, { phone: cleanPhone }],
      });

      if (existingUser) {
        const field = existingUser.email === cleanEmail ? 'email address' : 'mobile number';
        return res.status(409).json({
          success: false,
          message: `An account with this ${field} already exists.`,
        });
      }

      // Password hashing is performed automatically via pre-save hook on the User schema
      const newUser = await User.create({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password, // hashed in pre-save hook
      });

      const token = generateToken({
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
        token,
      });
    }

    // In-memory fallback (when MongoDB service is not running locally)
    const existing = userStore.findByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const existingPhone = userStore.findByPhone(cleanPhone);
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'An account with this mobile number already exists.',
      });
    }

    // Securely hash password using bcrypt utility
    const hashedPassword = await hashPassword(password);

    const newUser = userStore.createUser({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role || 'customer',
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role || 'customer',
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. User Login API
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Mongoose Database Flow
    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.',
        });
      }

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      });
    }

    // In-memory Flow
    const user = userStore.findByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role || 'customer',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'customer',
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. Get Current User API
 * GET /api/auth/me
 * Headers: { Authorization: "Bearer <token>" }
 */
export async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.',
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    // In-memory lookup
    let user = userStore.findById(userId);
    if (!user && userEmail) {
      user = userStore.findByEmail(userEmail);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'customer',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 4. Forgot Password API
 * POST /api/auth/forgot-password
 * Body: { email }
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Standardized generic response to avoid user enumeration
    const genericResponse = {
      success: true,
      message: 'If an account exists with that email, password reset instructions have been sent.',
    };

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(200).json(genericResponse);
      }

      // Generate random reset token and hash it
      const resetToken = crypto.randomBytes(24).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
      await user.save({ validateBeforeSave: false });

      return res.status(200).json(genericResponse);
    }

    // In-memory Flow
    const user = userStore.findByEmail(cleanEmail);
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Generate random 6-digit PIN or hex token and hash using bcrypt
    const resetToken = crypto.randomBytes(16).toString('hex');
    const tokenHash = await hashPassword(resetToken);

    userStore.createPasswordResetRequest(cleanEmail, tokenHash);

    return res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * 5. Logout API
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please remove your authorization token on the client.',
  });
}

/**
 * User Profile Update API
 * PUT /api/auth/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;
    const email = req.user?.email || req.body.email;

    if (!email) {
      return res.status(400).json({ success: false, message: 'User email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name.trim();
      if (phone) user.phone = phone.trim().replace(/\s+/g, '');
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    const updatedUser = userStore.updateProfile(cleanEmail, { name, phone });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role || 'customer',
      },
    });
  } catch (error) {
    next(error);
  }
}
