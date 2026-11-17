import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { userStore } from '../models/UserStore.js';
import { orderStore } from '../models/OrderStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Get all customers with search, pagination, and sorting
 * @route   GET /api/admin/customers
 * @access  Private / Admin
 */
export async function getCustomers(req, res, next) {
  try {
    const { search, sort = 'newest', page = 1, limit = 10, status } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    if (isDbConnected()) {
      const query = { role: 'customer' };

      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'name-asc') sortOptions = { name: 1 };
      else if (sort === 'name-desc') sortOptions = { name: -1 };
      else if (sort === 'oldest') sortOptions = { createdAt: 1 };

      const skip = (pageNum - 1) * limitNum;

      // Sensitive password is excluded via select('-password -resetPasswordToken -resetPasswordExpires')
      const [customers, total] = await Promise.all([
        User.find(query)
          .select('-password -resetPasswordToken -resetPasswordExpires')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum),
        User.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        count: customers.length,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
        customers,
      });
    }

    // In-memory Store Mode
    let list = userStore
      .getAllUsers()
      .filter((u) => u.role === 'customer');

    if (status === 'active') list = list.filter((u) => u.isActive !== false);
    if (status === 'inactive') list = list.filter((u) => u.isActive === false);

    if (search) {
      const s = search.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.phone && u.phone.includes(s))
      );
    }

    if (sort === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = list.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      count: paginated.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
      customers: paginated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    View individual customer details and their order history
 * @route   GET /api/admin/customers/:id
 * @access  Private / Admin
 */
export async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;

    let customer = null;
    let orders = [];

    if (isDbConnected()) {
      if (mongoose.isValidObjectId(id)) {
        customer = await User.findById(id).select(
          '-password -resetPasswordToken -resetPasswordExpires'
        );
      }
      if (!customer) {
        customer = await User.findOne({ email: id.toLowerCase() }).select(
          '-password -resetPasswordToken -resetPasswordExpires'
        );
      }

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: `Customer not found with ID ${id}`,
        });
      }

      orders = await Order.find({
        $or: [{ userId: customer._id }, { 'shippingAddress.email': customer.email }],
      }).sort({ createdAt: -1 });

      const totalSpent = orders
        .filter((o) => o.paymentStatus === 'Completed')
        .reduce((sum, o) => sum + (o.pricing?.grandTotal || 0), 0);

      return res.status(200).json({
        success: true,
        customer,
        orderStats: {
          totalOrders: orders.length,
          totalSpent: Math.round(totalSpent * 100) / 100,
        },
        orders,
      });
    }

    // Memory Store Mode
    const rawUser = userStore.findById(id) || userStore.findByEmail(id);
    if (!rawUser) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with ID ${id}`,
      });
    }

    const { password, ...customerWithoutPassword } = rawUser;

    const allOrders = orderStore.getAllOrders();
    orders = allOrders.filter(
      (o) =>
        String(o.userId) === String(rawUser.id) ||
        o.shippingAddress?.email?.toLowerCase() === rawUser.email.toLowerCase() ||
        o.customer?.email?.toLowerCase() === rawUser.email.toLowerCase()
    );

    const totalSpent = orders
      .filter((o) => o.paymentStatus === 'Completed')
      .reduce((sum, o) => sum + (o.pricing?.grandTotal || 0), 0);

    return res.status(200).json({
      success: true,
      customer: customerWithoutPassword,
      orderStats: {
        totalOrders: orders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
      },
      orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Activate or deactivate customer account
 * @route   PATCH /api/admin/customers/:id/status
 * @access  Private / Admin
 */
export async function updateCustomerStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive boolean field is required',
      });
    }

    const statusBool = Boolean(isActive);

    if (isDbConnected()) {
      let customer = null;
      if (mongoose.isValidObjectId(id)) {
        customer = await User.findById(id);
      }
      if (!customer) {
        customer = await User.findOne({ email: id.toLowerCase() });
      }

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: `Customer not found with ID ${id}`,
        });
      }

      customer.isActive = statusBool;
      await customer.save();

      return res.status(200).json({
        success: true,
        message: `Customer account ${statusBool ? 'activated' : 'deactivated'} successfully`,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          isActive: customer.isActive,
        },
      });
    }

    // Memory Store
    const updated = userStore.setUserStatus(id, statusBool);
    return res.status(200).json({
      success: true,
      message: `Customer account ${statusBool ? 'activated' : 'deactivated'} successfully`,
      customer: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
}

