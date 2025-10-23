/**
 * Add visibility field to crafts table
 * Adds: visibility column with default 'public'
 */

import pool from './db.js';

const addVisibilityToCrafts = async () => {
  try {
    console.log('Adding visibility field to crafts table...\n');

    // Add visibility column to crafts table
    await pool.query(`
      ALTER TABLE crafts 
      ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'hidden'))
    `);
    console.log('✓ Visibility column added to crafts table');

    // Update existing crafts to have visibility = 'public' by default
    await pool.query(`
      UPDATE crafts 
      SET visibility = 'public' 
      WHERE visibility IS NULL
    `);
    console.log('✓ Existing crafts set to public visibility');

    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_crafts_visibility ON crafts(visibility);
    `);
    console.log('✓ Visibility index created');

    console.log('\n✅ Visibility field added successfully!');
    console.log('Crafts will now have visibility = "public" by default');
    console.log('Artisans can hide crafts by setting visibility = "hidden"');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add visibility field:', error.message);
    process.exit(1);
  }
};

addVisibilityToCrafts();