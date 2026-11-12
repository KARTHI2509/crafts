/**
 * ============================================
 * DATABASE SETUP SCRIPT (MongoDB / Mongoose)
 * ============================================
 * Run this file to initialize MongoDB collections & indexes
 * Command: npm run db:setup
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/userModel.js';
import Craft from '../models/craftModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const setupDatabase = async () => {
  try {
    console.log('Starting MongoDB database setup...\n');

    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('MONGODB_URI or DATABASE_URL is not defined in environment variables.');
    }

    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB');

    // Create indexes for Users
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Users index created (unique email)');

    // Create indexes for Crafts
    await Craft.collection.createIndex({ user_id: 1 });
    await Craft.collection.createIndex({ status: 1 });
    await Craft.collection.createIndex({ visibility: 1 });
    console.log('✓ Crafts indexes created (user_id, status, visibility)');

    // Ensure collections exist
    await User.createCollection();
    console.log('✓ Users collection ready');

    await Craft.createCollection();
    console.log('✓ Crafts collection ready');

    console.log('\n✓ MongoDB Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    process.exit(1);
  }
};

setupDatabase();
