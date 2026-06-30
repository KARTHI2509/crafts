/**
 * Setup review helpful tracking
 * Tracks which users marked which reviews as helpful
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.js';

dotenv.config();

const setupReviewHelpful = async () => {
  try {
    console.log('Setting up review helpful tracking...');

    // Connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Add helpful_by field if missing
    const result = await Review.updateMany(
      { helpful_by: { $exists: false } },
      {
        $set: {
          helpful_by: [],
          helpful_count: 0
        }
      }
    );

    console.log(`✓ Updated ${result.modifiedCount} reviews`);

    // Create index
    await Review.collection.createIndex({ helpful_count: -1 });

    console.log('✓ Index created on helpful_count');

    console.log('✅ Review helpful tracking setup complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up review helpful:', error.message);
    process.exit(1);
  }
};

setupReviewHelpful();