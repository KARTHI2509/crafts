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
  role: {
    type: String,
    enum: ['artisan', 'buyer', 'admin'],
    default: 'artisan'
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

export default User;
