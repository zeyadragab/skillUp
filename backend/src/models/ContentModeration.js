import mongoose from 'mongoose';

const contentModerationSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalMessage: {
    type: String,
    required: true
  },
  flaggedWords: [String],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  action: {
    type: String,
    enum: ['warned', 'blocked', 'reviewed'],
    default: 'warned'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ContentModeration = mongoose.model('ContentModeration', contentModerationSchema);

export default ContentModeration;
