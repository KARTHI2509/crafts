/**
 * ============================================
 * CRAFT CONTROLLER
 * ============================================
 * Handles all craft-related operations:
 * - Create new craft
 * - Get all crafts
 * - Get single craft
 * - Get user's crafts
 * - Update craft
 * - Delete craft
 * - Admin operations (approve/reject crafts)
 */

import {
  createCraft,
  getAllCrafts,
  getAllCraftsAdmin,
  getCraftById,
  getCraftsByUser,
  updateCraft,
  deleteCraft,
  deleteCraftAdmin,
  updateCraftStatus,
  getPendingCrafts,
  trackCraftView,
  saveCraft,
  unsaveCraft,
  isCraftSaved,
  getArtisanStats,
  toggleCraftVisibility,
  getCraftsCount
} from '../models/craftModel.js';

/**
 * @desc    Create a new craft
 * @route   POST /api/crafts
 * @access  Private (authenticated users only)
 */
export const createNewCraft = async (req, res) => {
  try {
    const { 
      name, description, craft_type, price, location, image_url, contact,
      images, category, stock, delivery_days, is_featured, is_new_arrival,
      made_to_order, limited_edition
    } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide craft name and description'
      });
    }

    // Create craft with user ID from authenticated user
    const craftData = {
      user_id: req.user.id,
      name,
      description,
      craft_type,
      price,
      location: location || req.user.location,
      image_url,
      contact: contact || req.user.phone,
      images,
      category,
      stock,
      delivery_days,
      is_featured,
      is_new_arrival,
      made_to_order,
      limited_edition
    };

    const craft = await createCraft(craftData);

    res.status(201).json({
      success: true,
      message: 'Craft created successfully',
      data: { craft }
    });
  } catch (error) {
    console.error('Create craft error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating craft',
      error: error.message
    });
  }
};

/**
 * @desc    Get all approved crafts (public view)
 * @route   GET /api/crafts
 * @access  Public
 */
export const getCrafts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    const crafts = await getAllCrafts(limit, offset);
    const totalCount = await getCraftsCount();
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      count: crafts.length,
      data: { 
        crafts,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get crafts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crafts',
      error: error.message
    });
  }
};

/**
 * @desc    Get all crafts including pending (admin only)
 * @route   GET /api/crafts/admin/all
 * @access  Private/Admin
 */
export const getAllCraftsForAdmin = async (req, res) => {
  try {
    const crafts = await getAllCraftsAdmin();

    res.status(200).json({
      success: true,
      count: crafts.length,
      data: { crafts }
    });
  } catch (error) {
    console.error('Get all crafts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crafts',
      error: error.message
    });
  }
};

/**
 * @desc    Get pending crafts for review (admin only)
 * @route   GET /api/crafts/admin/pending
 * @access  Private/Admin
 */
export const getPendingCraftsForAdmin = async (req, res) => {
  try {
    const crafts = await getPendingCrafts();

    res.status(200).json({
      success: true,
      count: crafts.length,
      data: { crafts }
    });
  } catch (error) {
    console.error('Get pending crafts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending crafts',
      error: error.message
    });
  }
};

/**
 * @desc    Get single craft by ID
 * @route   GET /api/crafts/:id
 * @access  Public
 */
export const getCraft = async (req, res) => {
  try {
    const craft = await getCraftById(req.params.id);

    if (!craft) {
      return res.status(404).json({
        success: false,
        message: 'Craft not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { craft }
    });
  } catch (error) {
    console.error('Get craft error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching craft',
      error: error.message
    });
  }
};

/**
 * @desc    Get logged-in user's crafts
 * @route   GET /api/crafts/my-crafts
 * @access  Private
 */
export const getMyCrafts = async (req, res) => {
  try {
    const crafts = await getCraftsByUser(req.user.id);

    res.status(200).json({
      success: true,
      count: crafts.length,
      data: { crafts }
    });
  } catch (error) {
    console.error('Get my crafts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your crafts',
      error: error.message
    });
  }
};

/**
 * @desc    Update craft
 * @route   PUT /api/crafts/:id
 * @access  Private (only craft owner)
 */
export const updateCraftById = async (req, res) => {
  try {
    const { 
      name, description, craft_type, price, location, image_url, contact,
      images, category, stock, delivery_days, is_featured, is_new_arrival,
      made_to_order, limited_edition
    } = req.body;

    // Only the owner can update their craft
    const craft = await updateCraft(req.params.id, req.user.id, {
      name,
      description,
      craft_type,
      price,
      location,
      image_url,
      contact,
      images,
      category,
      stock,
      delivery_days,
      is_featured,
      is_new_arrival,
      made_to_order,
      limited_edition
    });

    if (!craft) {
      return res.status(404).json({
        success: false,
        message: 'Craft not found or you do not have permission to update it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Craft updated successfully',
      data: { craft }
    });
  } catch (error) {
    console.error('Update craft error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating craft',
      error: error.message
    });
  }
};

