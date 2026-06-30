import express from 'express';
import { 
  getAllUsers, 
  toggleUserBan, 
  moderateCraft, 
  getAllOrders, 
  refundOrder, 
  getSecurityWarnings 
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict security lock: Admin authentication checks on all routes
router.use(protect);
router.use(restrictTo('admin'));

// User operations
router.get('/users', getAllUsers);
router.patch('/users/:id/ban', toggleUserBan);

// Product moderation
router.patch('/crafts/:id/status', moderateCraft);

// Order & Refund management
router.get('/orders', getAllOrders);
router.patch('/orders/:id/refund', refundOrder);

// Fraud alerts
router.get('/security-warnings', getSecurityWarnings);

export default router;
