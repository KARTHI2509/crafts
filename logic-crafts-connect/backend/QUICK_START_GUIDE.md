# 🚀 Quick Start Guide - User Data Storage Backend

## ✅ Complete Implementation Status

Your backend for storing user data in PostgreSQL is **100% complete and ready to use**!

---

## 📦 What's Already Implemented

### ✓ Database Layer
- **PostgreSQL connection pool** configured
- **Users table** with all necessary fields
- **Indexes** for optimized queries
- **Auto-updating timestamps**

### ✓ User Model (models/userModel.js)
- `createUser()` - Store new user in database
- `findUserByEmail()` - Retrieve user by email
- `findUserById()` - Retrieve user by ID
- `updateUser()` - Update user information
- `deleteUser()` - Delete user
- `getAllUsers()` - Get all users (admin)

### ✓ Controllers
- **authController.js** - Registration and login
- **userController.js** - Profile management

### ✓ Security Features
- Password hashing with bcrypt (10 rounds)
- JWT authentication
- SQL injection protection
- Role-based access control

### ✓ API Endpoints
- `POST /api/auth/register` - Register & store user
- `POST /api/auth/login` - Login user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users` - Get all users (admin)

---

## 🎯 How to Use (3 Simple Steps)

### Step 1: Database Setup (One-time only)

```bash
# Navigate to backend folder
cd backend

# Create database in pgAdmin
# Database name: logic_crafts_db

# Run setup script
npm run db:setup
```

**Output:**
```
✓ Users table created
✓ Crafts table created
✓ Indexes created
✓ Database setup completed successfully!
```

### Step 2: Start Server

```bash
npm start
```

**Output:**
```
✓ Database connected successfully
✓ Server running on port 5000
✓ API URL: http://localhost:5000
```

### Step 3: Register a User (Stores in Database!)

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "location": "New York, USA"
  }'
```

**Using JavaScript/React:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '+1234567890',
    location: 'New York, USA'
  })
});

const data = await response.json();
console.log('User stored in database:', data.data.user);
```

**Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": "+1234567890",
      "location": "New York, USA"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

✅ **User data is now stored in PostgreSQL database!**

---

## 📊 Database Table Structure

```sql
users table:
┌─────────────┬──────────────┬─────────────────────────────────────────┐
│ Column      │ Type         │ Description                             │
├─────────────┼──────────────┼─────────────────────────────────────────┤
│ id          │ SERIAL       │ Auto-increment primary key              │
│ name        │ VARCHAR(100) │ User's full name                        │
│ email       │ VARCHAR(255) │ Unique email (for login)                │
│ password    │ VARCHAR(255) │ Bcrypt hashed password                  │
│ role        │ VARCHAR(20)  │ 'user' or 'admin'                       │
│ phone       │ VARCHAR(20)  │ Contact number (optional)               │
│ location    │ VARCHAR(255) │ User location (optional)                │
│ created_at  │ TIMESTAMP    │ Registration date/time                  │
│ updated_at  │ TIMESTAMP    │ Last update date/time                   │
└─────────────┴──────────────┴─────────────────────────────────────────┘
```

---

## 🔐 Security Features

### 1. Password Security
- **Hashing Algorithm:** bcrypt
- **Salt Rounds:** 10
- **Storage:** Only hashed password stored
- **Comparison:** Secure bcrypt.compare()

### 2. Authentication
- **Method:** JWT (JSON Web Tokens)
- **Expiration:** 7 days (configurable)
- **Storage:** Client-side (localStorage/cookies)

### 3. SQL Injection Protection
- **Method:** Parameterized queries
- **Example:**
  ```javascript
  pool.query('SELECT * FROM users WHERE email = $1', [email])
  // NOT: pool.query(`SELECT * FROM users WHERE email = '${email}'`)
  ```

### 4. Role-Based Access
- **Middleware:** `protect`, `restrictTo('admin')`
- **Enforcement:** Server-side verification

---

## 🧪 Testing Your Implementation

### Option 1: Using Postman

1. **Register User**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body (JSON):
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "test123",
       "phone": "+1234567890",
       "location": "Boston, MA"
     }
     ```

2. **Login User**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "test123"
     }
     ```

3. **Get User Profile**
   - Method: GET
   - URL: `http://localhost:5000/api/users/1`

4. **Update Profile**
   - Method: PUT
   - URL: `http://localhost:5000/api/users/profile`
   - Headers: `Authorization: Bearer <your_token>`
   - Body (JSON):
     ```json
     {
       "name": "Updated Name",
       "location": "New Location"
     }
     ```

### Option 2: Using the Test Script

```bash
# Install node-fetch if not already installed
npm install node-fetch

# Run the test script
node test-user-storage.js
```

This will automatically test:
1. User registration (CREATE)
2. User login (READ)
3. Get profile (READ)
4. Update profile (UPDATE)

---

## 📝 Common Operations

### Check Database Contents

```sql
-- View all users
SELECT id, name, email, role, phone, location, created_at 
FROM users 
ORDER BY created_at DESC;

-- Count total users
SELECT COUNT(*) as total_users FROM users;

-- Find user by email
SELECT * FROM users WHERE email = 'john@example.com';
```

### Environment Variables (.env)

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=logic_crafts_db

JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:5173
```

---

## 🎨 Frontend Integration

### React Component Example

```jsx
import React, { useState } from 'react';

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    
    if (data.success) {
      // User data stored in database!
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      alert('Registration successful! Data stored in database.');
      window.location.href = '/dashboard';
    } else {
      alert('Error: ' + data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
      />
      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({...formData, location: e.target.value})}
      />
      <button type="submit">Register</button>
    </form>
  );
}
```

---

## 🔍 Troubleshooting

### Issue: "Database connection failed"
**Solution:**
1. Check PostgreSQL is running
2. Verify .env database credentials
3. Ensure database 'logic_crafts_db' exists

### Issue: "User already exists"
**Solution:** Email must be unique. Use different email or delete existing user.

### Issue: "Invalid token"
**Solution:** Token might be expired. Login again to get new token.

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `models/userModel.js` | Database operations |
| `controllers/authController.js` | Registration & login |
| `controllers/userController.js` | Profile management |
| `routes/authRoutes.js` | Auth endpoints |
| `routes/userRoutes.js` | User endpoints |
| `middleware/authMiddleware.js` | JWT verification |
| `config/db.js` | Database connection |
| `config/setupDatabase.js` | Table creation |
| `server.js` | Main entry point |

---

## ✨ Key Features Summary

✅ User registration with data storage  
✅ Secure password hashing (bcrypt)  
✅ JWT authentication  
✅ User login and retrieval  
✅ Profile updates  
✅ Role-based access (user/admin)  
✅ SQL injection protection  
✅ Auto-updating timestamps  
✅ Complete API documentation  
✅ Error handling  

---

## 🎉 You're All Set!

Your backend is **fully functional** and ready to store user data in PostgreSQL!

**Next Steps:**
1. Start the server: `npm start`
2. Test registration: Create a new user
3. Verify database: Check pgAdmin
4. Integrate with frontend: Use the API endpoints

---

**Questions?** Check these files:
- `USER_DATA_STORAGE_IMPLEMENTATION.md` - Complete documentation
- `FRONTEND_INTEGRATION_EXAMPLES.js` - Frontend usage examples
- `test-user-storage.js` - Automated testing script

---

**Created:** 2025-10-23  
**Status:** ✅ Production Ready
