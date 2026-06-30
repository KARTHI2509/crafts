// src/services/api.js
import axios from "axios";
import { storage } from "../utils/storage";

// Base URL
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ===============================
// Request Interceptor
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// Response Interceptor
// ===============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearAll();
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      console.error("Access denied");
    }

    return Promise.reject(error);
  }
);

// ===============================
// AUTH API
// ===============================
export const authAPI = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  register: (userData) =>
    api.post("/auth/register", userData),

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      storage.clearAll();
    }
  },

  verifyToken: () =>
    api.get("/auth/verify"),

  getProfile: () =>
    api.get("/auth/profile"),
};

// ===============================
// CRAFT API
// ===============================
export const craftAPI = {
  getAll: (filters = {}) =>
    api.get("/crafts", { params: filters }),

  getById: (id) =>
    api.get(`/crafts/${id}`),

  create: (craftData) =>
    api.post("/crafts", craftData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, craftData) =>
    api.put(`/crafts/${id}`, craftData),

  delete: (id) =>
    api.delete(`/crafts/${id}`),

  getMyCrafts: () =>
    api.get("/crafts/my-crafts"),

  getArtisanStats: () =>
    api.get("/crafts/artisan/stats"),
};

// ===============================
// CART API
// ===============================
export const cartAPI = {
  getCart: () =>
    api.get("/cart"),

  addToCart: (data) =>
    api.post("/cart", data),

  updateCart: (id, data) =>
    api.put(`/cart/${id}`, data),

  removeItem: (id) =>
    api.delete(`/cart/${id}`),

  clearCart: () =>
    api.delete("/cart/clear"),
};

// ===============================
// WISHLIST API
// ===============================
export const wishlistAPI = {
  getWishlist: () =>
    api.get("/wishlist"),

  addToWishlist: (craftId) =>
    api.post("/wishlist", {
      craft_id: craftId,
    }),

  removeFromWishlist: (craftId) =>
    api.delete(`/wishlist/${craftId}`),

  moveToCart: (craftIds) =>
    api.post("/wishlist/move-to-cart", {
      craft_ids: craftIds,
    }),

  clearWishlist: () =>
    api.delete("/wishlist/clear"),

  getCount: () =>
    api.get("/wishlist/count"),
};

// ===============================
// ORDER API
// ===============================
export const orderAPI = {
  getOrders: () =>
    api.get("/orders"),

  getOrderById: (id) =>
    api.get(`/orders/${id}`),

  createOrder: (data) =>
    api.post("/orders", data),

  cancelOrder: (id) =>
    api.put(`/orders/${id}/cancel`),
};

// ===============================
// ADMIN API
// ===============================
export const adminAPI = {
  getPendingCrafts: () =>
    api.get("/admin/crafts/pending"),

  approveCraft: (id) =>
    api.put(`/admin/crafts/${id}/approve`),

  rejectCraft: (id) =>
    api.put(`/admin/crafts/${id}/reject`),

  getStats: () =>
    api.get("/admin/stats"),

  getEvents: () =>
    api.get("/admin/events"),

  createEvent: (eventData) =>
    api.post("/admin/events", eventData),

  getAllUsers: () =>
    api.get("/admin/users"),
};

// ===============================
// USER API
// ===============================
export const userAPI = {
  getProfile: (id) =>
    api.get(`/users/${id}`),

  updateProfile: (id, userData) =>
    api.put(`/users/${id}`, userData),
};

// ===============================
// REVIEW API
// ===============================
export const reviewAPI = {
  getForCraft: (craftId) =>
    api.get(`/reviews/craft/${craftId}`),

  create: (reviewData) =>
    api.post("/reviews", reviewData),
};

export default api;