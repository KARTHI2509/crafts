# 🧪 Testing Guide - Registration Fix

## 🎯 Quick Test Procedure

### Prerequisites
- ✅ Backend server running on port 5000
- ✅ Frontend server running on port 5173
- ✅ PostgreSQL database 'logic_crafts_db' created

---

## 📝 Step-by-Step Testing

### Step 1: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Expected output:
```
✓ Database connected successfully
✓ Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Expected output:
```
VITE ready in xxx ms
Local: http://localhost:5173/
```

---

### Step 2: Test User Registration

1. **Open Browser:** `http://localhost:5173/register`

2. **Fill Registration Form:**
   ```
   Full Name: John Smith
   Email: john.smith@example.com
   Password: password123
   Confirm Password: password123
   Role: ● Artisan (Seller)
   Location: Mumbai, Maharashtra
   Phone: +91 9876543210
   ```

3. **Click "Register" Button**

4. **Expected Results:**
   - ✅ Green success message appears: "Registration successful! Please login with your credentials."
   - ✅ Page redirects to `/login` after 1-2 seconds
   - ✅ Console shows: `Registration successful!`

5. **Verify in Database (pgAdmin):**
   ```sql
   SELECT * FROM users WHERE email = 'john.smith@example.com';
   ```
   
   Expected output:
   ```
   id | name        | email                   | role | phone         | location
   ---|-------------|------------------------|------|---------------|------------------
   3  | John Smith  | john.smith@example.com | user | +91987654321  | Mumbai, Maharashtra
   ```

---

### Step 3: Test Login with Registered Account

1. **On Login Page** (`/login`)

2. **Enter Credentials:**
   ```
   Email: john.smith@example.com
   Password: password123
   ```

3. **Click "Login" Button**

4. **Expected Results:**
   - ✅ Successfully logs in
   - ✅ Redirected to dashboard (based on role)
   - ✅ User info stored in localStorage
   - ✅ Token stored in localStorage

5. **Verify localStorage (Browser DevTools):**
   - Press F12 → Application → Local Storage
   - Should see:
     ```
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     user: {"id":3,"name":"John Smith","email":"john.smith@example.com",...}
     role: "user"
     ```

---

### Step 4: Test Duplicate Email Prevention

1. **Go back to:** `http://localhost:5173/register`

2. **Try registering with same email:**
   ```
   Email: john.smith@example.com
   (same email as before)
   ```

3. **Expected Results:**
   - ❌ Red error message: "User with this email already exists"
   - ❌ Not redirected to login
   - ❌ No new entry in database

---

### Step 5: Test Password Validation

**Test 5.1: Password Mismatch**
```
Password: password123
Confirm Password: password456
```
Expected: ❌ Error - "Passwords do not match!"

**Test 5.2: Short Password**
```
Password: test
Confirm Password: test
```
Expected: ❌ Error - "Password must be at least 6 characters long"

---

## 🔍 Debugging Checklist

### If Registration Doesn't Store Data:

1. **Check Backend Console:**
   ```
   POST /api/auth/register - [timestamp]
   Registration error: [error message]
   ```

2. **Check Frontend Console (F12):**
   ```javascript
   Registration error: [error details]
   ```

3. **Verify API Call:**
   - Open DevTools → Network tab
   - Register a user
   - Look for `register` request
   - Status should be `201 Created`
   - Response should contain user data

4. **Check Database Connection:**
   ```bash
   cd backend
   npm run db:setup
   ```

---

### If Still Redirecting to Dashboard:

1. **Clear Browser Cache:**
   - Press Ctrl+Shift+Delete
   - Clear "Cached images and files"
   - Clear "Cookies and other site data"

2. **Clear localStorage:**
   ```javascript
   // In browser console (F12):
   localStorage.clear();
   ```

3. **Hard Refresh:**
   - Press Ctrl+Shift+R (Windows)
   - Or Cmd+Shift+R (Mac)

---

## 📊 Network Request Verification

### Expected Request to Backend:

**Request:**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "password": "password123",
  "role": "user",
  "location": "Mumbai, Maharashtra",
  "phone": "+91 9876543210"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 3,
      "name": "John Smith",
      "email": "john.smith@example.com",
      "role": "user",
      "phone": "+91 9876543210",
      "location": "Mumbai, Maharashtra"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## ✅ Success Criteria

### Registration Flow:
- [ ] Form validates all inputs
- [ ] Password confirmation works
- [ ] API call sent to backend
- [ ] Backend stores user in database
- [ ] Success message displayed
- [ ] Redirects to /login page
- [ ] No auto-login occurs

### Database Verification:
- [ ] User exists in `users` table
- [ ] Password is hashed (not plain text)
- [ ] Email is unique
- [ ] All fields stored correctly
- [ ] created_at timestamp set

### Login Flow:
- [ ] Can login with registered credentials
- [ ] Token generated and stored
- [ ] User data stored in localStorage
- [ ] Redirected to appropriate dashboard

---

## 🎨 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   REGISTRATION TEST FLOW                     │
└─────────────────────────────────────────────────────────────┘

START
  │
  ├─→ Go to /register
  │
  ├─→ Fill form:
  │   ├── Name: John Smith
  │   ├── Email: john.smith@example.com
  │   ├── Password: password123
  │   ├── Location: Mumbai
  │   └── Phone: +91 987654321
  │
  ├─→ Click "Register"
  │
  ├─→ Frontend validates:
  │   ├── All required fields filled?
  │   ├── Password matches confirm?
  │   └── Password length ≥ 6?
  │
  ├─→ API Call: POST /api/auth/register
  │
  ├─→ Backend processes:
  │   ├── Check duplicate email
  │   ├── Hash password
  │   └── ✅ STORE IN DATABASE
  │
  ├─→ Backend responds: 201 Created
  │
  ├─→ Frontend shows success message
  │
  ├─→ ✅ REDIRECT TO /login
  │
  ├─→ User enters credentials
  │
  ├─→ API Call: POST /api/auth/login
  │
  ├─→ Backend verifies credentials
  │
  ├─→ Login successful
  │
  └─→ ✅ REDIRECT TO DASHBOARD

END - User registered and logged in successfully!
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Error:** "Access to fetch at 'http://localhost:5000' has been blocked by CORS policy"

**Solution:**
```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

### Issue 2: Database Connection Error
**Error:** "Database connection failed"

**Solution:**
1. Check PostgreSQL is running
2. Verify .env file:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=logic_crafts_db
   ```

---

### Issue 3: Token Not Stored
**Error:** localStorage is empty after registration

**Solution:**
- This is expected! Registration should NOT store token
- Token only stored after LOGIN
- Check AuthContext.jsx - register function should navigate to /login

---

## 📈 Performance Benchmarks

### Expected Response Times:
- Registration API call: 200-400ms
- Database insertion: 50-150ms
- Password hashing: 100-200ms
- Total registration time: < 500ms

---

## 🎉 Test Completion

Once all tests pass:
- ✅ Users can register
- ✅ Data stored in database
- ✅ Redirects to login page
- ✅ Can login with registered account
- ✅ Proper authentication flow

**Status: READY FOR PRODUCTION** 🚀

---

**Test Date:** 2025-10-23  
**Tester:** [Your Name]  
**Result:** [ ] PASS  /  [ ] FAIL
