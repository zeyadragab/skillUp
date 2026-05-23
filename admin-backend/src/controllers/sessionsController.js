import { Session, Transaction, User } from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all sessions
// @route   GET /api/admin/sessions
export const getSessions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) query.scheduledAt.$gte = new Date(startDate);
      if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // skill is a String field — do NOT populate it
    const sessions = await Session.find(query)
      .populate('teacher', 'name email avatar')
      .populate('learner', 'name email avatar')
      .populate('cancelledBy', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, message: 'Error fetching sessions' });
  }
};

// @desc    Get session details
// @route   GET /api/admin/sessions/:id
export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('teacher', 'name email avatar tokens')
      .populate('learner', 'name email avatar tokens')
      .populate('cancelledBy', 'name');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // session field on Transaction matches real schema
    const transactions = await Transaction.find({ session: session._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    await logActivity(req, 'session_view', 'session', session._id);

    res.status(200).json({
      success: true,
      data: { session, transactions }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ success: false, message: 'Error fetching session' });
  }
};

// @desc    Cancel session (admin)
// @route   POST /api/admin/sessions/:id/cancel
export const cancelSession = async (req, res) => {
  try {
    const { reason, refundLearner = true } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (['completed', 'cancelled'].includes(session.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this session' });
    }

    session.status = 'cancelled';
    session.cancellationReason = reason || 'Cancelled by admin';
    session.cancelledAt = new Date();
    await session.save();

    // Refund learner tokens if session was paid
    if (refundLearner && session.tokensCharged > 0) {
      const learner = await User.findById(session.learner);
      if (learner) {
        const balanceBefore = learner.tokens;
        learner.tokens += session.tokensCharged;
        await learner.save();

        await Transaction.create({
          user: learner._id,
          type: 'credit',
          amount: session.tokensCharged,
          reason: 'refund',
          description: `Session cancelled by admin — refund`,
          balanceBefore,
          balanceAfter: learner.tokens,
          session: session._id
        });
      }
    }

    await logActivity(req, 'session_cancel', 'session', session._id, { reason, refundLearner });

    res.status(200).json({ success: true, message: 'Session cancelled successfully' });
  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({ success: false, message: 'Error cancelling session' });
  }
};

// @desc    Get session stats
// @route   GET /api/admin/sessions/stats
export const getSessionStats = async (req, res) => {
  try {
    const stats = await Session.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalTokens: { $sum: '$tokensCharged' }
        }
      }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = await Session.countDocuments({
      scheduledAt: { $gte: today }
    });

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyStats = await Session.aggregate([
      { $match: { createdAt: { $gte: thisMonth } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          tokensExchanged: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$tokensCharged', 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        todaySessions,
        thisMonth: monthlyStats[0] || {
          total: 0, completed: 0, cancelled: 0, tokensExchanged: 0
        }
      }
    });
  } catch (error) {
    console.error('Session stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching session stats' });
  }
};
