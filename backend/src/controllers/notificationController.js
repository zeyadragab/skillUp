import Notification from '../models/Notification.js';

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    const notifications = await Notification.getUserNotifications(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true'
    });

    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread/count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read/clear
// @access  Private
export const clearReadNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({
      recipient: userId,
      isRead: true
    });

    res.status(200).json({
      success: true,
      message: 'Read notifications cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing notifications',
      error: error.message
    });
  }
};

// @desc    Create notification (admin/system only)
// @route   POST /api/notifications
// @access  Private (Admin)
export const createNotification = async (req, res) => {
  try {
    const {
      recipient,
      type,
      title,
      message,
      actionUrl,
      actionText,
      priority,
      expiresAt
    } = req.body;

    if (!recipient || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const notification = await Notification.create({
      recipient,
      sender: req.user._id,
      type,
      title,
      message,
      actionUrl,
      actionText,
      priority: priority || 'normal',
      expiresAt
    });

    // Emit real-time notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(recipient.toString()).emit('notification', notification);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      preferences: user.preferences || {
        emailNotifications: true,
        sessionReminders: true,
        marketingEmails: false
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification preferences',
      error: error.message
    });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailNotifications, sessionReminders, marketingEmails } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (emailNotifications !== undefined) {
      user.preferences.emailNotifications = emailNotifications;
    }
    if (sessionReminders !== undefined) {
      user.preferences.sessionReminders = sessionReminders;
    }
    if (marketingEmails !== undefined) {
      user.preferences.marketingEmails = marketingEmails;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};
