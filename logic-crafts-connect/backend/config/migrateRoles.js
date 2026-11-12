/**
 * ============================================
 * DATABASE MIGRATION SCRIPT - UPDATE ROLES (MongoDB)
 * ============================================
 * Updates users with old 'user' role to 'artisan'
 * Command: npm run db:migrate-roles
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const migrateRoles = async () => {
  try {
    console.log('Starting role migration...\n');

    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('MONGODB_URI or DATABASE_URL is not defined.');
    }

    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB');

    const result = await User.updateMany(
      { role: 'user' },
      { $set: { role: 'artisan' } }
    );

    console.log(`✓ Migrated ${result.modifiedCount} users to artisan role`);
    console.log('\n✓ Role migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
};

migrateRoles();
