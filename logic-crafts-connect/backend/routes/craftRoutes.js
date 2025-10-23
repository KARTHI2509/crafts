/**
 * ============================================
 * CRAFT ROUTES
 * ============================================
 * Defines all craft-related routes
 * 
 * Public routes:
 * - GET /api/crafts - Get all approved crafts
 * - GET /api/crafts/:id - Get single craft
 * 
 * Protected routes (requires login):
 * - POST /api/crafts - Create new craft
 * - GET /api/crafts/my-crafts - Get logged-in user's crafts
 * - PUT /api/crafts/:id - Update own craft
 * - DELETE /api/crafts/:id - Delete own craft
 * 
 * Admin routes (requires admin role):
 * - GET /api/crafts/admin/all - Get all crafts
 * - GET /api/crafts/admin/pending - Get pending crafts
 * - PATCH /api/crafts/:id/status - Approve/reject craft
 * - DELETE /api/crafts/admin/:id - Delete any craft
 */

import express from 'express';
import {
  createNewCraft,
  getCrafts,
  getCraft,
  getMyCrafts,
  updateCraftById,
  deleteCraftById,
  getAllCraftsForAdmin,
  getPendingCraftsForAdmin,
  updateStatus,
  deleteCraftByAdmin
} from '../controllers/craftController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/', getCrafts);              // Get all approved crafts
router.get('/:id', getCraft);            // Get single craft by ID

// ============================================
// PROTECTED ROUTES (Login required)
// ============================================
router.post('/', protect, createNewCraft);           // Create new craft
router.get('/my-crafts', protect, getMyCrafts);      // Get user's own crafts
router.put('/:id', protect, updateCraftById);        // Update own craft
router.delete('/:id', protect, deleteCraftById);     // Delete own craft

// ============================================
// ADMIN ROUTES (Admin role required)
// ============================================
router.get('/admin/all', protect, restrictTo('admin'), getAllCraftsForAdmin);
router.get('/admin/pending', protect, restrictTo('admin'), getPendingCraftsForAdmin);
router.patch('/:id/status', protect, restrictTo('admin'), updateStatus);
router.delete('/admin/:id', protect, restrictTo('admin'), deleteCraftByAdmin);

export default router;
