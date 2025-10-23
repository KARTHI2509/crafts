/**
 * ============================================
 * CART MODEL
 * ============================================
 * Handles shopping cart operations
 * - Add items to cart
 * - Update quantities
 * - Remove items
 * - Get cart contents
 * - Clear cart
 */

import pool from '../config/db.js';

/**
 * Get cart items for a buyer
 * @param {number} buyerId - Buyer user ID
 * @returns {Array} - Cart items with craft details
 */
export const getCartItems = async (buyerId) => {
  const query = `
    SELECT 
      cart.id as cart_id,
      cart.quantity,
      cart.created_at as added_at,
      c.id as craft_id,
      c.name,
      c.description,
      c.price,
      c.image_url,
      c.craft_type,
      c.location,
      c.status,
      u.id as artisan_id,
      u.name as artisan_name,
      (cart.quantity * c.price) as subtotal
    FROM cart
    JOIN crafts c ON cart.craft_id = c.id
    JOIN users u ON c.user_id = u.id
    WHERE cart.buyer_id = $1
    ORDER BY cart.created_at DESC
  `;

  const result = await pool.query(query, [buyerId]);
  return result.rows;
};

/**
 * Get cart summary (total items, total price)
 * @param {number} buyerId - Buyer user ID
 * @returns {Object} - Cart summary
 */
export const getCartSummary = async (buyerId) => {
  const query = `
    SELECT 
      COUNT(*) as item_count,
      SUM(cart.quantity) as total_quantity,
      SUM(cart.quantity * c.price) as total_price
    FROM cart
    JOIN crafts c ON cart.craft_id = c.id
    WHERE cart.buyer_id = $1
  `;

  const result = await pool.query(query, [buyerId]);
  return result.rows[0];
};

/**
 * Add item to cart
 * @param {number} buyerId - Buyer user ID
 * @param {number} craftId - Craft ID
 * @param {number} quantity - Quantity (default 1)
 * @returns {Object} - Cart item
 */
export const addToCart = async (buyerId, craftId, quantity = 1) => {
  // Check if item already exists in cart
  const checkQuery = `
    SELECT * FROM cart
    WHERE buyer_id = $1 AND craft_id = $2
  `;
  const checkResult = await pool.query(checkQuery, [buyerId, craftId]);

  if (checkResult.rows.length > 0) {
    // Update quantity if item exists
    const updateQuery = `
      UPDATE cart
      SET quantity = quantity + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE buyer_id = $2 AND craft_id = $3
      RETURNING *
    `;
    const updateResult = await pool.query(updateQuery, [quantity, buyerId, craftId]);
    return updateResult.rows[0];
  } else {
    // Insert new item
    const insertQuery = `
      INSERT INTO cart (buyer_id, craft_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [buyerId, craftId, quantity]);
    return insertResult.rows[0];
  }
};

/**
 * Update cart item quantity
 * @param {number} cartId - Cart item ID
 * @param {number} buyerId - Buyer user ID
 * @param {number} quantity - New quantity
 * @returns {Object} - Updated cart item
 */
export const updateCartQuantity = async (cartId, buyerId, quantity) => {
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    return await removeFromCart(cartId, buyerId);
  }

  const query = `
    UPDATE cart
    SET quantity = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND buyer_id = $3
    RETURNING *
  `;

  const result = await pool.query(query, [quantity, cartId, buyerId]);
  return result.rows[0];
};

/**
 * Remove item from cart
 * @param {number} cartId - Cart item ID
 * @param {number} buyerId - Buyer user ID
 * @returns {boolean} - Success status
 */
export const removeFromCart = async (cartId, buyerId) => {
  const query = `
    DELETE FROM cart
    WHERE id = $1 AND buyer_id = $2
  `;

  const result = await pool.query(query, [cartId, buyerId]);
  return result.rowCount > 0;
};

/**
 * Remove cart item by craft ID
 * @param {number} buyerId - Buyer user ID
 * @param {number} craftId - Craft ID
 * @returns {boolean} - Success status
 */
export const removeFromCartByCraft = async (buyerId, craftId) => {
  const query = `
    DELETE FROM cart
    WHERE buyer_id = $1 AND craft_id = $2
  `;

  const result = await pool.query(query, [buyerId, craftId]);
  return result.rowCount > 0;
};

/**
 * Clear entire cart
 * @param {number} buyerId - Buyer user ID
 * @returns {boolean} - Success status
 */
export const clearCart = async (buyerId) => {
  const query = `
    DELETE FROM cart
    WHERE buyer_id = $1
  `;

  const result = await pool.query(query, [buyerId]);
  return result.rowCount > 0;
};

/**
 * Check if item is in cart
 * @param {number} buyerId - Buyer user ID
 * @param {number} craftId - Craft ID
 * @returns {Object|null} - Cart item or null
 */
export const isInCart = async (buyerId, craftId) => {
  const query = `
    SELECT * FROM cart
    WHERE buyer_id = $1 AND craft_id = $2
  `;

  const result = await pool.query(query, [buyerId, craftId]);
  return result.rows[0] || null;
};

/**
 * Get cart items grouped by artisan
 * (Useful for checkout - one order per artisan)
 * @param {number} buyerId - Buyer user ID
 * @returns {Array} - Cart items grouped by artisan
 */
export const getCartByArtisan = async (buyerId) => {
  const query = `
    SELECT 
      u.id as artisan_id,
      u.name as artisan_name,
      u.email as artisan_email,
      u.location as artisan_location,
      json_agg(
        json_build_object(
          'cart_id', cart.id,
          'craft_id', c.id,
          'craft_name', c.name,
          'price', c.price,
          'quantity', cart.quantity,
          'image_url', c.image_url,
          'subtotal', cart.quantity * c.price
        )
      ) as items,
      SUM(cart.quantity * c.price) as artisan_total
    FROM cart
    JOIN crafts c ON cart.craft_id = c.id
    JOIN users u ON c.user_id = u.id
    WHERE cart.buyer_id = $1
    GROUP BY u.id, u.name, u.email, u.location
    ORDER BY u.name
  `;

  const result = await pool.query(query, [buyerId]);
  return result.rows;
};

/**
 * Validate cart items (check if still available)
 * @param {number} buyerId - Buyer user ID
 * @returns {Object} - Validation result
 */
export const validateCart = async (buyerId) => {
  const query = `
    SELECT 
      cart.id as cart_id,
      cart.craft_id,
      c.name as craft_name,
      c.status,
      c.price,
      cart.quantity
    FROM cart
    JOIN crafts c ON cart.craft_id = c.id
    WHERE cart.buyer_id = $1
  `;

  const result = await pool.query(query, [buyerId]);
  
  const unavailableItems = result.rows.filter(item => item.status !== 'approved');
  const availableItems = result.rows.filter(item => item.status === 'approved');

  return {
    valid: unavailableItems.length === 0,
    unavailableItems,
    availableItems,
    total_items: result.rows.length
  };
};
