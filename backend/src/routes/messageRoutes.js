import express from 'express';
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteMessage
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Conversations
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);

// Messages
router.get('/:conversationId', getMessages);
router.post('/', sendMessage);
router.delete('/:messageId', deleteMessage);

export default router;
