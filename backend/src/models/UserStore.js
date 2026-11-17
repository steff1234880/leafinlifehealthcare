import bcrypt from 'bcryptjs';

// In-memory User and Auth Store with duplicate email/phone check and password hashing
// Seamlessly operates when MongoDB daemon is active or when offline memory mode is used.

class UserStore {
  constructor() {
    this.users = new Map(); // email -> user object
    this.resetTokens = new Map(); // email -> { tokenHash, expiresAt }

    // Seed default demo user with bcrypt hashed password: "Password123!"
    // Generated via bcrypt.hashSync('Password123!', 10)
    const demoHashedPassword =
      '$2b$10$gb22NtDXTN9rV78HAx/ke.P7PZORsUh/184T4enLixsR0wz5iTroe';

    this.users.set('demo@leafinlifehealthcare.com', {
      id: 'usr_demo_1',
      name: 'Leaf In Life Customer',
      email: 'demo@leafinlifehealthcare.com',
      phone: '9876543210',
      password: demoHashedPassword,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    // Seed default admin user with bcrypt hashed password: "Password123!"
    this.users.set('admin@leafinlifehealthcare.com', {
      id: 'usr_admin_1',
      name: 'Leaf In Life Administrator',
      email: 'admin@leafinlifehealthcare.com',
      phone: '9876543211',
      password: demoHashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  }

  findByEmail(email) {
    if (!email) return null;
    return this.users.get(email.trim().toLowerCase()) || null;
  }

  findById(id) {
    if (!id) return null;
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  findByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.trim();
    for (const user of this.users.values()) {
      if (user.phone === cleanPhone) return user;
    }
    return null;
  }

  createUser(userData) {
    const emailKey = userData.email.trim().toLowerCase();
    if (this.users.has(emailKey)) {
      throw new Error('An account with this email address already exists.');
    }
    if (this.findByPhone(userData.phone)) {
      throw new Error('An account with this mobile number already exists.');
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: userData.name.trim(),
      email: emailKey,
      phone: userData.phone.trim(),
      password: userData.password, // already hashed by password utility
      role: userData.role || 'customer',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.users.set(emailKey, newUser);
    return newUser;
  }

  updateProfile(email, { name, phone }) {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.users.get(cleanEmail);
    if (!existing) {
      throw new Error('User not found.');
    }

    if (phone && phone.trim() !== existing.phone) {
      const phoneUser = this.findByPhone(phone.trim());
      if (phoneUser && phoneUser.email !== cleanEmail) {
        throw new Error('This phone number is already registered with another account.');
      }
      existing.phone = phone.trim();
    }

    if (name && name.trim()) {
      existing.name = name.trim();
    }

    this.users.set(cleanEmail, existing);
    return existing;
  }

  updatePassword(email, newHashedPassword) {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.users.get(cleanEmail);
    if (!existing) {
      throw new Error('User not found.');
    }
    existing.password = newHashedPassword;
    this.users.set(cleanEmail, existing);
    this.resetTokens.delete(cleanEmail);
    return true;
  }

  createPasswordResetRequest(email, tokenHash) {
    const cleanEmail = email.trim().toLowerCase();
    this.resetTokens.set(cleanEmail, {
      tokenHash,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins expiry
    });
  }

  verifyPasswordResetToken(email, token) {
    const cleanEmail = email.trim().toLowerCase();
    const record = this.resetTokens.get(cleanEmail);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      this.resetTokens.delete(cleanEmail);
      return false;
    }
    return bcrypt.compareSync(token, record.tokenHash);
  }

  getAllUsers() {
    return Array.from(this.users.values()).map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }

  setUserStatus(idOrEmail, isActive) {
    let user = this.findByEmail(idOrEmail) || this.findById(idOrEmail);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    user.isActive = Boolean(isActive);
    this.users.set(user.email, user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const userStore = new UserStore();
