/**
 * ============================================
 * REVIEW MODEL - MongoDB/Mongoose
 * ============================================
 * Handles review and rating operations
 */

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  craft_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Craft',
    required: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review_text: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  helpful_count: {
    type: Number,
    default: 0
  },
  artisan_reply: {
    type: String
  },
  artisan_reply_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// One review per buyer per craft
reviewSchema.index({ buyer_id: 1, craft_id: 1 }, { unique: true });
reviewSchema.index({ craft_id: 1 });

const Review = mongoose.model('Review', reviewSchema);

/**
 * Format review for response
 */
const formatReview = (review) => {
  if (!review) return null;
  return {
    id: review._id.toString(),
    buyer_id: review.buyer_id?._id?.toString() || review.buyer_id?.toString(),
    craft_id: review.craft_id?._id?.toString() || review.craft_id?.toString(),
    order_id: review.order_id?.toString(),
    buyer_name: review.buyer_id?.name,
    buyer_image: review.buyer_id?.profile_image,
    rating: review.rating,
    review_text: review.review_text,
    images: review.images || [],
    helpful_count: review.helpful_count || 0,
    artisan_reply: review.artisan_reply,
    artisan_reply_at: review.artisan_reply_at,
    created_at: review.created_at,
    updated_at: review.updated_at
  };
};

/**
 * Create a new review
 */
export const createReview = async (reviewData) => {
  const { buyer_id, craft_id, order_id, rating, review_text, images } = reviewData;

  // Check if already reviewed
  const existingReview = await Review.findOne({ buyer_id, craft_id });
  if (existingReview) {
    throw new Error('You have already reviewed this craft');
  }

  const review = await Review.create({
    buyer_id,
    craft_id,
    order_id,
    rating,
    review_text,
    images
  });

  // Update craft's average rating
  await updateCraftRating(craft_id);

  return formatReview(review);
};

/**
 * Update craft rating (helper)
 */
const updateCraftRating = async (craftId) => {
  const stats = await Review.aggregate([
    { $match: { craft_id: new mongoose.Types.ObjectId(craftId) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    const Craft = mongoose.model('Craft');
    await Craft.findByIdAndUpdate(craftId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      review_count: stats[0].count
    });
  }
};

/**
 * Get reviews for a craft
 */
export const getReviewsByCraft = async (craftId, options = {}) => {
  const { sortBy = 'recent', limit = 10, offset = 0, rating_filter } = options;

  let sortOption = { created_at: -1 };
  if (sortBy === 'highest') sortOption = { rating: -1, created_at: -1 };
  else if (sortBy === 'lowest') sortOption = { rating: 1, created_at: -1 };
  else if (sortBy === 'helpful') sortOption = { helpful_count: -1, created_at: -1 };

  const query = { craft_id: craftId };
  if (rating_filter) query.rating = rating_filter;

  const reviews = await Review.find(query)
    .populate('buyer_id', 'name profile_image')
    .sort(sortOption)
    .skip(offset)
    .limit(limit)
    .lean();

  return reviews.map(formatReview);
};

/**
 * Get review statistics for a craft
 */
export const getReviewStats = async (craftId) => {
  const stats = await Review.aggregate([
    { $match: { craft_id: new mongoose.Types.ObjectId(craftId) } },
    {
      $group: {
        _id: null,
        total_reviews: { $sum: 1 },
        average_rating: { $avg: '$rating' },
        five_star: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        four_star: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        three_star: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        two_star: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        one_star: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      total_reviews: 0,
      average_rating: '0.0',
      rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  return {
    total_reviews: stats[0].total_reviews,
    average_rating: (stats[0].average_rating || 0).toFixed(1),
    rating_distribution: {
      5: stats[0].five_star,
      4: stats[0].four_star,
      3: stats[0].three_star,
      2: stats[0].two_star,
      1: stats[0].one_star
    }
  };
};

/**
 * Get reviews by buyer
 */
export const getReviewsByBuyer = async (buyerId) => {
  const reviews = await Review.find({ buyer_id: buyerId })
    .populate('craft_id', 'name images user_id')
    .populate({
      path: 'craft_id',
      populate: { path: 'user_id', select: 'name' }
    })
    .sort({ created_at: -1 })
    .lean();

  return reviews.map(review => ({
    ...formatReview(review),
    craft_title: review.craft_id?.name,
    craft_images: review.craft_id?.images || [],
    artisan_name: review.craft_id?.user_id?.name
  }));
};

/**
 * Update a review
 */
export const updateReview = async (reviewId, buyerId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;

  const review = await Review.findOneAndUpdate(
    { _id: reviewId, buyer_id: buyerId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (review) {
    await updateCraftRating(review.craft_id);
  }

  return formatReview(review);
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId, buyerId) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) return false;

  const review = await Review.findOneAndDelete({ _id: reviewId, buyer_id: buyerId });
  
  if (review) {
    await updateCraftRating(review.craft_id);
    return true;
  }

  return false;
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (reviewId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $inc: { helpful_count: 1 } },
    { new: true }
  ).lean();

  return formatReview(review);
};

/**
 * Add artisan reply to review
 */
export const addArtisanReply = async (reviewId, artisanId, replyText) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;

  // Verify artisan owns the craft
  const review = await Review.findById(reviewId).populate('craft_id', 'user_id');
  if (!review || review.craft_id.user_id.toString() !== artisanId) {
    throw new Error('Not authorized to reply to this review');
  }

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { artisan_reply: replyText, artisan_reply_at: new Date() },
    { new: true }
  ).lean();

  return formatReview(updatedReview);
};

export default Review;
