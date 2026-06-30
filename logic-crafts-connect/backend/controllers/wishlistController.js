import User from '../models/User.js';

/**
 * Add item to wishlist
 */
export const addItem = async (req, res) => {
  try {
    const { craft_id } = req.body;

    if (!craft_id) {
      return res.status(400).json({
        success: false,
        message: 'Craft ID is required'
      });
    }

    const user = await User.findById(req.user.id);

    if (user.wishlist.includes(craft_id)) {
      return res.status(409).json({
        success: false,
        message: 'Item already in wishlist'
      });
    }

    user.wishlist.push(craft_id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist',
      data: { wishlist: user.wishlist }
    });

  } catch (error) {
    console.error('Add to wishlist error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to add item to wishlist',
      error: error.message
    });
  }
};

/**
 * Get wishlist
 */
export const getMyWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');

    res.json({
      success: true,
      data: {
        wishlist: user.wishlist,
        count: user.wishlist.length
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

/**
 * Remove item
 */
export const removeItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(
      item => item.toString() !== req.params.craftId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });

  } catch (error) {
    console.error('Remove wishlist error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to remove item from wishlist',
      error: error.message
    });
  }
};

/**
 * Check wishlist
 */
export const checkWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const exists = user.wishlist.some(
      item => item.toString() === req.params.craftId
    );

    res.json({
      success: true,
      data: {
        in_wishlist: exists
      }
    });

  } catch (error) {
    console.error('Check wishlist error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: error.message
    });
  }
};

/**
 * Clear all wishlist
 */
export const clearAll = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const count = user.wishlist.length;

    user.wishlist = [];

    await user.save();

    res.json({
      success: true,
      message: `${count} item(s) removed from wishlist`,
      data: { removed_count: count }
    });

  } catch (error) {
    console.error('Clear wishlist error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
};

/**
 * Wishlist count
 */
export const getCount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        count: user.wishlist.length
      }
    });

  } catch (error) {
    console.error('Get count error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist count',
      error: error.message
    });
  }
};

/**
 * Move wishlist items to cart
 */
export const moveItemsToCart = async (req, res) => {
  try {
    const { craft_ids } = req.body;

    if (!craft_ids || !Array.isArray(craft_ids) || craft_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Craft IDs array is required'
      });
    }

    const user = await User.findById(req.user.id);

    craft_ids.forEach(id => {
      user.cart.push({
        craft_id: id,
        quantity: 1
      });
    });

    user.wishlist = user.wishlist.filter(
      item => !craft_ids.includes(item.toString())
    );

    await user.save();

    res.json({
      success: true,
      message: `${craft_ids.length} item(s) moved to cart`
    });

  } catch (error) {
    console.error('Move to cart error:', error.message);

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