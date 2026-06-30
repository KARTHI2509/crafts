import mongoose from 'mongoose';

/**
 * Craft Schema
 */
const craftSchema = new mongoose.Schema(
{
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String
  },

  craft_type: {
    type: String
  },

  category: {
    type: String
  },

  price: {
    type: Number,
    required: true
  },

  location: {
    type: String
  },

  image_url: {
    type: String
  },

  images: [
    {
      type: String
    }
  ],

  contact: {
    type: String
  },

  stock: {
    type: Number,
    default: 0
  },

  delivery_days: {
    type: Number,
    default: 7
  },

  is_featured: {
    type: Boolean,
    default: false
  },

  is_new_arrival: {
    type: Boolean,
    default: false
  },

  made_to_order: {
    type: Boolean,
    default: false
  },

  limited_edition: {
    type: Boolean,
    default: false
  },

  rating: {
    type: Number,
    default: 0
  },

  view_count: {
    type: Number,
    default: 0
  },

  save_count: {
    type: Number,
    default: 0
  },

  order_count: {
    type: Number,
    default: 0
  },

  visibility: {
    type: String,
    enum: ['public', 'hidden'],
    default: 'public'
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
},
{
  timestamps: true
});

const Craft = mongoose.model('Craft', craftSchema);

export default Craft;