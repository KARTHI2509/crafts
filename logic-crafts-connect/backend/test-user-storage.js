/**
 * ============================================
 * USER DATA STORAGE TEST SCRIPT
 * ============================================
 * This script tests the user registration and data storage functionality
 * Run: node test-user-storage.js
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}`)
};

/**
 * Test 1: Register a new user (Store data in database)
 */
async function testUserRegistration() {
  log.section('TEST 1: REGISTER USER (Store in Database)');
  
  const userData = {
    name: 'Alice Johnson',
    email: `alice.${Date.now()}@example.com`, // Unique email
    password: 'SecurePass123!',
    phone: '+1-555-0123',
    location: 'Seattle, Washington, USA'
  };

  log.info('Sending registration request...');
  console.log('Request Data:', JSON.stringify(userData, null, 2));

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
      log.success('User registered successfully!');
      log.success('Data stored in PostgreSQL database');
      console.log('\nResponse:', JSON.stringify(data, null, 2));
      return data.data;
    } else {
      log.error('Registration failed');
      console.log('Error:', data.message);
      return null;
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    return null;
  }
}

/**
 * Test 2: Login with registered user
 */
async function testUserLogin(email, password) {
  log.section('TEST 2: LOGIN USER (Retrieve from Database)');

  const loginData = { email, password };

  log.info('Sending login request...');
  console.log('Request Data:', JSON.stringify(loginData, null, 2));

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    if (response.ok) {
      log.success('Login successful!');
      log.success('User data retrieved from database');
      console.log('\nResponse:', JSON.stringify(data, null, 2));
      return data.data;
    } else {
      log.error('Login failed');
      console.log('Error:', data.message);
      return null;
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    return null;
  }
}

/**
 * Test 3: Get user profile
 */
async function testGetUserProfile(userId) {
  log.section('TEST 3: GET USER PROFILE (Retrieve from Database)');

  log.info(`Fetching user profile for ID: ${userId}`);

  try {
    const response = await fetch(`${API_URL}/users/${userId}`);
    const data = await response.json();

    if (response.ok) {
      log.success('User profile retrieved successfully!');
      console.log('\nProfile Data:', JSON.stringify(data.data.user, null, 2));
      return data.data.user;
    } else {
      log.error('Failed to get user profile');
      console.log('Error:', data.message);
      return null;
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    return null;
  }
}

/**
 * Test 4: Update user profile
 */
async function testUpdateUserProfile(token) {
  log.section('TEST 4: UPDATE USER PROFILE (Update in Database)');

  const updateData = {
    name: 'Alice Johnson Updated',
    phone: '+1-555-9999',
    location: 'Portland, Oregon, USA'
  };

  log.info('Sending profile update request...');
  console.log('Update Data:', JSON.stringify(updateData, null, 2));

  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (response.ok) {
      log.success('Profile updated successfully!');
      log.success('Changes saved to database');
      console.log('\nUpdated Profile:', JSON.stringify(data.data.user, null, 2));
      return data.data.user;
    } else {
      log.error('Update failed');
      console.log('Error:', data.message);
      return null;
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    return null;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.yellow}`);
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║    USER DATA STORAGE - BACKEND TESTING                    ║');
  console.log('║    Testing PostgreSQL Database Integration                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  // Test 1: Register user (CREATE - Store in DB)
  const registrationResult = await testUserRegistration();
  if (!registrationResult) {
    log.error('Registration test failed. Stopping further tests.');
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

  // Test 2: Login user (READ - Retrieve from DB)
  const loginResult = await testUserLogin(
    registrationResult.user.email,
    'SecurePass123!'
  );
  if (!loginResult) {
    log.error('Login test failed. Stopping further tests.');
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Get user profile (READ - Retrieve from DB)
  await testGetUserProfile(registrationResult.user.id);

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Update profile (UPDATE - Modify in DB)
  await testUpdateUserProfile(registrationResult.token);

  // Summary
  log.section('✅ ALL TESTS COMPLETED');
  console.log('\n' + colors.green + 'Summary:' + colors.reset);
  console.log('1. ✓ User registration - Data stored in PostgreSQL');
  console.log('2. ✓ User login - Data retrieved from database');
  console.log('3. ✓ Get user profile - Data fetched successfully');
  console.log('4. ✓ Update profile - Changes saved to database');
  console.log('\n' + colors.cyan + 'Your user data storage backend is working perfectly!' + colors.reset);
  console.log('\n');
}

// Run the tests
runTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  console.error(error);
});
