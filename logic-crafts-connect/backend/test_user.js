import { findUserById } from './models/userModel.js';

async function testFindUserById() {
  try {
    // Test with user ID 3
    const userId = 3;
    console.log(`Fetching user with ID: ${userId}`);
    
    const user = await findUserById(userId);
    console.log('User found:', user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testFindUserById();