/**
 * @desc    Delete craft
 * @route   DELETE /api/crafts/:id
 * @access  Private (only craft owner)
 */
export const deleteCraftById = async (req, res) => {
  try {
    const deleted = await deleteCraft(req.params.id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Craft not found or you do not have permission to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Craft deleted successfully'
    });
  } catch (error) {
    console.error('Delete craft error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting craft',
      error: error.message
    });
  }
};

/**
 * @desc    Approve or reject craft (admin only)
 * @route   PATCH /api/crafts/:id/status
 * @access  Private/Admin
 */
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, rejected, or pending'
      });
    }

    const craft = await updateCraftStatus(req.params.id, status);

    if (!craft) {
      return res.status(404).json({
        success: false,
        message: 'Craft not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Craft ${status} successfully`,
      data: { craft }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating craft status',
      error: error.message
    });
  }
};

/**
 * @desc    Delete any craft (admin only)
 * @route   DELETE /api/crafts/admin/:id
 * @access  Private/Admin
 */
export const deleteCraftByAdmin = async (req, res) => {
  try {
    const deleted = await deleteCraftAdmin(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Craft not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Craft deleted successfully'
    });
  } catch (error) {
    console.error('Delete craft (admin) error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting craft',
      error: error.message
    });
  }
};

/**
 * @desc    Track craft view
 * @route   POST /api/crafts/:id/view
 * @access  Public
 */
export const trackView = async (req, res) => {
  try {
    const craftId = req.params.id;
    const userId = req.user?.id || null; // Optional authentication

    const success = await trackCraftView(craftId, userId);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Error tracking view'
      });
    }

    res.status(200).json({
      success: true,
      message: 'View tracked'
    });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking view',
      error: error.message
    });
  }
};

/**
 * @desc    Save/bookmark a craft
 * @route   POST /api/crafts/:id/save
 * @access  Private
 */
export const saveACraft = async (req, res) => {
  try {
    const craftId = req.params.id;
    const userId = req.user.id;

    const success = await saveCraft(craftId, userId);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Error saving craft'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Craft saved successfully'
    });
  } catch (error) {
    console.error('Save craft error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving craft',
      error: error.message
    });
  }
};

/**
 * @desc    Unsave/unbookmark a craft
 * @route   DELETE /api/crafts/:id/save
 * @access  Private
 */
export const unsaveACraft = async (req, res) => {
  try {
    const craftId = req.params.id;
    const userId = req.user.id;

    const success = await unsaveCraft(craftId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Craft was not saved'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Craft unsaved successfully'
    });
  } catch (error) {
    console.error('Unsave craft error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unsaving craft',
      error: error.message
    });
  }
};

/**
 * @desc    Get artisan statistics
 * @route   GET /api/crafts/artisan/stats
 * @access  Private (Artisan only)
 */
export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await getArtisanStats(userId);

    if (!stats) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching statistics'
      });
    }

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Check if craft is saved by user
 * @route   GET /api/crafts/:id/saved
 * @access  Private
 */
export const checkSavedStatus = async (req, res) => {
  try {
    const craftId = req.params.id;
    const userId = req.user.id;

    const isSaved = await isCraftSaved(craftId, userId);

    res.status(200).json({
      success: true,
      data: { isSaved }
    });
  } catch (error) {
    console.error('Check saved status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking saved status',
      error: error.message
    });
  }
};

/**
 * @desc    Toggle craft visibility (artisan only)
 * @route   PATCH /api/crafts/:id/visibility
 * @access  Private (only craft owner)
 */
export const toggleVisibility = async (req, res) => {
  try {
    const { visibility } = req.body;

    // Validate visibility
    if (!['public', 'hidden'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visibility. Must be public or hidden'
      });
    }

    const craft = await toggleCraftVisibility(req.params.id, req.user.id, visibility);

    if (!craft) {
      return res.status(404).json({
        success: false,
        message: 'Craft not found or you do not have permission to update it'
      });
    }

    res.status(200).json({
      success: true,
      message: `Craft visibility set to ${visibility} successfully`,
      data: { craft }
    });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating craft visibility',
      error: error.message
    });
  }
};