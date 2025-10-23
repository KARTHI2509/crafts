/**
 * Enhance Crafts Table for Artisan Features
 * Adds: multiple images, stock, delivery time, featured flag, view tracking
 */

import pool from './db.js';

const enhanceCraftsTable = async () => {
  try {
    console.log('Enhancing crafts table for artisan features...\n');

    // Add new columns to crafts table
    await pool.query(`
      ALTER TABLE crafts 
      ADD COLUMN IF NOT EXISTS images TEXT[], -- Array of image URLs
      ADD COLUMN IF NOT EXISTS category VARCHAR(100), -- More specific than craft_type
      ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS delivery_days INTEGER DEFAULT 7,
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS made_to_order BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS limited_edition BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS rating DECIMAL(2, 1) DEFAULT 0.0
    `);
    console.log('✓ New columns added to crafts table');

    // Create craft_views tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS craft_views (
        id SERIAL PRIMARY KEY,
        craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        ip_address VARCHAR(45),
        viewed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ craft_views table created');

    // Create craft_saves (bookmarks) table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS craft_saves (
        id SERIAL PRIMARY KEY,
        craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
        buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(craft_id, buyer_id)
      )
    `);
    console.log('✓ craft_saves table created');

    // Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_craft_views_craft_id ON craft_views(craft_id);
      CREATE INDEX IF NOT EXISTS idx_craft_views_viewed_at ON craft_views(viewed_at);
      CREATE INDEX IF NOT EXISTS idx_craft_saves_craft_id ON craft_saves(craft_id);
      CREATE INDEX IF NOT EXISTS idx_craft_saves_buyer_id ON craft_saves(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_crafts_featured ON crafts(is_featured);
      CREATE INDEX IF NOT EXISTS idx_crafts_category ON crafts(category);
    `);
    console.log('✓ Indexes created');

    console.log('\n✅ Crafts table enhancement completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Enhancement failed:', error.message);
    process.exit(1);
  }
};

enhanceCraftsTable();
