/**
 * ============================================
 * ORDER CONTROLLER
 * ============================================
 * Handles order-related HTTP requests
 * - Place orders
 * - Get orders
 * - Update status
 * - Track orders
 * - Cancel/Return
 */

import {
  createOrder,
  getOrdersByBuyer,
  getOrdersByArtisan,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  returnOrder,
  updateTracking,
  getBuyerOrderStats,
  getRecentOrders
} from '../models/orderModel.js';
import { clearCart } from '../models/cartModel.js';

/**
 * @desc    Place a new order
 * @route   POST /api/orders
 * @access  Private (Buyer only)
 */
export const placeOrder = async (req, res) => {
  try {
    const {
      artisan_id,
      items, // [{craft_id, quantity, price}]
      total_amount,
      shipping_address,
      buyer_phone,
      payment_method,
      notes
    } = req.body;

    const buyer_id = req.user.id;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!shipping_address || !buyer_phone) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and phone number are required'
      });
    }

    // Create order
    const order = await createOrder({
      buyer_id,
      artisan_id,
      items,
      total_amount,
      shipping_address,
      buyer_phone,
      payment_method: payment_method || 'COD',
      notes
    });

    // Clear cart after successful order
    if (req.body.clear_cart) {
      await clearCart(buyer_id);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message
    });
  }
};

/**
 * @desc    Get orders for logged-in user
 * @route   GET /api/orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, from_date, to_date } = req.query;

    const filters = { status, from_date, to_date };

    let orders;
    if (userRole === 'buyer') {
      orders = await getOrdersByBuyer(userId, filters);
    } else if (userRole === 'artisan') {
      orders = await getOrdersByArtisan(userId, filters);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role for this operation'
      });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await getOrderById(orderId, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

/**
 * @desc    Update order status (Artisan only)
 * @route   PUT /api/orders/:id/status
 * @access  Private (Artisan only)
 */
export const updateStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await updateOrderStatus(orderId, status, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you are not authorized to update this order'
      });
    }

    // TODO: Send notification to buyer about status change

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel order (Buyer only)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private (Buyer only)
 */
export const cancelOrderRequest = async (req, res) => {
  try {
    const orderId = req.params.id;
    const buyerId = req.user.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      });
    }

    const order = await cancelOrder(orderId, buyerId, reason);

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled (not found, already processed, or not your order)'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

/**
 * @desc    Request order return (Buyer only)
 * @route   PUT /api/orders/:id/return
 * @access  Private (Buyer only)
 */
export const returnOrderRequest = async (req, res) => {
  try {
    const orderId = req.params.id;
    const buyerId = req.user.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Return reason is required'
      });
    }

    const order = await returnOrder(orderId, buyerId, reason);

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be returned (not delivered or not your order)'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Return order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing return request',
      error: error.message
    });
  }
};

/**
 * @desc    Update tracking information (Artisan only)
 * @route   PUT /api/orders/:id/tracking
 * @access  Private (Artisan only)
 */
export const updateOrderTracking = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { tracking_number, estimated_delivery } = req.body;

    const order = await updateTracking(orderId, tracking_number, estimated_delivery);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tracking information updated',
      data: { order }
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tracking information',
      error: error.message
    });
  }
};

/**
 * @desc    Get order statistics for buyer
 * @route   GET /api/orders/stats
 * @access  Private (Buyer only)
 */
export const getOrderStats = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const stats = await getBuyerOrderStats(buyerId);

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get recent orders
 * @route   GET /api/orders/recent
 * @access  Private
 */
export const getRecentOrdersList = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const orders = await getRecentOrders(userId, limit);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent orders',
      error: error.message
    });
  }
};
