/**
 * Add review_helpful tracking table
 * This table tracks which users marked which reviews as helpful
 */

import pool from './db.js';

const setupReviewHelpfulTable = async () => {
  try {
    console.log('Setting up review_helpful tracking table...');
    
    // Create review_helpful tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS review_helpful (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(review_id, user_id)
      )
    `);
    
    console.log('✓ review_helpful table created');
    
    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id 
      ON review_helpful(review_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id 
      ON review_helpful(user_id)
    `);
    
    console.log('✓ Indexes created on review_helpful');
    
    console.log('✅ Review helpful tracking setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up review_helpful table:', error);
    process.exit(1);
  }
};

setupReviewHelpfulTable();
