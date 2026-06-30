import Craft from '../models/Craft.js';
import User from '../models/User.js';

/**
 * ============================================
 * CREATE NEW CRAFT
 * ============================================
 */
export const createNewCraft = async (req, res) => {
  try {
    const craft = await Craft.create({
      ...req.body,
      user_id: req.user.id,
      location: req.body.location || req.user.location,
      contact: req.body.contact || req.user.phone
    });

    res.status(201).json({
      success: true,
      message: 'Craft created successfully',
      data: { craft }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * GET ALL APPROVED CRAFTS
 * ============================================
 */
export const getCrafts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const crafts = await Craft.find({
      status: 'approved',
      visibility: 'public'
    })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Craft.countDocuments({
      status: 'approved',
      visibility: 'public'
    });

    res.status(200).json({
      success: true,
      count: crafts.length,
      data: {
        crafts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * GET SINGLE CRAFT
 * ============================================
 */
export const getCraft = async (req, res) => {
  try {
    const craft = await Craft.findById(req.params.id);

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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * GET LOGGED-IN USER CRAFTS
 * ============================================
 */
export const getMyCrafts = async (req, res) => {
  try {
    const crafts = await Craft.find({
      user_id: req.user.id
    });

    res.status(200).json({
      success: true,
      count: crafts.length,
      data: { crafts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * UPDATE CRAFT
 * ============================================
 */
export const updateCraftById = async (req, res) => {
  try {
    const craft = await Craft.findOneAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user.id
      },
      req.body,
      { new: true }
    );

    if (!craft) {
      return res.status(404).json({
        success: false,
        message: 'Craft not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Craft updated successfully',
      data: { craft }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * DELETE OWN CRAFT
 * ============================================
 */
export const deleteCraftById = async (req, res) => {
  try {
    const craft = await Craft.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!craft) {
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * ADMIN: UPDATE CRAFT STATUS
 * ============================================
 */
export const updateStatus = async (req, res) => {
  try {
    const craft = await Craft.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: { craft }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * TRACK CRAFT VIEW
 * ============================================
 */
export const trackView = async (req, res) => {
  try {
    await Craft.findByIdAndUpdate(req.params.id, {
      $inc: { view_count: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'View tracked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * SAVE CRAFT
 * ============================================
 */
export const saveACraft = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { wishlist: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Craft saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * UNSAVE CRAFT
 * ============================================
 */
export const unsaveACraft = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { wishlist: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Craft unsaved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * CHECK SAVED STATUS
 * ============================================
 */
export const checkSavedStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const saved = user?.wishlist?.includes(req.params.id);

    res.status(200).json({
      success: true,
      data: { saved }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * TOGGLE CRAFT VISIBILITY
 * ============================================
 */
export const toggleVisibility = async (req, res) => {
  try {
    const craft = await Craft.findOneAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user.id
      },
      { visibility: req.body.visibility },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: { craft }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * ADMIN: GET ALL CRAFTS
 * ============================================
 */
export const getAllCraftsForAdmin = async (req, res) => {
  try {
    const crafts = await Craft.find();

    res.status(200).json({
      success: true,
      count: crafts.length,
      data: { crafts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * ADMIN: GET PENDING CRAFTS
 * ============================================
 */
export const getPendingCraftsForAdmin = async (req, res) => {
  try {
    const crafts = await Craft.find({
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      count: crafts.length,
      data: { crafts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * ARTISAN STATS
 * ============================================
 */
export const getStats = async (req, res) => {
  try {
    const totalCrafts = await Craft.countDocuments({
      user_id: req.user.id
    });

    const approvedCrafts = await Craft.countDocuments({
      user_id: req.user.id,
      status: 'approved'
    });

    const pendingCrafts = await Craft.countDocuments({
      user_id: req.user.id,
      status: 'pending'
    });

    const totalViews = await Craft.aggregate([
      {
        $match: {
          user_id: req.user.id
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$view_count' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCrafts,
        approvedCrafts,
        pendingCrafts,
        totalViews: totalViews[0]?.totalViews || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ============================================
 * ADMIN: DELETE ANY CRAFT
 * ============================================
 */
export const deleteCraftByAdmin = async (req, res) => {
  try {
    const craft = await Craft.findByIdAndDelete(req.params.id);

    if (!craft) {
      return res.status(404).json({
        success: false,
        message: 'Craft not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Craft deleted by admin successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
