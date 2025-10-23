/**
 * ============================================
 * USER CONTROLLER
 * ============================================
 * Handles user-related operations
 * - Get user profile
 * - Update user profile
 * - Get all users (admin)
 */

import { findUserById, updateUser, getAllUsers } from '../models/userModel.js';

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);

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
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update logged-in user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;

    const updatedUser = await updateUser(req.user.id, {
      name,
      phone,
      location
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};
