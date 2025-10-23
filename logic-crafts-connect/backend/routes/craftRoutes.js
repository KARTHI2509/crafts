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
  deleteCraftByAdmin,
  trackView,
  saveACraft,
  unsaveACraft,
  checkSavedStatus,
  getStats,
  toggleVisibility
} from '../controllers/craftController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/', getCrafts);              // Get all approved crafts

// ============================================
// PROTECTED ROUTES (Login required)
// ============================================
router.post('/', protect, createNewCraft);           // Create new craft
router.get('/my-crafts', protect, getMyCrafts);      // Get user's own crafts (MUST be before /:id)

// ============================================
// ARTISAN FEATURES
// ============================================
router.get('/artisan/stats', protect, restrictTo('artisan'), getStats);  // Get artisan statistics (MUST be before /:id)

// ============================================
// SPECIFIC ROUTES (MUST come before /:id)
// ============================================
router.get('/:id', getCraft);            // Get single craft by ID
router.put('/:id', protect, updateCraftById);        // Update own craft
router.delete('/:id', protect, deleteCraftById);     // Delete own craft

// View tracking (public or authenticated)
router.post('/:id/view', trackView);                 // Track craft view

// Save/bookmark routes (authenticated users)
router.post('/:id/save', protect, saveACraft);       // Save/bookmark craft
router.delete('/:id/save', protect, unsaveACraft);   // Unsave craft
router.get('/:id/saved', protect, checkSavedStatus); // Check if saved

// Visibility toggle (artisan only)
router.patch('/:id/visibility', protect, toggleVisibility); // Toggle craft visibility

// ============================================
// ADMIN ROUTES (Admin role required)
// ============================================
router.get('/admin/all', protect, restrictTo('admin'), getAllCraftsForAdmin);
router.get('/admin/pending', protect, restrictTo('admin'), getPendingCraftsForAdmin);
router.patch('/:id/status', protect, restrictTo('admin'), updateStatus);
router.delete('/admin/:id', protect, restrictTo('admin'), deleteCraftByAdmin);

export default router;
