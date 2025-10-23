/**
 * ============================================
 * CRAFT MODEL
 * ============================================
 * Contains all database operations related to crafts
 * - Create craft
 * - Get all crafts
 * - Get craft by ID
 * - Get crafts by user
 * - Update craft
 * - Delete craft
 */

import pool from '../config/db.js';

/**
 * Create a new craft
 * @param {Object} craftData - Craft data
 * @returns {Object} - Created craft object
 */
export const createCraft = async (craftData) => {
  const { 
    user_id, name, description, craft_type, price, location, image_url, contact,
    images, category, stock, delivery_days, is_featured, is_new_arrival,
    made_to_order, limited_edition
  } = craftData;
  
  const query = `
    INSERT INTO crafts (
      user_id, name, description, craft_type, price, location, image_url, contact,
      images, category, stock, delivery_days, is_featured, is_new_arrival,
      made_to_order, limited_edition, visibility, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
  `;
  
  const values = [
    user_id, name, description, craft_type, price, location, 
    image_url || (images && images.length > 0 ? images[0] : null), // Fallback to first image
    contact,
    images || [], // Array of images
    category || craft_type,
    stock || 0,
    delivery_days || 7,
    is_featured || false,
    is_new_arrival || false,
    made_to_order || false,
    limited_edition || false,
    'public', // Default visibility
    'approved' // Default status for immediate visibility
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Get all approved crafts (for public viewing)
 * @param {number} limit - Number of crafts to return
 * @param {number} offset - Number of crafts to skip
 * @returns {Array} - Array of craft objects with user info
 */
export const getAllCrafts = async (limit = 50, offset = 0) => {
  const query = `
    SELECT 
      c.*,
      u.name as artisan_name,
      u.phone as artisan_phone,
      u.location as artisan_location
    FROM crafts c
    JOIN users u ON c.user_id = u.id
    WHERE c.status = 'approved' AND c.visibility = 'public'
    ORDER BY c.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

/**
 * Get all crafts (admin view - includes pending/rejected)
 * @returns {Array} - Array of all crafts
 */
export const getAllCraftsAdmin = async () => {
  const query = `
    SELECT 
      c.*,
      u.name as artisan_name,
      u.email as artisan_email
    FROM crafts c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
  `;
  
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Get total count of approved crafts
 * @returns {number} - Total count of approved crafts
 */
export const getCraftsCount = async () => {
  const query = `
    SELECT COUNT(*) as count
    FROM crafts c
    WHERE c.status = 'approved' AND c.visibility = 'public'
  `;
  
  const result = await pool.query(query);
  return parseInt(result.rows[0].count);
};
export const getCraftById = async (id) => {
  const query = `
    SELECT 
      c.*,
      u.name as artisan_name,
      u.phone as artisan_phone,
      u.email as artisan_email,
      u.location as artisan_location
    FROM crafts c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = $1
  `;
  
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Get all crafts created by a specific user
 * @param {number} userId - User ID
 * @returns {Array} - Array of craft objects
 */
export const getCraftsByUser = async (userId) => {
  const query = `
    SELECT 
      c.*,
      u.name as artisan_name,
      u.phone as artisan_phone,
      u.email as artisan_email,
      u.location as artisan_location
    FROM crafts c
    JOIN users u ON c.user_id = u.id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;
};

/**
 * Update craft information
 * @param {number} id - Craft ID
 * @param {number} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Object|null} - Updated craft object
 */
export const updateCraft = async (id, userId, updates) => {
  const { 
    name, description, craft_type, price, location, image_url, contact,
    images, category, stock, delivery_days, is_featured, is_new_arrival,
    made_to_order, limited_edition
  } = updates;
  
  const query = `
    UPDATE crafts 
    SET 
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      craft_type = COALESCE($3, craft_type),
      price = COALESCE($4, price),
      location = COALESCE($5, location),
      image_url = COALESCE($6, image_url),
      contact = COALESCE($7, contact),
      images = COALESCE($8, images),
      category = COALESCE($9, category),
      stock = COALESCE($10, stock),
      delivery_days = COALESCE($11, delivery_days),
      is_featured = COALESCE($12, is_featured),
      is_new_arrival = COALESCE($13, is_new_arrival),
      made_to_order = COALESCE($14, made_to_order),
      limited_edition = COALESCE($15, limited_edition)
    WHERE id = $16 AND user_id = $17
    RETURNING *
  `;
  
  const values = [
    name, description, craft_type, price, location, image_url, contact,
    images, category, stock, delivery_days, is_featured, is_new_arrival,
    made_to_order, limited_edition, id, userId
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Update craft status (admin only)
 * @param {number} id - Craft ID
 * @param {string} status - New status ('approved', 'rejected', 'pending')
 * @returns {Object|null} - Updated craft object
 */
export const updateCraftStatus = async (id, status) => {
  const query = `
    UPDATE crafts 
    SET status = $1
    WHERE id = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [status, id]);
  return result.rows[0] || null;
};

/**
 * Delete craft
 * @param {number} id - Craft ID
 * @param {number} userId - User ID (for authorization)
 * @returns {boolean} - Success status
 */
export const deleteCraft = async (id, userId) => {
  const query = 'DELETE FROM crafts WHERE id = $1 AND user_id = $2';
  const result = await pool.query(query, [id, userId]);
  return result.rowCount > 0;
};

/**
 * Toggle craft visibility (artisan only)
 * @param {number} id - Craft ID
 * @param {number} userId - User ID (for authorization)
 * @param {string} visibility - New visibility ('public' or 'hidden')
 * @returns {Object|null} - Updated craft object
 */
export const toggleCraftVisibility = async (id, userId, visibility) => {
  // Validate visibility
  if (!['public', 'hidden'].includes(visibility)) {
    throw new Error('Invalid visibility. Must be public or hidden');
  }
  
  const query = `
    UPDATE crafts 
    SET visibility = $1
    WHERE id = $2 AND user_id = $3
    RETURNING *
  `;
  
  const result = await pool.query(query, [visibility, id, userId]);
  return result.rows[0] || null;
};

/**
 * Delete craft (admin - no user restriction)
 * @param {number} id - Craft ID
 * @returns {boolean} - Success status
 */
export const deleteCraftAdmin = async (id) => {
  const query = 'DELETE FROM crafts WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};

/**
 * Get pending crafts (admin review)
 * @returns {Array} - Array of pending crafts
 */
export const getPendingCrafts = async () => {
  const query = `
    SELECT 
      c.*,
      u.name as artisan_name,
      u.email as artisan_email
    FROM crafts c
    JOIN users u ON c.user_id = u.id
    WHERE c.status = 'pending'
    ORDER BY c.created_at ASC
  `;
  
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Track craft view
 * @param {number} craftId - Craft ID
 * @param {number} userId - User ID (optional)
 * @returns {boolean} - Success status
 */
export const trackCraftView = async (craftId, userId = null) => {
  try {
    // Increment view count
    await pool.query(
      'UPDATE crafts SET view_count = view_count + 1 WHERE id = $1',
      [craftId]
    );

    // Track individual view if user is logged in
    if (userId) {
      await pool.query(
        `INSERT INTO craft_views (craft_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (craft_id, user_id) DO UPDATE SET viewed_at = NOW()`,
        [craftId, userId]
      );
    }

    return true;
  } catch (error) {
    console.error('Track view error:', error);
    return false;
  }
};

/**
 * Save/bookmark a craft
 * @param {number} craftId - Craft ID
 * @param {number} userId - User ID
 * @returns {boolean} - Success status
 */
export const saveCraft = async (craftId, userId) => {
  try {
    // Add to saves
    await pool.query(
      `INSERT INTO craft_saves (craft_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (craft_id, user_id) DO NOTHING`,
      [craftId, userId]
    );

    // Increment save count
    await pool.query(
      'UPDATE crafts SET save_count = save_count + 1 WHERE id = $1',
      [craftId]
    );

    return true;
  } catch (error) {
    console.error('Save craft error:', error);
    return false;
  }
};

/**
 * Unsave/unbookmark a craft
 * @param {number} craftId - Craft ID
 * @param {number} userId - User ID
 * @returns {boolean} - Success status
 */
export const unsaveCraft = async (craftId, userId) => {
  try {
    const result = await pool.query(
      'DELETE FROM craft_saves WHERE craft_id = $1 AND user_id = $2',
      [craftId, userId]
    );

    // Decrement save count if a row was deleted
    if (result.rowCount > 0) {
      await pool.query(
        'UPDATE crafts SET save_count = GREATEST(save_count - 1, 0) WHERE id = $1',
        [craftId]
      );
    }

    return result.rowCount > 0;
  } catch (error) {
    console.error('Unsave craft error:', error);
    return false;
  }
};

/**
 * Check if user has saved a craft
 * @param {number} craftId - Craft ID
 * @param {number} userId - User ID
 * @returns {boolean} - Saved status
 */
export const isCraftSaved = async (craftId, userId) => {
  try {
    const result = await pool.query(
      'SELECT 1 FROM craft_saves WHERE craft_id = $1 AND user_id = $2',
      [craftId, userId]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error('Check saved status error:', error);
    return false;
  }
};

/**
 * Get artisan statistics
 * @param {number} userId - Artisan user ID
 * @returns {Object} - Statistics object
 */
export const getArtisanStats = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_crafts,
        SUM(view_count) as total_views,
        SUM(save_count) as total_saves,
        SUM(order_count) as total_orders,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
      FROM crafts
      WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Get artisan stats error:', error);
    return null;
  }
};
