/**
 * ============================================
 * DATABASE SETUP SCRIPT
 * ============================================
 * Run this file to create tables in PostgreSQL
 * Command: npm run db:setup
 */

import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  try {
    console.log('Starting database setup...\n');

    // Create Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'artisan' CHECK (role IN ('artisan', 'buyer', 'admin')),
        phone VARCHAR(20),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create Crafts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crafts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        craft_type VARCHAR(100),
        price DECIMAL(10, 2),
        location VARCHAR(255),
        image_url TEXT,
        contact VARCHAR(20),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Crafts table created');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_crafts_user_id ON crafts(user_id);
      CREATE INDEX IF NOT EXISTS idx_crafts_status ON crafts(status);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    console.log('✓ Indexes created');

    // Create update timestamp trigger function
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    console.log('✓ Trigger function created');

    // Create triggers for both tables
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_crafts_updated_at ON crafts;
      CREATE TRIGGER update_crafts_updated_at
        BEFORE UPDATE ON crafts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✓ Triggers created');

    console.log('\n✓ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    process.exit(1);
  }
};

setupDatabase();
