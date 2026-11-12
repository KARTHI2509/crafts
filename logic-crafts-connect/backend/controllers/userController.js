/**
 * ============================================
 * USER CONTROLLER
 * ============================================
 * Handles user-related operations
 * - Get user profile
 * - Update user profile
 * - Change password
 * - Get all users (admin)
 */

import { findUserById, updateUser, getAllUsers, findUserByIdWithPassword } from '../models/userModel.js';
import bcrypt from 'bcryptjs';

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
    const { name, phone, location, bio, website, profileImage } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const updatedUser = await updateUser(req.user.id, updateData);

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
 * @desc    Change user password
 * @route   PUT /api/users/password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    // Get user with password
    const user = await findUserByIdWithPassword(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await updateUser(req.user.id, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
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
