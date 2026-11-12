/**
 * ============================================
 * ORDER MODEL - MongoDB/Mongoose
 * ============================================
 * Handles order management operations
 */

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  craft_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Craft',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price_at_purchase: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    required: true,
    unique: true
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artisan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total_amount: {
    type: Number,
    required: true
  },
  shipping_address: {
    type: String,
    required: true
  },
  buyer_phone: {
    type: String,
    required: true
  },
  payment_method: {
    type: String,
    enum: ['COD', 'UPI', 'card', 'netbanking'],
    default: 'COD'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'placed'
  },
  notes: String,
  tracking_number: String,
  tracking_url: String,
  estimated_delivery: Date,
  rejection_reason: String,
  cancelled_at: Date,
  delivered_at: Date
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

orderSchema.index({ buyer_id: 1 });
orderSchema.index({ artisan_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ created_at: -1 });

const Order = mongoose.model('Order', orderSchema);

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Format order for response
 */
const formatOrder = (order) => {
  if (!order) return null;
  return {
    id: order._id.toString(),
    order_number: order.order_number,
    buyer_id: order.buyer_id?._id?.toString() || order.buyer_id?.toString(),
    artisan_id: order.artisan_id?._id?.toString() || order.artisan_id?.toString(),
    buyer_name: order.buyer_id?.name,
    buyer_email: order.buyer_id?.email,
    artisan_name: order.artisan_id?.name,
    artisan_email: order.artisan_id?.email,
    items: order.items?.map(item => ({
      craft_id: item.craft_id?._id?.toString() || item.craft_id?.toString(),
      craft_name: item.craft_id?.name,
      image_url: item.craft_id?.image_url,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
      subtotal: item.subtotal
    })),
    total_amount: order.total_amount,
    shipping_address: order.shipping_address,
    buyer_phone: order.buyer_phone,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    status: order.status,
    notes: order.notes,
    tracking_number: order.tracking_number,
    tracking_url: order.tracking_url,
    estimated_delivery: order.estimated_delivery,
    rejection_reason: order.rejection_reason,
    cancelled_at: order.cancelled_at,
    delivered_at: order.delivered_at,
    created_at: order.created_at,
    updated_at: order.updated_at
  };
};

/**
 * Create a new order
 */
export const createOrder = async (orderData) => {
  const { buyer_id, artisan_id, items, total_amount, shipping_address, buyer_phone, payment_method, notes } = orderData;

  const orderItems = items.map(item => ({
    craft_id: item.craft_id,
    quantity: item.quantity,
    price_at_purchase: item.price,
    subtotal: item.quantity * item.price
  }));

  const order = await Order.create({
    order_number: generateOrderNumber(),
    buyer_id,
    artisan_id,
    items: orderItems,
    total_amount,
    shipping_address,
    buyer_phone,
    payment_method: payment_method || 'COD',
    notes
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('buyer_id', 'name email')
    .populate('artisan_id', 'name email')
    .populate('items.craft_id', 'name image_url')
    .lean();

  return formatOrder(populatedOrder);
};

/**
 * Get orders by buyer
 */
export const getOrdersByBuyer = async (buyerId, filters = {}) => {
  const query = { buyer_id: buyerId };
  
  if (filters.status) query.status = filters.status;
  if (filters.from_date) query.created_at = { $gte: new Date(filters.from_date) };
  if (filters.to_date) {
    query.created_at = { ...query.created_at, $lte: new Date(filters.to_date) };
  }

  const orders = await Order.find(query)
    .populate('artisan_id', 'name email')
    .populate('items.craft_id', 'name image_url')
    .sort({ created_at: -1 })
    .lean();

  return orders.map(formatOrder);
};

/**
 * Get orders by artisan
 */
export const getOrdersByArtisan = async (artisanId, filters = {}) => {
  const query = { artisan_id: artisanId };
  
  if (filters.status) query.status = filters.status;

  const orders = await Order.find(query)
    .populate('buyer_id', 'name email')
    .populate('items.craft_id', 'name image_url')
    .sort({ created_at: -1 })
    .lean();

  return orders.map(formatOrder);
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;

  const order = await Order.findOne({
    _id: orderId,
    $or: [{ buyer_id: userId }, { artisan_id: userId }]
  })
    .populate('buyer_id', 'name email phone')
    .populate('artisan_id', 'name email phone')
    .populate('items.craft_id', 'name image_url price')
    .lean();

  return formatOrder(order);
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status, artisanId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;

  const updateData = { status };
  if (status === 'delivered') updateData.delivered_at = new Date();

  const order = await Order.findOneAndUpdate(
    { _id: orderId, artisan_id: artisanId },
    updateData,
    { new: true }
  )
    .populate('buyer_id', 'name email')
    .populate('items.craft_id', 'name image_url')
    .lean();

  return formatOrder(order);
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId, buyerId, reason) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;

  const order = await Order.findOneAndUpdate(
    { _id: orderId, buyer_id: buyerId, status: { $in: ['placed', 'confirmed'] } },
    { status: 'cancelled', rejection_reason: reason, cancelled_at: new Date() },
    { new: true }
  ).lean();

  return formatOrder(order);
};

/**
 * Return order
 */
export const returnOrder = async (orderId, buyerId, reason) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;

  const order = await Order.findOneAndUpdate(
    { _id: orderId, buyer_id: buyerId, status: 'delivered' },
    { status: 'returned', rejection_reason: reason },
    { new: true }
  ).lean();

  return formatOrder(order);
};

