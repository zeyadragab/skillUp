import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

// @desc    Get user's transaction history
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, offset = 0, type, reason } = req.query;

    let query = { user: userId };

    // Filter by type (credit/debit)
    if (type) {
      query.type = type;
    }

    // Filter by reason
    if (reason) {
      query.reason = reason;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('session', 'title skill scheduledAt');

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(query);

    // Calculate summary statistics
    const stats = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      totalEarned: stats.find(s => s._id === 'credit')?.total || 0,
      totalSpent: stats.find(s => s._id === 'debit')?.total || 0,
      totalTransactions: totalCount
    };

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalCount,
      summary,
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('session', 'title skill scheduledAt teacher learner')
      .populate('user', 'name email avatar');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user owns this transaction
    if (transaction.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this transaction'
      });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
export const getTransactionStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // Days to look back

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get transactions within period
    const transactions = await Transaction.find({
      user: userId,
      createdAt: { $gte: startDate }
    });

    // Calculate statistics
    const stats = {
      period: parseInt(period),
      totalEarned: 0,
      totalSpent: 0,
      netChange: 0,
      transactionCount: transactions.length,
      byReason: {},
      byDate: {}
    };

    transactions.forEach(tx => {
      if (tx.type === 'credit') {
        stats.totalEarned += tx.amount;
      } else {
        stats.totalSpent += tx.amount;
      }

      // Group by reason
      if (!stats.byReason[tx.reason]) {
        stats.byReason[tx.reason] = { credit: 0, debit: 0, count: 0 };
      }
      stats.byReason[tx.reason][tx.type] += tx.amount;
      stats.byReason[tx.reason].count += 1;

      // Group by date
      const dateKey = tx.createdAt.toISOString().split('T')[0];
      if (!stats.byDate[dateKey]) {
        stats.byDate[dateKey] = { credit: 0, debit: 0 };
      }
      stats.byDate[dateKey][tx.type] += tx.amount;
    });

    stats.netChange = stats.totalEarned - stats.totalSpent;

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction statistics',
      error: error.message
    });
  }
};

// @desc    Create a manual transaction (Admin only)
// @route   POST /api/transactions
// @access  Private (Admin)
export const createTransaction = async (req, res) => {
  try {
    const { userId, type, amount, reason, description } = req.body;

    if (!userId || !type || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const balanceBefore = user.tokens;

    // Update user tokens
    if (type === 'credit') {
      await user.addTokens(amount, reason);
    } else {
      await user.deductTokens(amount, reason);
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: userId,
      type,
      amount,
      reason,
      description: description || `Manual ${type} by admin`,
      balanceBefore,
      balanceAfter: user.tokens
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
};
