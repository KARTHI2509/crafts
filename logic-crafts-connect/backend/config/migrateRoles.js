/**
 * ============================================
 * DATABASE MIGRATION SCRIPT - UPDATE ROLES
 * ============================================
 * This script updates the users table to support new role system:
 * - Old: 'user' and 'admin'
 * - New: 'artisan', 'buyer', and 'admin'
 * 
 * Run this ONCE to migrate existing data:
 * Command: node config/migrateRoles.js
 */

import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateRoles = async () => {
  try {
    console.log('Starting role migration...\n');

    // Step 1: Check if migration is needed
    const checkQuery = `
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'role';
    `;
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Users table or role column not found!');
      console.log('Please run: npm run db:setup first');
      process.exit(1);
    }

    console.log('✓ Users table found');

    // Step 2: Drop the old CHECK constraint
    console.log('\n📝 Dropping old role constraint...');
    await pool.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    `);
    console.log('✓ Old constraint dropped');

    // Step 3: Update existing 'user' role to 'artisan' (before adding new constraint)
    console.log('\n📝 Migrating existing users...');
    const updateResult = await pool.query(`
      UPDATE users 
      SET role = 'artisan' 
      WHERE role = 'user';
    `);
    console.log(`✓ Updated ${updateResult.rowCount} user(s) from 'user' to 'artisan'`);

    // Step 4: Add new CHECK constraint with artisan, buyer, admin
    console.log('\n📝 Adding new role constraint...');
    await pool.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('artisan', 'buyer', 'admin'));
    `);
    console.log('✓ New constraint added: role IN (\'artisan\', \'buyer\', \'admin\')');

    // Step 5: Update default value for new users
    console.log('\n📝 Updating default role...');
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN role SET DEFAULT 'artisan';
    `);
    console.log('✓ Default role set to \'artisan\'');

    // Step 6: Verify the migration
    console.log('\n📊 Verification - Current user roles:');
    const verifyResult = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY role;
    `);
    
    if (verifyResult.rows.length > 0) {
      console.table(verifyResult.rows);
    } else {
      console.log('No users found in database yet.');
    }

    console.log('\n✅ Role migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Old roles: user, admin');
    console.log('   - New roles: artisan, buyer, admin');
    console.log('   - All "user" roles migrated to "artisan"');
    console.log('   - Default role for new users: artisan');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

migrateRoles();
