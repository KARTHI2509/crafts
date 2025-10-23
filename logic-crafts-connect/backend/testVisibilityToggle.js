import pkg from 'pg';
import { toggleCraftVisibility } from './models/craftModel.js';

const { Pool } = pkg;

const testVisibilityToggle = async () => {
  try {
    console.log('Testing visibility toggle functionality...\n');
    
    // Test hiding the craft
    console.log('1. Hiding craft (ID: 1)...');
    const hiddenCraft = await toggleCraftVisibility(1, 3, 'hidden');
    console.log(`   Craft visibility: ${hiddenCraft.visibility}\n`);
    
    // Verify it's hidden
    console.log('2. Verifying craft is hidden...');
    const pool = new Pool({ 
      host: 'localhost', 
      port: 5432, 
      database: 'logic_crafts_db', 
      user: 'postgres', 
      password: '260309' 
    });
    
    const result = await pool.query('SELECT visibility FROM crafts WHERE id = 1');
    console.log(`   Database visibility: ${result.rows[0].visibility}\n`);
    
    // Test making it public again
    console.log('3. Making craft public again...');
    const publicCraft = await toggleCraftVisibility(1, 3, 'public');
    console.log(`   Craft visibility: ${publicCraft.visibility}\n`);
    
    // Verify it's public
    console.log('4. Verifying craft is public...');
    const result2 = await pool.query('SELECT visibility FROM crafts WHERE id = 1');
    console.log(`   Database visibility: ${result2.rows[0].visibility}\n`);
    
    await pool.end();
    
    console.log('✅ Visibility toggle test completed successfully!');
  } catch (error) {
    console.error('❌ Visibility toggle test failed:', error.message);
  }
};

testVisibilityToggle();