/**
 * Update tracking info
 */
export const updateTracking = async (orderId, artisanId, trackingData) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;

  const order = await Order.findOneAndUpdate(
    { _id: orderId, artisan_id: artisanId },
    { 
      tracking_number: trackingData.tracking_number,
      tracking_url: trackingData.tracking_url,
      estimated_delivery: trackingData.estimated_delivery
    },
    { new: true }
  ).lean();

  return formatOrder(order);
};

/**
 * Get buyer order stats
 */
export const getBuyerOrderStats = async (buyerId) => {
  const stats = await Order.aggregate([
    { $match: { buyer_id: new mongoose.Types.ObjectId(buyerId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $in: ['$status', ['placed', 'confirmed', 'processing']] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        total_spent: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$total_amount', 0] } }
      }
    }
  ]);

  return stats[0] || { total: 0, pending: 0, completed: 0, total_spent: 0 };
};

/**
 * Get recent orders
 */
export const getRecentOrders = async (userId, role, limit = 5) => {
  const query = role === 'buyer' ? { buyer_id: userId } : { artisan_id: userId };

  const orders = await Order.find(query)
    .populate('buyer_id', 'name')
    .populate('artisan_id', 'name')
    .populate('items.craft_id', 'name image_url')
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

  return orders.map(formatOrder);
};

/**
 * Get artisan order stats
 */
export const getArtisanOrderStats = async (artisanId) => {
  const stats = await Order.aggregate([
    { $match: { artisan_id: new mongoose.Types.ObjectId(artisanId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new_orders: { $sum: { $cond: [{ $eq: ['$status', 'placed'] }, 1, 0] } },
        processing: { $sum: { $cond: [{ $in: ['$status', ['confirmed', 'processing', 'shipped']] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || { total: 0, new_orders: 0, processing: 0, completed: 0, cancelled: 0 };
};

/**
 * Get artisan revenue
 */
export const getArtisanRevenue = async (artisanId) => {
  const revenue = await Order.aggregate([
    { $match: { artisan_id: new mongoose.Types.ObjectId(artisanId), status: 'delivered' } },
    {
      $group: {
        _id: null,
        total_revenue: { $sum: '$total_amount' },
        order_count: { $sum: 1 }
      }
    }
  ]);

  return revenue[0] || { total_revenue: 0, order_count: 0 };
};

/**
 * Reject order
 */
export const rejectOrder = async (orderId, artisanId, reason) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;

  const order = await Order.findOneAndUpdate(
    { _id: orderId, artisan_id: artisanId, status: 'placed' },
    { status: 'cancelled', rejection_reason: reason, cancelled_at: new Date() },
    { new: true }
  ).lean();

  return formatOrder(order);
};

export default Order;
