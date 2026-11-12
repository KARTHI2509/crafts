# 🎭 Buyer & Artisan Roles - Complete Implementation Guide

## 📋 Overview

This document describes the implementation of separate **Buyer** and **Artisan** roles with dedicated dashboards for each user type.

---

## 🎯 Role System

### User Roles:
1. **Artisan** (Seller/Creator)
   - Can upload and manage crafts
   - Has analytics dashboard
   - Can view orders and earnings
   
2. **Buyer** (Customer)
   - Can browse and purchase crafts
   - Has order history
   - Can favorite items

3. **Admin** (Administrator)
   - Can approve/reject crafts
   - Manage users
   - View platform analytics

---

## 🗄️ Database Changes

### Users Table Schema:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'artisan' CHECK (role IN ('artisan', 'buyer', 'admin')),
  phone VARCHAR(20),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Completed:
- ✅ Old roles: `user`, `admin`
- ✅ New roles: `artisan`, `buyer`, `admin`
- ✅ All existing "user" roles migrated to "artisan"
- ✅ Default role for new users: `artisan`

---

## 🔧 Implementation Changes

### 1. Backend Changes

#### `config/setupDatabase.js`
Updated role constraint:
```javascript
role VARCHAR(20) DEFAULT 'artisan' CHECK (role IN ('artisan', 'buyer', 'admin'))
```

#### `models/userModel.js`
Updated default role:
```javascript
const { name, email, password, phone, location, role = 'artisan' } = userData;
```

#### `config/migrateRoles.js` (NEW)
Migration script to update existing database:
- Drops old constraint
- Updates existing users
- Adds new constraint
- Updates default value

---

### 2. Frontend Changes

#### `pages/Register.jsx`
- Removed role mapping
- Sends role directly: `'artisan'` or `'buyer'`
- Updated form to handle both roles

#### `components/RoleBasedRoute.jsx`
- Added support for buyer and artisan roles
- Backwards compatibility for legacy 'user' role
- Clear access denied messages

#### `context/AuthContext.jsx`
- Role-based redirect on login
- Maps roles to appropriate dashboards:
  - `artisan` → `/artisan-dashboard`
  - `buyer` → `/buyer-dashboard`
  - `admin` → `/admin-dashboard`

#### `App.jsx`
- Route protection for each dashboard
- Role-specific redirects

---

## 🚀 How It Works

### Registration Flow:
```
1. User visits /register
   │
2. Selects role: ○ Artisan  ○ Buyer
   │
3. Fills form and submits
   │
4. Backend stores with selected role
   │
5. User redirects to /login
   │
6. User logs in
   │
7. Redirected based on role:
   ├─→ Artisan → /artisan-dashboard
   └─→ Buyer → /buyer-dashboard
```

### Login Flow:
```
1. User enters credentials
   │
2. Backend validates and returns user data
   │
3. Frontend stores: token, user, role
   │
4. AuthContext checks role
   │
5. Redirects to appropriate dashboard:
   ├─→ role='artisan' → /artisan-dashboard
   ├─→ role='buyer' → /buyer-dashboard
   └─→ role='admin' → /admin-dashboard
```

---

## 📊 Dashboard Features

### Artisan Dashboard (`/artisan-dashboard`)
Features:
- ✅ Upload new crafts
- ✅ View and manage existing crafts
- ✅ Analytics (views, sales, earnings)
- ✅ Order management
- ✅ Profile settings

Protected by:
```jsx
<RoleBasedRoute role="artisan">
  <ArtisanDashboard />
</RoleBasedRoute>
```

### Buyer Dashboard (`/buyer-dashboard`)
Features:
- ✅ Browse crafts
- ✅ Order history
- ✅ Favorites
- ✅ Profile settings
- ✅ Wishlist

Protected by:
```jsx
<RoleBasedRoute role="buyer">
  <BuyerDashboard />
</RoleBasedRoute>
```

### Admin Dashboard (`/admin-dashboard`)
Features:
- ✅ Approve/reject crafts
- ✅ User management
- ✅ Platform analytics
- ✅ Event management

Protected by:
```jsx
<RoleBasedRoute role="admin">
  <AdminDashboard_Role />
</RoleBasedRoute>
```

---

## 🧪 Testing Instructions

### Test 1: Register as Artisan

1. **Go to:** `http://localhost:5174/register`

2. **Fill form:**
   ```
   Name: John Artisan
   Email: john.artisan@example.com
   Password: password123
   Role: ● Artisan (Seller)
   Location: Mumbai, India
   ```

3. **Expected:**
   - ✅ Registration successful
   - ✅ Redirects to /login
   - ✅ Database role = 'artisan'

4. **Login and verify:**
   - ✅ Redirects to `/artisan-dashboard`
   - ✅ Can access artisan features

---

### Test 2: Register as Buyer

