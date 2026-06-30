/**
 * ============================================
 * DATABASE MIGRATION SCRIPT - UPDATE ROLES
 * ============================================
 * This script updates user roles:
 * Old: 'user', 'admin'
 * New: 'artisan', 'buyer', 'admin'
 *
 * Run ONCE:
 * node config/migrateRoles.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const migrateRoles = async () => {
  try {
    console.log('Starting role migration...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✓ Connected to MongoDB');

    // Update all users with role "user" to "artisan"
    console.log('\n📝 Migrating existing users...');

    const updateResult = await User.updateMany(
      { role: 'user' },
      { $set: { role: 'artisan' } }
    );

    console.log(`✓ Updated ${updateResult.modifiedCount} user(s) from 'user' to 'artisan'`);

    // Verification
    console.log('\n📊 Verification - Current user roles:');

    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    if (roleCounts.length > 0) {
      console.table(roleCounts);
    } else {
      console.log('No users found in database yet.');
    }

    console.log('\n✅ Role migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Old roles: user, admin');
    console.log('   - New roles: artisan, buyer, admin');
    console.log('   - All "user" roles migrated to "artisan"');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
};

migrateRoles();