/**
 * Enhance Crafts Collection for Artisan Features
 * Adds: multiple images, stock, delivery time, featured flag, view tracking
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Craft from '../models/Craft.js';

dotenv.config();

const enhanceCraftsCollection = async () => {
  try {
    console.log('Enhancing crafts collection for artisan features...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Update existing craft documents
    const result = await Craft.updateMany(
      {},
      {
        $set: {
          images: [],
          category: '',
          stock: 0,
          delivery_days: 7,
          is_featured: false,
          is_new_arrival: false,
          view_count: 0,
          save_count: 0,
          order_count: 0,
          made_to_order: false,
          limited_edition: false,
          rating: 0.0
        }
      }
    );

    console.log('✓ New fields added to crafts collection');
    console.log(`✓ Updated ${result.modifiedCount} craft documents`);

    console.log('\n✅ Crafts collection enhancement completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Enhancement failed:', error.message);
    process.exit(1);
  }
};

enhanceCraftsCollection();