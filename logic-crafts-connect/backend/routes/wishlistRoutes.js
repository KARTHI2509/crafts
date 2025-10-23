import express from 'express';
import {
  addItem,
  getMyWishlist,
  removeItem,
  checkWishlist,
  clearAll,
  getCount,
  moveItemsToCart
} from '../controllers/wishlistController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All wishlist routes require buyer authentication
 */
router.use(protect);
router.use(restrictTo('buyer'));

// Get wishlist count
router.get('/count', getCount);

// Check if item is in wishlist
router.get('/check/:craftId', checkWishlist);

// Get my wishlist
router.get('/', getMyWishlist);

// Add item to wishlist
router.post('/', addItem);

// Move items to cart
router.post('/move-to-cart', moveItemsToCart);

// Clear entire wishlist
router.delete('/clear', clearAll);

// Remove specific item from wishlist
router.delete('/:craftId', removeItem);

export default router;
