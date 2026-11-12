# User Data Storage - Complete Backend Implementation

## 📋 Overview
This document explains the complete backend implementation for storing and managing user data in PostgreSQL database.

---

## 🗄️ Database Schema

### Users Table Structure
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone VARCHAR(20),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Auto-incrementing unique identifier
- `name` - User's full name (required)
- `email` - Unique email address (required)
- `password` - Hashed password using bcrypt (required)
- `role` - User role: 'user' or 'admin' (default: 'user')
- `phone` - Contact phone number (optional)
- `location` - User's location/address (optional)
- `created_at` - Timestamp when user was created
- `updated_at` - Timestamp when user was last updated

---

## 📁 File Structure

```
backend/
├── config/
│   ├── db.js              # PostgreSQL connection pool
│   └── setupDatabase.js   # Database initialization script
├── models/
│   └── userModel.js       # User database operations
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── userController.js  # User management logic
├── middleware/
│   └── authMiddleware.js  # JWT authentication middleware
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   └── userRoutes.js      # User endpoints
├── .env                   # Environment variables
├── server.js              # Main server entry point
└── package.json           # Dependencies
```

---

## 🔧 Implementation Details

### 1. Database Connection (`config/db.js`)

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'logic_crafts_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**Features:**
- Connection pooling for performance
- Environment-based configuration
- Automatic connection management

---

### 2. User Model (`models/userModel.js`)

#### Create User
```javascript
export const createUser = async (userData) => {
  const { name, email, password, phone, location, role = 'user' } = userData;
  
  const query = `
    INSERT INTO users (name, email, password, phone, location, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, role, phone, location, created_at
  `;
  
  const values = [name, email, password, phone, location, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};
```

#### Find User by Email
```javascript
export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};
```

#### Find User by ID
```javascript
export const findUserById = async (id) => {
  const query = `
    SELECT id, name, email, role, phone, location, created_at, updated_at
    FROM users 
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};
```

#### Update User
```javascript
export const updateUser = async (id, updates) => {
  const { name, phone, location } = updates;
  
  const query = `
    UPDATE users 
    SET name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        location = COALESCE($3, location)
    WHERE id = $4
    RETURNING id, name, email, role, phone, location, updated_at
  `;
  
  const values = [name, phone, location, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};
```

#### Get All Users
```javascript
export const getAllUsers = async () => {
  const query = `
    SELECT id, name, email, role, phone, location, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};
```

---

### 3. Authentication Controller (`controllers/authController.js`)

#### User Registration (Stores data in database)
```javascript
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // 2. Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // 3. Hash password (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user in database
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      location
    });

    // 5. Generate JWT token
    const token = generateToken(user.id);

    // 6. Return user data (without password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
};
```

**Process Flow:**
1. ✅ Validate input data
2. ✅ Check for duplicate email
3. ✅ Hash password with bcrypt
4. ✅ **Store user data in database** via `createUser()`
5. ✅ Generate JWT token
6. ✅ Return success response

#### User Login
```javascript
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // 2. Find user in database
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 3. Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user.id);

    // 5. Return user data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};
```

---

### 4. User Controller (`controllers/userController.js`)

#### Get User Profile
```javascript
export const getUserProfile = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};
```

#### Update User Profile
```javascript
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;

    const updatedUser = await updateUser(req.user.id, {
      name,
      phone,
      location
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};
```

---

## 🚀 API Endpoints

### Authentication Endpoints

#### 1. Register User (Stores data in DB)
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "location": "New York, USA"
}

Response (201 Created):
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

#### 2. Login User
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
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

### User Management Endpoints

#### 3. Get User Profile
```
GET /api/users/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": "+1234567890",
      "location": "New York, USA",
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

#### 4. Update User Profile (Protected)
```
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "John Updated",
  "phone": "+9876543210",
  "location": "Los Angeles, USA"
}

