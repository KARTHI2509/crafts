/**
 * Add visibility field to crafts collection (MongoDB)
 * Adds: visibility field with default 'public'
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Craft from '../models/craftModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const addVisibilityToCrafts = async () => {
  try {
    console.log('Adding visibility field to crafts collection...\n');

    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!uri) throw new Error('MONGODB_URI or DATABASE_URL is not defined.');

    await mongoose.connect(uri);

    const result = await Craft.updateMany(
      { visibility: { $exists: false } },
      { $set: { visibility: 'public' } }
    );

    console.log('✓ Visibility field added to crafts collection');
    console.log(`✓ ${result.modifiedCount} existing crafts updated`);
    console.log('\n✅ Visibility field added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add visibility field:', error.message);
    process.exit(1);
  }
};

addVisibilityToCrafts();
