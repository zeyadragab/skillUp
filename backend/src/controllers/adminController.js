import User from '../models/User.js';
import Session from '../models/Session.js';
import Transaction from '../models/Transaction.js';
import Payment from '../models/Payment.js';

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getPlatformStats = async (req, res) => {
  try {
    // Get counts
    const [
      totalUsers,
      totalTeachers,
      totalLearners,
      totalSessions,
      completedSessions,
      totalTransactions,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isTeacher: true }),
      User.countDocuments({ isTeacher: false }),
      Session.countDocuments(),
      Session.countDocuments({ status: 'completed' }),
      Transaction.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get active sessions
    const activeSessions = await Session.countDocuments({
      status: 'in-progress'
    });

    // Calculate total tokens in circulation
    const tokenStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$tokens' },
          totalEarned: { $sum: '$tokensEarned' },
          totalSpent: { $sum: '$tokensSpent' }
        }
      }
    ]);

    // Get top teachers by earnings
    const topTeachers = await User.find({ isTeacher: true })
      .sort({ tokensEarned: -1 })
      .limit(5)
      .select('name email avatar tokensEarned totalSessionsTaught averageRating');

    // Get recent sessions
    const recentSessions = await Session.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('teacher', 'name email')
      .populate('learner', 'name email');

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          teachers: totalTeachers,
          learners: totalLearners,
          newThisMonth: newUsers
        },
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          active: activeSessions,
          completionRate: totalSessions > 0
            ? ((completedSessions / totalSessions) * 100).toFixed(2)
            : 0
        },
        tokens: {
          inCirculation: tokenStats[0]?.totalTokens || 0,
          totalEarned: tokenStats[0]?.totalEarned || 0,
          totalSpent: tokenStats[0]?.totalSpent || 0
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          transactions: totalTransactions
        },
        topTeachers,
        recentSessions
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role; // teacher, learner, both

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role === 'teacher') {
      query.isTeacher = true;
    } else if (role === 'learner') {
      query.isTeacher = false;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's sessions
    const sessions = await Session.find({
      $or: [{ teacher: user._id }, { learner: user._id }]
    })
      .populate('teacher', 'name email')
      .populate('learner', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's transactions
    const transactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      user,
      sessions,
      transactions
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

// @desc    Update user status (ban/unban)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive, isBanned } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, isBanned },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
};

// @desc    Adjust user tokens
// @route   POST /api/admin/users/:id/tokens
// @access  Private/Admin
export const adjustUserTokens = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Amount and reason are required'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const balanceBefore = user.tokens;
    const isCredit = amount > 0;

    if (isCredit) {
      await user.addTokens(amount, reason);
    } else {
      if (!user.hasEnoughTokens(Math.abs(amount))) {
        return res.status(400).json({
          success: false,
          message: 'User does not have enough tokens'
        });
      }
      await user.deductTokens(Math.abs(amount), reason);
    }

    // Create transaction record
    await Transaction.create({
      user: user._id,
      type: isCredit ? 'credit' : 'debit',
      amount: Math.abs(amount),
      reason: 'admin_adjustment',
      description: reason,
      balanceBefore,
      balanceAfter: user.tokens
    });

    res.json({
      success: true,
      message: `Tokens ${isCredit ? 'added' : 'deducted'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        tokens: user.tokens
      }
    });
  } catch (error) {
    console.error('Adjust tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adjusting tokens'
    });
  }
};

// @desc    Get all sessions with filters
// @route   GET /api/admin/sessions
// @access  Private/Admin
export const getAllSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;

    const query = {};
    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate('teacher', 'name email avatar')
      .populate('learner', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions'
    });
  }
};

// @desc    Cancel session (admin action)
// @route   DELETE /api/admin/sessions/:id
// @access  Private/Admin
export const cancelSession = async (req, res) => {
  try {
    const { reason } = req.body;

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status === 'cancelled' || session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this session'
      });
    }

    // Refund tokens if session was paid
    if (session.tokensCharged > 0) {
      const learner = await User.findById(session.learner);
      await learner.addTokens(session.tokensCharged, 'admin_refund');

      // Create refund transaction
      await Transaction.create({
        user: learner._id,
        type: 'credit',
        amount: session.tokensCharged,
        reason: 'admin_session_cancellation',
        description: reason || 'Session cancelled by admin',
        balanceBefore: learner.tokens - session.tokensCharged,
        balanceAfter: learner.tokens
      });
    }

    session.status = 'cancelled';
    session.cancelledBy = 'admin';
    session.cancellationReason = reason;
    await session.save();

    res.json({
      success: true,
      message: 'Session cancelled and tokens refunded',
      session
    });
  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling session'
    });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Session activity
    const sessionActivity = await Session.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue over time
    const revenueOverTime = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          tokens: { $sum: '$tokensAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top skills
    const topSkills = await Session.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$skill',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Payment method breakdown
    const paymentMethodBreakdown = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
          tokens: { $sum: '$tokensAmount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Package popularity
    const packagePopularity = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$packageType',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
          tokens: { $sum: '$tokensAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Transaction breakdown by type
    const transactionsByType = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
          totalTokens: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({
      createdAt: { $gte: startDate }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name email')
      .populate('payment');

    // Recent payments
    const recentPayments = await Payment.find({
      createdAt: { $gte: startDate }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name email');

    // Average session value
    const avgSessionValue = await Session.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: null,
          avgTokens: { $avg: '$tokenCost' },
          totalSessions: { $sum: 1 }
        }
      }
    ]);

    // Token velocity (how fast tokens are being used)
    const tokenVelocity = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          credits: {
            $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] }
          },
          debits: {
            $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        userGrowth,
        sessionActivity,
        revenueOverTime,
        topSkills,
        paymentMethodBreakdown,
        packagePopularity,
        transactionsByType,
        tokenVelocity,
        recentTransactions,
        recentPayments,
        avgSessionValue: avgSessionValue[0] || { avgTokens: 0, totalSessions: 0 },
        period
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};
