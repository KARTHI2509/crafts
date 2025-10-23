import {
  getPersonalizedRecommendations,
  getSimilarItems,
  getTrendingCrafts,
  getNewArrivals,
  getTopRated
} from '../models/recommendationModel.js';

/**
 * Get personalized recommendations
 * GET /api/recommendations/personalized
 * Buyer only
 */
export const getPersonalized = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const { limit } = req.query;
    
    const recommendations = await getPersonalizedRecommendations(
      buyer_id,
      parseInt(limit) || 10
    );
    
    res.json({
      success: true,
      message: 'Personalized recommendations based on your activity',
      data: {
        recommendations,
        count: recommendations.length
      }
    });
  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
};

/**
 * Get similar items
 * GET /api/recommendations/similar/:craftId
 * Public
 */
export const getSimilar = async (req, res) => {
  try {
    const { craftId } = req.params;
    const { limit } = req.query;
    
    const similar = await getSimilarItems(craftId, parseInt(limit) || 6);
    
    res.json({
      success: true,
      message: 'Similar items',
      data: {
        similar,
        count: similar.length
      }
    });
  } catch (error) {
    console.error('Get similar items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch similar items',
      error: error.message
    });
  }
};

/**
 * Get trending crafts
 * GET /api/recommendations/trending
 * Public
 */
export const getTrending = async (req, res) => {
  try {
    const { limit } = req.query;
    const trending = await getTrendingCrafts(parseInt(limit) || 10);
    
    res.json({
      success: true,
      message: 'Trending crafts',
      data: {
        trending,
        count: trending.length
      }
    });
  } catch (error) {
    console.error('Get trending crafts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending crafts',
      error: error.message
    });
  }
};

/**
 * Get new arrivals
 * GET /api/recommendations/new-arrivals
 * Public
 */
export const getNew = async (req, res) => {
  try {
    const { limit } = req.query;
    const newArrivals = await getNewArrivals(parseInt(limit) || 10);
    
    res.json({
      success: true,
      message: 'New arrivals in the last 30 days',
      data: {
        new_arrivals: newArrivals,
        count: newArrivals.length
      }
    });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new arrivals',
      error: error.message
    });
  }
};

/**
 * Get top rated crafts
 * GET /api/recommendations/top-rated
 * Public
 */
export const getTopRatedCrafts = async (req, res) => {
  try {
    const { limit } = req.query;
    const topRated = await getTopRated(parseInt(limit) || 10);
    
    res.json({
      success: true,
      message: 'Top rated crafts',
      data: {
        top_rated: topRated,
        count: topRated.length
      }
    });
  } catch (error) {
    console.error('Get top rated crafts error:', error);
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
