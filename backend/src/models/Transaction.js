import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    enum: [
      'purchase',           // Bought tokens
      'session_teaching',   // Earned from teaching
      'session_learning',   // Spent on learning
      'referral',          // Referral bonus
      'challenge',         // Challenge reward
      'streak',            // Streak bonus
      'admin_adjustment',  // Admin added/removed
      'refund',           // Refund from cancelled session
      'welcome_bonus'      // New user bonus
    ],
    required: true
  },
  description: String,

  // Related entities
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },

  // Balance tracking
  balanceBefore: Number,
  balanceAfter: {
    type: Number,
    required: true
  },

  // Metadata
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, reason: 1 });

// Static method to get user transaction history
transactionSchema.statics.getUserHistory = function(userId, limit = 50) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('session', 'title skill scheduledAt');
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
