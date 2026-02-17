import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { notifyNewMessage } from '../services/notificationService.js';

// @desc    Get conversations for logged-in user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
      .populate('participants', 'name avatar email isOnline')
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt messageType'
      })
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// @desc    Get or create a conversation with another user
// @route   POST /api/messages/conversations
// @access  Private
export const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    const conversation = await Conversation.findOrCreate(req.user._id, userId);

    await conversation.populate('participants', 'name avatar email isOnline');
    await conversation.populate({
      path: 'lastMessage',
      select: 'content sender createdAt messageType'
    });

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this conversation'
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false
    })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    // Update unread count
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      total: await Message.countDocuments({ conversation: conversationId, isDeleted: false })
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text' } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and content are required'
      });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages in this conversation'
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
      messageType
    });

    await message.populate('sender', 'name avatar');

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    // Increment unread count for other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    // Get recipient(s) for notification
    const recipients = conversation.participants.filter(
      participantId => participantId.toString() !== req.user._id.toString()
    );

    // Send notification to recipient(s)
    const io = req.app.get('io');
    for (const recipientId of recipients) {
      // Create a preview of the message (max 50 chars)
      const messagePreview = content.length > 50 ? content.substring(0, 50) + '...' : content;

      await notifyNewMessage(
        recipientId,
        req.user._id,
        req.user.name,
        messagePreview,
        io
      );
    }

    // Emit socket event for real-time delivery
    io.to(conversationId).emit('new-message', {
      message,
      conversationId
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    message.isDeleted = true;
    await message.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(message.conversation.toString()).emit('message-deleted', {
      messageId,
      conversationId: message.conversation
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};
