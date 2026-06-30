/**
 * ============================================
 * MESSAGE MODEL
 * ============================================
 * Stores messages between users
 * Supports:
 * - Text messages
 * - Image/file attachments
 * - Craft-related chats
 * - Read/unread tracking
 */

import mongoose from 'mongoose';

/**
 * Message Schema
 */
const messageSchema = new mongoose.Schema(
{
  // User who sends the message
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // User who receives the message
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Optional related craft
  craft_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Craft',
    default: null
  },

  // Main message content
  message_text: {
    type: String,
    required: true,
    trim: true
  },

  // Type of message
  message_type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },

  // Optional attachment
  attachment_url: {
    type: String,
    default: null
  },

  // Read status
  is_read: {
    type: Boolean,
    default: false
  }
},
{
  // Automatically adds:
  // createdAt
  // updatedAt
  timestamps: true
});

// Add indexes for faster querying
messageSchema.index({ sender_id: 1 });
messageSchema.index({ receiver_id: 1 });
messageSchema.index({ sender_id: 1, receiver_id: 1 });

/**
 * Create Message model
 */
const Message = mongoose.model('Message', messageSchema);

export default Message;