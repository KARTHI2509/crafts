import User from '../models/User.js';
import Craft from '../models/Craft.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Get all users with query filters
 * GET /api/admin/users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

  res.json({
    success: true,
    data: users
  });
});

/**
 * Ban or unban a user
 * PATCH /api/admin/users/:id/ban
 */
export const toggleUserBan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.role === 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot ban administrative users'
    });
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res.json({
    success: true,
    message: `User has been successfully ${user.isBanned ? 'banned' : 'unbanned'}.`,
    data: user
  });
});

/**
 * Moderate a craft (Approve/Reject)
 * PATCH /api/admin/crafts/:id/status
 */
export const moderateCraft = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be approved, rejected, or pending.'
    });
  }

  const craft = await Craft.findById(req.params.id);

  if (!craft) {
    return res.status(404).json({
      success: false,
      message: 'Craft not found'
    });
  }

  // Update craft status
  craft.status = status;
  // If your craft schema uses approved as boolean:
  craft.approved = (status === 'approved');
  
  await craft.save();

  res.json({
    success: true,
    message: `Craft status successfully updated to ${status}.`,
    data: craft
  });
});

/**
 * Get all orders
 * GET /api/admin/orders
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('buyer_id', 'name email')
    .populate('items.craft_id', 'name price')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders
  });
});

/**
 * Refund an order
 * PATCH /api/admin/orders/:id/refund
 */
export const refundOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.status === 'refunded') {
    return res.status(400).json({
      success: false,
      message: 'Order is already refunded'
    });
  }

  order.status = 'refunded';
  order.refund_amount = order.total_amount;
  await order.save();

  res.json({
    success: true,
    message: 'Order has been successfully refunded.',
    data: order
  });
});

/**
 * Fetch security/fraud warning records
 * GET /api/admin/security-warnings
 */
export const getSecurityWarnings = asyncHandler(async (req, res) => {
  // Fraud detection rules:
  // 1. High value orders (Order value > ₹20,000)
  const highValueOrders = await Order.find({ total_amount: { $gt: 20000 } })
    .populate('buyer_id', 'name email')
    .sort({ total_amount: -1 });

  // 2. Currently locked out users
  const lockedUsers = await User.find({ lockUntil: { $gt: new Date() } })
    .select('name email failedLoginAttempts lockUntil');

  res.json({
    success: true,
    data: {
      highValueOrders: highValueOrders.map(o => ({
        id: o._id,
        buyer: o.buyer_id?.name || 'Unknown',
        email: o.buyer_id?.email || 'N/A',
        amount: o.total_amount,
        createdAt: o.createdAt,
        type: 'High Value Transaction Warning (> ₹20,000)'
      })),
      lockedUsers: lockedUsers.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        attempts: u.failedLoginAttempts,
        lockedUntil: u.lockUntil,
        type: 'Brute Force Attempt Lockout'
      }))
    }
  });
});
