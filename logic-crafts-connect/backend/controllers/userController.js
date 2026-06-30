import User from '../models/User.js';

/**
 * Get user profile by ID
 * GET /api/users/:id
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user profile error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

/**
 * Update logged-in user profile
 * PUT /api/users/profile
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        location
      },
      {
        new: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * Get all users
 * GET /api/users
 * Admin only
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users }
    });

  } catch (error) {
    console.error('Get users error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};