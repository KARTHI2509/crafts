import express from 'express';
import { trackEvent, getMetricsSummary } from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Middleware to optionally populate req.user if a token is present
const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Soft fail: ignore invalid tokens for tracking
    }
  }
  next();
};

// Public event logger (uses soft auth check to identify user)
router.post('/track', optionalProtect, trackEvent);

// Admin-restricted metrics dashboard
router.get('/metrics', protect, restrictTo('admin'), getMetricsSummary);

export default router;
