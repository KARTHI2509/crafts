/**
 * ============================================
 * AUTHENTICATION ROUTES
 * ============================================
 * Defines routes for user authentication
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Login user
 * - GET /api/auth/me - Get current user info
 * - POST /api/auth/verify-email - Verify email with token
 * - POST /api/auth/resend-verification - Resend verification email
 * - POST /api/auth/forgot-password - Request password reset
 * - POST /api/auth/reset-password - Reset password with token
 */

import express from 'express';
import { register, login, getMe, verifyEmailToken, resendVerification, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Email verification routes
router.post('/verify-email', verifyEmailToken);
router.post('/resend-verification', resendVerification);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
router.get('/me', protect, getMe);

export default router;
