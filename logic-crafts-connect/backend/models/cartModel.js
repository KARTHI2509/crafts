/**
 * ============================================
 * CART MODEL - MongoDB/Mongoose
 * ============================================
 * Handles shopping cart operations
 */

import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  craft_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Craft',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for unique cart items per user
cartSchema.index({ buyer_id: 1, craft_id: 1 }, { unique: true });

const Cart = mongoose.model('Cart', cartSchema);

/**
 * Get cart items for a buyer
 */
export const getCartItems = async (buyerId) => {
  const items = await Cart.find({ buyer_id: buyerId })
    .populate({
      path: 'craft_id',
      populate: { path: 'user_id', select: 'name phone location' }
    })
    .sort({ created_at: -1 })
    .lean();

  return items.map(item => ({
    id: item._id.toString(),
    cart_id: item._id.toString(),
    quantity: item.quantity,
    added_at: item.created_at,
    craft_id: item.craft_id?._id?.toString(),
    name: item.craft_id?.name,
    description: item.craft_id?.description,
    price: item.craft_id?.price,
    image_url: item.craft_id?.image_url,
    craft_type: item.craft_id?.craft_type,
    location: item.craft_id?.location,
    status: item.craft_id?.status,
    stock: item.craft_id?.stock,
    artisan_id: item.craft_id?.user_id?._id?.toString(),
    artisan_name: item.craft_id?.user_id?.name,
    subtotal: item.quantity * (item.craft_id?.price || 0)
  }));
};

/**
 * Get cart summary
 */
export const getCartSummary = async (buyerId) => {
  const items = await getCartItems(buyerId);
  const itemCount = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    item_count: itemCount,
    total_quantity: totalQuantity,
    total_price: totalPrice
  };
};

/**
 * Add item to cart
 */
export const addToCart = async (buyerId, craftId, quantity = 1) => {
  const existingItem = await Cart.findOne({ buyer_id: buyerId, craft_id: craftId });

  if (existingItem) {
    existingItem.quantity += quantity;
    await existingItem.save();
    return { id: existingItem._id.toString(), ...existingItem.toObject() };
  }

  const newItem = await Cart.create({
    buyer_id: buyerId,
    craft_id: craftId,
    quantity
  });

  return { id: newItem._id.toString(), ...newItem.toObject() };
};

/**
 * Update cart item quantity
 */
export const updateCartQuantity = async (cartId, buyerId, quantity) => {
  if (quantity <= 0) {
    await removeFromCart(cartId, buyerId);
    return null;
  }

  const item = await Cart.findOneAndUpdate(
    { _id: cartId, buyer_id: buyerId },
    { quantity },
    { new: true }
  ).lean();

  return item ? { id: item._id.toString(), ...item } : null;
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (cartId, buyerId) => {
  const result = await Cart.deleteOne({ _id: cartId, buyer_id: buyerId });
  return result.deletedCount > 0;
};

/**
 * Remove cart item by craft ID
 */
export const removeFromCartByCraft = async (buyerId, craftId) => {
  const result = await Cart.deleteOne({ buyer_id: buyerId, craft_id: craftId });
  return result.deletedCount > 0;
};

/**
 * Clear entire cart
 */
export const clearCart = async (buyerId) => {
  const result = await Cart.deleteMany({ buyer_id: buyerId });
  return result.deletedCount > 0;
};

/**
 * Check if item is in cart
 */
export const isInCart = async (buyerId, craftId) => {
  const item = await Cart.findOne({ buyer_id: buyerId, craft_id: craftId }).lean();
  return item ? { id: item._id.toString(), ...item } : null;
};

/**
 * Get cart items grouped by artisan
 */
export const getCartByArtisan = async (buyerId) => {
  const items = await getCartItems(buyerId);
  
  const grouped = {};
  items.forEach(item => {
    const artisanId = item.artisan_id;
    if (!grouped[artisanId]) {
      grouped[artisanId] = {
        artisan_id: artisanId,
        artisan_name: item.artisan_name,
        items: [],
        subtotal: 0
      };
    }
    grouped[artisanId].items.push(item);
    grouped[artisanId].subtotal += item.subtotal;
  });

  return Object.values(grouped);
};

/**
 * Validate cart items (check stock availability)
 */
export const validateCart = async (buyerId) => {
  const items = await getCartItems(buyerId);
  const issues = [];

  items.forEach(item => {
    if (item.stock === 0) {
      issues.push({ craft_id: item.craft_id, issue: 'out_of_stock', name: item.name });
    } else if (item.quantity > item.stock) {
      issues.push({ craft_id: item.craft_id, issue: 'insufficient_stock', name: item.name, available: item.stock });
    }
  });

  return { valid: issues.length === 0, issues };
};

export default Cart;
