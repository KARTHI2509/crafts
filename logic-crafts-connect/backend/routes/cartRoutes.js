/**
 * ============================================
 * CART ROUTES
 * ============================================
 * Defines routes for shopping cart management
 * 
 * All routes are protected and buyer-only
 * 
 * Routes:
 * - GET    /api/cart           - Get cart items
 * - POST   /api/cart           - Add item to cart
 * - PUT    /api/cart/:id       - Update cart item quantity
 * - DELETE /api/cart/:id       - Remove item from cart
 * - DELETE /api/cart           - Clear entire cart
 * - GET    /api/cart/check/:craftId  - Check if item in cart
 * - GET    /api/cart/grouped   - Get cart grouped by artisan
 * - GET    /api/cart/validate  - Validate cart items
 */

import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCart,
  removeCartItem,
  clearCartItems,
  checkInCart,
  getGroupedCart,
  validateCartItems
} from '../controllers/cartController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and buyer role
router.use(protect);
router.use(restrictTo('buyer'));

// Get cart grouped by artisan (for checkout)
router.get('/grouped', getGroupedCart);

// Validate cart items
router.get('/validate', validateCartItems);

// Check if specific item is in cart
router.get('/check/:craftId', checkInCart);

// Get cart items
router.get('/', getCart);

// Add item to cart
router.post('/', addItemToCart);

// Update cart item quantity
router.put('/:id', updateCart);

// Remove item from cart
router.delete('/:id', removeCartItem);

// Clear entire cart
router.delete('/', clearCartItems);

export default router;
