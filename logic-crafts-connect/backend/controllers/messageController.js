import Message from '../models/Message.js';

/**
 * Send Message
 */
export const sendNewMessage = async (req, res) => {
  try {
    const { receiver_id, craft_id, message_text, message_type, attachment_url } = req.body;

    if (!receiver_id || !message_text) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message text are required'
      });
    }

    if (req.user.id === receiver_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    const message = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      craft_id,
      message_text,
      message_type,
      attachment_url
    });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(receiver_id.toString()).emit('newMessage', message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Conversation
 */
export const getConversationWithUser = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: req.user.id, receiver_id: req.params.userId },
        { sender_id: req.params.userId, receiver_id: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: { messages }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Inbox
 */
export const getInbox = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: req.user.id },
        { receiver_id: req.user.id }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { messages }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark Read
 */
export const markAsRead = async (req, res) => {
  try {
    const result = await Message.updateMany(
      {
        sender_id: req.params.senderId,
        receiver_id: req.user.id,
        is_read: false
      },
      {
        $set: { is_read: true }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} message(s) marked as read`
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Unread Count
 */
export const getUnreadMessageCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver_id: req.user.id,
      is_read: false
    });

    res.json({
      success: true,
      data: { unread_count: count }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete Message
 */
export const deleteMessageById = async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      sender_id: req.user.id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Search Messages
 */
export const searchUserMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: req.user.id },
        { receiver_id: req.user.id }
      ],
      message_text: {
        $regex: req.query.q,
        $options: 'i'
      }
    });

    res.json({
      success: true,
      data: { messages }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Message Stats
 */
export const getUserMessageStats = async (req, res) => {
  try {
    const sent = await Message.countDocuments({ sender_id: req.user.id });
    const received = await Message.countDocuments({ receiver_id: req.user.id });
    const unread = await Message.countDocuments({
      receiver_id: req.user.id,
      is_read: false
    });

    res.json({
      success: true,
      data: {
        stats: {
          sent,
          received,
          unread
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};