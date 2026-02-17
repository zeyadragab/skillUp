import Session from '../models/Session.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { generateSessionCredentials } from '../services/agoraService.js';
import {
  notifySessionBooked,
  notifySessionCancelled,
  notifySessionCompleted,
  notifySessionReviewed,
  notifyTokensSpent,
  notifyTokensReceived
} from '../services/notificationService.js';

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private (Learner or Teacher)
export const createSession = async (req, res) => {
  try {
    const {
      teacherId,
      learnerId,
      skill,
      skillCategory,
      title,
      description,
      scheduledAt,
      duration,
      sessionType,
      isSkillExchange,
      tokensCharged
    } = req.body;

    const currentUserId = req.user._id;

    // Determine who is creating the session
    let finalTeacherId, finalLearnerId;

    if (teacherId) {
      // Learner is booking with a specific teacher
      finalTeacherId = teacherId;
      finalLearnerId = currentUserId;
    } else if (learnerId) {
      // Teacher is creating session with a specific learner
      finalTeacherId = currentUserId;
      finalLearnerId = learnerId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either teacherId or learnerId'
      });
    }

    // Validation
    if (!skill || !title || !scheduledAt || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if teacher and learner exist
    const [teacher, learner] = await Promise.all([
      User.findById(finalTeacherId),
      User.findById(finalLearnerId)
    ]);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (!learner) {
      return res.status(404).json({
        success: false,
        message: 'Learner not found'
      });
    }

    // Verify teacher actually teaches this skill
    if (!teacher.isTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not a teacher'
      });
    }

    // If not skill exchange, check if learner has enough tokens
    if (!isSkillExchange && tokensCharged > 0) {
      if (!learner.hasEnoughTokens(tokensCharged)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient tokens. Required: ${tokensCharged}, Available: ${learner.tokens}`
        });
      }
    }

    // Check if session time is in the future
    const sessionDate = new Date(scheduledAt);
    if (sessionDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Session must be scheduled in the future'
      });
    }

    // Check for scheduling conflicts
    const conflict = await Session.findOne({
      $or: [
        { teacher: finalTeacherId },
        { learner: finalLearnerId }
      ],
      scheduledAt: {
        $gte: new Date(sessionDate.getTime() - duration * 60000),
        $lte: new Date(sessionDate.getTime() + duration * 60000)
      },
      status: { $in: ['scheduled', 'in-progress'] }
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Time slot conflicts with another session'
      });
    }

    // Create session
    const session = await Session.create({
      teacher: finalTeacherId,
      learner: finalLearnerId,
      skill,
      skillCategory,
      title,
      description,
      scheduledAt: sessionDate,
      duration,
      sessionType: sessionType || 'one-on-one',
      isSkillExchange: isSkillExchange || false,
      tokensCharged: tokensCharged || 0,
      agoraChannel: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // If paid session, deduct tokens from learner
    if (!isSkillExchange && tokensCharged > 0) {
      await learner.deductTokens(tokensCharged, 'session_learning');

      // Create transaction
      await Transaction.create({
        user: finalLearnerId,
        type: 'debit',
        amount: tokensCharged,
        reason: 'session_learning',
        description: `Session: ${title}`,
        session: session._id,
        balanceBefore: learner.tokens + tokensCharged,
        balanceAfter: learner.tokens
      });
    }

    // Populate teacher and learner details
    await session.populate('teacher learner', 'name email avatar');

    // Send notifications to both teacher and learner
    const io = req.app.get('io');
    await notifySessionBooked(session, teacher, learner, io);

    // Notify learner about tokens spent (if paid session)
    if (!isSkillExchange && tokensCharged > 0) {
      await notifyTokensSpent(learner._id, tokensCharged, session._id, teacher.name, io);
    }

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating session',
      error: error.message
    });
  }
};

// @desc    Get user's sessions
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, type, upcoming, past } = req.query;

    let query = {
      $or: [{ teacher: userId }, { learner: userId }]
    };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by type
    if (type) {
      query.sessionType = type;
    }

    // Filter upcoming sessions
    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
      query.status = 'scheduled';
    }

    // Filter past sessions
    if (past === 'true') {
      query.scheduledAt = { $lt: new Date() };
    }

    const sessions = await Session.find(query)
      .populate('teacher learner', 'name email avatar averageRating')
      .sort({ scheduledAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: error.message
    });
  }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private
export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('teacher learner', 'name email avatar averageRating bio skillsToTeach');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is part of this session
    const userId = req.user._id.toString();
    if (session.teacher._id.toString() !== userId && session.learner._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this session'
      });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session',
      error: error.message
    });
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSession = async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the teacher
    if (session.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the teacher can update the session'
      });
    }

    // Only allow updates if session is scheduled
    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Can only update scheduled sessions'
      });
    }

    const allowedUpdates = ['scheduledAt', 'duration', 'description', 'teacherNotes'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    session = await Session.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('teacher learner', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating session',
      error: error.message
    });
  }
};

// @desc    Cancel session
// @route   DELETE /api/sessions/:id/cancel
// @access  Private
export const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const userId = req.user._id.toString();
    const isTeacher = session.teacher.toString() === userId;
    const isLearner = session.learner.toString() === userId;

    if (!isTeacher && !isLearner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this session'
      });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel scheduled sessions'
      });
    }

    // Check cancellation policy (24 hours before)
    if (!session.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Sessions can only be cancelled 24 hours in advance'
      });
    }

    // Update session
    session.status = 'cancelled';
    session.cancelledBy = req.user._id;
    session.cancellationReason = req.body.reason;
    session.cancelledAt = new Date();
    await session.save();

    // Refund tokens if it was a paid session
    if (!session.isSkillExchange && session.tokensCharged > 0) {
      const learner = await User.findById(session.learner);
      await learner.addTokens(session.tokensCharged, 'refund');

      // Create refund transaction
      await Transaction.create({
        user: session.learner,
        type: 'credit',
        amount: session.tokensCharged,
        reason: 'refund',
        description: `Refund for cancelled session: ${session.title}`,
        session: session._id,
        balanceBefore: learner.tokens - session.tokensCharged,
        balanceAfter: learner.tokens
      });
    }

    // Populate and send cancellation notifications
    await session.populate('teacher learner', 'name email avatar');
    const io = req.app.get('io');
    const cancelledBy = isTeacher ? 'teacher' : 'learner';
    await notifySessionCancelled(session, session.teacher, session.learner, cancelledBy, io);

    res.status(200).json({
      success: true,
      message: 'Session cancelled successfully. Tokens have been refunded.',
      session
    });
  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling session',
      error: error.message
    });
  }
};

// @desc    Rate session
// @route   POST /api/sessions/:id/rate
// @access  Private
export const rateSession = async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5'
      });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed sessions'
      });
    }

    const userId = req.user._id.toString();
    const isTeacher = session.teacher.toString() === userId;
    const isLearner = session.learner.toString() === userId;

    if (!isTeacher && !isLearner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to rate this session'
      });
    }

    // Update rating based on user role
    if (isTeacher) {
      if (session.teacherRating.rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this session'
        });
      }

      session.teacherRating = {
        rating,
        review,
        ratedAt: new Date()
      };

      // Update learner's rating
      const learner = await User.findById(session.learner);
      learner.updateRating(rating);
      await learner.save();
    } else {
      if (session.learnerRating.rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this session'
        });
      }

      session.learnerRating = {
        rating,
        review,
        ratedAt: new Date()
      };

      // Update teacher's rating
      const teacher = await User.findById(session.teacher);
      teacher.updateRating(rating);
      teacher.totalSessionsTaught += 1;
      await teacher.save();

      // Award tokens to teacher
      await teacher.addTokens(session.tokensCharged, 'session_teaching');

      await Transaction.create({
        user: session.teacher,
        type: 'credit',
        amount: session.tokensCharged,
        reason: 'session_teaching',
        description: `Earned from teaching: ${session.title}`,
        session: session._id,
        balanceBefore: teacher.tokens - session.tokensCharged,
        balanceAfter: teacher.tokens
      });

      // Notify teacher about tokens earned
      const learner = await User.findById(session.learner);
      const io = req.app.get('io');
      await notifyTokensReceived(teacher._id, session.tokensCharged, session._id, learner.name, io);
    }

    await session.save();

    // Populate session and send review notification
    await session.populate('teacher learner', 'name email avatar');
    const io = req.app.get('io');

    // Determine reviewer and reviewee
    if (isTeacher) {
      await notifySessionReviewed(session, session.teacher, session.learner, rating, io);
    } else {
      await notifySessionReviewed(session, session.learner, session.teacher, rating, io);
    }

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      session
    });
  } catch (error) {
    console.error('Rate session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rating session',
      error: error.message
    });
  }
};

// @desc    Join video session (get Agora token)
// @route   POST /api/sessions/:id/join
// @access  Private
export const joinSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const userId = req.user._id.toString();
    const isParticipant =
      session.teacher.toString() === userId ||
      session.learner.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this session'
      });
    }

    // Allow joining if session is scheduled or already in progress
    if (session.status !== 'scheduled' && session.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'This session is not available to join'
      });
    }

    // Check if session is within 15 minutes of start time
    const now = new Date();
    const sessionStart = new Date(session.scheduledAt);
    const timeDiff = (sessionStart - now) / (1000 * 60); // minutes

    if (timeDiff > 15) {
      return res.status(400).json({
        success: false,
        message: `Session starts in ${Math.floor(timeDiff)} minutes. You can join 15 minutes before the start time.`
      });
    }

    if (timeDiff < -session.duration) {
      return res.status(400).json({
        success: false,
        message: 'This session has ended'
      });
    }

    // Generate Agora credentials
    // Convert MongoDB ObjectId to a number for Agora (Agora expects numeric UID)
    // We'll use a hash of the userId string to create a unique integer
    const numericUserId = Math.abs(userId.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0));

    const credentials = generateSessionCredentials(
      session._id.toString(),
      numericUserId,
      'publisher'
    );

    // Update session status
    if (session.status === 'scheduled') {
      session.status = 'in-progress';
      if (!session.actualStartTime) {
        session.actualStartTime = new Date();
      }
    }

    // Track join time
    const isTeacher = session.teacher.toString() === userId;
    if (isTeacher && !session.teacherJoinedAt) {
      session.teacherJoinedAt = new Date();
    } else if (!isTeacher && !session.learnerJoinedAt) {
      session.learnerJoinedAt = new Date();
    }

    // Update session with Agora channel info
    if (!session.agoraChannel) {
      session.agoraChannel = credentials.channelName;
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Joining session',
      session: {
        id: session._id,
        title: session.title,
        skill: session.skill,
        scheduledAt: session.scheduledAt,
        duration: session.duration
      },
      videoCredentials: credentials
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining session',
      error: error.message
    });
  }
};