1. **Go to:** `http://localhost:5174/register`

2. **Fill form:**
   ```
   Name: Jane Buyer
   Email: jane.buyer@example.com
   Password: password123
   Role: ○ Buyer
   Location: Delhi, India
   ```

3. **Expected:**
   - ✅ Registration successful
   - ✅ Redirects to /login
   - ✅ Database role = 'buyer'

4. **Login and verify:**
   - ✅ Redirects to `/buyer-dashboard`
   - ✅ Can access buyer features

---

### Test 3: Role-Based Access Control

**Test 3a: Buyer tries to access Artisan Dashboard**
```
1. Login as buyer
2. Navigate to /artisan-dashboard
3. Expected: ❌ Access Denied message
```

**Test 3b: Artisan tries to access Buyer Dashboard**
```
1. Login as artisan
2. Navigate to /buyer-dashboard
3. Expected: ❌ Access Denied message
```

**Test 3c: Non-admin tries to access Admin Dashboard**
```
1. Login as artisan or buyer
2. Navigate to /admin-dashboard
3. Expected: ❌ Access Denied message
```

---

## 🔍 Database Verification

### Check User Roles:
```sql
SELECT id, name, email, role, created_at
FROM users
ORDER BY created_at DESC;
```

### Count by Role:
```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;
```

Expected output:
```
┌─────────┬───────┐
│ role    │ count │
├─────────┼───────┤
│ artisan │   5   │
│ buyer   │   3   │
│ admin   │   1   │
└─────────┴───────┘
```

---

## 🎨 Frontend Routes Summary

| Route | Component | Required Role | Description |
|-------|-----------|---------------|-------------|
| `/` | Home | Public | Landing page |
| `/explore` | Explore | Public | Browse crafts |
| `/login` | Login | Public | User login |
| `/register` | Register | Public | User registration |
| `/artisan-dashboard` | ArtisanDashboard | artisan | Artisan dashboard |
| `/buyer-dashboard` | BuyerDashboard | buyer | Buyer dashboard |
| `/admin-dashboard` | AdminDashboard_Role | admin | Admin dashboard |
| `/upload` | UploadCraft | Authenticated | Upload crafts |

---

## 🔐 Security Features

### Role Verification:
1. **Frontend Route Protection:**
   - `<ProtectedRoute>` - Requires authentication
   - `<RoleBasedRoute role="X">` - Requires specific role

2. **Backend Middleware:**
   ```javascript
   // Protect route
   protect  // Requires valid JWT
   
   // Restrict to role
   restrictTo('admin')  // Only admin can access
   ```

3. **Database Constraints:**
   ```sql
   CHECK (role IN ('artisan', 'buyer', 'admin'))
   ```

---

## 📝 Migration Checklist

- [x] Update database schema
- [x] Run migration script
- [x] Update backend models
- [x] Update frontend registration
- [x] Update role-based routing
- [x] Test artisan registration
- [x] Test buyer registration
- [x] Test role-based access
- [x] Verify database roles
- [x] Test login redirects

---

## 🚦 Quick Start Commands

### Run Migration:
```bash
cd backend
npm run db:migrate-roles
```

### Start Backend:
```bash
cd backend
npm start
```

### Start Frontend:
```bash
cd frontend
npm run dev
```

### Test Registration:
1. Open: `http://localhost:5174/register`
2. Select role: Artisan or Buyer
3. Fill form and register
4. Login and verify dashboard

---

## 🐛 Troubleshooting

### Issue 1: "check constraint violated"
**Solution:** Run the migration script:
```bash
npm run db:migrate-roles
```

### Issue 2: Old users can't login
**Solution:** Migration already updated all 'user' roles to 'artisan'

### Issue 3: Wrong dashboard after login
**Solution:** 
1. Clear localStorage
2. Login again
3. Check AuthContext redirect logic

---

## 📚 API Endpoints

### Registration:
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "artisan",  // or "buyer"
  "location": "Mumbai",
  "phone": "+91 1234567890"
}
```

### Login:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes user role:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "artisan",  // ← Used for redirect
      ...
    },
    "token": "..."
  }
}
```

---

## ✅ Summary

**Before:**
- ❌ Generic 'user' role
- ❌ No distinction between buyers and sellers
- ❌ Single dashboard for all users

**After:**
- ✅ Dedicated 'artisan' role for sellers
- ✅ Dedicated 'buyer' role for customers
- ✅ Separate dashboards with role-specific features
- ✅ Role-based access control
- ✅ Automatic redirect based on user role
- ✅ Database migration completed
- ✅ All existing users migrated to artisan role

---

**Implementation Date:** 2025-10-23  
**Status:** ✅ Complete and Tested  
**Database Migration:** ✅ Successfully Applied  
**Files Modified:** 7 files  
**Files Created:** 2 files
