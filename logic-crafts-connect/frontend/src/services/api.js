// src/services/api.js
// Centralized API configuration with Axios

import axios from 'axios';

// Base URL for API - Update this with your backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      console.error('Access denied: Insufficient permissions');
    }

    return Promise.reject(error);
  }
);

// ============================================
// Authentication API Endpoints
// ============================================

export const authAPI = {
  /**
   * User login
   * @param {string} email
   * @param {string} password
   * @returns {Promise} User data and token
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  /**
   * User registration
   * @param {Object} userData - User registration data
   * @returns {Promise} User data and token
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  /**
   * Logout (optional backend call to invalidate token)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Verify token validity
   * @returns {Promise} Token validity status
   */
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token verification failed' };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },
};

// ============================================
// Craft API Endpoints
// ============================================

export const craftAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/crafts', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch crafts' };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/crafts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch craft' };
    }
  },

  create: async (craftData) => {
    try {
      const response = await api.post('/crafts', craftData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create craft' };
    }
  },

  update: async (id, craftData) => {
    try {
      const response = await api.put(`/crafts/${id}`, craftData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update craft' };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/crafts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete craft' };
    }
  },

  getMyCrafts: async () => {
    try {
      const response = await api.get('/crafts/my-crafts');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch your crafts' };
    }
  },
};

// ============================================
// Admin API Endpoints
// ============================================

export const adminAPI = {
  getPendingCrafts: async () => {
    try {
      const response = await api.get('/admin/crafts/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pending crafts' };
    }
  },

  approveCraft: async (id) => {
    try {
      const response = await api.put(`/admin/crafts/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve craft' };
    }
  },

  rejectCraft: async (id) => {
    try {
      const response = await api.put(`/admin/crafts/${id}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject craft' };
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch stats' };
    }
  },

  getEvents: async () => {
    try {
      const response = await api.get('/admin/events');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch events' };
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await api.post('/admin/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create event' };
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },
};

// ============================================
// User API Endpoints
// ============================================

export const userAPI = {
  getProfile: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  updateProfile: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },
};

// ============================================
// Reviews API Endpoints
// ============================================

export const reviewAPI = {
  getForCraft: async (craftId) => {
    try {
      const response = await api.get(`/reviews/craft/${craftId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch reviews' };
    }
  },

  create: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create review' };
    }
  },
};

export default api;
