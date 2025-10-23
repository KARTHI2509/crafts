import { getAllCrafts, getCraftsCount } from './models/craftModel.js';

const testPagination = async () => {
  try {
    console.log('Testing pagination functionality...\n');
    
    // Test getCraftsCount
    const totalCount = await getCraftsCount();
    console.log(`Total approved, public crafts: ${totalCount}\n`);
    
    // Test getAllCrafts with pagination
    const limit = 5;
    const offset = 0;
    const crafts = await getAllCrafts(limit, offset);
    
    console.log(`First ${crafts.length} crafts:`);
    crafts.forEach((craft, index) => {
      console.log(`${index + 1}. ${craft.name} - ₹${craft.price} (${craft.visibility})`);
    });
    
    console.log('\n✅ Pagination test completed successfully!');
  } catch (error) {
    console.error('❌ Pagination test failed:', error.message);
  }
};

testPagination();