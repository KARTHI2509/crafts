/**
 * ============================================
 * AUTHENTICATION CONTROLLER
 * ============================================
 * Handles user registration and login
 * - Register new users with password hashing
 * - Login existing users with JWT token generation
 * - Password comparison using bcrypt
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/userModel.js';

/**
 * Generate JWT token
 * @param {number} id - User ID
 * @returns {string} - JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, location, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Validate role if provided
    const validRoles = ['artisan', 'buyer', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be artisan, buyer, or admin'
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    // Salt rounds: 10 is a good balance between security and performance
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in database with role
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      role: role || 'artisan'  // Default to artisan if not provided
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user info and token (excluding password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email (include password for comparison)
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password with hashed password in database
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user info and token (excluding password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private (requires authentication)
 */
export const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};
