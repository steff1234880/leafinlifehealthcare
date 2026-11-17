import { User } from '../models/User.js';
import { userStore } from '../models/UserStore.js';
import mongoose from 'mongoose';

/**
 * Seed initial administrative account into MongoDB or memory store.
 * Uses environment variables ADMIN_EMAIL and ADMIN_PASSWORD if provided,
 * otherwise falls back to the configured system administrator account.
 */
export async function seedAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@leafinlifehealthcare.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Password123!';
  const adminName = process.env.ADMIN_NAME || 'Leaf In Life Administrator';
  const adminPhone = process.env.ADMIN_PHONE || '9876543211';

  try {
    // 1. If MongoDB is connected, ensure admin exists in MongoDB
    if (mongoose.connection.readyState === 1) {
      let admin = await User.findOne({ email: adminEmail }).select('+password');

      if (!admin) {
        // Create new admin account with hashed password
        admin = new User({
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          password: adminPassword, // pre('save') hook will hash this securely
          role: 'admin',
          isActive: true,
        });
        await admin.save();
        console.log(`🔐 Admin user initialized in MongoDB: ${adminEmail}`);
      } else {
        // Ensure role is admin and account is active
        let needsSave = false;
        if (admin.role !== 'admin') {
          admin.role = 'admin';
          needsSave = true;
        }
        if (!admin.isActive) {
          admin.isActive = true;
          needsSave = true;
        }
        // If password does not match current configured password, update it
        const matches = await admin.matchPassword(adminPassword);
        if (!matches) {
          admin.password = adminPassword; // pre('save') hook will hash this securely
          needsSave = true;
        }
        if (needsSave) {
          await admin.save();
          console.log(`🔐 Admin user credentials synchronized in MongoDB: ${adminEmail}`);
        }
      }
    }

    // 2. Also ensure memory store has the matching admin
    userStore.seedAdmin({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      phone: adminPhone,
    });
  } catch (err) {
    console.warn(`⚠️ Warning initializing admin account: ${err.message}`);
  }
}