Response (200 OK):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Updated",
      "email": "john@example.com",
      "role": "user",
      "phone": "+9876543210",
      "location": "Los Angeles, USA",
      "updated_at": "2025-01-15T11:45:00.000Z"
    }
  }
}
```

#### 5. Get All Users (Admin Only)
```
GET /api/users
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "count": 5,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "phone": "+1234567890",
        "location": "New York, USA",
        "created_at": "2025-01-15T10:30:00.000Z"
      },
      // ... more users
    ]
  }
}
```

---

## 🔒 Security Features

### 1. Password Hashing
- **Algorithm:** bcrypt
- **Salt Rounds:** 10
- **Implementation:**
  ```javascript
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  ```

### 2. JWT Authentication
- **Secret:** Stored in environment variable
- **Expiration:** 7 days (configurable)
- **Token Format:** Bearer token in Authorization header

### 3. SQL Injection Protection
- **Method:** Parameterized queries
- **Example:**
  ```javascript
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  ```

### 4. Password Never Returned
- User queries exclude password field
- Only returned during internal authentication

### 5. Role-Based Access Control
- Middleware checks user roles
- Admin-only endpoints protected

---

## 📦 Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` file with:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=logic_crafts_db

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:5173
```

### 3. Create Database
Open pgAdmin and create database:
```sql
CREATE DATABASE logic_crafts_db;
```

### 4. Setup Database Tables
```bash
npm run db:setup
```

This creates:
- `users` table
- `crafts` table
- Indexes for performance
- Triggers for auto-updating timestamps

### 5. Start Server
```bash
npm start
```

Server runs on: `http://localhost:5000`

---

## 🧪 Testing the Implementation

### Using cURL

#### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "location": "Boston, MA"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

#### Get User Profile
```bash
curl http://localhost:5000/api/users/1
```

#### Update Profile (with token)
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Jane Updated",
    "location": "San Francisco, CA"
  }'
```

### Using Postman

1. Create a new collection: "Logic Crafts API"
2. Add requests for each endpoint
3. Use environment variables for base URL and token
4. Test registration → login → profile update flow

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │
       │ POST /api/auth/register
       │ { name, email, password, phone, location }
       ▼
┌──────────────────┐
│  Auth Controller │
│  (register)      │
└────────┬─────────┘
         │
         │ 1. Validate input
         │ 2. Check duplicate email
         │ 3. Hash password
         ▼
┌──────────────────┐
│   User Model     │
│  (createUser)    │
└────────┬─────────┘
         │
         │ INSERT INTO users...
         ▼
┌──────────────────┐
│   PostgreSQL     │
│   Database       │
│  (users table)   │
└────────┬─────────┘
         │
         │ RETURNING user data
         ▼
┌──────────────────┐
│  Auth Controller │
│  (return response)│
└────────┬─────────┘
         │
         │ { success, user, token }
         ▼
┌─────────────┐
│   Client    │
│  (Frontend) │
└─────────────┘
```

---

## ✅ Success Checklist

- [x] PostgreSQL database connection configured
- [x] Users table schema created
- [x] User model with CRUD operations
- [x] Password hashing with bcrypt
- [x] JWT token generation
- [x] User registration endpoint
- [x] User login endpoint
- [x] Profile update endpoint
- [x] Get user profile endpoint
- [x] Admin: Get all users endpoint
- [x] Authentication middleware
- [x] Role-based access control
- [x] SQL injection protection
- [x] Error handling
- [x] Environment configuration

---

## 🎯 Key Takeaways

1. **User data is stored in PostgreSQL** using parameterized queries
2. **Passwords are hashed** before storage using bcrypt
3. **JWT tokens** are used for stateless authentication
4. **Role-based access** ensures proper authorization
5. **Environment variables** keep sensitive data secure
6. **MVC pattern** maintains clean code structure

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [bcrypt Library](https://www.npmjs.com/package/bcryptjs)
- [JSON Web Tokens](https://jwt.io/)
- [Node-Postgres (pg)](https://node-postgres.com/)

---

**Created:** 2025-10-23  
**Version:** 1.0.0  
**Status:** ✅ Complete Implementation
