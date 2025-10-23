import pool from '../config/db.js';

/**
 * Track viewed craft
 * @param {number} buyerId - Buyer ID
 * @param {number} craftId - Craft ID
 * @returns {Object} Recently viewed record
 */
export const trackView = async (buyerId, craftId) => {
  try {
    // Check if already viewed
    const existing = await pool.query(
      'SELECT id FROM recently_viewed WHERE buyer_id = $1 AND craft_id = $2',
      [buyerId, craftId]
    );
    
    if (existing.rows.length > 0) {
      // Update viewed_at to move to top
      const query = `
        UPDATE recently_viewed
        SET viewed_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [existing.rows[0].id]);
      return result.rows[0];
    } else {
      // Insert new view
      const query = `
        INSERT INTO recently_viewed (buyer_id, craft_id)
        VALUES ($1, $2)
        RETURNING *
      `;
      const result = await pool.query(query, [buyerId, craftId]);
      
      // Keep only last 50 viewed items
      await pool.query(
        `DELETE FROM recently_viewed 
         WHERE buyer_id = $1 
         AND id NOT IN (
           SELECT id FROM recently_viewed 
           WHERE buyer_id = $1 
           ORDER BY viewed_at DESC 
           LIMIT 50
         )`,
        [buyerId]
      );
      
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error tracking view:', error);
    throw error;
  }
};

/**
 * Get recently viewed items
 * @param {number} buyerId - Buyer ID
 * @param {number} limit - Number of items to return
 * @returns {Array} Recently viewed crafts
 */
export const getRecentlyViewed = async (buyerId, limit = 20) => {
  try {
    const query = `
      SELECT 
        rv.id,
        rv.craft_id,
        rv.viewed_at,
        c.title,
        c.description,
        c.price,
        c.images,
        c.category,
        c.stock,
        c.rating,
        u.id as artisan_id,
        u.name as artisan_name
      FROM recently_viewed rv
      JOIN crafts c ON rv.craft_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE rv.buyer_id = $1
      ORDER BY rv.viewed_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [buyerId, limit]);
    
    const items = result.rows.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));
    
    return items;
  } catch (error) {
    console.error('Error fetching recently viewed:', error);
    throw error;
  }
};

/**
 * Clear recently viewed history
 * @param {number} buyerId - Buyer ID
 * @returns {number} Number of items removed
 */
export const clearRecentlyViewed = async (buyerId) => {
  try {
    const result = await pool.query(
      'DELETE FROM recently_viewed WHERE buyer_id = $1',
      [buyerId]
    );
    
    return result.rowCount;
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
    throw error;
  }
};

/**
 * Remove specific item from recently viewed
 * @param {number} buyerId - Buyer ID
 * @param {number} craftId - Craft ID
 * @returns {boolean} Success status
 */
export const removeFromRecentlyViewed = async (buyerId, craftId) => {
  try {
    const result = await pool.query(
      'DELETE FROM recently_viewed WHERE buyer_id = $1 AND craft_id = $2',
      [buyerId, craftId]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error removing from recently viewed:', error);
    throw error;
  }
};

export default {
  trackView,
  getRecentlyViewed,
  clearRecentlyViewed,
  removeFromRecentlyViewed
};
