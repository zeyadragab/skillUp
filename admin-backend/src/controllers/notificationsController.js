import SystemNotification from '../models/SystemNotification.js';
import AdminNotification from '../models/AdminNotification.js';
import { User } from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all system notifications
// @route   GET /api/admin/notifications
export const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const notifications = await SystemNotification.find(query)
      .populate('createdBy', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SystemNotification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

// @desc    Get single notification
// @route   GET /api/admin/notifications/:id
export const getNotification = async (req, res) => {
  try {
    const notification = await SystemNotification.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification'
    });
  }
};

// @desc    Create system notification
// @route   POST /api/admin/notifications
export const createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      targetAudience = 'all',
      targetUsers = [],
      priority = 'normal',
      scheduledAt,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Calculate target user count
    let targetCount = 0;
    if (targetAudience === 'all') {
      targetCount = await User.countDocuments({ isActive: true });
    } else if (targetAudience === 'teachers') {
      targetCount = await User.countDocuments({ isActive: true, role: 'teacher' });
    } else if (targetAudience === 'learners') {
      targetCount = await User.countDocuments({ isActive: true, role: 'learner' });
    } else if (targetAudience === 'specific') {
      targetCount = targetUsers.length;
    }

    const notification = await SystemNotification.create({
      title,
      message,
      type,
      targetAudience,
      targetUsers: targetAudience === 'specific' ? targetUsers : [],
      priority,
      scheduledAt: scheduledAt || new Date(),
      expiresAt,
      createdBy: req.admin._id,
      status: scheduledAt && new Date(scheduledAt) > new Date() ? 'scheduled' : 'active',
      stats: {
        totalTargeted: targetCount,
        delivered: 0,
        read: 0
      }
    });

    await logActivity(req, 'notification_create', 'notification', notification._id, {
      title,
      targetAudience,
      targetCount
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification'
    });
  }
};

// @desc    Update notification
// @route   PUT /api/admin/notifications/:id
export const updateNotification = async (req, res) => {
  try {
    const notification = await SystemNotification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Only allow updates for scheduled or draft notifications
    if (notification.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a notification that has already been sent'
      });
    }

    const allowedUpdates = ['title', 'message', 'type', 'targetAudience', 'targetUsers', 'priority', 'scheduledAt', 'expiresAt'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        notification[field] = req.body[field];
      }
    });

    await notification.save();

    await logActivity(req, 'notification_update', 'notification', notification._id);

    res.status(200).json({
      success: true,
      message: 'Notification updated successfully',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/admin/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const notification = await SystemNotification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.deleteOne();

    await logActivity(req, 'notification_delete', 'notification', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification'
    });
  }
};

// @desc    Send notification immediately
// @route   POST /api/admin/notifications/:id/send
export const sendNotification = async (req, res) => {
  try {
    const notification = await SystemNotification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Notification has already been sent'
      });
    }

    // Get target users based on audience
    let targetUserIds = [];
    if (notification.targetAudience === 'all') {
      const users = await User.find({ isActive: true }).select('_id');
      targetUserIds = users.map(u => u._id);
    } else if (notification.targetAudience === 'teachers') {
      const users = await User.find({ isActive: true, role: 'teacher' }).select('_id');
      targetUserIds = users.map(u => u._id);
    } else if (notification.targetAudience === 'learners') {
      const users = await User.find({ isActive: true, role: 'learner' }).select('_id');
      targetUserIds = users.map(u => u._id);
    } else if (notification.targetAudience === 'specific') {
      targetUserIds = notification.targetUsers;
    }

    // Update notification status
    notification.status = 'sent';
    notification.sentAt = new Date();
    notification.stats.totalTargeted = targetUserIds.length;
    notification.stats.delivered = targetUserIds.length; // Simplified - assume all delivered

    await notification.save();

    // Here you would implement actual notification delivery (push, email, in-app, etc.)
    // For now, we'll just mark it as sent

    await logActivity(req, 'notification_send', 'notification', notification._id, {
      targetCount: targetUserIds.length
    });

    res.status(200).json({
      success: true,
      message: `Notification sent to ${targetUserIds.length} users`,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending notification'
    });
  }
};

// @desc    Cancel scheduled notification
// @route   POST /api/admin/notifications/:id/cancel
export const cancelNotification = async (req, res) => {
  try {
    const notification = await SystemNotification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled notifications can be cancelled'
      });
    }

    notification.status = 'cancelled';
    notification.cancelledAt = new Date();
    notification.cancelledBy = req.admin._id;

    await notification.save();

    await logActivity(req, 'notification_cancel', 'notification', notification._id);

    res.status(200).json({
      success: true,
      message: 'Notification cancelled successfully',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling notification'
    });
  }
};

// @desc    Get notification statistics
// @route   GET /api/admin/notifications/stats
export const getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await SystemNotification.countDocuments();
    const sentNotifications = await SystemNotification.countDocuments({ status: 'sent' });
    const scheduledNotifications = await SystemNotification.countDocuments({ status: 'scheduled' });
    const activeNotifications = await SystemNotification.countDocuments({ status: 'active' });

    // Notifications by type
    const byType = await SystemNotification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent notifications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCount = await SystemNotification.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalNotifications,
        sentNotifications,
        scheduledNotifications,
        activeNotifications,
        recentCount,
        byType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification statistics'
    });
  }
};

// ============ ADMIN NOTIFICATIONS (for admin panel) ============

// @desc    Get admin notifications (notifications for admins about platform activity)
// @route   GET /api/admin/notifications/admin
export const getAdminNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      isRead,
      priority,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const notifications = await AdminNotification.find(query)
      .populate('relatedUser', 'name email avatar')
      .populate('readBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AdminNotification.countDocuments(query);
    const unreadCount = await AdminNotification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin notifications'
    });
  }
};

// @desc    Mark admin notification as read
// @route   PUT /api/admin/notifications/admin/:id/read
export const markAdminNotificationRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    notification.readBy = req.admin._id;
    
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read'
    });
  }
};

// @desc    Mark all admin notifications as read
// @route   PUT /api/admin/notifications/admin/read-all
export const markAllAdminNotificationsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany(
      { isRead: false },
      { 
        isRead: true,
        readAt: new Date(),
        readBy: req.admin._id
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read'
    });
  }
};

// @desc    Delete admin notification
// @route   DELETE /api/admin/notifications/admin/:id
export const deleteAdminNotification = async (req, res) => {
  try {
    const notification = await AdminNotification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification'
    });
  }
};

// @desc    Get admin notification stats
// @route   GET /api/admin/notifications/admin/stats
export const getAdminNotificationStats = async (req, res) => {
  try {
    const total = await AdminNotification.countDocuments();
    const unread = await AdminNotification.countDocuments({ isRead: false });
    const today = await AdminNotification.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    // By priority
    const byPriority = await AdminNotification.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // By type
    const byType = await AdminNotification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        unread,
        today,
        byPriority,
        byType
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification statistics'
    });
  }
};
