import mongoose from 'mongoose';

/**
 * User Schema for MongoDB
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password']
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  website: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['artisan', 'buyer', 'admin'],
    default: 'artisan'
  },
  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  // Password reset fields
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create User model
const User = mongoose.model('User', userSchema);

/**
 * Create a new user in the database
 * @param {Object} userData - User data {name, email, password, phone, location, role}
 * @returns {Object} - Created user object
 */
export const createUser = async (userData) => {
  const user = await User.create(userData);
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    location: user.location,
    created_at: user.createdAt
  };
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Object|null} - User object or null
 */
export const findUserByEmail = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    password: user.password, // Include for authentication
    role: user.role,
    phone: user.phone,
    location: user.location,
    created_at: user.createdAt,
    updated_at: user.updatedAt
  };
};

/**
 * Find user by ID
 * @param {string} id - User ID
 * @returns {Object|null} - User object without password
 */
export const findUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) return null;
  
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    location: user.location,
    created_at: user.createdAt,
    updated_at: user.updatedAt
  };
};

/**
 * Find user by ID with password (for password change)
 * @param {string} id - User ID
 * @returns {Object|null} - User object with password
 */
export const findUserByIdWithPassword = async (id) => {
  const user = await User.findById(id);
  if (!user) return null;
  
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
    phone: user.phone,
    location: user.location,
    created_at: user.createdAt,
    updated_at: user.updatedAt
  };
};

/**
 * Update user information
 * @param {string} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated user object
 */
export const updateUser = async (id, updates) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) return null;
  
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    location: user.location,
    updated_at: user.updatedAt
  };
};

/**
 * Delete user by ID
 * @param {string} id - User ID
 * @returns {boolean} - Success status
 */
export const deleteUser = async (id) => {
  const result = await User.findByIdAndDelete(id);
  return result !== null;
};

/**
 * Get all users (admin only)
 * @returns {Array} - Array of user objects
 */
export const getAllUsers = async () => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  
  return users.map(user => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    location: user.location,
    created_at: user.createdAt
  }));
};

/**
 * Set email verification token
 * @param {string} id - User ID
 * @param {string} token - Verification token
 * @returns {Object} - Updated user
 */
export const setVerificationToken = async (id, token) => {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const user = await User.findByIdAndUpdate(
    id,
    {
      emailVerificationToken: token,
      emailVerificationExpires: expires
    },
    { new: true }
  );
  return user;
};

/**
 * Verify email with token
 * @param {string} token - Verification token
 * @returns {Object|null} - User if verified, null otherwise
 */
export const verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() }
  });
  
  if (!user) return null;
  
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();
  
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified
  };
};

/**
 * Set password reset token
 * @param {string} email - User email
 * @param {string} token - Reset token
 * @returns {Object|null} - User if found
 */
export const setPasswordResetToken = async (email, token) => {
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      passwordResetToken: token,
      passwordResetExpires: expires
    },
    { new: true }
  );
  return user ? { id: user._id.toString(), name: user.name, email: user.email } : null;
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New hashed password
 * @returns {Object|null} - User if reset successful
 */
export const resetPasswordWithToken = async (token, newPassword) => {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });
  
  if (!user) return null;
  
  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();
  
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email
  };
};

export default User;
