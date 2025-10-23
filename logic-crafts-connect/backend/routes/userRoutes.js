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
 * 
 * Admin routes:
 * - GET /api/users - Get all users
 */

import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUsers
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/:id', getUserProfile);

// Protected routes (login required)
router.put('/profile', protect, updateUserProfile);

// Admin routes
router.get('/', protect, restrictTo('admin'), getUsers);

export default router;
