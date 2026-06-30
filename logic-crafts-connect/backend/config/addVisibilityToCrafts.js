/**
 * Add visibility field to crafts collection
 * Adds: visibility field with default 'public'
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Craft from '../models/Craft.js';

dotenv.config();

const addVisibilityToCrafts = async () => {
  try {
    console.log('Adding visibility field to crafts collection...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Add visibility field to all crafts where it does not exist
    const result = await Craft.updateMany(
      { visibility: { $exists: false } },
      { $set: { visibility: 'public' } }
    );

    console.log('✓ Visibility field added to crafts collection');
    console.log(`✓ ${result.modifiedCount} existing crafts set to public visibility`);

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