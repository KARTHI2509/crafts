import pool from '../config/db.js';

/**
 * Send a message
 * @param {Object} messageData - { sender_id, receiver_id, craft_id, message_text, message_type, attachment_url }
 * @returns {Object} Created message
 */
export const sendMessage = async (messageData) => {
  const { sender_id, receiver_id, craft_id, message_text, message_type = 'text', attachment_url } = messageData;
  
  try {
    const query = `
      INSERT INTO messages (sender_id, receiver_id, craft_id, message_text, message_type, attachment_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      sender_id,
      receiver_id,
      craft_id || null,
      message_text,
      message_type,
      attachment_url || null
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get conversation between two users
 * @param {number} userId1 - First user ID
 * @param {number} userId2 - Second user ID
 * @param {Object} options - { limit, offset, craft_id }
 * @returns {Array} Messages
 */
export const getConversation = async (userId1, userId2, options = {}) => {
  const { limit = 50, offset = 0, craft_id } = options;
  
  try {
    let query = `
      SELECT 
        m.*,
        sender.name as sender_name,
        sender.profile_image as sender_image,
        receiver.name as receiver_name,
        receiver.profile_image as receiver_image,
        c.title as craft_title,
        c.images as craft_images
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      LEFT JOIN crafts c ON m.craft_id = c.id
      WHERE (
        (m.sender_id = $1 AND m.receiver_id = $2) OR
        (m.sender_id = $2 AND m.receiver_id = $1)
      )
    `;
    
    const queryParams = [userId1, userId2];
    
    if (craft_id) {
      query += ` AND m.craft_id = $${queryParams.length + 1}`;
      queryParams.push(craft_id);
    }
    
    query += ` ORDER BY m.created_at ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    const messages = result.rows.map(msg => ({
      ...msg,
      craft_images: msg.craft_images ? JSON.parse(msg.craft_images) : []
    }));
    
    return messages;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

/**
 * Get all conversations for a user (inbox)
 * @param {number} userId - User ID
 * @returns {Array} Conversations with last message
 */
export const getUserConversations = async (userId) => {
  try {
    const query = `
      WITH latest_messages AS (
        SELECT DISTINCT ON (
          CASE 
            WHEN sender_id = $1 THEN receiver_id 
            ELSE sender_id 
          END
        )
          m.*,
          CASE 
            WHEN sender_id = $1 THEN receiver_id 
            ELSE sender_id 
          END as other_user_id
        FROM messages m
        WHERE sender_id = $1 OR receiver_id = $1
        ORDER BY 
          CASE 
            WHEN sender_id = $1 THEN receiver_id 
            ELSE sender_id 
          END,
          created_at DESC
      )
      SELECT 
        lm.*,
        u.name as other_user_name,
        u.profile_image as other_user_image,
        u.role as other_user_role,
        c.title as craft_title,
        c.images as craft_images,
        (
          SELECT COUNT(*)
          FROM messages
          WHERE receiver_id = $1 
            AND sender_id = lm.other_user_id
            AND is_read = false
        ) as unread_count
      FROM latest_messages lm
      JOIN users u ON lm.other_user_id = u.id
      LEFT JOIN crafts c ON lm.craft_id = c.id
      ORDER BY lm.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    const conversations = result.rows.map(conv => ({
      ...conv,
      craft_images: conv.craft_images ? JSON.parse(conv.craft_images) : [],
      unread_count: parseInt(conv.unread_count)
    }));
    
    return conversations;
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 * @param {number} userId - Receiver ID
 * @param {number} senderId - Sender ID
 * @returns {number} Number of messages marked as read
 */
export const markMessagesAsRead = async (userId, senderId) => {
  try {
    const query = `
      UPDATE messages
      SET is_read = true
      WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false
      RETURNING id
    `;
    
    const result = await pool.query(query, [userId, senderId]);
    return result.rowCount;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Get unread message count for a user
 * @param {number} userId - User ID
 * @returns {number} Unread count
 */
export const getUnreadCount = async (userId) => {
  try {
    const query = `
      SELECT COUNT(*) as unread_count
      FROM messages
      WHERE receiver_id = $1 AND is_read = false
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].unread_count);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Delete a message (soft delete)
 * @param {number} messageId - Message ID
 * @param {number} userId - User ID (for authorization)
 * @returns {boolean} Success status
 */
export const deleteMessage = async (messageId, userId) => {
  try {
    // Only sender can delete their own message
    const result = await pool.query(
      'DELETE FROM messages WHERE id = $1 AND sender_id = $2',
      [messageId, userId]
    );
    
    if (result.rowCount === 0) {
      throw new Error('Message not found or unauthorized');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Search messages
 * @param {number} userId - User ID
 * @param {string} searchTerm - Search term
 * @returns {Array} Matching messages
 */
export const searchMessages = async (userId, searchTerm) => {
  try {
    const query = `
      SELECT 
        m.*,
        sender.name as sender_name,
        receiver.name as receiver_name,
        c.title as craft_title
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      LEFT JOIN crafts c ON m.craft_id = c.id
      WHERE (m.sender_id = $1 OR m.receiver_id = $1)
        AND m.message_text ILIKE $2
      ORDER BY m.created_at DESC
      LIMIT 50
    `;
    
    const result = await pool.query(query, [userId, `%${searchTerm}%`]);
    return result.rows;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

/**
 * Get message statistics for a user
 * @param {number} userId - User ID
 * @returns {Object} Message stats
 */
export const getMessageStats = async (userId) => {
  try {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE sender_id = $1) as sent_count,
        COUNT(*) FILTER (WHERE receiver_id = $1) as received_count,
        COUNT(*) FILTER (WHERE receiver_id = $1 AND is_read = false) as unread_count,
        COUNT(DISTINCT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END) as conversation_count
      FROM messages
      WHERE sender_id = $1 OR receiver_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    const stats = result.rows[0];
    
    return {
      sent_count: parseInt(stats.sent_count),
      received_count: parseInt(stats.received_count),
      unread_count: parseInt(stats.unread_count),
      conversation_count: parseInt(stats.conversation_count)
    };
  } catch (error) {
    console.error('Error fetching message stats:', error);
    throw error;
  }
};

export default {
  sendMessage,
  getConversation,
  getUserConversations,
  markMessagesAsRead,
  getUnreadCount,
  deleteMessage,
  searchMessages,
  getMessageStats
};
