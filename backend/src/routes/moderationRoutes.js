import express from 'express';
import {
  logFlaggedMessage,
  getSessionFlags,
  getUserFlags
} from '../controllers/moderationController.js';
import { protect, requireAdmin, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Log a flagged message (any authenticated user)
router.post('/flag', logFlaggedMessage);

// Get all flags for a session (admin or teacher only)
router.get('/session/:sessionId', requireAdmin, getSessionFlags);

// Get all flags for a user (admin or teacher only)
router.get('/user/:userId', requireAdmin, getUserFlags);

export default router;
