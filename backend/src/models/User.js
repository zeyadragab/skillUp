import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  category: {
    type: String,
    required: true
  },
  tokensPerHour: {
    type: Number,
    default: 50,
    min: 0
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=6366f1&color=fff`;
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  country: String,
  timeZone: String,
  languages: [String],

  // Skills
  skillsToTeach: [skillSchema],
  skillsToLearn: [skillSchema],

  // Token system
  tokens: {
    type: Number,
    default: 50 // Starting tokens
  },
  tokensEarned: {
    type: Number,
    default: 0
  },
  tokensSpent: {
    type: Number,
    default: 0
  },

  // Statistics
  totalSessionsTaught: {
    type: Number,
    default: 0
  },
  totalSessionsLearned: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },

  // Gamification
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: Date
  }],
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: Date
  },

  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  isTeacher: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false // User must verify email to activate
  },
  role: {
    type: String,
    enum: ['user', 'teacher', 'admin'],
    default: 'user'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String
  },
  bannedAt: {
    type: Date
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  // Verification
  verificationToken: String,
  verificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Preferences
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    sessionReminders: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false }
  },

  // Social connections
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update average rating
userSchema.methods.updateRating = function(newRating) {
  const totalScore = this.averageRating * this.totalRatings;
  this.totalRatings += 1;
  this.averageRating = (totalScore + newRating) / this.totalRatings;
};

// Add tokens
userSchema.methods.addTokens = function(amount, reason = 'purchase') {
  this.tokens += amount;
  this.tokensEarned += amount;
  return this.save();
};

// Deduct tokens
userSchema.methods.deductTokens = function(amount, reason = 'session') {
  if (this.tokens < amount) {
    throw new Error('Insufficient tokens');
  }
  this.tokens -= amount;
  this.tokensSpent += amount;
  return this.save();
};

// Check if user has enough tokens
userSchema.methods.hasEnoughTokens = function(amount) {
  return this.tokens >= amount;
};

const User = mongoose.model('User', userSchema);

export default User;
