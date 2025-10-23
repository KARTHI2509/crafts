import express from 'express';
import {
  getPersonalized,
  getSimilar,
  getTrending,
  getNew,
  getTopRatedCrafts
} from '../controllers/recommendationController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public routes - No authentication required
 */
// Get similar items to a craft
router.get('/similar/:craftId', getSimilar);

// Get trending crafts
router.get('/trending', getTrending);

// Get new arrivals
router.get('/new-arrivals', getNew);

// Get top rated crafts
router.get('/top-rated', getTopRatedCrafts);

/**
 * Protected routes - Buyer only
 */
// Get personalized recommendations (requires user history)
router.get('/personalized', protect, restrictTo('buyer'), getPersonalized);

export default router;
