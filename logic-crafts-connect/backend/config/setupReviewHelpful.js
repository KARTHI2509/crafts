/**
 * Setup review helpful tracking (MongoDB)
 * Tracks which users marked which reviews as helpful
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Review from '../models/reviewModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const setupReviewHelpful = async () => {
  try {
    console.log('Setting up review helpful tracking...\n');

    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!uri) throw new Error('MONGODB_URI or DATABASE_URL is not defined.');

    await mongoose.connect(uri);

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
