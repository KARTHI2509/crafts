import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Craft from '../models/Craft.js';

/**
 * Submit Review
 */
export const submitReview = async (req, res) => {
  try {
    const { craft_id, order_id, rating, review_text, images } = req.body;

    if (!craft_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Craft ID and rating are required'
      });
    }

    const existingReview = await Review.findOne({
      buyer_id: req.user.id,
      craft_id
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You already reviewed this craft'
      });
    }

    const review = await Review.create({
      buyer_id: req.user.id,
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
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

/**
 * Get Craft Reviews
 */
export const getCraftReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      craft_id: req.params.craftId
    }).sort({ createdAt: -1 });

    const total = reviews.length;

    const avg =
      total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          total_reviews: total,
          average_rating: avg
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

/**
 * Get Review Stats
 */
export const getCraftReviewStats = async (req, res) => {
  try {
    const reviews = await Review.find({
      craft_id: req.params.craftId
    });

    const total = reviews.length;

    const avg =
      total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;

    res.json({
      success: true,
      data: {
        stats: {
          total_reviews: total,
          average_rating: avg
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics',
      error: error.message
    });
  }
};

/**
 * Get My Reviews
 */
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      buyer_id: req.user.id
    });

    res.json({
      success: true,
      data: { reviews }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your reviews',
      error: error.message
    });
  }
};

/**
 * Update Review
 */
export const updateReviewById = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      {
        _id: req.params.id,
        buyer_id: req.user.id
      },
      req.body,
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

/**
 * Delete Review
 */
export const deleteReviewById = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      buyer_id: req.user.id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

/**
 * Mark Helpful
 */
export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review.helpful_by.includes(req.user.id)) {
      return res.status(409).json({
        success: false,
        message: 'Already marked as helpful'
      });
    }

    review.helpful_by.push(req.user.id);
    review.helpful_count += 1;

    await review.save();

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: review
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
};

/**
 * Reply to Review
 */
export const replyToReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        artisan_reply: {
          reply_text: req.body.reply_text,
          replied_at: new Date()
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Reply added successfully',
      data: { review }
    });

  } catch (error) {
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