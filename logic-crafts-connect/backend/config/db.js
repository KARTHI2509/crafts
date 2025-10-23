/**
 * ============================================
 * DATABASE CONFIGURATION
 * ============================================
 * This file handles PostgreSQL database connection
 * using the 'pg' library (node-postgres)
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create a connection pool
// Pool is better than single client for handling multiple requests
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'logic_crafts_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if can't connect
});

/**
 * Test database connection
 */
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`Database connected: ${client.database}`);
    client.release(); // Release the client back to the pool
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} - Query result
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

// Export the pool for direct access if needed
export default pool;
