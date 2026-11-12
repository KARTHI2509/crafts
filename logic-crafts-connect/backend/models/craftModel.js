/**
 * ============================================
 * CRAFT MODEL - MongoDB/Mongoose
 * ============================================
 * Contains all database operations related to crafts
 */

import mongoose from 'mongoose';

/**
 * Craft Schema for MongoDB
 */
const craftSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Craft name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  craft_type: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  location: {
    type: String,
    trim: true
  },
  image_url: {
    type: String
  },
  images: [{
    type: String
  }],
  contact: {
    type: String
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
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
    default: true
  },
  made_to_order: {
    type: Boolean,
    default: false
  },
  limited_edition: {
    type: Boolean,
    default: false
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
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  review_count: {
    type: Number,
    default: 0
  },
  story: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient queries
craftSchema.index({ user_id: 1 });
craftSchema.index({ status: 1, visibility: 1 });
craftSchema.index({ category: 1 });
craftSchema.index({ created_at: -1 });
// Text index for search
craftSchema.index({ name: 'text', description: 'text', category: 'text', craft_type: 'text' });

const Craft = mongoose.model('Craft', craftSchema);

/**
 * Create a new craft
 */
export const createCraft = async (craftData) => {
  const craft = await Craft.create({
    ...craftData,
    category: craftData.category || craftData.craft_type,
    image_url: craftData.image_url || (craftData.images && craftData.images.length > 0 ? craftData.images[0] : null)
  });
  
  return formatCraft(craft);
};

/**
 * Get all approved crafts (for public viewing)
 */
export const getAllCrafts = async (limit = 50, offset = 0, filters = {}) => {
  const query = { status: 'approved', visibility: 'public' };
  
  // Search functionality
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { category: { $regex: filters.search, $options: 'i' } },
      { craft_type: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  // Category filter
  if (filters.category) {
    query.category = filters.category;
  }
  
  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
  }
  
  // Location filter
  if (filters.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }
  
  // Sort options
  let sortOption = { created_at: -1 };
  if (filters.sort === 'price_asc') sortOption = { price: 1 };
  else if (filters.sort === 'price_desc') sortOption = { price: -1 };
  else if (filters.sort === 'rating') sortOption = { rating: -1 };
  else if (filters.sort === 'popular') sortOption = { view_count: -1 };
  
  const crafts = await Craft.find(query)
    .populate('user_id', 'name phone location email')
    .sort(sortOption)
    .skip(offset)
    .limit(limit)
    .lean();
  
  return crafts.map(craft => ({
    ...formatCraft(craft),
    artisan_name: craft.user_id?.name,
    artisan_phone: craft.user_id?.phone,
    artisan_location: craft.user_id?.location
  }));
};

/**
 * Get crafts count with filters
 */
export const getCraftsCountFiltered = async (filters = {}) => {
  const query = { status: 'approved', visibility: 'public' };
  
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { category: { $regex: filters.search, $options: 'i' } },
      { craft_type: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  if (filters.category) query.category = filters.category;
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
  }
  if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
  
  return await Craft.countDocuments(query);
};

/**
 * Get related crafts by category
 */
export const getRelatedCrafts = async (craftId, category, limit = 4) => {
  if (!mongoose.Types.ObjectId.isValid(craftId)) return [];
  
  const crafts = await Craft.find({
    _id: { $ne: craftId },
    category: category,
    status: 'approved',
    visibility: 'public'
  })
    .populate('user_id', 'name location')
    .sort({ rating: -1, view_count: -1 })
    .limit(limit)
    .lean();
  
  return crafts.map(craft => ({
    ...formatCraft(craft),
    artisan_name: craft.user_id?.name,
    artisan_location: craft.user_id?.location
  }));
};

/**
 * Get all crafts (admin view)
 */
export const getAllCraftsAdmin = async () => {
  const crafts = await Craft.find()
    .populate('user_id', 'name email')
    .sort({ created_at: -1 })
    .lean();
  
  return crafts.map(craft => ({
    ...formatCraft(craft),
    artisan_name: craft.user_id?.name,
    artisan_email: craft.user_id?.email
  }));
};

/**
 * Get total count of approved crafts
 */
export const getCraftsCount = async () => {
  return await Craft.countDocuments({ status: 'approved', visibility: 'public' });
};

/**
 * Get craft by ID
 */
export const getCraftById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  
  const craft = await Craft.findById(id)
    .populate('user_id', 'name phone email location')
    .lean();
  
  if (!craft) return null;
  
  return {
    ...formatCraft(craft),
    artisan_name: craft.user_id?.name,
    artisan_phone: craft.user_id?.phone,
    artisan_email: craft.user_id?.email,
    artisan_location: craft.user_id?.location
  };
};

/**
 * Get all crafts by a specific user
 */
