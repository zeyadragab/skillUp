import Notification from '../models/Notification.js';

/**
 * Notification Service
 * Centralized service for creating notifications across all user activities
 */

// Helper function to emit real-time notification via Socket.io
const emitNotification = (io, recipientId, notification) => {
  if (io) {
    io.to(recipientId.toString()).emit('notification', notification);
  }
};

// ============================================
// SESSION NOTIFICATIONS
// ============================================

export const notifySessionBooked = async (session, teacher, learner, io = null) => {
  try {
    // Notify teacher
    const teacherNotification = await Notification.create({
      recipient: teacher._id,
      sender: learner._id,
      type: 'session_booked',
      title: '🎉 New Session Booked!',
      message: `${learner.name} has booked a session with you for ${session.skill}`,
      session: session._id,
      actionUrl: `/sessions/${session._id}`,
      actionText: 'View Session',
      priority: 'high',
      icon: '🎉'
    });

    emitNotification(io, teacher._id, teacherNotification);

    // Notify learner (confirmation)
    const learnerNotification = await Notification.create({
      recipient: learner._id,
      type: 'session_booked',
      title: '✅ Session Confirmed!',
      message: `Your session with ${teacher.name} for ${session.skill} has been confirmed`,
      session: session._id,
      actionUrl: `/sessions/${session._id}`,
      actionText: 'View Details',
      priority: 'normal',
      icon: '✅'
    });

    emitNotification(io, learner._id, learnerNotification);

    return { teacherNotification, learnerNotification };
  } catch (error) {
    console.error('Error creating session booked notifications:', error);
    return null;
  }
};

export const notifySessionCancelled = async (session, teacher, learner, cancelledBy, io = null) => {
  try {
    const cancellerName = cancelledBy === 'teacher' ? teacher.name : learner.name;
    const notifyUserId = cancelledBy === 'teacher' ? learner._id : teacher._id;
    const notifyUserName = cancelledBy === 'teacher' ? learner.name : teacher.name;

    const notification = await Notification.create({
      recipient: notifyUserId,
      sender: cancelledBy === 'teacher' ? teacher._id : learner._id,
      type: 'session_cancelled',
      title: '❌ Session Cancelled',
      message: `${cancellerName} has cancelled the session for ${session.skill}`,
      session: session._id,
      actionUrl: '/sessions',
      actionText: 'Find Another Session',
      priority: 'high',
      icon: '❌'
    });

    emitNotification(io, notifyUserId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating session cancelled notification:', error);
    return null;
  }
};

export const notifySessionCompleted = async (session, teacher, learner, io = null) => {
  try {
    // Notify both participants
    const notifications = await Notification.insertMany([
      {
        recipient: teacher._id,
        type: 'session_completed',
        title: '🏆 Session Completed!',
        message: `Your session with ${learner.name} has been completed. Please rate your experience.`,
        session: session._id,
        actionUrl: `/sessions/${session._id}/rate`,
        actionText: 'Rate Session',
        priority: 'normal',
        icon: '🏆'
      },
      {
        recipient: learner._id,
        type: 'session_completed',
        title: '🏆 Session Completed!',
        message: `Your session with ${teacher.name} has been completed. Please rate your experience.`,
        session: session._id,
        actionUrl: `/sessions/${session._id}/rate`,
        actionText: 'Rate Session',
        priority: 'normal',
        icon: '🏆'
      }
    ]);

    emitNotification(io, teacher._id, notifications[0]);
    emitNotification(io, learner._id, notifications[1]);

    return notifications;
  } catch (error) {
    console.error('Error creating session completed notifications:', error);
    return null;
  }
};

export const notifySessionReviewed = async (session, reviewer, reviewee, rating, io = null) => {
  try {
    const stars = '⭐'.repeat(Math.round(rating));

    const notification = await Notification.create({
      recipient: reviewee._id,
      sender: reviewer._id,
      type: 'session_reviewed',
      title: '⭐ New Review Received!',
      message: `${reviewer.name} rated your session ${stars} (${rating}/5)`,
      session: session._id,
      actionUrl: `/profile/reviews`,
      actionText: 'View Review',
      priority: 'normal',
      icon: '⭐'
    });

    emitNotification(io, reviewee._id, notification);
    return notification;
  } catch (error) {
    console.error('Error creating review notification:', error);
    return null;
  }
};

// ============================================
// TOKEN/PAYMENT NOTIFICATIONS
// ============================================

export const notifyTokensPurchased = async (userId, amount, transactionId, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'tokens_purchased',
      title: '💰 Tokens Purchased!',
      message: `You successfully purchased ${amount} tokens`,
      transaction: transactionId,
      actionUrl: '/wallet',
      actionText: 'View Wallet',
      priority: 'normal',
      icon: '💰'
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating tokens purchased notification:', error);
    return null;
  }
};

