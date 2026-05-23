import { Transaction, User } from '../models/index.js';

// @desc    Get all transactions
// @route   GET /api/admin/transactions
export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type,
      reason,
      userId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (reason) query.reason = reason;
    if (userId) query.user = userId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseInt(minAmount);
      if (maxAmount) query.amount.$lte = parseInt(maxAmount);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Real field names: session (not relatedSession); no relatedUser field
    const transactions = await Transaction.find(query)
      .populate('user', 'name email avatar')
      .populate('session', 'title skill scheduledAt status')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions'
    });
  }
};

// @desc    Get transaction stats
// @route   GET /api/admin/transactions/stats
export const getTransactionStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Total stats
    const totalStats = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Period stats
    const periodStats = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // By reason
    const byReason = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$reason',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Daily breakdown
    const dailyBreakdown = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Current token circulation
    const tokenCirculation = await User.aggregate([
      {
        $group: {
          _id: null,
          totalInCirculation: { $sum: '$tokens' },
          totalEarned: { $sum: '$tokensEarned' },
          totalSpent: { $sum: '$tokensSpent' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: {
          credited: totalStats.find(s => s._id === 'credit') || { total: 0, count: 0 },
          debited: totalStats.find(s => s._id === 'debit') || { total: 0, count: 0 }
        },
        period: {
          credited: periodStats.find(s => s._id === 'credit') || { total: 0, count: 0 },
          debited: periodStats.find(s => s._id === 'debit') || { total: 0, count: 0 }
        },
        byReason,
        dailyBreakdown,
        circulation: tokenCirculation[0] || {
          totalInCirculation: 0,
          totalEarned: 0,
          totalSpent: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction stats'
    });
  }
};

// @desc    Get user transaction history
// @route   GET /api/admin/transactions/user/:userId
export const getUserTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findById(req.params.userId).select('name email tokens tokensEarned tokensSpent');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const transactions = await Transaction.find({ user: req.params.userId })
      .populate('session', 'title skill scheduledAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ user: req.params.userId });

    res.status(200).json({
      success: true,
      data: {
        user,
        transactions
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user transactions'
    });
  }
};
