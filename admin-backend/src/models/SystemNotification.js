import mongoose from 'mongoose';
import { adminConn } from '../config/database.js';

const systemNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['announcement', 'maintenance', 'update', 'promotion', 'warning', 'info'],
    default: 'info'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'users', 'teachers', 'verified_teachers', 'new_users'],
    default: 'all'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  scheduledFor: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'draft'
  },
  sentAt: {
    type: Date
  },
  sentTo: {
    type: Number,
    default: 0
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  metadata: {
    link: String,
    imageUrl: String,
    actionButton: {
      text: String,
      url: String
    }
  }
}, {
  timestamps: true
});

systemNotificationSchema.index({ status: 1, scheduledFor: 1 });
systemNotificationSchema.index({ targetAudience: 1 });

const SystemNotification = adminConn.models.SystemNotification || adminConn.model('SystemNotification', systemNotificationSchema);

export default SystemNotification;
