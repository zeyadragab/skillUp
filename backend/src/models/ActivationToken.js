import mongoose from 'mongoose';
import crypto from 'crypto';

const activationTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
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

// Auto-delete expired tokens after 24 hours
activationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

// Generate random activation token
activationTokenSchema.statics.createToken = async function(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const activationToken = await this.create({
    user: userId,
    token,
    expiresAt
  });

  return activationToken;
};

// Verify and mark token as used
activationTokenSchema.statics.verifyToken = async function(token) {
  const activationToken = await this.findOne({
    token,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  if (!activationToken) {
    return null;
  }

  activationToken.isUsed = true;
  await activationToken.save();

  return activationToken;
};

const ActivationToken = mongoose.model('ActivationToken', activationTokenSchema);

export default ActivationToken;
