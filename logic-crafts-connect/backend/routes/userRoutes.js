/**
 * ============================================
 * USER ROUTES
 * ============================================
 * Defines user-related routes
 */

import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUsers
} from '../controllers/userController.js';

import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ============================================
 * PROTECTED ROUTES
 * ============================================
 */

// Update logged-in user profile
router.put('/profile', protect, updateUserProfile);

/**
 * ============================================
 * ADMIN ROUTES
 * ============================================
 */

// Get all users
router.get('/', protect, restrictTo('admin'), getUsers);

/**
 * ============================================
 * PUBLIC ROUTES
 * ============================================
 */

// Get user profile by ID
// Keep this LAST
router.get('/:id', getUserProfile);

export default router;