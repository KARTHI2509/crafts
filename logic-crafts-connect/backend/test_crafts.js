import { getCraftsByUser } from './models/craftModel.js';

async function testGetCraftsByUser() {
  try {
    // Test with a user ID that should have crafts
    const userId = 3; // Based on the earlier test result
    console.log(`Fetching crafts for user ID: ${userId}`);
    
    const crafts = await getCraftsByUser(userId);
    console.log('Crafts found:', crafts.length);
    console.log('Crafts:', crafts);
  } catch (error) {
    console.error('Error fetching crafts:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testGetCraftsByUser();