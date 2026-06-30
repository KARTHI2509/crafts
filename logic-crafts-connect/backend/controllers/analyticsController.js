import Analytics from '../models/Analytics.js';
import Order from '../models/Order.js';
import Craft from '../models/Craft.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Save event tracking records
 * POST /api/analytics/track
 */
export const trackEvent = asyncHandler(async (req, res) => {
  const { eventType, sessionId, payload } = req.body;

  if (!eventType || !sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Event type and session ID are required'
    });
  }

  // Attach authenticated user if available
  const userId = req.user ? req.user._id : null;

  const log = await Analytics.create({
    eventType,
    sessionId,
    userId,
    payload: payload || {}
  });

  res.status(201).json({
    success: true,
    data: log
  });
});

/**
 * Fetch dashboard analytics reports (Admin Only)
 * GET /api/analytics/metrics
 */
export const getMetricsSummary = asyncHandler(async (req, res) => {
  // 1. Core Conversion Funnel counts
  const funnelData = await Analytics.aggregate([
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 }
      }
    }
  ]);

  const funnelMap = funnelData.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {
    page_visit: 0,
    product_click: 0,
    cart_add: 0,
    checkout_start: 0,
    checkout_success: 0
  });

  // 2. Top search keywords
  const topSearches = await Analytics.aggregate([
    { $match: { eventType: 'search' } },
    { $group: { _id: '$payload.query', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // 3. Top clicked products
  const topClickedProductsRaw = await Analytics.aggregate([
    { $match: { eventType: 'product_click' } },
    { $group: { _id: '$payload.productId', clicks: { $sum: 1 } } },
    { $sort: { clicks: -1 } },
    { $limit: 5 }
  ]);

  // Populate names for top clicked products
  const topProducts = await Promise.all(
    topClickedProductsRaw.map(async (item) => {
      try {
        const craft = await Craft.findById(item._id).select('name price');
        return {
          productId: item._id,
          name: craft ? craft.name : 'Unknown Product',
          clicks: item.clicks,
          price: craft ? craft.price : 0
        };
      } catch (e) {
        return { productId: item._id, name: 'Unknown Product', clicks: item.clicks, price: 0 };
      }
    })
  );

  // 4. Monthly Revenue aggregates (from Orders)
  const monthlyRevenue = await Order.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: '$total_amount' },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 5. General counts
  const totalOrders = await Order.countDocuments();
  const completedOrders = await Order.countDocuments({ status: 'completed' });
  const totalArtisans = await User.countDocuments({ role: 'artisan' });
  const totalBuyers = await User.countDocuments({ role: 'buyer' });

  // 6. Security Warnings & lockouts
  const lockedUsersCount = await User.countDocuments({ lockUntil: { $gt: new Date() } });
  const bannedUsersCount = await User.countDocuments({ isBanned: true });

  res.json({
    success: true,
    data: {
      funnel: funnelMap,
      topSearches: topSearches.map(s => ({ keyword: s._id || 'All', count: s.count })),
      topProducts,
      monthlyRevenue: monthlyRevenue.map(r => ({ month: r._id, revenue: r.revenue, orders: r.ordersCount })),
      counts: {
        totalOrders,
        completedOrders,
        totalArtisans,
        totalBuyers,
        lockedUsersCount,
        bannedUsersCount
      }
    }
  });
});
