import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    unique: true // One recording per session
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true
  },

  // Recording metadata
  title: {
    type: String,
    required: true
  },
  description: String,

  // Agora recording info
  resourceId: String, // Agora cloud recording resource ID
  sid: String, // Agora recording SID
  agoraChannel: {
    type: String,
    required: true
  },

  // Recording files
  videoUrl: String, // Primary video URL (Cloudinary/S3)
  videoPublicId: String, // Cloudinary public ID for deletion
  thumbnailUrl: String, // Video thumbnail
  fileSize: Number, // File size in bytes
  format: {
    type: String,
    default: 'mp4'
  },

  // Recording details
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  quality: {
    type: String,
    enum: ['HD', 'SD', 'AUTO'],
    default: 'AUTO'
  },
  resolution: String, // e.g., "1920x1080", "1280x720"

  // Recording status
  status: {
    type: String,
    enum: ['recording', 'processing', 'ready', 'failed', 'deleted'],
    default: 'recording'
  },
  recordingStartedAt: Date,
  recordingEndedAt: Date,
  processingStartedAt: Date,
  processedAt: Date,

  // Access control
  isPublic: {
    type: Boolean,
    default: false
  },
  accessToken: String, // Secure token for playback
  tokenExpiresAt: Date,

  // View tracking
  views: {
    type: Number,
    default: 0
  },
  viewHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: Date,
    duration: Number // How long they watched (seconds)
  }],

  // Timestamps
  scheduledAt: Date, // Original session scheduled time

  // Automatic deletion
  expiresAt: {
    type: Date,
    default: function() {
      // Default: recordings expire after 30 days
      const expiryDays = parseInt(process.env.RECORDING_EXPIRY_DAYS || '30');
      return new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    }
  },

  // Error handling
  errorMessage: String,
  failureReason: String,

  // Additional features
  hasScreenShare: {
    type: Boolean,
    default: false
  },
  hasWhiteboard: {
    type: Boolean,
    default: false
  },

  // Participants who appeared in recording
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
recordingSchema.index({ session: 1 });
recordingSchema.index({ teacher: 1, createdAt: -1 });
recordingSchema.index({ learner: 1, createdAt: -1 });
recordingSchema.index({ status: 1 });
recordingSchema.index({ expiresAt: 1 });

// Virtual for human-readable duration
recordingSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return '0:00';

  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for file size in MB
recordingSchema.virtual('fileSizeMB').get(function() {
  if (!this.fileSize) return 0;
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Check if user can access recording
recordingSchema.methods.canAccess = function(userId) {
  const userIdStr = userId.toString();
  return (
    this.teacher.toString() === userIdStr ||
    this.learner.toString() === userIdStr ||
    this.isPublic
  );
};

// Check if recording is expired
recordingSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Track view
recordingSchema.methods.addView = async function(userId, duration = 0) {
  this.views += 1;
  this.viewHistory.push({
    user: userId,
    viewedAt: new Date(),
    duration
  });
  return this.save();
};

// Generate secure playback token
recordingSchema.methods.generatePlaybackToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.accessToken = token;
  // Token expires in 24 hours
  this.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

// Static method to find user's recordings
recordingSchema.statics.findUserRecordings = function(userId, options = {}) {
  const {
    status = 'ready',
    limit = 20,
    skip = 0,
    sort = '-createdAt'
  } = options;

  return this.find({
    $or: [{ teacher: userId }, { learner: userId }],
    status
  })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('teacher learner', 'name avatar email')
    .populate('session', 'title scheduledAt');
};

// Static method to find expired recordings for cleanup
recordingSchema.statics.findExpiredRecordings = function() {
  return this.find({
    expiresAt: { $lte: new Date() },
    status: { $in: ['ready', 'failed'] }
  });
};

const Recording = mongoose.model('Recording', recordingSchema);

export default Recording;
