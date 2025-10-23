/**
 * ============================================
 * CART CONTROLLER
 * ============================================
 * Handles shopping cart HTTP requests
 * - Get cart
 * - Add items
 * - Update quantities
 * - Remove items
 * - Clear cart
 */

import {
  getCartItems,
  getCartSummary,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  removeFromCartByCraft,
  clearCart,
  isInCart,
  getCartByArtisan,
  validateCart
} from '../models/cartModel.js';

/**
 * @desc    Get cart items for logged-in buyer
 * @route   GET /api/cart
 * @access  Private (Buyer only)
 */
export const getCart = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const items = await getCartItems(buyerId);
    const summary = await getCartSummary(buyerId);

    res.status(200).json({
      success: true,
      count: items.length,
      data: {
        items,
        summary
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private (Buyer only)
 */
export const addItemToCart = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { craft_id, quantity } = req.body;

    if (!craft_id) {
      return res.status(400).json({
        success: false,
        message: 'Craft ID is required'
      });
    }

    const qty = parseInt(quantity) || 1;

    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    const cartItem = await addToCart(buyerId, craft_id, qty);

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: { cartItem }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:id
 * @access  Private (Buyer only)
 */
export const updateCart = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const cartId = req.params.id;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    const qty = parseInt(quantity);

    const cartItem = await updateCartQuantity(cartId, buyerId, qty);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found or removed'
      });
    }

    res.status(200).json({
      success: true,
      message: qty === 0 ? 'Item removed from cart' : 'Cart updated',
      data: { cartItem }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error.message
    });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:id
 * @access  Private (Buyer only)
 */
export const removeCartItem = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const cartId = req.params.id;

    const success = await removeFromCart(cartId, buyerId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private (Buyer only)
 */
export const clearCartItems = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const success = await clearCart(buyerId);

    res.status(200).json({
      success: true,
      message: success ? 'Cart cleared successfully' : 'Cart was already empty'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};

/**
 * @desc    Check if item is in cart
 * @route   GET /api/cart/check/:craftId
 * @access  Private (Buyer only)
 */
export const checkInCart = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const craftId = req.params.craftId;

    const cartItem = await isInCart(buyerId, craftId);

    res.status(200).json({
      success: true,
      data: {
        inCart: !!cartItem,
        cartItem: cartItem || null
      }
    });
  } catch (error) {
    console.error('Check in cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking cart',
      error: error.message
    });
  }
};

/**
 * @desc    Get cart grouped by artisan (for checkout)
 * @route   GET /api/cart/grouped
 * @access  Private (Buyer only)
 */
export const getGroupedCart = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const groupedCart = await getCartByArtisan(buyerId);

    res.status(200).json({
      success: true,
      count: groupedCart.length,
      data: { groupedCart }
    });
  } catch (error) {
    console.error('Get grouped cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grouped cart',
      error: error.message
    });
  }
};

/**
 * @desc    Validate cart items
 * @route   GET /api/cart/validate
 * @access  Private (Buyer only)
 */
export const validateCartItems = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const validation = await validateCart(buyerId);

    res.status(200).json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating cart',
      error: error.message
    });
  }
};
