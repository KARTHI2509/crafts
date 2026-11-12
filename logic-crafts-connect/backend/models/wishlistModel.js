/**
 * ============================================
 * WISHLIST MODEL - MongoDB/Mongoose
 * ============================================
 * Handles wishlist operations
 */

import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  craft_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Craft',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// One wishlist item per buyer per craft
wishlistSchema.index({ buyer_id: 1, craft_id: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

/**
 * Add item to wishlist
 */
export const addToWishlist = async (buyerId, craftId) => {
  const existing = await Wishlist.findOne({ buyer_id: buyerId, craft_id: craftId });
  if (existing) {
    throw new Error('Item already in wishlist');
  }

  const item = await Wishlist.create({ buyer_id: buyerId, craft_id: craftId });
  return { id: item._id.toString(), buyer_id: buyerId, craft_id: craftId, created_at: item.created_at };
};

/**
 * Get buyer's wishlist
 */
export const getWishlist = async (buyerId) => {
  const items = await Wishlist.find({ buyer_id: buyerId })
    .populate({
      path: 'craft_id',
      populate: { path: 'user_id', select: 'name profile_image' }
    })
    .sort({ created_at: -1 })
    .lean();

  return items.map(item => ({
    id: item._id.toString(),
    craft_id: item.craft_id?._id?.toString(),
    created_at: item.created_at,
    title: item.craft_id?.name,
    description: item.craft_id?.description,
    price: item.craft_id?.price,
    images: item.craft_id?.images || [],
    category: item.craft_id?.category,
    stock: item.craft_id?.stock,
    rating: item.craft_id?.rating,
    artisan_id: item.craft_id?.user_id?._id?.toString(),
    artisan_name: item.craft_id?.user_id?.name,
    artisan_image: item.craft_id?.user_id?.profile_image
  }));
};

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = async (buyerId, craftId) => {
  const result = await Wishlist.deleteOne({ buyer_id: buyerId, craft_id: craftId });
  if (result.deletedCount === 0) {
    throw new Error('Item not found in wishlist');
  }
  return true;
};

/**
 * Check if item is in wishlist
 */
export const isInWishlist = async (buyerId, craftId) => {
  const item = await Wishlist.findOne({ buyer_id: buyerId, craft_id: craftId });
  return !!item;
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = async (buyerId) => {
  const result = await Wishlist.deleteMany({ buyer_id: buyerId });
  return result.deletedCount;
};

/**
 * Get wishlist count
 */
export const getWishlistCount = async (buyerId) => {
  const count = await Wishlist.countDocuments({ buyer_id: buyerId });
  return count;
};

/**
 * Move item to cart
 */
export const moveToCart = async (buyerId, craftId) => {
  const Cart = mongoose.model('Cart');
  
  // Add to cart
  await Cart.findOneAndUpdate(
    { buyer_id: buyerId, craft_id: craftId },
    { buyer_id: buyerId, craft_id: craftId, quantity: 1 },
    { upsert: true }
  );

  // Remove from wishlist
  await Wishlist.deleteOne({ buyer_id: buyerId, craft_id: craftId });

  return true;
};

export default Wishlist;
