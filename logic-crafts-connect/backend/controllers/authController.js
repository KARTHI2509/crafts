/**
 * ============================================
 * AUTHENTICATION CONTROLLER
 * ============================================
 * Handles user registration and login
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Register User
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, location, role } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password'
    });
  }

  // Validate role
  const validRoles = ['artisan', 'buyer', 'admin'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be artisan, buyer, or admin'
    });
  }

  // Check existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    location,
    role: role || 'artisan'
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location
      },
      token
    }
  });
});

/**
 * Login User
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if account is banned
  if (user.isBanned) {
    return res.status(403).json({
      success: false,
      message: 'This account has been banned by administrators.'
    });
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
    return res.status(423).json({
      success: false,
      message: `Account is temporarily locked. Please try again in ${remainingTime} minutes.`
    });
  }

  // Compare password
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    // Increment failed login count
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      user.failedLoginAttempts = 0; // reset counter after locking
      await user.save();
      return res.status(423).json({
        success: false,
        message: 'Too many failed login attempts. Your account has been locked for 15 minutes.'
      });
    }
    await user.save();
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Reset login limits on successful login
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location
      },
      token
    }
  });
});

/**
 * Get Current User
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

/**
 * Reset Password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and new password'
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User with this email not found'
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user.password = hashedPassword;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});