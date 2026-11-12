import {
  trackView,
  getRecentlyViewed,
  clearRecentlyViewed,
  removeFromRecentlyViewed
} from '../models/recentlyViewedModel.js';

/**
 * Track a craft view
 * POST /api/recently-viewed
 * Buyer only
 */
export const trackCraftView = async (req, res) => {
  try {
    const { craft_id } = req.body;
    const buyer_id = req.user.id;
    
    if (!craft_id) {
      return res.status(400).json({
        success: false,
        message: 'Craft ID is required'
      });
    }
    
    const record = await trackView(buyer_id, craft_id);
    
    res.status(201).json({
      success: true,
      message: 'View tracked',
      data: { record }
    });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track view',
      error: error.message
    });
  }
};

/**
 * Get recently viewed items
 * GET /api/recently-viewed
 * Buyer only
 */
export const getRecent = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const { limit } = req.query;
    
    const items = await getRecentlyViewed(buyer_id, parseInt(limit) || 20);
    
    res.json({
      success: true,
      data: {
        items,
        count: items.length
      }
    });
  } catch (error) {
    console.error('Get recently viewed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recently viewed items',
      error: error.message
    });
  }
};

/**
 * Clear recently viewed history
 * DELETE /api/recently-viewed/clear
 * Buyer only
 */
export const clearHistory = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const count = await clearRecentlyViewed(buyer_id);
    
    res.json({
      success: true,
      message: `${count} item(s) removed from history`,
      data: { removed_count: count }
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear history',
      error: error.message
    });
  }
};

/**
 * Remove specific item from recently viewed
 * DELETE /api/recently-viewed/:craftId
 * Buyer only
 */
export const removeItem = async (req, res) => {
  try {
    const { craftId } = req.params;
    const buyer_id = req.user.id;
    
    const removed = await removeFromRecentlyViewed(buyer_id, craftId);
    
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in recently viewed'
      });
    }
    
    res.json({
      success: true,
      message: 'Item removed from recently viewed'
    });
  } catch (error) {
    console.error('Remove from recently viewed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item',
      error: error.message
    });
  }
};

export default {
  trackCraftView,
  getRecent,
  clearHistory,
  removeItem
};
