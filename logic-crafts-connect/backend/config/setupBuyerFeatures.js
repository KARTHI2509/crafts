/**
 * ============================================
 * BUYER FEATURES DATABASE SETUP
 * ============================================
 * Initializes buyer feature collections and fields
 * Run: node config/setupBuyerFeatures.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Craft from '../models/Craft.js';

dotenv.config();

const setupBuyerFeatures = async () => {
  try {
    console.log('🚀 Starting Buyer Features Setup...\n');

    // Connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

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
    await Craft.collection.createIndex({ artisan_id: 1 });
    await Craft.collection.createIndex({ category: 1 });

    console.log('✓ Indexes created');

    console.log('\n✅ Buyer Features Setup Completed Successfully!\n');

    console.log('📋 Features Initialized:');
    console.log('   1. Buyer analytics');
    console.log('   2. Shopping cart');
    console.log('   3. Wishlist');
    console.log('   4. Recently viewed');
    console.log('   5. Notifications');
    console.log('   6. Favorite artisans');
    console.log('   7. Reviews system');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
};

setupBuyerFeatures();