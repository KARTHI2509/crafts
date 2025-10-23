import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'logic_crafts_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function approveCrafts() {
  try {
    // Show pending crafts
    const pending = await pool.query("SELECT id, name, status FROM crafts WHERE status = 'pending'");
    console.log('\n📋 Pending Crafts:');
    if (pending.rows.length === 0) {
      console.log('   No pending crafts found.\n');
    } else {
      pending.rows.forEach(c => console.log(`   - ${c.name} (ID: ${c.id})`));
    }
    
    // Approve all pending crafts
    const result = await pool.query("UPDATE crafts SET status = 'approved' WHERE status = 'pending' RETURNING id, name, status");
    
    console.log('\n✅ Approved Crafts:');
    if (result.rows.length === 0) {
      console.log('   No crafts were approved.\n');
    } else {
      result.rows.forEach(c => console.log(`   - ${c.name} (ID: ${c.id}) - Status: ${c.status}`));
      console.log(`\n🎉 ${result.rows.length} craft(s) approved! They are now visible to buyers.\n`);
    }
    
    // Show all crafts status
    const all = await pool.query("SELECT status, COUNT(*) as count FROM crafts GROUP BY status");
    console.log('📊 Crafts Status Summary:');
    all.rows.forEach(row => console.log(`   ${row.status}: ${row.count}`));
    console.log('');
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

approveCrafts();
