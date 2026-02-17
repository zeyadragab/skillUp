import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
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
    required: [true, 'Please specify the skill'],
    trim: true
  },
  skillCategory: String,

  // Session details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,

  // Scheduling
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  endTime: Date,

  // Session type
  sessionType: {
    type: String,
    enum: ['one-on-one', 'group', 'workshop'],
    default: 'one-on-one'
  },
  isSkillExchange: {
    type: Boolean,
    default: false // true if it's a skill swap, false if paid with tokens
  },

  // Pricing
  tokensCharged: {
    type: Number,
    default: 0
  },

  // Video call
  videoRoomId: String,
  videoToken: String,
  agoraChannel: String,

  // Status
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },

  // Ratings and reviews
  teacherRating: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    ratedAt: Date
  },
  learnerRating: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    ratedAt: Date
  },

  // Session notes
  teacherNotes: String,
  learnerNotes: String,

  // Attendance tracking
  teacherJoinedAt: Date,
  learnerJoinedAt: Date,
  actualStartTime: Date,
  actualEndTime: Date,

  // Cancellation
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  cancelledAt: Date,

  // Reminders
  remindersSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
sessionSchema.index({ teacher: 1, scheduledAt: -1 });
sessionSchema.index({ learner: 1, scheduledAt: -1 });
sessionSchema.index({ status: 1, scheduledAt: 1 });

// Calculate end time before saving
sessionSchema.pre('save', function(next) {
  if (this.scheduledAt && this.duration) {
    this.endTime = new Date(this.scheduledAt.getTime() + this.duration * 60000);
  }
  next();
});

// Static method to find upcoming sessions
sessionSchema.statics.findUpcoming = function(userId) {
  return this.find({
    $or: [{ teacher: userId }, { learner: userId }],
    scheduledAt: { $gte: new Date() },
    status: 'scheduled'
  })
  .sort({ scheduledAt: 1 })
  .populate('teacher learner', 'name avatar email');
};

// Check if session can be cancelled
sessionSchema.methods.canCancel = function() {
  const hoursUntilSession = (this.scheduledAt - new Date()) / (1000 * 60 * 60);
  return hoursUntilSession > 24 && this.status === 'scheduled';
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
