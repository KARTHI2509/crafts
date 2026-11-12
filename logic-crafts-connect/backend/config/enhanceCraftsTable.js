/**
 * Enhance Crafts Table / Collection with extra fields (MongoDB)
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

const enhanceCrafts = async () => {
  try {
    console.log('Enhancing crafts collection with extra fields...\n');

    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!uri) throw new Error('MONGODB_URI or DATABASE_URL is not defined.');

    await mongoose.connect(uri);

    const result = await Craft.updateMany(
      {},
      {
        $setOnInsert: {
          stock: 10,
          delivery_days: 7,
          is_featured: false,
          is_new_arrival: false,
          made_to_order: false,
          limited_edition: false,
          visibility: 'public',
          status: 'approved'
        }
      }
    );

    console.log(`✓ Enhanced crafts documents`);
    console.log('✅ Crafts enhancement complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error enhancing crafts:', error.message);
    process.exit(1);
  }
};

enhanceCrafts();
