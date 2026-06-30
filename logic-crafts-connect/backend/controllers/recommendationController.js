import Craft from '../models/Craft.js';
import User from '../models/User.js';

/**
 * Personalized Recommendations
 */
export const getPersonalized = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const categories = user.recently_viewed?.map(
      item => item.category
    ) || [];

    const recommendations = await Craft.find({
      category: { $in: categories },
      status: 'approved',
      visibility: 'public'
    }).limit(parseInt(req.query.limit) || 10);

    res.json({
      success: true,
      message: 'Personalized recommendations based on your activity',
      data: {
        recommendations,
        count: recommendations.length
      }
    });

  } catch (error) {
    console.error('Get personalized recommendations error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
};

/**
 * Similar Items
 */
export const getSimilar = async (req, res) => {
  try {
    const craft = await Craft.findById(req.params.craftId);

    const similar = await Craft.find({
      category: craft.category,
      _id: { $ne: craft._id },
      status: 'approved',
      visibility: 'public'
    }).limit(parseInt(req.query.limit) || 6);

    res.json({
      success: true,
      message: 'Similar items',
      data: {
        similar,
        count: similar.length
      }
    });

  } catch (error) {
    console.error('Get similar items error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch similar items',
      error: error.message
    });
  }
};

/**
 * Trending Crafts
 */
export const getTrending = async (req, res) => {
  try {
    const trending = await Craft.find({
      status: 'approved',
      visibility: 'public'
    })
      .sort({ view_count: -1, save_count: -1 })
      .limit(parseInt(req.query.limit) || 10);

    res.json({
      success: true,
      message: 'Trending crafts',
      data: {
        trending,
        count: trending.length
      }
    });

  } catch (error) {
    console.error('Get trending crafts error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending crafts',
      error: error.message
    });
  }
};

/**
 * New Arrivals
 */
export const getNew = async (req, res) => {
  try {
    const newArrivals = await Craft.find({
      status: 'approved',
      visibility: 'public'
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 10);

    res.json({
      success: true,
      message: 'New arrivals',
      data: {
        new_arrivals: newArrivals,
        count: newArrivals.length
      }
    });

  } catch (error) {
    console.error('Get new arrivals error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch new arrivals',
      error: error.message
    });
  }
};

/**
 * Top Rated Crafts
 */
export const getTopRatedCrafts = async (req, res) => {
  try {
    const topRated = await Craft.find({
      status: 'approved',
      visibility: 'public'
    })
      .sort({ rating: -1 })
      .limit(parseInt(req.query.limit) || 10);

    res.json({
      success: true,
      message: 'Top rated crafts',
      data: {
        top_rated: topRated,
        count: topRated.length
      }
    });

  } catch (error) {
    console.error('Get top rated crafts error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch top rated crafts',
      error: error.message
    });
  }
};

export default {
  getPersonalized,
  getSimilar,
  getTrending,
  getNew,
  getTopRatedCrafts
};