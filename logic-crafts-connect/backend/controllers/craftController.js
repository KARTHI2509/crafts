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
  getPendingCrafts
} from '../models/craftModel.js';

/**
 * @desc    Create a new craft
 * @route   POST /api/crafts
 * @access  Private (authenticated users only)
 */
export const createNewCraft = async (req, res) => {
  try {
    const { name, description, craft_type, price, location, image_url, contact } = req.body;

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
      contact: contact || req.user.phone
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
    const crafts = await getAllCrafts();

    res.status(200).json({
      success: true,
      count: crafts.length,
      data: { crafts }
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
    const { name, description, craft_type, price, location, image_url, contact } = req.body;

    // Only the owner can update their craft
    const craft = await updateCraft(req.params.id, req.user.id, {
      name,
      description,
      craft_type,
      price,
      location,
      image_url,
      contact
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
