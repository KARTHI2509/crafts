/**
 * ============================================
 * RECOMMENDATION MODEL - MongoDB/Mongoose
 * ============================================
 * Handles personalized recommendations
 */

import mongoose from 'mongoose';

/**
 * Get personalized recommendations based on user behavior
 */
export const getPersonalizedRecommendations = async (buyerId, limit = 10) => {
  const Craft = mongoose.model('Craft');
  const Order = mongoose.model('Order');
  const Wishlist = mongoose.model('Wishlist');
  const RecentlyViewed = mongoose.model('RecentlyViewed');
  const Cart = mongoose.model('Cart');

  try {
    // Get user's preferred categories from orders, wishlist, and recently viewed
    const [orderCategories, wishlistCategories, viewedCategories] = await Promise.all([
      // Categories from orders
      Order.aggregate([
        { $match: { buyer_id: new mongoose.Types.ObjectId(buyerId) } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'crafts',
            localField: 'items.craft_id',
            foreignField: '_id',
            as: 'craft'
          }
        },
        { $unwind: '$craft' },
        { $group: { _id: '$craft.category', weight: { $sum: 3 } } }
      ]),
      // Categories from wishlist
      Wishlist.aggregate([
        { $match: { buyer_id: new mongoose.Types.ObjectId(buyerId) } },
        {
          $lookup: {
            from: 'crafts',
            localField: 'craft_id',
            foreignField: '_id',
            as: 'craft'
          }
        },
        { $unwind: '$craft' },
        { $group: { _id: '$craft.category', weight: { $sum: 2 } } }
      ]),
      // Categories from recently viewed
      RecentlyViewed.aggregate([
        { $match: { buyer_id: new mongoose.Types.ObjectId(buyerId) } },
        {
          $lookup: {
            from: 'crafts',
            localField: 'craft_id',
            foreignField: '_id',
            as: 'craft'
          }
        },
        { $unwind: '$craft' },
        { $group: { _id: '$craft.category', weight: { $sum: 1 } } }
      ])
    ]);

    // Combine and sort categories by weight
    const categoryWeights = {};
    [...orderCategories, ...wishlistCategories, ...viewedCategories].forEach(cat => {
      if (cat._id) {
        categoryWeights[cat._id] = (categoryWeights[cat._id] || 0) + cat.weight;
      }
    });

    const preferredCategories = Object.entries(categoryWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    // Get excluded craft IDs (already purchased, in wishlist, in cart)
    const [purchasedCrafts, wishlistCrafts, cartCrafts] = await Promise.all([
      Order.aggregate([
        { $match: { buyer_id: new mongoose.Types.ObjectId(buyerId) } },
        { $unwind: '$items' },
        { $group: { _id: null, crafts: { $addToSet: '$items.craft_id' } } }
      ]),
      Wishlist.distinct('craft_id', { buyer_id: buyerId }),
      Cart.distinct('craft_id', { buyer_id: buyerId })
    ]);

    const excludedIds = [
      ...(purchasedCrafts[0]?.crafts || []),
      ...wishlistCrafts,
      ...cartCrafts
    ];

    // Build recommendation query
    const query = {
      status: 'approved',
      visibility: 'public',
      stock: { $gt: 0 }
    };

    if (excludedIds.length > 0) {
      query._id = { $nin: excludedIds };
    }

    if (preferredCategories.length > 0) {
      query.category = { $in: preferredCategories };
    }

    // Get recommendations
    let recommendations = await Craft.find(query)
      .populate('user_id', 'name profile_image')
      .sort({ rating: -1, created_at: -1 })
      .limit(limit)
      .lean();

    // If not enough recommendations, fill with popular items
    if (recommendations.length < limit) {
      const moreQuery = {
        status: 'approved',
        visibility: 'public',
        stock: { $gt: 0 },
        _id: { $nin: [...excludedIds, ...recommendations.map(r => r._id)] }
      };

      const moreCrafts = await Craft.find(moreQuery)
        .populate('user_id', 'name profile_image')
        .sort({ rating: -1, view_count: -1 })
        .limit(limit - recommendations.length)
        .lean();

      recommendations = [...recommendations, ...moreCrafts];
    }

    return recommendations.map(craft => ({
      id: craft._id.toString(),
      title: craft.name,
      description: craft.description,
      price: craft.price,
      images: craft.images || [],
      category: craft.category,
      stock: craft.stock,
      rating: craft.rating,
      artisan_id: craft.user_id?._id?.toString(),
      artisan_name: craft.user_id?.name,
      artisan_image: craft.user_id?.profile_image
    }));
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
};

/**
 * Get similar items based on a specific craft
 */
export const getSimilarItems = async (craftId, limit = 6) => {
  const Craft = mongoose.model('Craft');

  try {
    if (!mongoose.Types.ObjectId.isValid(craftId)) return [];

    const targetCraft = await Craft.findById(craftId).lean();
    if (!targetCraft) return [];

    const priceRange = {
      min: targetCraft.price * 0.7,
      max: targetCraft.price * 1.3
    };

    const similar = await Craft.find({
      _id: { $ne: craftId },
      status: 'approved',
      visibility: 'public',
      stock: { $gt: 0 },
      category: targetCraft.category,
      price: { $gte: priceRange.min, $lte: priceRange.max }
    })
      .populate('user_id', 'name')
      .sort({ rating: -1 })
      .limit(limit)
      .lean();

    return similar.map(craft => ({
      id: craft._id.toString(),
      title: craft.name,
      description: craft.description,
      price: craft.price,
      images: craft.images || [],
      category: craft.category,
      stock: craft.stock,
      rating: craft.rating,
      artisan_id: craft.user_id?._id?.toString(),
      artisan_name: craft.user_id?.name
    }));
  } catch (error) {
    console.error('Error getting similar items:', error);
    return [];
  }
};

/**
 * Get trending crafts
 */
export const getTrendingCrafts = async (limit = 10) => {
  const Craft = mongoose.model('Craft');

  try {
    const crafts = await Craft.find({
      status: 'approved',
      visibility: 'public',
      stock: { $gt: 0 }
    })
      .populate('user_id', 'name profile_image')
      .sort({ view_count: -1, order_count: -1, rating: -1 })
      .limit(limit)
      .lean();

    return crafts.map(craft => ({
      id: craft._id.toString(),
      title: craft.name,
      description: craft.description,
      price: craft.price,
      images: craft.images || [],
      category: craft.category,
      stock: craft.stock,
      rating: craft.rating,
      view_count: craft.view_count,
      artisan_id: craft.user_id?._id?.toString(),
      artisan_name: craft.user_id?.name,
      artisan_image: craft.user_id?.profile_image
    }));
  } catch (error) {
    console.error('Error getting trending crafts:', error);
    return [];
  }
};

/**
 * Get new arrivals
 */
export const getNewArrivals = async (limit = 10) => {
  const Craft = mongoose.model('Craft');

  try {
    const crafts = await Craft.find({
      status: 'approved',
      visibility: 'public',
      stock: { $gt: 0 },
      is_new_arrival: true
    })
      .populate('user_id', 'name profile_image')
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();

    return crafts.map(craft => ({
      id: craft._id.toString(),
      title: craft.name,
      description: craft.description,
      price: craft.price,
      images: craft.images || [],
      category: craft.category,
      stock: craft.stock,
      rating: craft.rating,
      artisan_id: craft.user_id?._id?.toString(),
      artisan_name: craft.user_id?.name,
      artisan_image: craft.user_id?.profile_image
    }));
  } catch (error) {
    console.error('Error getting new arrivals:', error);
    return [];
  }
};

/**
 * Get top rated crafts
 */
export const getTopRated = async (limit = 10) => {
  const Craft = mongoose.model('Craft');

  try {
    const crafts = await Craft.find({
      status: 'approved',
      visibility: 'public',
      stock: { $gt: 0 },
      rating: { $gte: 4 }
    })
      .populate('user_id', 'name profile_image')
      .sort({ rating: -1, review_count: -1 })
      .limit(limit)
      .lean();

    return crafts.map(craft => ({
      id: craft._id.toString(),
      title: craft.name,
      description: craft.description,
      price: craft.price,
      images: craft.images || [],
      category: craft.category,
      stock: craft.stock,
      rating: craft.rating,
      review_count: craft.review_count,
      artisan_id: craft.user_id?._id?.toString(),
      artisan_name: craft.user_id?.name,
      artisan_image: craft.user_id?.profile_image
    }));
  } catch (error) {
    console.error('Error getting top rated crafts:', error);
    return [];
  }
};

export default {
  getPersonalizedRecommendations,
  getSimilarItems,
  getTrendingCrafts,
  getNewArrivals,
  getTopRated
};
