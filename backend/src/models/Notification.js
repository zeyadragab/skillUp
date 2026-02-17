import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Notification type
  type: {
    type: String,
    enum: [
      // Session notifications
      'session_booked',        // New session booked
      'session_cancelled',     // Session cancelled
      'session_rescheduled',   // Session time changed
      'session_reminder_24h',  // 24 hours before session
      'session_reminder_1h',   // 1 hour before session
      'session_starting',      // Session starting now
      'session_started',       // Participant joined
      'session_ended',         // Session ended
      'session_completed',     // Session marked as completed
      'session_rated',         // Session was rated
      'session_reviewed',      // New review received

      // Recording notifications
      'recording_ready',       // Recording available
      'recording_expiring',    // Recording expiring soon
      'recording_deleted',     // Recording removed

      // Token/Payment notifications
      'tokens_purchased',      // Tokens bought successfully
      'tokens_received',       // Tokens earned from teaching
      'tokens_spent',          // Tokens spent on booking
      'tokens_low',            // Low token balance warning
      'payment_successful',    // Payment processed
      'payment_failed',        // Payment failed
      'refund_issued',         // Refund processed

      // Profile/Account notifications
      'profile_updated',       // Profile information changed
      'profile_viewed',        // Someone viewed profile
      'avatar_changed',        // Profile picture updated
      'teacher_application',   // Applied to become teacher
      'teacher_approved',      // Teacher status approved
      'teacher_rejected',      // Teacher application denied
      'account_verified',      // Email/account verified
      'password_changed',      // Password updated

      // Social notifications
      'new_follower',          // New follower
      'new_review',            // New review received
      'review_response',       // Teacher responded to review
      'new_message',           // New chat message

      // Availability notifications
      'availability_updated',  // Teacher updated schedule
      'slot_booked',           // Time slot was booked

      // System notifications
      'system',                // System announcement
      'admin',                 // Admin notification
      'welcome',               // Welcome new user
      'maintenance',           // Scheduled maintenance
      'feature_update'         // New feature announcement
    ],
    required: true
  },

  // Notification content
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  icon: String, // Emoji or icon name

  // Related entities
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  recording: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recording'
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },

  // Action link
  actionUrl: String, // URL to navigate to when clicked
  actionText: String, // Button text like "View Session", "Join Now"

  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,

  // Delivery status
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  pushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: Date,
  inAppDelivered: {
    type: Boolean,
    default: true // In-app is always delivered
  },

  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // Expiration (for time-sensitive notifications)
  expiresAt: Date,

  // Metadata for additional data
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Compound indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// Mark notification as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return this;
};

// Check if notification is expired
notificationSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Static method to create session booking notification
notificationSchema.statics.createSessionBookingNotification = async function(session, teacher, learner) {
  return this.create({
    recipient: teacher._id,
    sender: learner._id,
    type: 'session_booked',
    title: '🎉 New Session Booked!',
    message: `${learner.name} has booked a session with you for ${session.skill}`,
    session: session._id,
    actionUrl: `/sessions/${session._id}`,
    actionText: 'View Session',
    priority: 'high'
  });
};

// Static method to create session reminder notifications
notificationSchema.statics.createSessionReminderNotifications = async function(session, hoursBeforeSession) {
  const type = hoursBeforeSession === 24 ? 'session_reminder_24h' : 'session_reminder_1h';
  const timeText = hoursBeforeSession === 24 ? '24 hours' : '1 hour';

  const notifications = [
    {
      recipient: session.teacher,
      type,
      title: `⏰ Session Reminder`,
      message: `Your session for ${session.skill} starts in ${timeText}`,
      session: session._id,
      actionUrl: `/sessions/${session._id}`,
      actionText: 'View Details',
      priority: 'high',
      icon: '⏰'
    },
    {
      recipient: session.learner,
      type,
      title: `⏰ Session Reminder`,
      message: `Your session for ${session.skill} starts in ${timeText}`,
      session: session._id,
      actionUrl: `/sessions/${session._id}`,
      actionText: 'View Details',
      priority: 'high',
      icon: '⏰'
    }
  ];

  return this.insertMany(notifications);
};

// Static method to create recording ready notification
notificationSchema.statics.createRecordingReadyNotification = async function(recording, recipients) {
  const notifications = recipients.map(userId => ({
    recipient: userId,
    type: 'recording_ready',
    title: '🎬 Recording Ready!',
    message: `The recording for "${recording.title}" is now available`,
    recording: recording._id,
    session: recording.session,
    actionUrl: `/recordings/${recording._id}`,
    actionText: 'Watch Now',
    priority: 'normal',
    icon: '🎬'
  }));

  return this.insertMany(notifications);
};

// Static method to get user's unread notifications
notificationSchema.statics.getUnreadNotifications = function(userId, limit = 50) {
  return this.find({
    recipient: userId,
    isRead: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name avatar')
    .populate('session', 'title skill scheduledAt')
    .populate('recording', 'title thumbnailUrl');
};

// Static method to get user's all notifications
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    unreadOnly = false
  } = options;

  const query = {
    recipient: userId,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  };

  if (unreadOnly) {
    query.isRead = false;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name avatar')
    .populate('session', 'title skill scheduledAt')
    .populate('recording', 'title thumbnailUrl');
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    {
      recipient: userId,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
