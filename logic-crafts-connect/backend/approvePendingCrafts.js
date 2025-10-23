/**
 * Quick script to approve all pending crafts
 * Run with: node approvePendingCrafts.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'logic_crafts_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

const approvePendingCrafts = async () => {
  try {
    console.log('🔍 Checking for pending crafts...\n');
    
    // Get pending crafts
    const pendingQuery = 'SELECT id, name, user_id, status FROM crafts WHERE status = $1';
    const pendingResult = await pool.query(pendingQuery, ['pending']);
    
    if (pendingResult.rows.length === 0) {
      console.log('✅ No pending crafts found!');
      pool.end();
      return;
    }
    
    console.log(`Found ${pendingResult.rows.length} pending craft(s):\n`);
    pendingResult.rows.forEach((craft, index) => {
      console.log(`${index + 1}. ID: ${craft.id} - Name: ${craft.name} - User ID: ${craft.user_id}`);
    });
    
    // Approve all pending crafts
    console.log('\n🔄 Approving all pending crafts...\n');
    const updateQuery = 'UPDATE crafts SET status = $1 WHERE status = $2 RETURNING id, name';
    const updateResult = await pool.query(updateQuery, ['approved', 'pending']);
    
    console.log('✅ Successfully approved crafts:\n');
    updateResult.rows.forEach((craft, index) => {
      console.log(`${index + 1}. ID: ${craft.id} - Name: ${craft.name}`);
    });
    
    console.log('\n🎉 All crafts have been approved and are now visible to buyers!');
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
    process.exit(1);
  }
};

approvePendingCrafts();
