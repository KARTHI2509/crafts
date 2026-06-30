import mongoose from 'mongoose';

/**
 * Event Tracking Analytics Log Schema
 */
const analyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_visit',
      'product_click',
      'cart_add',
      'checkout_start',
      'checkout_success',
      'user_retention',
      'search',
      'wishlist_add'
    ]
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  sessionId: {
    type: String,
    required: true
  },
  
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexing for high-speed date range filters and event groupings
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
