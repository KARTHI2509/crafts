/**
 * ============================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================
 * Protects routes by verifying JWT tokens
 * - Checks if token exists in Authorization header
 * - Verifies token is valid
 * - Attaches user info to request object
 */

import jwt from 'jsonwebtoken';
import { findUserById } from '../models/userModel.js';

/**
 * Protect routes - User must be authenticated
 * Usage: Add this middleware before any route that needs authentication
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    // Format: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, return error
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login to access this resource.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database (without password)
      req.user = await findUserById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token may be invalid.'
        });
      }

      // Continue to next middleware/route handler
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

/**
 * Restrict to specific roles (e.g., admin only)
 * Usage: protect, restrictTo('admin'), routeHandler
 * @param  {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};
