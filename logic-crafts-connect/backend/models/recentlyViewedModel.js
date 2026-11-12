/**
 * ============================================
 * RECENTLY VIEWED MODEL - MongoDB/Mongoose
 * ============================================
 * Tracks recently viewed crafts
 */

import mongoose from 'mongoose';

const recentlyViewedSchema = new mongoose.Schema({
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
  viewed_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// One entry per buyer per craft (updated on re-view)
recentlyViewedSchema.index({ buyer_id: 1, craft_id: 1 }, { unique: true });
recentlyViewedSchema.index({ buyer_id: 1, viewed_at: -1 });

const RecentlyViewed = mongoose.model('RecentlyViewed', recentlyViewedSchema);

/**
 * Track viewed craft
 */
export const trackView = async (buyerId, craftId) => {
  const existing = await RecentlyViewed.findOne({ buyer_id: buyerId, craft_id: craftId });

  if (existing) {
    // Update viewed_at
    existing.viewed_at = new Date();
    await existing.save();
    return { id: existing._id.toString(), buyer_id: buyerId, craft_id: craftId, viewed_at: existing.viewed_at };
  }

  // Create new entry
  const entry = await RecentlyViewed.create({ buyer_id: buyerId, craft_id: craftId });

  // Keep only last 50 viewed items per user
  const count = await RecentlyViewed.countDocuments({ buyer_id: buyerId });
  if (count > 50) {
    const oldItems = await RecentlyViewed.find({ buyer_id: buyerId })
      .sort({ viewed_at: 1 })
      .limit(count - 50);
    
    const idsToDelete = oldItems.map(item => item._id);
    await RecentlyViewed.deleteMany({ _id: { $in: idsToDelete } });
  }

  return { id: entry._id.toString(), buyer_id: buyerId, craft_id: craftId, viewed_at: entry.viewed_at };
};

/**
 * Get recently viewed items
 */
export const getRecentlyViewed = async (buyerId, limit = 20) => {
  const items = await RecentlyViewed.find({ buyer_id: buyerId })
    .populate({
      path: 'craft_id',
      populate: { path: 'user_id', select: 'name' }
    })
    .sort({ viewed_at: -1 })
    .limit(limit)
    .lean();

  return items.map(item => ({
    id: item._id.toString(),
    craft_id: item.craft_id?._id?.toString(),
    viewed_at: item.viewed_at,
    title: item.craft_id?.name,
    description: item.craft_id?.description,
    price: item.craft_id?.price,
    images: item.craft_id?.images || [],
    category: item.craft_id?.category,
    stock: item.craft_id?.stock,
    rating: item.craft_id?.rating,
    artisan_id: item.craft_id?.user_id?._id?.toString(),
    artisan_name: item.craft_id?.user_id?.name
  }));
};

/**
 * Clear recently viewed history
 */
export const clearRecentlyViewed = async (buyerId) => {
  const result = await RecentlyViewed.deleteMany({ buyer_id: buyerId });
  return result.deletedCount;
};

/**
 * Remove specific item from recently viewed
 */
export const removeFromRecentlyViewed = async (buyerId, craftId) => {
  const result = await RecentlyViewed.deleteOne({ buyer_id: buyerId, craft_id: craftId });
  return result.deletedCount > 0;
};

export default {
  trackView,
  getRecentlyViewed,
  clearRecentlyViewed,
  removeFromRecentlyViewed
};
