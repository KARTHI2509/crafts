# Backend Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│                     (localhost:5173)                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP Requests (REST API)
                            │ JSON + JWT Token
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Express Backend                             │
│                     (localhost:5000)                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Middleware Layer                        │  │
│  │  • CORS             • Body Parser                          │  │
│  │  • JWT Auth         • Error Handler                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                        Routes                              │  │
│  │  /api/auth  →  authRoutes.js                              │  │
│  │  /api/crafts → craftRoutes.js                             │  │
│  │  /api/users → userRoutes.js                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Controllers                            │  │
│  │  authController  → Register, Login, GetMe                 │  │
│  │  craftController → CRUD Operations                        │  │
│  │  userController  → User Management                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                       Models                               │  │
│  │  userModel.js   → Database Queries for Users              │  │
│  │  craftModel.js  → Database Queries for Crafts             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ SQL Queries
                             │ pg Pool Connection
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│                     (localhost:5432)                             │
│                                                                   │
│  ┌──────────────────┐         ┌────────────────────┐           │
│  │   users table    │         │   crafts table     │           │
│  ├──────────────────┤         ├────────────────────┤           │
│  │ id (PK)          │         │ id (PK)            │           │
│  │ name             │◄────────│ user_id (FK)       │           │
│  │ email (UNIQUE)   │         │ name               │           │
│  │ password (hash)  │         │ description        │           │
│  │ role             │         │ craft_type         │           │
│  │ phone            │         │ price              │           │
│  │ location         │         │ status             │           │
│  │ created_at       │         │ image_url          │           │
│  │ updated_at       │         │ created_at         │           │
│  └──────────────────┘         └────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### Example: User Registration

```
1. Frontend sends POST /api/auth/register
   ↓
2. Express server.js receives request
   ↓
3. CORS & Body Parser middleware process request
   ↓
4. Route: authRoutes.js → /register endpoint
   ↓
5. Controller: authController.register()
   - Validates input
   - Hashes password with bcrypt
   ↓
6. Model: userModel.createUser()
   - Executes SQL INSERT query
   - Returns user data
   ↓
7. Controller generates JWT token
   ↓
8. Response sent back to frontend
   {
     "success": true,
     "data": { user, token }
   }
```

### Example: Creating a Craft (Authenticated)

```
1. Frontend sends POST /api/crafts with JWT token
   ↓
2. Express receives request
   ↓
3. Middleware: protect (authMiddleware)
   - Extracts token from header
   - Verifies JWT signature
   - Fetches user from database
   - Attaches user to req.user
   ↓
4. Route: craftRoutes.js → POST /
   ↓
5. Controller: craftController.createNewCraft()
   - Validates craft data
   - Uses req.user.id for user_id
   ↓
6. Model: craftModel.createCraft()
   - Executes SQL INSERT
   - Returns created craft
   ↓
7. Response sent to frontend
   {
     "success": true,
     "data": { craft }
   }
```

## File Dependencies

```
server.js
├── config/db.js (database connection)
├── routes/
│   ├── authRoutes.js
│   │   ├── controllers/authController.js
│   │   │   ├── models/userModel.js
│   │   │   │   └── config/db.js
│   │   │   └── jsonwebtoken, bcryptjs
│   │   └── middleware/authMiddleware.js
│   │
│   ├── craftRoutes.js
│   │   ├── controllers/craftController.js
│   │   │   └── models/craftModel.js
│   │   │       └── config/db.js
│   │   └── middleware/authMiddleware.js
│   │
│   └── userRoutes.js
│       ├── controllers/userController.js
│       │   └── models/userModel.js
│       └── middleware/authMiddleware.js
└── middleware/authMiddleware.js
    ├── models/userModel.js
    └── jsonwebtoken
```

## Security Features

### 1. Password Security
```
User Password → bcrypt.hash(password, 10) → Hashed Password
                                              ↓
                                     Stored in Database
                                              ↓
Login Attempt → bcrypt.compare(input, hash) → Match?
```

### 2. JWT Authentication
```
Login Success → jwt.sign({ id }, SECRET) → Token
                                             ↓
                              Sent to Frontend (stored in localStorage)
                                             ↓
Next Request → Authorization: Bearer <token>
                                             ↓
Backend → jwt.verify(token, SECRET) → Valid? → Continue
                                       Invalid → 401 Error
```

### 3. Role-Based Access Control (RBAC)
```
Request → protect middleware → User authenticated?
                                       ↓ Yes
                             restrictTo('admin') → User is admin?
                                                         ↓ Yes
                                                  Controller Action
                                                         ↓ No
                                                   403 Forbidden
```

## Database Relationships

```
users (1) ────── (many) crafts
  │                       │
  └─ One user can create multiple crafts
  └─ One craft belongs to one user (user_id foreign key)
  └─ CASCADE DELETE: If user deleted → their crafts deleted
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev mode only)"
}
```

## Environment Variables Flow

```
.env file
  ↓
dotenv.config()
  ↓
process.env.DB_HOST
process.env.DB_PASSWORD
process.env.JWT_SECRET
  ↓
Used across application
```

## Port Configuration

| Service    | Port | URL                      |
|------------|------|--------------------------|
| Frontend   | 5173 | http://localhost:5173    |
| Backend    | 5000 | http://localhost:5000    |
| PostgreSQL | 5432 | postgres://localhost:5432|

## Key Technologies

- **Express.js**: Web framework for routing and middleware
- **PostgreSQL**: Relational database for data storage
- **pg**: PostgreSQL client for Node.js
- **bcryptjs**: Password hashing and verification
- **jsonwebtoken**: JWT creation and verification
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing

## Development Workflow

```
1. Make code changes
   ↓
2. nodemon detects changes
   ↓
3. Server automatically restarts
   ↓
4. Test with Postman/Frontend
   ↓
5. Check terminal for logs
   ↓
6. Repeat
```

---

This architecture ensures:
- ✅ Separation of concerns
- ✅ Secure authentication
- ✅ Scalable code structure
- ✅ Easy maintenance
- ✅ Clear data flow
