import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String, // email or phone number
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-delete expired OTPs after 1 hour
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

// Hash OTP before saving
otpSchema.pre('save', async function(next) {
  if (!this.isModified('otp')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
  next();
});

// Compare OTP
otpSchema.methods.compareOTP = async function(candidateOTP) {
  return await bcrypt.compare(candidateOTP, this.otp);
};

// Generate 6-digit OTP
otpSchema.statics.generateOTP = function() {
  return crypto.randomInt(100000, 999999).toString();
};

// Create OTP for user
otpSchema.statics.createOTP = async function(identifier) {
  // Delete any existing OTPs for this identifier
  await this.deleteMany({ identifier });

  const otpCode = this.generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const otp = await this.create({
    identifier,
    otp: otpCode,
    expiresAt
  });

  return otpCode; // Return plain OTP before hashing
};

// Verify OTP
otpSchema.statics.verifyOTP = async function(identifier, otpCode) {
  const otpDoc = await this.findOne({
    identifier,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  if (!otpDoc) {
    throw new Error('OTP expired or invalid');
  }

  // Check attempts
  if (otpDoc.attempts >= otpDoc.maxAttempts) {
    throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
  }

  // Increment attempts
  otpDoc.attempts += 1;
  await otpDoc.save();

  // Verify OTP
  const isValid = await otpDoc.compareOTP(otpCode);

  if (!isValid) {
    throw new Error('Invalid OTP');
  }

  // Mark as used
  otpDoc.isUsed = true;
  await otpDoc.save();

  return true;
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
