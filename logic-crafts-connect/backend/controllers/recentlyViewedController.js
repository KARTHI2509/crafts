/**
 * ============================================
 * RECENTLY VIEWED CONTROLLER
 * ============================================
 * Handles recently viewed crafts
 * - Track craft views
 * - Get viewed history
 * - Clear history
 * - Remove single item
 */

import User from '../models/User.js';

/**
 * Track a craft view
 * POST /api/recently-viewed
 */
export const trackCraftView = async (req, res) => {
  try {
    const { craft_id } = req.body;

    if (!craft_id) {
      return res.status(400).json({
        success: false,
        message: 'Craft ID is required'
      });
    }

    const user = await User.findById(req.user.id);

    // Remove if already exists
    user.recently_viewed = user.recently_viewed.filter(
      item => item.craft_id.toString() !== craft_id
    );

    // Add new at top
    user.recently_viewed.unshift({
      craft_id,
      viewed_at: new Date()
    });

    // Keep only latest 50
    user.recently_viewed = user.recently_viewed.slice(0, 50);

    await user.save();

    res.status(201).json({
      success: true,
      message: 'View tracked successfully'
    });

  } catch (error) {
    console.error('Track view error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to track view',
      error: error.message
    });
  }
};

/**
 * Get recently viewed crafts
 * GET /api/recently-viewed
 */
export const getRecent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const user = await User.findById(req.user.id)
      .populate('recently_viewed.craft_id');

    const items = user.recently_viewed.slice(0, limit);

    res.json({
      success: true,
      data: {
        items,
        count: items.length
      }
    });

  } catch (error) {
    console.error('Get recent error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch recently viewed',
      error: error.message
    });
  }
};

/**
 * Clear entire history
 * DELETE /api/recently-viewed/clear
 */
export const clearHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const count = user.recently_viewed.length;

    user.recently_viewed = [];

    await user.save();

    res.json({
      success: true,
      message: `${count} item(s) removed from history`,
      data: {
        removed_count: count
      }
    });

  } catch (error) {
    console.error('Clear history error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to clear history',
      error: error.message
    });
  }
};

/**
 * Remove one item
 * DELETE /api/recently-viewed/:craftId
 */
export const removeItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.recently_viewed = user.recently_viewed.filter(
      item => item.craft_id.toString() !== req.params.craftId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Item removed successfully'
    });

  } catch (error) {
    console.error('Remove item error:', error.message);

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