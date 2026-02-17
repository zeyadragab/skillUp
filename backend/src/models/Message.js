import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'session-request', 'system'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String,

  // Read status
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Related session (if it's a session request)
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },

  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
