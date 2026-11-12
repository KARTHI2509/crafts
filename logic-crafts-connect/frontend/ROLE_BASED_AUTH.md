# Role-Based Authentication System - Logic Crafts Connect

## 🔐 Complete JWT Authentication Implementation

This document describes the full role-based authentication system implemented for Logic Crafts Connect using JWT tokens, React Context API, and React Router v6.

---

## 📋 **Features Implemented**

✅ **JWT-based Authentication**
✅ **Three User Roles**: Artisan, Buyer, Admin
✅ **Protected Routes** with authentication checks
✅ **Role-Based Routes** with authorization checks
✅ **Session Persistence** across page refreshes
✅ **Automatic Role-Based Redirects** after login/register
✅ **Access Denied Pages** for unauthorized users
✅ **Loading States** during authentication
✅ **Secure API Integration** with Axios interceptors
✅ **Centralized Auth State Management** with Context API

---

## 🏗️ **Architecture Overview**

```
Authentication Flow:
┌─────────────┐
│   User      │
│  Register   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  AuthContext        │
│  - login()          │
│  - register()       │
│  - logout()         │
│  - getUserRole()    │
│  - hasRole()        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Store JWT Token &  │
│  User in localStorage│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Role-Based Redirect│
│  - artisan → /artisan-dashboard
│  - buyer   → /buyer-dashboard
│  - admin   → /admin-dashboard
└─────────────────────┘
```

---

## 📁 **File Structure**

```
frontend/src/
├── context/
│   ├── AuthContext.jsx          ✅ Authentication state & methods
│   └── LanguageContext.jsx      (existing)
│
├── components/
│   ├── ProtectedRoute.jsx       ✅ Requires authentication
│   ├── RoleBasedRoute.jsx       ✅ Requires specific role
│   ├── Navbar.jsx               (updated to use AuthContext)
│   └── Footer.jsx               (existing)
│
├── services/
│   └── api.js                   ✅ Axios config with JWT interceptors
│
├── pages/
│   ├── Login.jsx                ✅ Updated to use AuthContext
│   ├── Register.jsx             ✅ Updated to use AuthContext
│   ├── ArtisanDashboard.jsx     ✅ NEW - Artisan-specific dashboard
│   ├── BuyerDashboard.jsx       ✅ NEW - Buyer-specific dashboard
│   ├── AdminDashboard_Role.jsx  ✅ NEW - Admin-specific dashboard
│   └── ... (other pages)
│
├── App.jsx                      ✅ Updated with role-based routing
└── main.jsx                     ✅ Wrapped with AuthProvider
```

---

## 🔑 **User Roles**

| Role | Access Level | Dashboard Route | Permissions |
|------|-------------|----------------|-------------|
| **Artisan** | Creator | `/artisan-dashboard` | Upload crafts, view analytics, manage own crafts |
| **Buyer** | Consumer | `/buyer-dashboard` | Browse crafts, add favorites, write reviews |
| **Admin** | Manager | `/admin-dashboard` | Approve/reject crafts, manage events, view stats |

---

## 🚀 **Quick Start Guide**

### 1. **Test with Mock Data**

The system is currently using mock authentication. You can test with any email:

```javascript
// Login Examples:
admin@example.com    → Admin Dashboard
buyer@example.com    → Buyer Dashboard
artisan@example.com  → Artisan Dashboard
anything@else.com    → Artisan Dashboard (default)
```

### 2. **Registration Flow**

1. Navigate to `/register`
2. Choose role (Artisan or Buyer)
3. Fill form and submit
4. Automatically redirected to role-specific dashboard

### 3. **Connect to Backend**

Update `src/services/api.js`:

```javascript
const BASE_URL = 'http://your-backend-url/api';
```

Then uncomment API calls in:
- `src/context/AuthContext.jsx` (login, register methods)
- All dashboard pages (data fetching)

---

## 📝 **API Endpoints Expected**

### Authentication

```javascript
POST /api/auth/register
Body: { name, email, password, role, location, myStory }
Response: { user, token }

POST /api/auth/login
Body: { email, password }
Response: { user, token }

GET /api/auth/verify
Headers: Authorization: Bearer {token}
Response: { valid: true/false }

GET /api/auth/profile
Headers: Authorization: Bearer {token}
Response: { user }
```

### Role-Specific Endpoints

```javascript
// Artisan
GET /api/crafts/my-crafts
POST /api/crafts
PUT /api/crafts/:id
DELETE /api/crafts/:id

// Buyer
GET /api/crafts
POST /api/reviews
GET /api/reviews/craft/:id

// Admin
GET /api/admin/crafts/pending
PUT /api/admin/crafts/:id/approve
PUT /api/admin/crafts/:id/reject
GET /api/admin/stats
POST /api/admin/events
```

---

## 🛡️ **Security Features**

### 1. **JWT Token Management**

```javascript
// Stored in localStorage
localStorage.setItem('token', jwt_token);
localStorage.setItem('user', JSON.stringify(user));

// Auto-attached to API requests via Axios interceptor
config.headers.Authorization = `Bearer ${token}`;
```

### 2. **Automatic Token Validation**

