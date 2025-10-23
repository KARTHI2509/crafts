import express from 'express';
import {
  sendNewMessage,
  getConversationWithUser,
  getInbox,
  markAsRead,
  getUnreadMessageCount,
  deleteMessageById,
  searchUserMessages,
  getUserMessageStats
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All message routes require authentication
 */
router.use(protect);

// Send a new message
router.post('/', sendNewMessage);

// Get inbox (all conversations)
router.get('/inbox', getInbox);

// Get unread message count
router.get('/unread-count', getUnreadMessageCount);

// Search messages
router.get('/search', searchUserMessages);

// Get message statistics
router.get('/stats', getUserMessageStats);

// Get conversation with specific user
router.get('/conversation/:userId', getConversationWithUser);

// Mark messages from a sender as read
router.put('/mark-read/:senderId', markAsRead);

// Delete a message
router.delete('/:id', deleteMessageById);

export default router;
