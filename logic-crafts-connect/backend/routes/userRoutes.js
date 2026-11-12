/**
 * ============================================
 * USER ROUTES
 * ============================================
 * Defines user-related routes
 * 
 * Public routes:
 * - GET /api/users/:id - Get user profile by ID
 * 
 * Protected routes:
 * - PUT /api/users/profile - Update own profile
 * - PUT /api/users/password - Change password
 * 
 * Admin routes:
 * - GET /api/users - Get all users
 */

import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUsers
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (login required) - These must come before /:id
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, changePassword);

// Admin routes
router.get('/', protect, restrictTo('admin'), getUsers);

// Public routes - Must come last to avoid matching other routes
router.get('/:id', getUserProfile);

export default router;
