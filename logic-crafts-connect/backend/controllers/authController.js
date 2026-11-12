/**
 * ============================================
 * AUTHENTICATION CONTROLLER
 * ============================================
 * Handles user registration and login
 * - Register new users with password hashing
 * - Login existing users with JWT token generation
 * - Password comparison using bcrypt
 * - Password strength validation
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { createUser, findUserByEmail, setVerificationToken, verifyEmail, setPasswordResetToken, resetPasswordWithToken } from '../models/userModel.js';
import { generateVerificationToken, generateResetToken, sendVerificationEmail, sendPasswordResetEmail } from '../config/email.js';

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
 * Validate password strength
 * @param {string} password
 * @returns {object} { isValid: boolean, message: string }
 */
const validatePassword = (password) => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true, message: 'Password is strong' };
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

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Sanitize inputs
    const sanitizedName = validator.escape(name.trim());
    const sanitizedEmail = validator.normalizeEmail(email.toLowerCase());

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
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
    const existingUser = await findUserByEmail(sanitizedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    // Salt rounds: 12 for better security
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in database with role
    const user = await createUser({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      phone: phone ? validator.escape(phone.trim()) : undefined,
      location: location ? validator.escape(location.trim()) : undefined,
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

    // Validate and sanitize email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    const sanitizedEmail = validator.normalizeEmail(email.toLowerCase());

    // Find user by email (include password for comparison)
    const user = await findUserByEmail(sanitizedEmail);
    if (!user) {
      // Use same message for security (don't reveal if email exists)
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

/**
 * @desc    Verify email with token
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const user = await verifyEmail(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a verification link'
      });
    }

    // Generate and save verification token
    const token = generateVerificationToken();
    await setVerificationToken(user.id, token);

    // Send verification email
    await sendVerificationEmail(email, user.name, token);

    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification email',
      error: error.message
    });
  }
};

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate reset token
    const token = generateResetToken();
    const user = await setPasswordResetToken(email, token);

    if (user) {
      // Send reset email
      await sendPasswordResetEmail(email, user.name, token);
    }

    // Always return success to not reveal if email exists
    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request',
      error: error.message
    });
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Reset password
    const user = await resetPasswordWithToken(token, hashedPassword);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};
