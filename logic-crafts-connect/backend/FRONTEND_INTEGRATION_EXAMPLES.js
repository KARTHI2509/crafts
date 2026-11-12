/**
 * ============================================
 * FRONTEND INTEGRATION EXAMPLE
 * ============================================
 * How to use the user data storage API from React frontend
 */

// ==============================================
// 1. REGISTER A NEW USER (Store in Database)
// ==============================================

export const registerUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        location: userData.location
      })
    });

    const data = await response.json();

    if (response.ok) {
      // User successfully registered and stored in database
      console.log('✓ User registered:', data.data.user);
      
      // Store token and user info in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('role', data.data.user.role);
      
      return { success: true, user: data.data.user, token: data.data.token };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: error.message };
  }
};

// ==============================================
// 2. LOGIN USER (Retrieve from Database)
// ==============================================

export const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // User data retrieved from database
      console.log('✓ Login successful:', data.data.user);
      
      // Store token and user info
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('role', data.data.user.role);
      
      return { success: true, user: data.data.user, token: data.data.token };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error.message };
  }
};

// ==============================================
// 3. GET USER PROFILE (Retrieve from Database)
// ==============================================

export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}`);
    const data = await response.json();

    if (response.ok) {
      console.log('✓ User profile retrieved:', data.data.user);
      return { success: true, user: data.data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, message: error.message };
  }
};

// ==============================================
// 4. UPDATE USER PROFILE (Update in Database)
// ==============================================

export const updateUserProfile = async (updates) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✓ Profile updated:', data.data.user);
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      return { success: true, user: data.data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, message: error.message };
  }
};

// ==============================================
// 5. GET ALL USERS - Admin Only (Retrieve from Database)
// ==============================================

export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✓ Retrieved all users:', data.count);
      return { success: true, users: data.data.users, count: data.count };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Get all users error:', error);
    return { success: false, message: error.message };
  }
};

// ==============================================
// USAGE EXAMPLES IN REACT COMPONENTS
// ==============================================

/**
 * Example 1: Registration Form Component
 */
/*
import React, { useState } from 'react';
import { registerUser } from './api-examples';

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
    
    // Store user data in database
    const result = await registerUser(formData);
    
    if (result.success) {
      alert('Registration successful! User data stored in database.');
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      alert('Registration failed: ' + result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
      />
      <button type="submit">Register & Store Data</button>
    </form>
  );
}
*/

/**
 * Example 2: Login Form Component
 */
/*
import React, { useState } from 'react';
import { loginUser } from './api-examples';

function LoginForm() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Retrieve user data from database
    const result = await loginUser(credentials.email, credentials.password);
    
    if (result.success) {
      alert('Login successful! User data retrieved from database.');
      // Redirect based on role
      if (result.user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      alert('Login failed: ' + result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={credentials.email}
        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
*/

/**
 * Example 3: Profile Update Component
 */
/*
import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from './api-examples';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        name: storedUser.name,
        phone: storedUser.phone || '',
        location: storedUser.location || ''
      });
    }
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Update user data in database
    const result = await updateUserProfile(formData);
    
    if (result.success) {
      alert('Profile updated successfully!');
      setUser(result.user);
    } else {
      alert('Update failed: ' + result.message);
    }
  };

  return (
    <div>
      <h2>Update Profile</h2>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Name"
        />
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Phone"
        />
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Location"
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
*/

/**
 * Example 4: Admin Users List Component
 */
/*
import React, { useState, useEffect } from 'react';
import { getAllUsers } from './api-examples';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();
    
    if (result.success) {
      setUsers(result.users);
    } else {
      alert('Failed to load users: ' + result.message);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h2>All Users ({users.length})</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.phone || 'N/A'}</td>
              <td>{user.location || 'N/A'}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
*/

// ==============================================
// TESTING IN BROWSER CONSOLE
// ==============================================

/**
 * You can test these functions directly in the browser console:
 * 
 * // Register a user
 * registerUser({
 *   name: 'Test User',
 *   email: 'test@example.com',
 *   password: 'password123',
 *   phone: '+1234567890',
 *   location: 'New York'
 * }).then(console.log);
 * 
 * // Login
 * loginUser('test@example.com', 'password123').then(console.log);
 * 
 * // Get profile
 * getUserProfile(1).then(console.log);
 * 
 * // Update profile
 * updateUserProfile({
 *   name: 'Updated Name',
 *   location: 'Los Angeles'
 * }).then(console.log);
 * 
 * // Get all users (admin only)
 * getAllUsers().then(console.log);
 */
