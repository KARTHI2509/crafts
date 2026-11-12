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

  /**
   * Verify email with token
   * @param {string} token - Email verification token
   * @returns {Promise} Verification result
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Email verification failed' };
    }
  },

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise} Result
   */
  resendVerification: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend verification' };
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} Result
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send reset email' };
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise} Result
   */
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed' };
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

  getRelated: async (id, limit = 4) => {
    try {
      const response = await api.get(`/crafts/${id}/related`, { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch related crafts' };
    }
  },

  search: async (query, filters = {}) => {
    try {
      const response = await api.get('/crafts', { params: { search: query, ...filters } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search crafts' };
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
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/password', passwordData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user' };
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
  
  reply: async (reviewId, replyText) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/reply`, { reply_text: replyText });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to post reply' };
    }
  },

  getMyReviews: async () => {
    try {
      const response = await api.get('/reviews/my-reviews');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch your reviews' };
    }
  },

  markHelpful: async (reviewId) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark review as helpful' };
    }
  },
};

// ============================================
// Cart API Endpoints
// ============================================

export const cartAPI = {
  get: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch cart' };
    }
  },

  add: async (craftId, quantity = 1) => {
    try {
      const response = await api.post('/cart', { craft_id: craftId, quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add to cart' };
    }
  },

  update: async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update cart' };
    }
  },

  remove: async (itemId) => {
    try {
      const response = await api.delete(`/cart/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove from cart' };
    }
  },

  clear: async () => {
    try {
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear cart' };
    }
  },
};

// ============================================
// Wishlist API Endpoints
// ============================================

export const wishlistAPI = {
  get: async () => {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch wishlist' };
    }
  },

  add: async (craftId) => {
    try {
      const response = await api.post('/wishlist', { craft_id: craftId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add to wishlist' };
    }
  },

  remove: async (craftId) => {
    try {
      const response = await api.delete(`/wishlist/${craftId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove from wishlist' };
    }
  },

  moveToCart: async (craftIds) => {
    try {
      const response = await api.post('/wishlist/move-to-cart', { craft_ids: craftIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to move to cart' };
    }
  },

  clear: async () => {
    try {
      const response = await api.delete('/wishlist/clear');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear wishlist' };
    }
  },

  getCount: async () => {
    try {
      const response = await api.get('/wishlist/count');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get wishlist count' };
    }
  },
};

// ============================================
// Orders API Endpoints
// ============================================

export const orderAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/orders', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch orders' };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch order' };
    }
  },

  create: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create order' };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update order status' };
    }
  },

  cancel: async (id, reason) => {
    try {
      const response = await api.put(`/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel order' };
    }
  },

  return: async (id, reason) => {
    try {
      const response = await api.put(`/orders/${id}/return`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to return order' };
    }
  },

  reject: async (id, reason) => {
    try {
      const response = await api.put(`/orders/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject order' };
    }
  },

  updateTracking: async (id, trackingData) => {
    try {
      const response = await api.put(`/orders/${id}/tracking`, trackingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update tracking' };
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/orders/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch order stats' };
    }
  },

  getArtisanStats: async () => {
    try {
      const response = await api.get('/orders/artisan/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch artisan stats' };
    }
  },

  getArtisanRevenue: async (period = 'month') => {
    try {
      const response = await api.get(`/orders/artisan/revenue`, { params: { period } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch revenue' };
    }
  },
};

// ============================================
// Messages API Endpoints
// ============================================

export const messageAPI = {
  getInbox: async () => {
    try {
      const response = await api.get('/messages/inbox');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch inbox' };
    }
  },

  getConversation: async (userId) => {
    try {
      const response = await api.get(`/messages/conversation/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch conversation' };
    }
  },

  send: async (messageData) => {
    try {
      const response = await api.post('/messages', messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send message' };
    }
  },

  markAsRead: async (senderId) => {
    try {
      const response = await api.put(`/messages/mark-read/${senderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark as read' };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/messages/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get unread count' };
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/messages/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch message stats' };
    }
  },
};

// ============================================
// Recommendations API Endpoints
// ============================================

export const recommendationAPI = {
  getPersonalized: async (limit = 10) => {
    try {
      const response = await api.get('/recommendations/personalized', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch recommendations' };
    }
  },

  getSimilar: async (craftId, limit = 6) => {
    try {
      const response = await api.get(`/recommendations/similar/${craftId}`, { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch similar items' };
    }
  },

  getTrending: async (limit = 10) => {
    try {
      const response = await api.get('/recommendations/trending', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch trending' };
    }
  },

  getNewArrivals: async (limit = 10) => {
    try {
      const response = await api.get('/recommendations/new-arrivals', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch new arrivals' };
    }
  },
};

// ============================================
// Artisan-specific API Endpoints
// ============================================

export const artisanAPI = {
  getMyCrafts: async () => {
    try {
      const response = await api.get('/crafts/my-crafts');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch your crafts' };
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/crafts/artisan/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch stats' };
    }
  },

  updateVisibility: async (craftId, visibility) => {
    try {
      const response = await api.put(`/crafts/${craftId}/visibility`, { visibility });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update visibility' };
    }
  },
};

// ============================================
// Upload API Endpoints
// ============================================

export const uploadAPI = {
  // Upload craft images (up to 5 files)
  uploadCraftImages: async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      const response = await api.post('/upload/craft-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload images' };
    }
  },

  // Upload profile/avatar image
  uploadProfileImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload profile image' };
    }
  },

  // Alias for profile image upload (used by Profile page)
  profileImage: async (formData) => {
    try {
      const response = await api.post('/upload/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload profile image' };
    }
  },

  // Upload base64 image
  uploadBase64: async (base64Image, folder = 'logic-crafts/crafts') => {
    try {
      const response = await api.post('/upload/base64', { image: base64Image, folder });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload image' };
    }
  },

  // Check if upload service is configured
  getStatus: async () => {
    try {
      const response = await api.get('/upload/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to check upload status' };
    }
  },
};

export default api;
