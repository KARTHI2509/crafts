/**
 * ============================================
 * ORDER MODEL
 * ============================================
 * Stores all order details
 * Supports:
 * - Buyer orders
 * - Artisan orders
 * - Order items
 * - Shipping
 * - Payment
 * - Tracking
 * - Cancellation
 * - Returns
 */

import mongoose from 'mongoose';

/**
 * Order Item Schema
 * Stores each craft inside an order
 */
const orderItemSchema = new mongoose.Schema({
  craft_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Craft',
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    default: 1
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

/**
 * Main Order Schema
 */
const orderSchema = new mongoose.Schema(
{
  // Unique order number
  order_number: {
    type: String,
    unique: true,
    required: true
  },

  // Buyer reference
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Artisan reference
  artisan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Order items
  items: [orderItemSchema],

  // Total price
  total_amount: {
    type: Number,
    required: true
  },

  // Shipping address
  shipping_address: {
    type: String,
    required: true
  },

  // Buyer contact number
  buyer_phone: {
    type: String
  },

  // Payment method
  payment_method: {
    type: String,
    enum: ['cod', 'upi', 'card', 'netbanking'],
    default: 'cod'
  },

  // Payment status
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },

  // Order status
  status: {
    type: String,
    enum: [
      'placed',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned'
    ],
    default: 'placed'
  },

  // Optional buyer notes
  notes: {
    type: String
  },

  // Tracking number
  tracking_number: {
    type: String
  },

  // Estimated delivery date
  estimated_delivery: {
    type: Date
  },

  // Delivered date
  delivered_at: {
    type: Date
  },

  // Cancelled date
  cancelled_at: {
    type: Date
  },

  // Cancellation reason
  cancellation_reason: {
    type: String
  },

  // Return reason
  return_reason: {
    type: String
  }
},
{
  timestamps: true
});

// Add indexes for faster querying
orderSchema.index({ buyer_id: 1 });
orderSchema.index({ artisan_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

/**
 * Auto-generate order number before saving
 * Format: ORD-YYYYMMDD-XXXXX
 */
orderSchema.pre('save', function(next) {
  if (!this.order_number) {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 99999)
      .toString()
      .padStart(5, '0');

    this.order_number = `ORD-${year}${month}${day}-${random}`;
  }

  next();
});

/**
 * Create model
 */
const Order = mongoose.model('Order', orderSchema);

export default Order;