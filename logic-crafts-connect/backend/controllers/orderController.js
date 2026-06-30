import Order from '../models/Order.js';
import User from '../models/User.js';
import Analytics from '../models/Analytics.js';

/**
 * Place Order
 */
export const placeOrder = async (req, res) => {
  try {
    const {
      artisan_id,
      items,
      total_amount,
      shipping_address,
      buyer_phone,
      payment_method,
      notes
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    const order = await Order.create({
      buyer_id: req.user.id,
      artisan_id,
      items,
      total_amount,
      shipping_address,
      buyer_phone,
      payment_method: payment_method || 'COD',
      notes,
      status: 'pending'
    });

    // Track checkout_success analytics
    try {
      await Analytics.create({
        eventType: 'checkout_success',
        userId: req.user.id,
        sessionId: req.body.sessionId || 'system-placed-order',
        payload: {
          orderId: order._id,
          totalAmount: total_amount,
          itemsCount: items.length
        }
      });
    } catch (err) {
      console.warn("Failed to log order analytics:", err);
    }

    if (req.body.clear_cart) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: { cart: [] }
      });
    }

    // Emit real-time event to artisan
    const io = req.app.get('io');
    if (io) {
      io.to(artisan_id.toString()).emit('newOrder', order);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get My Orders
 */
export const getMyOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'buyer') {
      orders = await Order.find({ buyer_id: req.user.id });
    } else {
      orders = await Order.find({ artisan_id: req.user.id });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Single Order
 */
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Status
 */
export const updateStatus = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        artisan_id: req.user.id
      },
      {
        status: req.body.status
      },
      { new: true }
    );

    // Emit real-time event to buyer
    const io = req.app.get('io');
    if (io && order) {
      io.to(order.buyer_id.toString()).emit('orderStatusUpdated', order);
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cancel Order
 */
export const cancelOrderRequest = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        buyer_id: req.user.id
      },
      {
        status: 'cancelled',
        cancel_reason: req.body.reason
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Return Order
 */
export const returnOrderRequest = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        buyer_id: req.user.id
      },
      {
        return_requested: true,
        return_reason: req.body.reason
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully',
      data: { order }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Tracking
 */
export const updateOrderTracking = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        tracking_number: req.body.tracking_number,
        estimated_delivery: req.body.estimated_delivery
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Tracking information updated',
      data: { order }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Order Stats
 */
export const getOrderStats = async (req, res) => {
  try {
    const total = await Order.countDocuments({
      buyer_id: req.user.id
    });

    const delivered = await Order.countDocuments({
      buyer_id: req.user.id,
      status: 'delivered'
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          delivered
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * ============================================
 * GET ARTISAN STATS
 * ============================================
 */
export const getArtisanStats = async (req, res) => {
  try {
    const artisanId = req.user.id;

    const totalOrders = await Order.countDocuments({
      artisan_id: artisanId
    });

    const pendingOrders = await Order.countDocuments({
      artisan_id: artisanId,
      status: 'pending'
    });

    const completedOrders = await Order.countDocuments({
      artisan_id: artisanId,
      status: 'delivered'
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * GET ARTISAN REVENUE DATA
 * ============================================
 */
export const getArtisanRevenueData = async (req, res) => {
  try {
    const artisanId = req.user.id;

    const revenue = await Order.aggregate([
      {
        $match: {
          artisan_id: artisanId,
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenue[0]?.totalRevenue || 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * REJECT ORDER
 * ============================================
 */
export const rejectOrderRequest = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    // Emit real-time event to buyer
    const io = req.app.get('io');
    if (io && order) {
      io.to(order.buyer_id.toString()).emit('orderStatusUpdated', order);
    }

    res.status(200).json({
      success: true,
      message: 'Order rejected successfully',
      data: { order }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
/**
 * ============================================
 * GET RECENT ORDERS
 * ============================================
 * Returns latest 5 orders for logged-in user
 * Buyer -> orders placed
 * Artisan -> orders received
 */
export const getRecentOrdersList = async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'buyer') {
      orders = await Order.find({ buyer_id: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5);
    } else if (req.user.role === 'artisan') {
      orders = await Order.find({ artisan_id: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5);
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};