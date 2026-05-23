import mongoose from 'mongoose';
import { adminConn } from '../config/database.js';

const activityLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout',
      'user_view', 'user_update', 'user_ban', 'user_unban', 'user_delete',
      'teacher_verify', 'teacher_reject',
      'skill_create', 'skill_update', 'skill_delete',
      'category_create', 'category_update', 'category_delete',
      'session_view', 'session_cancel', 'session_refund',
      'transaction_view', 'transaction_adjust',
      'report_view', 'report_resolve', 'report_dismiss',
      'review_delete', 'review_hide',
      'notification_send',
      'settings_update',
      'admin_create', 'admin_update', 'admin_delete'
    ]
  },
  targetType: {
    type: String,
    enum: ['user', 'teacher', 'skill', 'category', 'session', 'transaction', 'report', 'review', 'notification', 'settings', 'admin']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  }
}, {
  timestamps: true
});

activityLogSchema.index({ admin: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });

const ActivityLog = adminConn.models.ActivityLog || adminConn.model('ActivityLog', activityLogSchema);

export default ActivityLog;
