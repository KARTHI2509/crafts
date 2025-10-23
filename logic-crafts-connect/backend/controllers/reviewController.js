import {
  createReview,
  getReviewsByCraft,
  getReviewStats,
  getReviewsByBuyer,
  updateReview,
  deleteReview,
  markReviewHelpful,
  addArtisanReply
} from '../models/reviewModel.js';

/**
 * Submit a new review
 * POST /api/reviews
 * Buyer only
 */
export const submitReview = async (req, res) => {
  try {
    const { craft_id, order_id, rating, review_text, images } = req.body;
    const buyer_id = req.user.id;
    
    // Validation
    if (!craft_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Craft ID and rating are required'
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const review = await createReview({
      buyer_id,
      craft_id,
      order_id,
      rating,
      review_text,
      images
    });
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    
    if (error.message.includes('already reviewed')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('only review crafts you have purchased')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

/**
 * Get reviews for a craft
 * GET /api/reviews/craft/:craftId
 * Public
 */
export const getCraftReviews = async (req, res) => {
  try {
    const { craftId } = req.params;
    const { sortBy, limit, offset, rating_filter } = req.query;
    
    const reviews = await getReviewsByCraft(craftId, {
      sortBy,
      limit: parseInt(limit) || 10,
      offset: parseInt(offset) || 0,
      rating_filter: rating_filter ? parseInt(rating_filter) : null
    });
    
    const stats = await getReviewStats(craftId);
    
    res.json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          limit: parseInt(limit) || 10,
          offset: parseInt(offset) || 0,
          total: stats.total_reviews
        }
      }
    });
  } catch (error) {
    console.error('Get craft reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

/**
 * Get review statistics for a craft
 * GET /api/reviews/craft/:craftId/stats
 * Public
 */
export const getCraftReviewStats = async (req, res) => {
  try {
    const { craftId } = req.params;
    const stats = await getReviewStats(craftId);
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics',
      error: error.message
    });
  }
};

/**
 * Get my reviews (buyer's own reviews)
 * GET /api/reviews/my-reviews
 * Buyer only
 */
export const getMyReviews = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const reviews = await getReviewsByBuyer(buyer_id);
    
    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your reviews',
      error: error.message
    });
  }
};

/**
 * Update a review
 * PUT /api/reviews/:id
 * Buyer only (own review)
 */
export const updateReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const buyer_id = req.user.id;
    const { rating, review_text, images } = req.body;
    
    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const review = await updateReview(id, buyer_id, {
      rating,
      review_text,
      images
    });
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Update review error:', error);
    
    if (error.message.includes('not found or unauthorized')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:id
 * Buyer only (own review)
 */
export const deleteReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const buyer_id = req.user.id;
    
    await deleteReview(id, buyer_id);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    
    if (error.message.includes('not found or unauthorized')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

/**
 * Mark a review as helpful
 * POST /api/reviews/:id/helpful
 * Authenticated users only
 */
export const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const result = await markReviewHelpful(id, user_id);
    
    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: result
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    
    if (error.message.includes('already marked')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
};

/**
 * Artisan reply to a review
 * POST /api/reviews/:id/reply
 * Artisan only
 */
export const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const artisan_id = req.user.id;
    const { reply_text } = req.body;
    
    if (!reply_text) {
      return res.status(400).json({
        success: false,
        message: 'Reply text is required'
      });
    }
    
    const review = await addArtisanReply(id, artisan_id, reply_text);
    
    res.json({
      success: true,
      message: 'Reply added successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Reply to review error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
};

export default {
  submitReview,
  getCraftReviews,
  getCraftReviewStats,
  getMyReviews,
  updateReviewById,
  deleteReviewById,
  markHelpful,
  replyToReview
};
