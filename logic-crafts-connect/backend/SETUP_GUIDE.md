# 🚀 QUICK SETUP GUIDE

## Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)

---

## Step-by-Step Setup

### 1. Install PostgreSQL

**Windows:**
1. Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and follow wizard
3. Set password for `postgres` user (remember this!)
4. Use default port `5432`
5. Complete installation

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Create Database

**Option A: Using psql (Command Line)**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE logic_crafts_db;

# Exit
\q
```

**Option B: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click on "Databases"
4. Create → Database
5. Name: `logic_crafts_db`
6. Save

### 3. Install Node.js Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your credentials
```

**Required changes in .env:**
```env
DB_PASSWORD=your_actual_postgres_password
JWT_SECRET=generate_random_secret_key
```

**Generate JWT Secret (optional but recommended):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Setup Database Tables

```bash
npm run db:setup
```

This will create:
- `users` table
- `crafts` table
- Indexes
- Triggers

### 6. Start the Server

**Development mode (auto-reload on changes):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 7. Verify Installation

Open browser or Postman:
```
GET http://localhost:5000/
```

Expected response:
```json
{
  "message": "Logic Crafts Connect API",
  "status": "running",
  "version": "1.0.0"
}
```

---

## 🧪 Test the API

### Create Test User

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "phone": "+919876543210",
  "location": "Mumbai"
}
```

### Create Test Craft

```bash
POST http://localhost:5000/api/crafts
Authorization: Bearer <token_from_register>
Content-Type: application/json

{
  "name": "Handmade Pottery",
  "description": "Beautiful handcrafted pottery",
  "craft_type": "Pottery",
  "price": 500,
  "image_url": "https://via.placeholder.com/400"
}
```

### Get All Crafts

```bash
GET http://localhost:5000/api/crafts
```

---

## 📱 Connect to React Frontend

### Update Frontend API Configuration

Create `frontend/src/utils/api.js`:

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Example Usage in React Components

```javascript
// Login component
import api from '../utils/api';

const handleLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message);
  }
};

// Get crafts
const fetchCrafts = async () => {
  try {
    const response = await api.get('/crafts');
    setCrafts(response.data.data.crafts);
  } catch (error) {
    console.error('Error fetching crafts:', error);
  }
};

// Create craft
const uploadCraft = async (craftData) => {
  try {
    const response = await api.post('/crafts', craftData);
    console.log('Craft uploaded:', response.data);
  } catch (error) {
    console.error('Upload failed:', error.response?.data?.message);
  }
};
```

---

## 🔧 Troubleshooting

### Database Connection Error
**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
1. Check if PostgreSQL is running:
   ```bash
   # Windows
   services.msc  # Look for "postgresql"
   
   # Mac
   brew services list
   
   # Linux
   sudo service postgresql status
   ```
2. Verify credentials in `.env`
3. Check database exists:
   ```bash
   psql -U postgres -l
   ```

### Port Already in Use
**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Change PORT in `.env` to 5001
2. Or kill process on port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### JWT Secret Not Set
**Problem:** `secretOrPrivateKey must have a value`

**Solution:**
- Add JWT_SECRET to `.env`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Copy output to `.env`

### Database Tables Not Created
**Problem:** `relation "users" does not exist`

**Solution:**
```bash
npm run db:setup
```

---

## 📊 Database Management

### View Data (psql)
```bash
# Login
psql -U postgres -d logic_crafts_db

# View users
SELECT * FROM users;

# View crafts
SELECT * FROM crafts;

# Exit
\q
```

### Make User Admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Reset Database
```bash
# Drop and recreate
psql -U postgres
DROP DATABASE logic_crafts_db;
CREATE DATABASE logic_crafts_db;
\q

# Re-run setup
npm run db:setup
```

---

## 🎯 Next Steps

1. ✅ Backend is running
2. Update React frontend to use API
3. Test authentication flow
4. Test craft CRUD operations
5. Deploy to production

---

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

Need help? Check [API_TESTING.md](./API_TESTING.md) for detailed API examples!
