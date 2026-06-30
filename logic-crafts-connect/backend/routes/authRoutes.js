/**
 * ============================================
 * AUTHENTICATION ROUTES
 * ============================================
 * Defines routes for user authentication
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Login user
 * - GET /api/auth/me - Get current user info
 */

import express from 'express';
import { check } from 'express-validator';
import { register, login, getMe, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], validate, register);

router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], validate, login);

router.post('/reset-password', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'New password is required').exists()
], validate, resetPassword);

// Protected routes (authentication required)
router.get('/me', protect, getMe);

export default router;
