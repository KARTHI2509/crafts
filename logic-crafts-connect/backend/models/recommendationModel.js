import pool from '../config/db.js';

/**
 * Get personalized recommendations based on user behavior
 * @param {number} buyerId - Buyer ID
 * @param {number} limit - Number of recommendations
 * @returns {Array} Recommended crafts
 */
export const getPersonalizedRecommendations = async (buyerId, limit = 10) => {
  try {
    // Algorithm: Recommend based on:
    // 1. Categories from purchased items
    // 2. Categories from wishlist
    // 3. Categories from recently viewed
    // 4. High-rated items
    
    const query = `
      WITH user_preferences AS (
        -- Categories from orders
        SELECT DISTINCT c.category, 3 as weight
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN crafts c ON oi.craft_id = c.id
        WHERE o.buyer_id = $1
        
        UNION ALL
        
        -- Categories from wishlist
        SELECT DISTINCT c.category, 2 as weight
        FROM wishlist w
        JOIN crafts c ON w.craft_id = c.id
        WHERE w.buyer_id = $1
        
        UNION ALL
        
        -- Categories from recently viewed
        SELECT DISTINCT c.category, 1 as weight
        FROM recently_viewed rv
        JOIN crafts c ON rv.craft_id = c.id
        WHERE rv.buyer_id = $1
      ),
      preferred_categories AS (
        SELECT category, SUM(weight) as total_weight
        FROM user_preferences
        GROUP BY category
        ORDER BY total_weight DESC
        LIMIT 5
      ),
      excluded_crafts AS (
        -- Exclude already purchased
        SELECT DISTINCT oi.craft_id
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.buyer_id = $1
        
        UNION
        
        -- Exclude items in wishlist
        SELECT craft_id FROM wishlist WHERE buyer_id = $1
        
        UNION
        
        -- Exclude items in cart
        SELECT craft_id FROM cart WHERE buyer_id = $1
      )
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.images,
        c.category,
        c.stock,
        c.rating,
        u.id as artisan_id,
        u.name as artisan_name,
        u.profile_image as artisan_image,
        COALESCE(pc.total_weight, 0) as relevance_score
      FROM crafts c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN preferred_categories pc ON c.category = pc.category
      WHERE c.id NOT IN (SELECT craft_id FROM excluded_crafts)
        AND c.stock > 0
      ORDER BY 
        COALESCE(pc.total_weight, 0) DESC,
        c.rating DESC,
        c.created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [buyerId, limit]);
    
    const recommendations = result.rows.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));
    
    return recommendations;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    throw error;
  }
};

/**
 * Get similar items based on a specific craft
 * @param {number} craftId - Craft ID
 * @param {number} limit - Number of recommendations
 * @returns {Array} Similar crafts
 */
export const getSimilarItems = async (craftId, limit = 6) => {
  try {
    const query = `
      WITH target_craft AS (
        SELECT category, user_id, price
        FROM crafts
        WHERE id = $1
      )
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.images,
        c.category,
        c.stock,
        c.rating,
        u.id as artisan_id,
        u.name as artisan_name
      FROM crafts c
      JOIN users u ON c.user_id = u.id
      JOIN target_craft tc ON c.category = tc.category
      WHERE c.id != $1
        AND c.stock > 0
        AND c.price BETWEEN (tc.price * 0.7) AND (tc.price * 1.3)
      ORDER BY 
        c.rating DESC,
        ABS(c.price - tc.price) ASC,
        c.created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [craftId, limit]);
    
    const similar = result.rows.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));
    
    return similar;
  } catch (error) {
    console.error('Error getting similar items:', error);
    throw error;
  }
};

/**
 * Get trending crafts (most viewed/purchased recently)
 * @param {number} limit - Number of items
 * @returns {Array} Trending crafts
 */
export const getTrendingCrafts = async (limit = 10) => {
  try {
    const query = `
      WITH recent_activity AS (
        -- Recently viewed (last 7 days)
        SELECT craft_id, COUNT(*) * 1 as score
        FROM recently_viewed
        WHERE viewed_at >= NOW() - INTERVAL '7 days'
        GROUP BY craft_id
        
        UNION ALL
        
        -- Recently ordered (last 30 days)
        SELECT oi.craft_id, COUNT(*) * 3 as score
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY oi.craft_id
      )
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.images,
        c.category,
        c.stock,
        c.rating,
        u.id as artisan_id,
        u.name as artisan_name,
        COALESCE(SUM(ra.score), 0) as trending_score
      FROM crafts c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN recent_activity ra ON c.id = ra.craft_id
      WHERE c.stock > 0
      GROUP BY c.id, u.id, u.name
      ORDER BY trending_score DESC, c.rating DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    const trending = result.rows.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
      trending_score: parseInt(item.trending_score)
    }));
    
    return trending;
  } catch (error) {
    console.error('Error getting trending crafts:', error);
    throw error;
  }
};

/**
 * Get new arrivals
 * @param {number} limit - Number of items
 * @returns {Array} New crafts
 */
export const getNewArrivals = async (limit = 10) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.images,
        c.category,
        c.stock,
        c.rating,
        c.created_at,
        u.id as artisan_id,
        u.name as artisan_name
      FROM crafts c
      JOIN users u ON c.user_id = u.id
      WHERE c.stock > 0
        AND c.created_at >= NOW() - INTERVAL '30 days'
      ORDER BY c.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    const newArrivals = result.rows.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));
    
    return newArrivals;
  } catch (error) {
    console.error('Error getting new arrivals:', error);
    throw error;
  }
};

/**
 * Get top rated crafts
 * @param {number} limit - Number of items
 * @returns {Array} Top rated crafts
 */
export const getTopRated = async (limit = 10) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.images,
        c.category,
        c.stock,
        c.rating,
        u.id as artisan_id,
        u.name as artisan_name,
        COUNT(r.id) as review_count
      FROM crafts c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN reviews r ON c.id = r.craft_id
      WHERE c.stock > 0
        AND c.rating >= 4.0
      GROUP BY c.id, u.id, u.name
      HAVING COUNT(r.id) >= 3
      ORDER BY c.rating DESC, COUNT(r.id) DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    const topRated = result.rows.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
      review_count: parseInt(item.review_count)
    }));
    
    return topRated;
  } catch (error) {
    console.error('Error getting top rated crafts:', error);
    throw error;
  }
};

export default {
  getPersonalizedRecommendations,
  getSimilarItems,
  getTrendingCrafts,
  getNewArrivals,
  getTopRated
};
