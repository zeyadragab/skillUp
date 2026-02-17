import express from 'express';
import {
  getPlatformStats,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  adjustUserTokens,
  getAllSessions,
  cancelSession,
  getAnalytics
} from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(requireAdmin);

// Platform statistics
router.get('/stats', getPlatformStats);

// Analytics
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);
router.post('/users/:id/tokens', adjustUserTokens);

// Session management
router.get('/sessions', getAllSessions);
router.delete('/sessions/:id', cancelSession);

export default router;
