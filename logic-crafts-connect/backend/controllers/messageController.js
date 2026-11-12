import {
  sendMessage,
  getConversation,
  getUserConversations,
  markMessagesAsRead,
  getUnreadCount,
  deleteMessage,
  searchMessages,
  getMessageStats
} from '../models/messageModel.js';

/**
 * Send a message
 * POST /api/messages
 * Authenticated users
 */
export const sendNewMessage = async (req, res) => {
  try {
    const { receiver_id, craft_id, message_text, message_type, attachment_url } = req.body;
    const sender_id = req.user.id;
    
    // Validation
    if (!receiver_id || !message_text) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message text are required'
      });
    }
    
    if (sender_id === receiver_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }
    
    const message = await sendMessage({
      sender_id,
      receiver_id,
      craft_id,
      message_text,
      message_type,
      attachment_url
    });
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

/**
 * Get conversation with another user
 * GET /api/messages/conversation/:userId
 * Authenticated users
 */
export const getConversationWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { limit, offset, craft_id } = req.query;
    
    const messages = await getConversation(currentUserId, userId, {
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      craft_id: craft_id ? parseInt(craft_id) : null
    });
    
    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
};

/**
 * Get all conversations (inbox)
 * GET /api/messages/inbox
 * Authenticated users
 */
export const getInbox = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await getUserConversations(userId);
    
    res.json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inbox',
      error: error.message
    });
  }
};

/**
 * Mark messages as read
 * PUT /api/messages/mark-read/:senderId
 * Authenticated users
 */
export const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user.id;
    
    const count = await markMessagesAsRead(receiverId, senderId);
    
    res.json({
      success: true,
      message: `${count} message(s) marked as read`,
      data: { marked_count: count }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

/**
 * Get unread message count
 * GET /api/messages/unread-count
 * Authenticated users
 */
export const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);
    
    res.json({
      success: true,
      data: { unread_count: count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

/**
 * Delete a message
 * DELETE /api/messages/:id
 * Authenticated users (sender only)
 */
export const deleteMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await deleteMessage(id, userId);
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    
    if (error.message.includes('not found or unauthorized')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

/**
 * Search messages
 * GET /api/messages/search
 * Authenticated users
 */
export const searchUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const messages = await searchMessages(userId, q);
    
    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages',
      error: error.message
    });
  }
};

/**
 * Get message statistics
 * GET /api/messages/stats
 * Authenticated users
 */
export const getUserMessageStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getMessageStats(userId);
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics',
      error: error.message
    });
  }
};

export default {
  sendNewMessage,
  getConversationWithUser,
  getInbox,
  markAsRead,
  getUnreadMessageCount,
  deleteMessageById,
  searchUserMessages,
  getUserMessageStats
};