export const getCraftsByUser = async (userId) => {
  const crafts = await Craft.find({ user_id: userId })
    .populate('user_id', 'name phone email location')
    .sort({ created_at: -1 })
    .lean();
  
  return crafts.map(craft => ({
    ...formatCraft(craft),
    artisan_name: craft.user_id?.name,
    artisan_phone: craft.user_id?.phone,
    artisan_email: craft.user_id?.email,
    artisan_location: craft.user_id?.location
  }));
};

/**
 * Update craft information
 */
export const updateCraft = async (id, userId, updates) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  
  const craft = await Craft.findOneAndUpdate(
    { _id: id, user_id: userId },
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();
  
  return craft ? formatCraft(craft) : null;
};

/**
 * Update craft status (admin only)
 */
export const updateCraftStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  
  const craft = await Craft.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).lean();
  
  return craft ? formatCraft(craft) : null;
};

/**
 * Delete craft
 */
export const deleteCraft = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  
  const result = await Craft.deleteOne({ _id: id, user_id: userId });
  return result.deletedCount > 0;
};

/**
 * Toggle craft visibility
 */
export const toggleCraftVisibility = async (id, userId, visibility) => {
  if (!['public', 'hidden'].includes(visibility)) {
    throw new Error('Invalid visibility. Must be public or hidden');
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  
  const craft = await Craft.findOneAndUpdate(
    { _id: id, user_id: userId },
    { visibility },
    { new: true }
  ).lean();
  
  return craft ? formatCraft(craft) : null;
};

/**
 * Delete craft (admin - no user restriction)
 */
export const deleteCraftAdmin = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  
  const result = await Craft.deleteOne({ _id: id });
  return result.deletedCount > 0;
};

/**
 * Get pending crafts (admin review)
 */
export const getPendingCrafts = async () => {
  const crafts = await Craft.find({ status: 'pending' })
    .populate('user_id', 'name email')
    .sort({ created_at: 1 })
    .lean();
  
  return crafts.map(craft => ({
    ...formatCraft(craft),
    artisan_name: craft.user_id?.name,
    artisan_email: craft.user_id?.email
  }));
};

/**
 * Track craft view
 */
export const trackCraftView = async (craftId, userId = null) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(craftId)) return false;
    
    await Craft.findByIdAndUpdate(craftId, { $inc: { view_count: 1 } });
    return true;
  } catch (error) {
    console.error('Track view error:', error);
    return false;
  }
};

/**
 * Save/bookmark a craft
 */
export const saveCraft = async (craftId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(craftId)) return false;
    
    await Craft.findByIdAndUpdate(craftId, { $inc: { save_count: 1 } });
    return true;
  } catch (error) {
    console.error('Save craft error:', error);
    return false;
  }
};

/**
 * Unsave/unbookmark a craft
 */
export const unsaveCraft = async (craftId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(craftId)) return false;
    
    await Craft.findByIdAndUpdate(craftId, { $inc: { save_count: -1 } });
    return true;
  } catch (error) {
    console.error('Unsave craft error:', error);
    return false;
  }
};

/**
 * Check if user has saved a craft (placeholder - needs SavedCraft model)
 */
export const isCraftSaved = async (craftId, userId) => {
  return false;
};

/**
 * Get artisan statistics
 */
export const getArtisanStats = async (userId) => {
  try {
    const stats = await Craft.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total_crafts: { $sum: 1 },
          total_views: { $sum: '$view_count' },
          total_saves: { $sum: '$save_count' },
          total_orders: { $sum: '$order_count' },
          featured_count: { $sum: { $cond: ['$is_featured', 1, 0] } },
          approved_count: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          pending_count: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }
      }
    ]);
    
    return stats[0] || {
      total_crafts: 0,
      total_views: 0,
      total_saves: 0,
      total_orders: 0,
      featured_count: 0,
      approved_count: 0,
      pending_count: 0
    };
  } catch (error) {
    console.error('Get artisan stats error:', error);
    return null;
  }
};

/**
 * Helper function to format craft for consistent response
 */
const formatCraft = (craft) => {
  if (!craft) return null;
  return {
    id: craft._id.toString(),
    user_id: craft.user_id?._id?.toString() || craft.user_id?.toString(),
    name: craft.name,
    description: craft.description,
    craft_type: craft.craft_type,
    category: craft.category,
    price: craft.price,
    location: craft.location,
    image_url: craft.image_url,
    images: craft.images || [],
    contact: craft.contact,
    stock: craft.stock,
    delivery_days: craft.delivery_days,
    is_featured: craft.is_featured,
    is_new_arrival: craft.is_new_arrival,
    made_to_order: craft.made_to_order,
    limited_edition: craft.limited_edition,
    visibility: craft.visibility,
    status: craft.status,
    view_count: craft.view_count,
    save_count: craft.save_count,
    order_count: craft.order_count,
    rating: craft.rating,
    review_count: craft.review_count,
    story: craft.story,
    created_at: craft.created_at,
    updated_at: craft.updated_at
  };
};

export default Craft;
