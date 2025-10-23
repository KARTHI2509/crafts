
import pool from '../config/db.js';

/**
 * Create a new user in the database
 * @param {Object} userData - User data {name, email, password, phone, location}
 * @returns {Object} - Created user object
 */
export const createUser = async (userData) => {
  const { name, email, password, phone, location, role = 'artisan' } = userData;
  
  const query = `
    INSERT INTO users (name, email, password, phone, location, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, role, phone, location, created_at
  `;
  
  const values = [name, email, password, phone, location, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Object|null} - User object or null
 */
export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Object|null} - User object without password
 */
export const findUserById = async (id) => {
  const query = `
    SELECT id, name, email, role, phone, location, created_at, updated_at
    FROM users 
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Update user information
 * @param {number} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated user object
 */
export const updateUser = async (id, updates) => {
  const { name, phone, location } = updates;
  
  const query = `
    UPDATE users 
    SET name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        location = COALESCE($3, location)
    WHERE id = $4
    RETURNING id, name, email, role, phone, location, updated_at
  `;
  
  const values = [name, phone, location, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete user by ID
 * @param {number} id - User ID
 * @returns {boolean} - Success status
 */
export const deleteUser = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};

/**
 * Get all users (admin only)
 * @returns {Array} - Array of user objects
 */
export const getAllUsers = async () => {
  const query = `
    SELECT id, name, email, role, phone, location, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};
