import pool from '../config/db.js';

/**
 * Add item to wishlist
 * @param {number} buyerId - Buyer ID
 * @param {number} craftId - Craft ID
 * @returns {Object} Wishlist item
 */
export const addToWishlist = async (buyerId, craftId) => {
  try {
    // Check if already in wishlist
    const existing = await pool.query(
      'SELECT id FROM wishlist WHERE buyer_id = $1 AND craft_id = $2',
      [buyerId, craftId]
    );
    
    if (existing.rows.length > 0) {
      throw new Error('Item already in wishlist');
    }
    
    const query = `
      INSERT INTO wishlist (buyer_id, craft_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [buyerId, craftId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Get buyer's wishlist
 * @param {number} buyerId - Buyer ID
 * @returns {Array} Wishlist items with craft details
 */
export const getWishlist = async (buyerId) => {
  try {
    const query = `
      SELECT 
        w.id,
        w.craft_id,
        w.created_at,
        c.title,
        c.description,
        c.price,
        c.images,
        c.category,
        c.stock,
        c.rating,
        u.id as artisan_id,
        u.name as artisan_name,
        u.profile_image as artisan_image
      FROM wishlist w
      JOIN crafts c ON w.craft_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE w.buyer_id = $1
      ORDER BY w.created_at DESC
    `;
    
    const result = await pool.query(query, [buyerId]);
    
    const wishlist = result.rows.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));
    
    return wishlist;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

/**
 * Remove item from wishlist
 * @param {number} buyerId - Buyer ID
 * @param {number} craftId - Craft ID
 * @returns {boolean} Success status
 */
export const removeFromWishlist = async (buyerId, craftId) => {
  try {
    const result = await pool.query(
      'DELETE FROM wishlist WHERE buyer_id = $1 AND craft_id = $2',
      [buyerId, craftId]
    );
    
    if (result.rowCount === 0) {
      throw new Error('Item not found in wishlist');
    }
    
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Check if item is in wishlist
 * @param {number} buyerId - Buyer ID
 * @param {number} craftId - Craft ID
 * @returns {boolean} Is in wishlist
 */
export const isInWishlist = async (buyerId, craftId) => {
  try {
    const result = await pool.query(
      'SELECT 1 FROM wishlist WHERE buyer_id = $1 AND craft_id = $2',
      [buyerId, craftId]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    throw error;
  }
};

/**
 * Clear entire wishlist
 * @param {number} buyerId - Buyer ID
 * @returns {number} Number of items removed
 */
export const clearWishlist = async (buyerId) => {
  try {
    const result = await pool.query(
      'DELETE FROM wishlist WHERE buyer_id = $1',
      [buyerId]
    );
    
    return result.rowCount;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};

/**
 * Get wishlist count
 * @param {number} buyerId - Buyer ID
 * @returns {number} Number of items in wishlist
 */
export const getWishlistCount = async (buyerId) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM wishlist WHERE buyer_id = $1',
      [buyerId]
    );
    
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    throw error;
  }
};

/**
 * Move wishlist items to cart
 * @param {number} buyerId - Buyer ID
 * @param {Array} craftIds - Array of craft IDs to move
 * @returns {Object} Result
 */
export const moveToCart = async (buyerId, craftIds) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let movedCount = 0;
    const errors = [];
    
    for (const craftId of craftIds) {
      try {
        // Check if already in cart
        const existing = await client.query(
          'SELECT id, quantity FROM cart WHERE buyer_id = $1 AND craft_id = $2',
          [buyerId, craftId]
        );
        
        if (existing.rows.length > 0) {
          // Update quantity if already in cart
          await client.query(
            'UPDATE cart SET quantity = quantity + 1 WHERE id = $1',
            [existing.rows[0].id]
          );
        } else {
          // Add to cart
          await client.query(
            'INSERT INTO cart (buyer_id, craft_id, quantity) VALUES ($1, $2, 1)',
            [buyerId, craftId]
          );
        }
        
        // Remove from wishlist
        await client.query(
          'DELETE FROM wishlist WHERE buyer_id = $1 AND craft_id = $2',
          [buyerId, craftId]
        );
        
        movedCount++;
      } catch (err) {
        errors.push({ craft_id: craftId, error: err.message });
      }
    }
    
    await client.query('COMMIT');
    
    return {
      moved_count: movedCount,
      errors: errors.length > 0 ? errors : null
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error moving to cart:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  isInWishlist,
  clearWishlist,
  getWishlistCount,
  moveToCart
};
