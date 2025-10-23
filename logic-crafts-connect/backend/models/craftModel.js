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
  const { user_id, name, description, craft_type, price, location, image_url, contact } = craftData;
  
  const query = `
    INSERT INTO crafts (user_id, name, description, craft_type, price, location, image_url, contact)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const values = [user_id, name, description, craft_type, price, location, image_url, contact];
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Get all approved crafts (for public viewing)
 * @returns {Array} - Array of craft objects with user info
 */
export const getAllCrafts = async () => {
  const query = `
    SELECT 
      c.*,
      u.name as artisan_name,
      u.phone as artisan_phone,
      u.location as artisan_location
    FROM crafts c
    JOIN users u ON c.user_id = u.id
    WHERE c.status = 'approved'
    ORDER BY c.created_at DESC
  `;
  
  const result = await pool.query(query);
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
 * Get craft by ID
 * @param {number} id - Craft ID
 * @returns {Object|null} - Craft object or null
 */
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
    SELECT * FROM crafts
    WHERE user_id = $1
    ORDER BY created_at DESC
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
  const { name, description, craft_type, price, location, image_url, contact } = updates;
  
  const query = `
    UPDATE crafts 
    SET 
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      craft_type = COALESCE($3, craft_type),
      price = COALESCE($4, price),
      location = COALESCE($5, location),
      image_url = COALESCE($6, image_url),
      contact = COALESCE($7, contact)
    WHERE id = $8 AND user_id = $9
    RETURNING *
  `;
  
  const values = [name, description, craft_type, price, location, image_url, contact, id, userId];
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
