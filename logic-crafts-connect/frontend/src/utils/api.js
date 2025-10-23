// src/utils/api.js
// API utility for backend communication
// TODO: Update BASE_URL with actual backend URL when ready

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api'; // Backend API base URL

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Craft endpoints
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
      // For FormData (image upload)
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

// Admin endpoints
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
};

// User/Artisan endpoints
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

// Reviews endpoints
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
