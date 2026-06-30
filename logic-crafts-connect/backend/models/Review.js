/**
 * ============================================
 * REVIEW MODEL
 * ============================================
 * Stores buyer reviews for crafts
 * Supports:
 * - Ratings
 * - Review text
 * - Images
 * - Helpful votes
 * - Artisan replies
 */

import mongoose from 'mongoose';

/**
 * Artisan reply schema
 */
const artisanReplySchema = new mongoose.Schema({
  reply_text: {
    type: String,
    required: true
  },

  replied_at: {
    type: Date,
    default: Date.now
  }
});

/**
 * Review schema
 */
const reviewSchema = new mongoose.Schema(
{
  // Buyer who wrote review
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Reviewed craft
  craft_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Craft',
    required: true
  },

  // Related order
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },

  // Rating (1 to 5)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  // Review text
  review_text: {
    type: String
  },

  // Review images
  images: [
    {
      type: String
    }
  ],

  // Helpful count
  helpful_count: {
    type: Number,
    default: 0
  },

  // Users who marked helpful
  helpful_by: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  // Artisan reply
  artisan_reply: artisanReplySchema
},
{
  timestamps: true
});

/**
 * Prevent duplicate review by same buyer for same craft
 */
reviewSchema.index(
  { buyer_id: 1, craft_id: 1 },
  { unique: true }
);

/**
 * Create Review model
 */
const Review = mongoose.model('Review', reviewSchema);

export default Review;