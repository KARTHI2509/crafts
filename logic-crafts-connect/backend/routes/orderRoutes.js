/**
 * ============================================
 * ORDER ROUTES
 * ============================================
 * Defines routes for order management
 * 
 * Public routes: None
 * 
 * Protected routes (Buyer):
 * - POST   /api/orders          - Place order
 * - GET    /api/orders          - Get buyer's orders
 * - GET    /api/orders/:id      - Get specific order
 * - PUT    /api/orders/:id/cancel  - Cancel order
 * - PUT    /api/orders/:id/return  - Return order
 * - GET    /api/orders/stats       - Get order statistics
 * - GET    /api/orders/recent      - Get recent orders
 * 
 * Protected routes (Artisan):
 * - GET    /api/orders              - Get artisan's orders
 * - PUT    /api/orders/:id/status   - Update order status
 * - PUT    /api/orders/:id/tracking - Update tracking info
 */

import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrder,
  updateStatus,
  cancelOrderRequest,
  returnOrderRequest,
  updateOrderTracking,
  getOrderStats,
  getRecentOrdersList,
  getArtisanStats,
  getArtisanRevenueData,
  rejectOrderRequest
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get recent orders (for both buyer and artisan)
router.get('/recent', getRecentOrdersList);

// Get order statistics (buyer only)
router.get('/stats', restrictTo('buyer'), getOrderStats);

// Artisan-specific routes
router.get('/artisan/stats', restrictTo('artisan'), getArtisanStats);
router.get('/artisan/revenue', restrictTo('artisan'), getArtisanRevenueData);

// Get all orders for logged-in user (buyer or artisan)
router.get('/', getMyOrders);

// Place new order (buyer only)
router.post('/', restrictTo('buyer'), placeOrder);

// Get specific order
router.get('/:id', getOrder);

// Update order status (artisan only)
router.put('/:id/status', restrictTo('artisan'), updateStatus);

// Reject order (artisan only)
router.put('/:id/reject', restrictTo('artisan'), rejectOrderRequest);

// Cancel order (buyer only)
router.put('/:id/cancel', restrictTo('buyer'), cancelOrderRequest);

// Return order (buyer only)
router.put('/:id/return', restrictTo('buyer'), returnOrderRequest);

// Update tracking information (artisan only)
router.put('/:id/tracking', restrictTo('artisan'), updateOrderTracking);

export default router;
