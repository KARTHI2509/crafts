/**
 * ============================================
 * MESSAGE MODEL - MongoDB/Mongoose
 * ============================================
 * Handles buyer-artisan messaging
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  craft_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Craft'
  },
  message_text: {
    type: String,
    required: true
  },
  message_type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  attachment_url: {
    type: String
  },
  is_read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

messageSchema.index({ sender_id: 1, receiver_id: 1 });
messageSchema.index({ receiver_id: 1, is_read: 1 });

const Message = mongoose.model('Message', messageSchema);

/**
 * Format message for response
 */
const formatMessage = (msg) => {
  if (!msg) return null;
  return {
    id: msg._id.toString(),
    sender_id: msg.sender_id?._id?.toString() || msg.sender_id?.toString(),
    receiver_id: msg.receiver_id?._id?.toString() || msg.receiver_id?.toString(),
    craft_id: msg.craft_id?._id?.toString() || msg.craft_id?.toString(),
    sender_name: msg.sender_id?.name,
    sender_image: msg.sender_id?.profile_image,
    receiver_name: msg.receiver_id?.name,
    receiver_image: msg.receiver_id?.profile_image,
    craft_title: msg.craft_id?.name,
    craft_images: msg.craft_id?.images || [],
    message_text: msg.message_text,
    message_type: msg.message_type,
    attachment_url: msg.attachment_url,
    is_read: msg.is_read,
    created_at: msg.created_at
  };
};

/**
 * Send a message
 */
export const sendMessage = async (messageData) => {
  const { sender_id, receiver_id, craft_id, message_text, message_type, attachment_url } = messageData;

  const message = await Message.create({
    sender_id,
    receiver_id,
    craft_id: craft_id || null,
    message_text,
    message_type: message_type || 'text',
    attachment_url: attachment_url || null
  });

  return formatMessage(message);
};

/**
 * Get conversation between two users
 */
export const getConversation = async (userId1, userId2, options = {}) => {
  const { limit = 50, offset = 0, craft_id } = options;

  const query = {
    $or: [
      { sender_id: userId1, receiver_id: userId2 },
      { sender_id: userId2, receiver_id: userId1 }
    ]
  };

  if (craft_id) {
    query.craft_id = craft_id;
  }

  const messages = await Message.find(query)
    .populate('sender_id', 'name profile_image')
    .populate('receiver_id', 'name profile_image')
    .populate('craft_id', 'name images')
    .sort({ created_at: 1 })
    .skip(offset)
    .limit(limit)
    .lean();

  return messages.map(formatMessage);
};

/**
 * Get all conversations for a user (inbox)
 */
export const getUserConversations = async (userId) => {
  // Get distinct users the current user has conversed with
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender_id: new mongoose.Types.ObjectId(userId) },
          { receiver_id: new mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $addFields: {
        other_user_id: {
          $cond: {
            if: { $eq: ['$sender_id', new mongoose.Types.ObjectId(userId)] },
            then: '$receiver_id',
            else: '$sender_id'
          }
        }
      }
    },
    { $sort: { created_at: -1 } },
    {
      $group: {
        _id: '$other_user_id',
        last_message: { $first: '$$ROOT' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'other_user'
      }
    },
    { $unwind: '$other_user' },
    {
      $lookup: {
        from: 'crafts',
        localField: 'last_message.craft_id',
        foreignField: '_id',
        as: 'craft'
      }
    },
    {
      $lookup: {
        from: 'messages',
        let: { other_user: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$sender_id', '$$other_user'] },
                  { $eq: ['$receiver_id', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$is_read', false] }
                ]
              }
            }
          },
          { $count: 'count' }
        ],
        as: 'unread'
      }
    },
    { $sort: { 'last_message.created_at': -1 } }
  ]);

  return conversations.map(conv => ({
    other_user_id: conv._id.toString(),
    other_user_name: conv.other_user.name,
    other_user_image: conv.other_user.profile_image,
    other_user_role: conv.other_user.role,
    last_message: {
      id: conv.last_message._id.toString(),
      message_text: conv.last_message.message_text,
      created_at: conv.last_message.created_at,
      is_read: conv.last_message.is_read
    },
    craft_id: conv.craft?.[0]?._id?.toString(),
    craft_title: conv.craft?.[0]?.name,
    craft_images: conv.craft?.[0]?.images || [],
    unread_count: conv.unread?.[0]?.count || 0
  }));
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (userId, senderId) => {
  const result = await Message.updateMany(
    { receiver_id: userId, sender_id: senderId, is_read: false },
    { is_read: true }
  );

  return result.modifiedCount;
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (userId) => {
  const count = await Message.countDocuments({ receiver_id: userId, is_read: false });
  return count;
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) return false;

  const result = await Message.deleteOne({
    _id: messageId,
    sender_id: userId
  });

  return result.deletedCount > 0;
};

/**
 * Search messages
 */
export const searchMessages = async (userId, searchTerm, options = {}) => {
  const { limit = 50 } = options;

  const messages = await Message.find({
    $or: [
      { sender_id: userId },
      { receiver_id: userId }
    ],
    message_text: { $regex: searchTerm, $options: 'i' }
  })
    .populate('sender_id', 'name profile_image')
    .populate('receiver_id', 'name profile_image')
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

  return messages.map(formatMessage);
};

/**
 * Get message statistics
 */
export const getMessageStats = async (userId) => {
  const [totalSent, totalReceived, unreadCount, uniqueConversations] = await Promise.all([
    Message.countDocuments({ sender_id: userId }),
    Message.countDocuments({ receiver_id: userId }),
    Message.countDocuments({ receiver_id: userId, is_read: false }),
    Message.aggregate([
      {
        $match: {
          $or: [
            { sender_id: new mongoose.Types.ObjectId(userId) },
            { receiver_id: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender_id', new mongoose.Types.ObjectId(userId)] },
              then: '$receiver_id',
              else: '$sender_id'
            }
          }
        }
      },
      { $count: 'count' }
    ])
  ]);

  return {
    total_sent: totalSent,
    total_received: totalReceived,
    unread_count: unreadCount,
    unique_conversations: uniqueConversations[0]?.count || 0
  };
};

export default Message;
