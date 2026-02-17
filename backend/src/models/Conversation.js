import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: Date,

  // Unread counts for each participant
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },

  // Conversation type
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },

  // For group conversations
  groupName: String,
  groupAvatar: String,
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure participants array has exactly 2 users for direct conversations
conversationSchema.pre('save', function(next) {
  if (this.type === 'direct' && this.participants.length !== 2) {
    next(new Error('Direct conversation must have exactly 2 participants'));
  } else {
    next();
  }
});

// Index for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function(user1Id, user2Id) {
  let conversation = await this.findOne({
    type: 'direct',
    participants: { $all: [user1Id, user2Id] }
  }).populate('participants', 'name avatar email');

  if (!conversation) {
    conversation = await this.create({
      type: 'direct',
      participants: [user1Id, user2Id],
      unreadCount: {
        [user1Id]: 0,
        [user2Id]: 0
      }
    });
    conversation = await conversation.populate('participants', 'name avatar email');
  }

  return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
