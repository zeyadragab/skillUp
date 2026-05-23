import mongoose from 'mongoose';
import { adminConn } from '../config/database.js';

const adminNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'new_user',
      'new_teacher',
      'teacher_verification',
      'user_ban',
      'user_report',
      'high_value_transaction',
      'session_dispute',
      'system_alert',
      'review_flagged'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  actionUrl: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
adminNotificationSchema.index({ isRead: 1, createdAt: -1 });
adminNotificationSchema.index({ type: 1, createdAt: -1 });
adminNotificationSchema.index({ priority: 1, isRead: 1 });

const AdminNotification = adminConn.models.AdminNotification || adminConn.model('AdminNotification', adminNotificationSchema);

export default AdminNotification;
