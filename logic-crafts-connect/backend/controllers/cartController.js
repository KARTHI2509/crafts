import User from '../models/User.js';

/**
 * Get cart
 */
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('cart.craft_id');

    const items = user.cart;

    let totalPrice = 0;
    let totalQuantity = 0;

    items.forEach(item => {
      totalQuantity += item.quantity;
      totalPrice += item.quantity * item.craft_id.price;
    });

    res.status(200).json({
      success: true,
      count: items.length,
      data: {
        items,
        summary: {
          item_count: items.length,
          total_quantity: totalQuantity,
          total_price: totalPrice
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

/**
 * Add item to cart
 */
export const addItemToCart = async (req, res) => {
  try {
    const { craft_id, quantity } = req.body;

    const qty = parseInt(quantity) || 1;

    const user = await User.findById(req.user.id);

    const existingItem = user.cart.find(
      item => item.craft_id.toString() === craft_id
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      user.cart.push({
        craft_id,
        quantity: qty
      });
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: { cart: user.cart }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
};

/**
 * Update quantity
 */
export const updateCart = async (req, res) => {
  try {
    const { quantity } = req.body;

    const user = await User.findById(req.user.id);

    const item = user.cart.id(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error.message
    });
  }
};

/**
 * Remove item
 */
export const removeCartItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      item => item._id.toString() !== req.params.id
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing item',
      error: error.message
    });
  }
};

/**
 * Clear cart
 */
export const clearCartItems = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.cart = [];

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};

/**
 * Check if in cart
 */
export const checkInCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const cartItem = user.cart.find(
      item => item.craft_id.toString() === req.params.craftId
    );

    res.status(200).json({
      success: true,
      data: {
        inCart: !!cartItem,
        cartItem: cartItem || null
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking cart',
      error: error.message
    });
  }
};

/**
 * Grouped cart by artisan
 */
export const getGroupedCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'cart.craft_id',
        populate: {
          path: 'user_id'
        }
      });

    const grouped = {};

    user.cart.forEach(item => {
      const artisanId = item.craft_id.user_id._id.toString();

      if (!grouped[artisanId]) {
        grouped[artisanId] = {
          artisan: item.craft_id.user_id,
          items: [],
          artisan_total: 0
        };
      }

      grouped[artisanId].items.push(item);
      grouped[artisanId].artisan_total +=
        item.quantity * item.craft_id.price;
    });

    res.status(200).json({
      success: true,
      data: {
        groupedCart: Object.values(grouped)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching grouped cart',
      error: error.message
    });
  }
};

/**
 * Validate cart
 */
export const validateCartItems = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('cart.craft_id');

    const unavailableItems = user.cart.filter(
      item => item.craft_id.status !== 'approved'
    );

    const availableItems = user.cart.filter(
      item => item.craft_id.status === 'approved'
    );

    res.status(200).json({
      success: true,
      data: {
        valid: unavailableItems.length === 0,
        unavailableItems,
        availableItems,
        total_items: user.cart.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validating cart',
      error: error.message
    });
  }
};