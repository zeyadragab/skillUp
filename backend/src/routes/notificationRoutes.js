import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  createNotification,
  getNotificationPreferences,
  updateNotificationPreferences
} from '../controllers/notificationController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updateNotificationPreferences);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/read/clear', clearReadNotifications);

// Admin only
router.post('/', requireAdmin, createNotification);

export default router;
