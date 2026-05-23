import mongoose from 'mongoose';
import { adminConn } from '../config/database.js';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  reportedReview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  type: {
    type: String,
    enum: ['user', 'session', 'review', 'spam', 'fraud', 'inappropriate', 'other'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  evidence: [{
    type: String // URLs to screenshots or files
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  resolution: {
    action: {
      type: String,
      enum: ['no_action', 'warning', 'suspension', 'ban', 'content_removed']
    },
    notes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    resolvedAt: Date
  },
  adminNotes: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    note: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

reportSchema.index({ status: 1, priority: -1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ reportedUser: 1 });

const Report = adminConn.models.Report || adminConn.model('Report', reportSchema);

export default Report;