```javascript
// In api.js - Response Interceptor
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

### 3. **Protected Routes**

```jsx
<Route 
  path="/upload" 
  element={
    <ProtectedRoute>
      <UploadCraft />
    </ProtectedRoute>
  } 
/>
```

### 4. **Role-Based Access Control**

```jsx
<Route 
  path="/artisan-dashboard" 
  element={
    <RoleBasedRoute role="artisan">
      <ArtisanDashboard />
    </RoleBasedRoute>
  } 
/>
```

---

## 🎨 **Component Usage**

### AuthContext Hook

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { 
    user,           // Current user object
    token,          // JWT token
    loading,        // Loading state
    login,          // Login function
    logout,         // Logout function
    register,       // Register function
    getUserRole,    // Get current user role
    isAuthenticated,// Check if user is logged in
    hasRole         // Check if user has specific role
  } = useAuth();

  return (
    <div>
      {user && <p>Welcome, {user.name}!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### ProtectedRoute Component

```jsx
// Protects routes - requires authentication
<Route 
  path="/protected" 
  element={
    <ProtectedRoute>
      <ProtectedComponent />
    </ProtectedRoute>
  } 
/>
```

### RoleBasedRoute Component

```jsx
// Protects routes - requires specific role
<Route 
  path="/admin-only" 
  element={
    <RoleBasedRoute role="admin" showAccessDenied={true}>
      <AdminComponent />
    </RoleBasedRoute>
  } 
/>
```

---

## 🔄 **Authentication Flow**

### Login Process

```
1. User enters credentials
   ↓
2. AuthContext.login(email, password)
   ↓
3. Call API /auth/login
   ↓
4. Receive { user, token }
   ↓
5. Store in localStorage
   ↓
6. Update React state
   ↓
7. Redirect based on role:
   - admin → /admin-dashboard
   - buyer → /buyer-dashboard
   - artisan → /artisan-dashboard
```

### Session Restoration

```
1. User refreshes page
   ↓
2. AuthContext useEffect() runs
   ↓
3. Read token & user from localStorage
   ↓
4. Validate and restore state
   ↓
5. User remains logged in
```

### Logout Process

```
1. User clicks logout
   ↓
2. AuthContext.logout()
   ↓
3. Clear localStorage
   ↓
4. Clear React state
   ↓
5. Redirect to /login
```

---

## 🎯 **Route Protection Examples**

### Public Routes (No Auth Required)

```jsx
<Route path="/" element={<Home />} />
<Route path="/explore" element={<Explore />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
```

### Protected Routes (Auth Required)

```jsx
<Route path="/upload" element={
  <ProtectedRoute>
    <UploadCraft />
  </ProtectedRoute>
} />
```

### Role-Based Routes

```jsx
// Artisan Only
<Route path="/artisan-dashboard" element={
  <RoleBasedRoute role="artisan">
    <ArtisanDashboard />
  </RoleBasedRoute>
} />

// Buyer Only
<Route path="/buyer-dashboard" element={
  <RoleBasedRoute role="buyer">
    <BuyerDashboard />
  </RoleBasedRoute>
} />

// Admin Only
<Route path="/admin-dashboard" element={
  <RoleBasedRoute role="admin">
    <AdminDashboard_Role />
  </RoleBasedRoute>
} />
```

---

## 🔧 **Configuration**

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### API Base URL

Update in `src/services/api.js`:

```javascript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

---

## 🐛 **Troubleshooting**

### Issue: User logged out after refresh

**Solution**: Check if localStorage is being cleared. Verify AuthContext useEffect is running.

### Issue: 401 Unauthorized errors

**Solution**: Ensure JWT token is being sent in Authorization header. Check API interceptor.

### Issue: Wrong dashboard redirect

**Solution**: Verify user.role matches one of: 'artisan', 'buyer', 'admin'

### Issue: Access denied even with correct role

**Solution**: Check RoleBasedRoute role prop matches user.role exactly (case-sensitive)

---

## ✅ **Testing Checklist**

- [ ] Register as Artisan → Redirects to /artisan-dashboard
- [ ] Register as Buyer → Redirects to /buyer-dashboard
- [ ] Login as Admin → Redirects to /admin-dashboard
- [ ] Session persists after page refresh
- [ ] Logout clears session and redirects to /login
- [ ] Protected routes redirect to /login when not authenticated
- [ ] Role-based routes show access denied for wrong role
- [ ] Loading spinner shows during authentication
- [ ] Error messages display for invalid credentials

---

## 📚 **API Integration Guide**

### Step 1: Update AuthContext.jsx

Uncomment the actual API calls:

```javascript
const response = await authAPI.login(email, password);
```

### Step 2: Remove Mock Data

Delete the mock user creation code in login/register methods.

### Step 3: Update Dashboard Components

Replace mock data fetching with actual API calls:

```javascript
const crafts = await craftAPI.getMyCrafts();
```

---

## 🎉 **Success! System is Ready**

Your role-based authentication system is now complete with:

✅ JWT token management
✅ Three separate dashboards (Artisan, Buyer, Admin)
✅ Protected and role-based routing
✅ Session persistence
✅ Secure API integration
✅ Loading states and error handling
✅ Access denied pages

**All you need to do is connect your backend API!**

---

**Built with ❤️ for secure, role-based access control**
