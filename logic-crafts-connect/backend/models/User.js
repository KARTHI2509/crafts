import mongoose from 'mongoose';

/**
 * User Schema
 */
const userSchema = new mongoose.Schema(
{
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
  },

  // Shopping Cart
  cart: [
    {
      craft_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Craft'
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],

  // Wishlist
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Craft'
    }
  ],

  // Recently Viewed
  recently_viewed: [
    {
      craft_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Craft'
      },
      viewed_at: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Favorite artisans
  favorite_artisans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  // Notifications
  notifications: [
    {
      message: String,
      is_read: {
        type: Boolean,
        default: false
      },
      created_at: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Buyer analytics
  total_orders: {
    type: Number,
    default: 0
  },

  total_spent: {
    type: Number,
    default: 0
  },

  loyalty_points: {
    type: Number,
    default: 0
  },

  loyalty_level: {
    type: String,
    default: 'bronze'
  },

  isVerified: {
    type: Boolean,
    default: true
  },

  isBanned: {
    type: Boolean,
    default: false
  },

  failedLoginAttempts: {
    type: Number,
    default: 0
  },

  lockUntil: {
    type: Date,
    default: null
  }
},
{
  timestamps: true
}
);

const User = mongoose.model('User', userSchema);

export default User;