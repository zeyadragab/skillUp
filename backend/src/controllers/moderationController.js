import ContentModeration from '../models/ContentModeration.js';

// POST /api/moderation/flag
// Log a flagged message — requires auth
export const logFlaggedMessage = async (req, res, next) => {
  try {
    const { session, originalMessage, flaggedWords, severity, action } = req.body;

    if (!session || !originalMessage) {
      return res.status(400).json({
        success: false,
        message: 'session and originalMessage are required'
      });
    }

    const flag = await ContentModeration.create({
      session,
      user: req.user._id,
      originalMessage,
      flaggedWords: flaggedWords || [],
      severity: severity || 'low',
      action: action || 'warned'
    });

    res.status(201).json({
      success: true,
      data: flag
    });
  } catch (error) {
    console.error('logFlaggedMessage error:', error);
    next(error);
  }
};

// GET /api/moderation/session/:sessionId
// Get all flags for a session — admin or teacher only
export const getSessionFlags = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const flags = await ContentModeration.find({ session: sessionId })
      .populate('user', 'name email')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: flags.length,
      data: flags
    });
  } catch (error) {
    console.error('getSessionFlags error:', error);
    next(error);
  }
};

// GET /api/moderation/user/:userId
// Get all flags for a user — requires auth
export const getUserFlags = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const flags = await ContentModeration.find({ user: userId })
      .populate('session', 'title scheduledAt')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: flags.length,
      data: flags
    });
  } catch (error) {
    console.error('getUserFlags error:', error);
    next(error);
  }
};
