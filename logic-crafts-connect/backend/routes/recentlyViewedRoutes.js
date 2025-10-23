import express from 'express';
import {
  trackCraftView,
  getRecent,
  clearHistory,
  removeItem
} from '../controllers/recentlyViewedController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All recently viewed routes require buyer authentication
 */
router.use(protect);
router.use(restrictTo('buyer'));

// Get recently viewed items
router.get('/', getRecent);

// Track a craft view
router.post('/', trackCraftView);

// Clear recently viewed history
router.delete('/clear', clearHistory);

// Remove specific item from recently viewed
router.delete('/:craftId', removeItem);

export default router;
