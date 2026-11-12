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

async function checkCrafts() {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.status,
        c.price,
        c.category,
        c.craft_type,
        c.location,
        CASE 
          WHEN c.image_url IS NOT NULL AND LENGTH(c.image_url) > 0 THEN 'YES (' || LENGTH(c.image_url) || ' chars)'
          ELSE 'NO'
        END as has_image,
        c.user_id,
        u.name as artisan_name,
        u.role as artisan_role,
        c.created_at
      FROM crafts c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);
    
    console.log('\n📋 Recent Crafts in Database:\n');
    
    if (result.rows.length === 0) {
      console.log('   No crafts found in database.\n');
    } else {
      result.rows.forEach((craft, index) => {
        console.log(`${index + 1}. ${craft.name}`);
        console.log(`   ID: ${craft.id}`);
        console.log(`   Status: ${craft.status}`);
        console.log(`   Price: ₹${craft.price}`);
        console.log(`   Category: ${craft.category || craft.craft_type || 'N/A'}`);
        console.log(`   Location: ${craft.location || 'N/A'}`);
        console.log(`   Has Image: ${craft.has_image}`);
        console.log(`   Artisan: ${craft.artisan_name} (ID: ${craft.user_id}, Role: ${craft.artisan_role})`);
        console.log(`   Created: ${craft.created_at}`);
        console.log('');
      });
    }
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

checkCrafts();