export const notifyTokensReceived = async (teacherId, amount, sessionId, learnerName, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: teacherId,
      type: 'tokens_received',
      title: '🎁 Tokens Earned!',
      message: `You earned ${amount} tokens from your session with ${learnerName}`,
      session: sessionId,
      actionUrl: '/wallet',
      actionText: 'View Wallet',
      priority: 'normal',
      icon: '🎁'
    });

    emitNotification(io, teacherId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating tokens received notification:', error);
    return null;
  }
};

export const notifyTokensSpent = async (learnerId, amount, sessionId, teacherName, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: learnerId,
      type: 'tokens_spent',
      title: '💸 Tokens Spent',
      message: `${amount} tokens spent for session with ${teacherName}`,
      session: sessionId,
      actionUrl: `/sessions/${sessionId}`,
      actionText: 'View Session',
      priority: 'low',
      icon: '💸'
    });

    emitNotification(io, learnerId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating tokens spent notification:', error);
    return null;
  }
};

export const notifyLowTokenBalance = async (userId, currentBalance, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'tokens_low',
      title: '⚠️ Low Token Balance',
      message: `Your token balance is low (${currentBalance} tokens). Top up to continue booking sessions.`,
      actionUrl: '/wallet/topup',
      actionText: 'Buy Tokens',
      priority: 'high',
      icon: '⚠️'
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating low token notification:', error);
    return null;
  }
};

export const notifyPaymentSuccessful = async (userId, amount, transactionId, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'payment_successful',
      title: '✅ Payment Successful',
      message: `Your payment of $${amount} was processed successfully`,
      transaction: transactionId,
      actionUrl: '/transactions',
      actionText: 'View Receipt',
      priority: 'normal',
      icon: '✅'
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating payment successful notification:', error);
    return null;
  }
};

export const notifyPaymentFailed = async (userId, amount, reason, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'payment_failed',
      title: '❌ Payment Failed',
      message: `Payment of $${amount} failed. ${reason}`,
      actionUrl: '/wallet/topup',
      actionText: 'Try Again',
      priority: 'urgent',
      icon: '❌'
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating payment failed notification:', error);
    return null;
  }
};

// ============================================
// PROFILE/ACCOUNT NOTIFICATIONS
// ============================================

export const notifyProfileUpdated = async (userId, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'profile_updated',
      title: '✏️ Profile Updated',
      message: 'Your profile has been updated successfully',
      actionUrl: '/profile',
      actionText: 'View Profile',
      priority: 'low',
      icon: '✏️'
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating profile updated notification:', error);
    return null;
  }
};

export const notifyProfileViewed = async (profileOwnerId, viewerName, viewerId, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: profileOwnerId,
      sender: viewerId,
      type: 'profile_viewed',
      title: '👀 Profile Viewed',
      message: `${viewerName} viewed your profile`,
      actionUrl: '/profile',
      actionText: 'View Profile',
      priority: 'low',
      icon: '👀'
    });

    emitNotification(io, profileOwnerId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating profile viewed notification:', error);
    return null;
  }
};

export const notifyTeacherApproved = async (userId, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'teacher_approved',
      title: '🎉 Teacher Application Approved!',
      message: 'Congratulations! You can now start teaching on SkillSwap',
      actionUrl: '/dashboard/teacher',
      actionText: 'Go to Dashboard',
      priority: 'high',
      icon: '🎉'
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating teacher approved notification:', error);
    return null;
  }
};

export const notifyTeacherRejected = async (userId, reason, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'teacher_rejected',
      title: '❌ Teacher Application Declined',
      message: `Your teacher application was not approved. Reason: ${reason}`,
      actionUrl: '/help',
      actionText: 'Contact Support',
      priority: 'high',
      icon: '❌'
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating teacher rejected notification:', error);
    return null;
  }
};

export const notifyPasswordChanged = async (userId, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'password_changed',
      title: '🔐 Password Changed',
      message: 'Your password has been changed successfully',
      actionUrl: '/settings/security',
      actionText: 'Security Settings',
      priority: 'high',
      icon: '🔐'
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating password changed notification:', error);
    return null;
  }
};

export const notifyAccountVerified = async (userId, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'account_verified',
      title: '✅ Account Verified!',
      message: 'Your email has been verified. Welcome to SkillSwap!',
      actionUrl: '/dashboard',
      actionText: 'Explore',
      priority: 'normal',
      icon: '✅'
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating account verified notification:', error);
    return null;
  }
};

