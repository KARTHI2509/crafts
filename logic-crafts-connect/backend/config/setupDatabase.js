/**
 * ============================================
 * DATABASE SETUP SCRIPT
 * ============================================
 * Run this file to initialize MongoDB collections
 * Command: npm run db:setup
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Craft from '../models/Craft.js';

dotenv.config();

const setupDatabase = async () => {
  try {
    console.log('Starting database setup...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✓ Connected to MongoDB');

    // Create indexes for Users
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Users indexes created');

    // Create indexes for Crafts
    await Craft.collection.createIndex({ user_id: 1 });
    await Craft.collection.createIndex({ status: 1 });

    console.log('✓ Crafts indexes created');

    // Ensure collections exist
    await User.createCollection();
    console.log('✓ Users collection ready');

    await Craft.createCollection();
    console.log('✓ Crafts collection ready');

    console.log('\n✓ Database setup completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    process.exit(1);
  }
};

setupDatabase();