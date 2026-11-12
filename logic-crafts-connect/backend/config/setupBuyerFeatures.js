/**
 * ============================================
 * BUYER FEATURES SETUP SCRIPT (MongoDB)
 * ============================================
 * Initializes buyer feature collections and fields
 * Command: npm run db:setup-buyer-features
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

const setupBuyerFeatures = async () => {
  try {
    console.log('🚀 Starting Buyer Features Setup (MongoDB)...\n');

    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('MONGODB_URI or DATABASE_URL is not defined.');
    }

    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB');

    // Initialize buyer analytics fields
    const usersResult = await User.updateMany(
      { role: 'buyer' },
      {
        $set: {
          total_orders: 0,
          total_spent: 0,
          favorite_category: '',
          loyalty_points: 0,
          loyalty_level: 'bronze',
          cart: [],
          wishlist: [],
          recently_viewed: [],
          favorite_artisans: [],
          notifications: []
        }
      }
    );
    console.log(`✓ Updated ${usersResult.modifiedCount} buyer accounts`);

    // Initialize craft review-related fields
    const craftsResult = await Craft.updateMany(
      {},
      {
        $set: {
          reviews: [],
          average_rating: 0,
          total_reviews: 0
        }
      }
    );
    console.log(`✓ Updated ${craftsResult.modifiedCount} craft documents`);

    // Create indexes
    console.log('\n📊 Creating indexes...');
    await User.collection.createIndex({ role: 1 });
    await Craft.collection.createIndex({ user_id: 1 });
    await Craft.collection.createIndex({ category: 1 });
    console.log('✓ Indexes created');

    console.log('\n✅ Buyer Features Setup Completed Successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
};

setupBuyerFeatures();
