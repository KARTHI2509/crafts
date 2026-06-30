/**
 * ============================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login to access this resource.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from MongoDB
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token may be invalid.'
        });
      }

      // Attach user
      req.user = user;

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
 * Restrict by role
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};