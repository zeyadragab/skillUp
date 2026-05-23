import express from 'express';
import {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  cancelNotification,
  getNotificationStats,
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  deleteAdminNotification,
  getAdminNotificationStats
} from '../controllers/notificationsController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Admin notification routes (for admin panel notifications)
router.get('/admin/stats', getAdminNotificationStats);
router.get('/admin', getAdminNotifications);
router.put('/admin/read-all', markAllAdminNotificationsRead);
router.put('/admin/:id/read', markAdminNotificationRead);
router.delete('/admin/:id', deleteAdminNotification);

// System notification routes (notifications to users) - requires permission
router.use(hasPermission('notifications'));
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.get('/:id', getNotification);
router.post('/', createNotification);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);
router.post('/:id/send', sendNotification);
router.post('/:id/cancel', cancelNotification);

export default router;
