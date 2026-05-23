import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { adminConn } from '../config/database.js';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'moderator', 'support'],
    default: 'moderator'
  },
  permissions: {
    users: { type: Boolean, default: true },
    teachers: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    sessions: { type: Boolean, default: true },
    transactions: { type: Boolean, default: false },
    reports: { type: Boolean, default: true },
    reviews: { type: Boolean, default: true },
    notifications: { type: Boolean, default: false },
    settings: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true }
  },
  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=dc2626&color=fff`;
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Set full permissions for super_admin
adminSchema.pre('save', function(next) {
  if (this.role === 'super_admin') {
    this.permissions = {
      users: true,
      teachers: true,
      skills: true,
      sessions: true,
      transactions: true,
      reports: true,
      reviews: true,
      notifications: true,
      settings: true,
      analytics: true
    };
  }
  next();
});

const Admin = adminConn.models.Admin || adminConn.model('Admin', adminSchema);

export default Admin;
