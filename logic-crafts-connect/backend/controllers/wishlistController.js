import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  isInWishlist,
  clearWishlist,
  getWishlistCount,
  moveToCart
} from '../models/wishlistModel.js';

/**
 * Add item to wishlist
 * POST /api/wishlist
 * Buyer only
 */
export const addItem = async (req, res) => {
  try {
    const { craft_id } = req.body;
    const buyer_id = req.user.id;
    
    if (!craft_id) {
      return res.status(400).json({
        success: false,
        message: 'Craft ID is required'
      });
    }
    
    const item = await addToWishlist(buyer_id, craft_id);
    
    res.status(201).json({
      success: true,
      message: 'Item added to wishlist',
      data: { item }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    
    if (error.message.includes('already in wishlist')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add item to wishlist',
      error: error.message
    });
  }
};

/**
 * Get user's wishlist
 * GET /api/wishlist
 * Buyer only
 */
export const getMyWishlist = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const wishlist = await getWishlist(buyer_id);
    
    res.json({
      success: true,
      data: {
        wishlist,
        count: wishlist.length
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

/**
 * Remove item from wishlist
 * DELETE /api/wishlist/:craftId
 * Buyer only
 */
export const removeItem = async (req, res) => {
  try {
    const { craftId } = req.params;
    const buyer_id = req.user.id;
    
    await removeFromWishlist(buyer_id, craftId);
    
    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from wishlist',
      error: error.message
    });
  }
};

/**
 * Check if item is in wishlist
 * GET /api/wishlist/check/:craftId
 * Buyer only
 */
export const checkWishlist = async (req, res) => {
  try {
    const { craftId } = req.params;
    const buyer_id = req.user.id;
    
    const inWishlist = await isInWishlist(buyer_id, craftId);
    
    res.json({
      success: true,
      data: { in_wishlist: inWishlist }
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: error.message
    });
  }
};

/**
 * Clear entire wishlist
 * DELETE /api/wishlist/clear
 * Buyer only
 */
export const clearAll = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const count = await clearWishlist(buyer_id);
    
    res.json({
      success: true,
      message: `${count} item(s) removed from wishlist`,
      data: { removed_count: count }
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
};

/**
 * Get wishlist count
 * GET /api/wishlist/count
 * Buyer only
 */
export const getCount = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const count = await getWishlistCount(buyer_id);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist count',
      error: error.message
    });
  }
};

/**
 * Move items from wishlist to cart
 * POST /api/wishlist/move-to-cart
 * Buyer only
 */
export const moveItemsToCart = async (req, res) => {
  try {
    const { craft_ids } = req.body;
    const buyer_id = req.user.id;
    
    if (!craft_ids || !Array.isArray(craft_ids) || craft_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Craft IDs array is required'
      });
    }
    
    const result = await moveToCart(buyer_id, craft_ids);
    
    res.json({
      success: true,
      message: `${result.moved_count} item(s) moved to cart`,
      data: result
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move items to cart',
      error: error.message
    });
  }
};

export default {
  addItem,
  getMyWishlist,
  removeItem,
  checkWishlist,
  clearAll,
  getCount,
  moveItemsToCart
};
