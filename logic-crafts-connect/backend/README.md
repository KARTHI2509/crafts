# Logic Crafts Connect - Backend API

Backend REST API for the Logic Crafts Connect marketplace platform where local artisans can showcase and sell their handmade crafts.

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📁 Project Structure

```
backend/
├── server.js                 # Main entry point
├── config/
│   ├── db.js                # Database connection
│   └── setupDatabase.js     # Database setup script
├── models/
│   ├── userModel.js         # User database operations
│   └── craftModel.js        # Craft database operations
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── craftRoutes.js       # Craft CRUD routes
│   └── userRoutes.js        # User routes
├── controllers/
│   ├── authController.js    # Auth logic (register/login)
│   ├── craftController.js   # Craft logic
│   └── userController.js    # User logic
├── middleware/
│   └── authMiddleware.js    # JWT authentication
├── package.json
├── .env                     # Environment variables (create this)
└── README.md
```

## 🛠️ Setup Instructions

### 1. Install PostgreSQL

**Windows:**
- Download from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
- Install and remember the password you set for the `postgres` user
- Default port is `5432`

### 2. Create Database

Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE logic_crafts_db;
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the backend folder:

```bash
cp .env.example .env
```

Edit `.env` and add your PostgreSQL credentials:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
DB_NAME=logic_crafts_db

# JWT Configuration
JWT_SECRET=your_random_secret_key_12345
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 5. Setup Database Tables

Run the database setup script to create tables:

```bash
npm run db:setup
```

This will create:
- `users` table
- `crafts` table
- Indexes for performance
- Auto-update timestamp triggers

### 6. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Craft Routes (`/api/crafts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/crafts` | Get all approved crafts | No |
| GET | `/api/crafts/:id` | Get single craft | No |
| POST | `/api/crafts` | Create new craft | Yes |
| GET | `/api/crafts/my-crafts` | Get user's crafts | Yes |
| PUT | `/api/crafts/:id` | Update own craft | Yes (Owner) |
| DELETE | `/api/crafts/:id` | Delete own craft | Yes (Owner) |
| GET | `/api/crafts/admin/all` | Get all crafts | Yes (Admin) |
| GET | `/api/crafts/admin/pending` | Get pending crafts | Yes (Admin) |
| PATCH | `/api/crafts/:id/status` | Approve/reject craft | Yes (Admin) |
| DELETE | `/api/crafts/admin/:id` | Delete any craft | Yes (Admin) |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/:id` | Get user profile | No |
| PUT | `/api/users/profile` | Update own profile | Yes |
| GET | `/api/users` | Get all users | Yes (Admin) |

## 🔐 Authentication

The API uses JWT (JSON Web Token) for authentication.

### Register/Login Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using Token in Requests

Include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## 📝 Example API Calls

### Register User

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+919876543210",
  "location": "Mumbai"
}
```

### Login

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Craft (Requires Auth)

```bash
POST http://localhost:5000/api/crafts
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Handmade Pottery Vase",
  "description": "Beautiful handcrafted ceramic vase",
  "craft_type": "Pottery",
  "price": 500,
  "location": "Jaipur",
  "image_url": "https://example.com/image.jpg",
  "contact": "+919876543210"
}
```

### Get All Crafts

```bash
GET http://localhost:5000/api/crafts
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  phone VARCHAR(20),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Crafts Table

```sql
CREATE TABLE crafts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  craft_type VARCHAR(100),
  price DECIMAL(10, 2),
  location VARCHAR(255),
  image_url TEXT,
  contact VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔗 Connecting to React Frontend

In your React app, configure Axios or fetch:

```javascript
// api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 🧪 Testing the API

You can test using:
- **Postman** - Import endpoints
- **Thunder Client** (VS Code extension)
- **curl** commands
- Frontend application

## 🐛 Troubleshooting

**Database connection error:**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists

**Port already in use:**
- Change PORT in `.env`
- Kill process using port 5000

**JWT token errors:**
- Check JWT_SECRET is set
- Verify token format in headers

## 📦 Dependencies

- `express` - Web framework
- `pg` - PostgreSQL client
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables
- `cors` - Cross-origin requests
- `express-validator` - Input validation
- `nodemon` - Development auto-reload

## 👨‍💻 Development

```bash
# Install dependencies
npm install

# Setup database
npm run db:setup

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome!

---

Made with ❤️ for local artisans
