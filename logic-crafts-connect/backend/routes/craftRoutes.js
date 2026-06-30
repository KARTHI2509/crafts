/**
 * ============================================
 * CRAFT ROUTES
 * ============================================
 * Defines all craft-related routes
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

/**
 * ============================================
 * PUBLIC ROUTES
 * ============================================
 */
router.get('/', getCrafts);

/**
 * ============================================
 * PROTECTED ROUTES
 * ============================================
 */
router.post('/', protect, createNewCraft);
router.get('/my-crafts', protect, getMyCrafts);

/**
 * ============================================
 * ARTISAN ROUTES
 * ============================================
 */
router.get(
  '/artisan/stats',
  protect,
  restrictTo('artisan'),
  getStats
);

/**
 * ============================================
 * ADMIN ROUTES
 * ============================================
 */
router.get(
  '/admin/all',
  protect,
  restrictTo('admin'),
  getAllCraftsForAdmin
);

router.get(
  '/admin/pending',
  protect,
  restrictTo('admin'),
  getPendingCraftsForAdmin
);

router.delete(
  '/admin/:id',
  protect,
  restrictTo('admin'),
  deleteCraftByAdmin
);

/**
 * ============================================
 * CRAFT ACTION ROUTES
 * (Must come before /:id)
 * ============================================
 */
router.post('/:id/view', trackView);

router.post('/:id/save', protect, saveACraft);

router.delete('/:id/save', protect, unsaveACraft);

router.get('/:id/saved', protect, checkSavedStatus);

router.patch('/:id/visibility', protect, toggleVisibility);

router.patch(
  '/:id/status',
  protect,
  restrictTo('admin'),
  updateStatus
);

/**
 * ============================================
 * SINGLE CRAFT ROUTES
 * (Keep LAST)
 * ============================================
 */
router.get('/:id', getCraft);

router.put('/:id', protect, updateCraftById);

router.delete('/:id', protect, deleteCraftById);

export default router;