import express from 'express';
import {
  submitReview,
  getCraftReviews,
  getCraftReviewStats,
  getMyReviews,
  updateReviewById,
  deleteReviewById,
  markHelpful,
  replyToReview
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public routes - No authentication required
 */
// Get reviews for a specific craft
router.get('/craft/:craftId', getCraftReviews);

// Get review statistics for a craft
router.get('/craft/:craftId/stats', getCraftReviewStats);

/**
 * Protected routes - Authentication required
 */
router.use(protect);

// Mark review as helpful (any authenticated user)
router.post('/:id/helpful', markHelpful);

/**
 * Buyer-only routes
 */
// Submit a new review (buyers only)
router.post('/', restrictTo('buyer'), submitReview);

// Get my reviews (buyer's own reviews)
router.get('/my-reviews', restrictTo('buyer'), getMyReviews);

// Update my review
router.put('/:id', restrictTo('buyer'), updateReviewById);

// Delete my review
router.delete('/:id', restrictTo('buyer'), deleteReviewById);

/**
 * Artisan-only routes
 */
// Reply to a review (artisan only)
router.post('/:id/reply', restrictTo('artisan'), replyToReview);

export default router;