// ============================================
// RECORDING NOTIFICATIONS
// ============================================

export const notifyRecordingReady = async (sessionId, teacherId, learnerId, recordingId, io = null) => {
  try {
    const notifications = await Notification.insertMany([
      {
        recipient: teacherId,
        type: 'recording_ready',
        title: '🎬 Recording Ready!',
        message: 'Your session recording is now available to watch',
        recording: recordingId,
        session: sessionId,
        actionUrl: `/recordings/${recordingId}`,
        actionText: 'Watch Now',
        priority: 'normal',
        icon: '🎬'
      },
      {
        recipient: learnerId,
        type: 'recording_ready',
        title: '🎬 Recording Ready!',
        message: 'Your session recording is now available to watch',
        recording: recordingId,
        session: sessionId,
        actionUrl: `/recordings/${recordingId}`,
        actionText: 'Watch Now',
        priority: 'normal',
        icon: '🎬'
      }
    ]);

    emitNotification(io, teacherId, notifications[0]);
    emitNotification(io, learnerId, notifications[1]);

    return notifications;
  } catch (error) {
    console.error('Error creating recording ready notifications:', error);
    return null;
  }
};

export const notifyRecordingExpiring = async (userId, recordingTitle, daysLeft, recordingId, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'recording_expiring',
      title: '⏰ Recording Expiring Soon',
      message: `Recording "${recordingTitle}" will be deleted in ${daysLeft} days`,
      recording: recordingId,
      actionUrl: `/recordings/${recordingId}`,
      actionText: 'Watch Now',
      priority: 'high',
      icon: '⏰'
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating recording expiring notification:', error);
    return null;
  }
};

// ============================================
// AVAILABILITY NOTIFICATIONS
// ============================================

export const notifyAvailabilityUpdated = async (teacherId, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: teacherId,
      type: 'availability_updated',
      title: '📅 Availability Updated',
      message: 'Your teaching schedule has been updated successfully',
      actionUrl: '/teacher/availability',
      actionText: 'View Schedule',
      priority: 'low',
      icon: '📅'
    });

    emitNotification(io, teacherId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating availability updated notification:', error);
    return null;
  }
};

// ============================================
// WELCOME/SYSTEM NOTIFICATIONS
// ============================================

export const notifyWelcomeUser = async (userId, userName, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      type: 'welcome',
      title: '👋 Welcome to SkillSwap!',
      message: `Hi ${userName}! Start your learning journey by exploring teachers or share your expertise by teaching.`,
      actionUrl: '/explore',
      actionText: 'Explore Teachers',
      priority: 'normal',
      icon: '👋',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
    });

    emitNotification(io, userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating welcome notification:', error);
    return null;
  }
};

export const notifySystemAnnouncement = async (recipientIds, title, message, io = null) => {
  try {
    const notifications = recipientIds.map(userId => ({
      recipient: userId,
      type: 'system',
      title: `📢 ${title}`,
      message,
      priority: 'normal',
      icon: '📢'
    }));

    const created = await Notification.insertMany(notifications);

    // Emit to all recipients
    if (io) {
      recipientIds.forEach((userId, index) => {
        emitNotification(io, userId, created[index]);
      });
    }

    return created;
  } catch (error) {
    console.error('Error creating system announcement:', error);
    return null;
  }
};

// ============================================
// MESSAGE NOTIFICATIONS
// ============================================

export const notifyNewMessage = async (recipientId, senderId, senderName, messagePreview, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: 'new_message',
      title: '💬 New Message',
      message: `${senderName}: ${messagePreview}`,
      actionUrl: `/messages/${senderId}`,
      actionText: 'Reply',
      priority: 'normal',
      icon: '💬'
    });

    emitNotification(io, recipientId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating new message notification:', error);
    return null;
  }
};

// Export all notification functions
export default {
  // Session
  notifySessionBooked,
  notifySessionCancelled,
  notifySessionCompleted,
  notifySessionReviewed,

  // Tokens/Payments
  notifyTokensPurchased,
  notifyTokensReceived,
  notifyTokensSpent,
  notifyLowTokenBalance,
  notifyPaymentSuccessful,
  notifyPaymentFailed,

  // Profile
  notifyProfileUpdated,
  notifyProfileViewed,
  notifyTeacherApproved,
  notifyTeacherRejected,
  notifyPasswordChanged,
  notifyAccountVerified,

  // Recording
  notifyRecordingReady,
  notifyRecordingExpiring,

  // Availability
  notifyAvailabilityUpdated,

  // System
  notifyWelcomeUser,
  notifySystemAnnouncement,

  // Messages
  notifyNewMessage
};
