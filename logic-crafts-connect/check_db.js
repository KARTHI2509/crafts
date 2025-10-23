require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'logic_crafts_db'
});

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Check users table
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('Total users:', usersResult.rows[0].count);
    
    // Check crafts table
    const craftsResult = await pool.query('SELECT COUNT(*) as count FROM crafts');
    console.log('Total crafts:', craftsResult.rows[0].count);
    
    // Check first few crafts
    const crafts = await pool.query('SELECT * FROM crafts LIMIT 3');
    console.log('Sample crafts:', crafts.rows);
    
    // Check first few users
    const users = await pool.query('SELECT id, name, email, role FROM users LIMIT 3');
    console.log('Sample users:', users.rows);
    
    pool.end();
  } catch (error) {
    console.error('Database error:', error.message);
    pool.end();
  }
}

checkDatabase();