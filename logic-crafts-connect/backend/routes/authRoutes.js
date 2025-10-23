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
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (authentication required)
router.get('/me', protect, getMe);

export default router;
