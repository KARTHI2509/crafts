# API Testing Guide

## Quick Start Testing

### 1. Health Check
```bash
GET http://localhost:5000/
```

Expected Response:
```json
{
  "message": "Logic Crafts Connect API",
  "status": "running",
  "version": "1.0.0"
}
```

---

## Authentication Flow

### 2. Register New User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "password": "password123",
  "phone": "+919876543210",
  "location": "Jaipur, Rajasthan"
}
```

**Response:** Save the `token` for future requests!
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "role": "user",
      "phone": "+919876543210",
      "location": "Jaipur, Rajasthan"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "rajesh@example.com",
  "password": "password123"
}
```

### 4. Get Current User
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your_token_here>
```

---

## Craft Operations

### 5. Create a Craft (Requires Auth)
```bash
POST http://localhost:5000/api/crafts
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Handmade Clay Lamp",
  "description": "Traditional handcrafted terracotta lamp",
  "craft_type": "Pottery",
  "price": 250,
  "location": "Jaipur",
  "image_url": "https://via.placeholder.com/400",
  "contact": "+919876543210"
}
```

### 6. Get All Approved Crafts (Public)
```bash
GET http://localhost:5000/api/crafts
```

### 7. Get Single Craft
```bash
GET http://localhost:5000/api/crafts/1
```

### 8. Get My Crafts (Requires Auth)
```bash
GET http://localhost:5000/api/crafts/my-crafts
Authorization: Bearer <your_token>
```

### 9. Update My Craft
```bash
PUT http://localhost:5000/api/crafts/1
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Updated Craft Name",
  "price": 300
}
```

### 10. Delete My Craft
```bash
DELETE http://localhost:5000/api/crafts/1
Authorization: Bearer <your_token>
```

---

## Admin Operations

### 11. Register Admin User (Manually update DB)
After registering a regular user, update their role in PostgreSQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### 12. Get All Crafts (Admin)
```bash
GET http://localhost:5000/api/crafts/admin/all
Authorization: Bearer <admin_token>
```

### 13. Get Pending Crafts
```bash
GET http://localhost:5000/api/crafts/admin/pending
Authorization: Bearer <admin_token>
```

### 14. Approve/Reject Craft
```bash
PATCH http://localhost:5000/api/crafts/1/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "approved"
}
```

Options: `approved`, `rejected`, `pending`

### 15. Delete Any Craft (Admin)
```bash
DELETE http://localhost:5000/api/crafts/admin/1
Authorization: Bearer <admin_token>
```

### 16. Get All Users (Admin)
```bash
GET http://localhost:5000/api/users
Authorization: Bearer <admin_token>
```

---

## User Profile

### 17. Get User Profile
```bash
GET http://localhost:5000/api/users/1
```

### 18. Update Own Profile
```bash
PUT http://localhost:5000/api/users/profile
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Rajesh Kumar Updated",
  "phone": "+919876543211",
  "location": "New Delhi"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized. Please login to access this resource."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Craft not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Error creating craft",
  "error": "Detailed error message"
}
```

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Create Craft
```bash
curl -X POST http://localhost:5000/api/crafts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Craft","description":"Test description","price":100}'
```

---

## Testing with JavaScript (Frontend)

```javascript
// Register
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});
const data = await response.json();
console.log(data);

// Create Craft (with token)
const token = localStorage.getItem('token');
const craftResponse = await fetch('http://localhost:5000/api/crafts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'My Craft',
    description: 'Craft description',
    price: 500
  })
});
```
