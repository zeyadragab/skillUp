import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  tokensAmount: {
    type: Number,
    required: true
  },
  packageType: {
    type: String,
    enum: ['starter', 'popular', 'professional', 'premium', 'basic', 'pro', 'custom'],
    required: true
  },

  // Stripe details
  stripePaymentIntentId: String,
  stripePaymentMethodId: String,
  stripeCustomerId: String,

  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },

  // Payment method
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'visa', 'instapay', 'fawry', 'wallet', 'admin'],
    default: 'stripe'
  },

  // Receipt
  receiptUrl: String,
  receiptNumber: String,

  // Refund details
  refundReason: String,
  refundedAt: Date,
  refundAmount: Number,

  // Metadata
  metadata: mongoose.Schema.Types.Mixed,

  failureReason: String
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

// Generate receipt number
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.receiptNumber) {
    this.receiptNumber = `SS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
