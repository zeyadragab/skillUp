import { User, Transaction, Session } from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';
import axios from 'axios';

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive,
      isBanned,
      isTeacher,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';
    if (isTeacher !== undefined) query.isTeacher = isTeacher === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
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

// @desc    Get single user with full activity data
// @route   GET /api/admin/users/:id
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const uid = user._id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [transactions, sessionsAsTeacher, sessionsAsLearner, activityChart] = await Promise.all([
      // Last 20 transactions
      Transaction.find({ user: uid })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),

      // Sessions taught
      Session.find({ teacher: uid })
        .select('skill title status scheduledAt tokensCharged createdAt')
        .populate('learner', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),

      // Sessions learned
      Session.find({ learner: uid })
        .select('skill title status scheduledAt tokensCharged createdAt')
        .populate('teacher', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),

      // 30-day daily activity (token debits/credits per day)
      Transaction.aggregate([
        { $match: { user: uid, createdAt: { $gte: thirtyDaysAgo } } },
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
      ]),
    ]);

    // Merge activity chart by date
    const chartByDate = {};
    activityChart.forEach(({ _id, amount, count }) => {
      if (!chartByDate[_id.date]) {
        chartByDate[_id.date] = { date: _id.date, spent: 0, earned: 0, txCount: 0 };
      }
      chartByDate[_id.date].txCount += count;
      if (_id.type === 'debit') chartByDate[_id.date].spent += amount;
      else chartByDate[_id.date].earned += amount;
    });

    // Embed session reviews into the response
    const reviews = [
      ...sessionsAsTeacher
        .filter(s => s.teacherRating?.rating)
        .map(s => ({ ...s.teacherRating, sessionId: s._id, skill: s.skill, role: 'teacher' })),
      ...sessionsAsLearner
        .filter(s => s.learnerRating?.rating)
        .map(s => ({ ...s.learnerRating, sessionId: s._id, skill: s.skill, role: 'learner' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    await logActivity(req, 'user_view', 'user', uid);

    res.status(200).json({
      success: true,
      data: {
        user,
        transactions,
        sessionsAsTeacher,
        sessionsAsLearner,
        reviews,
        activityChart: Object.values(chartByDate),
        stats: {
          totalSessions: sessionsAsTeacher.length + sessionsAsLearner.length,
          completedSessions: [...sessionsAsTeacher, ...sessionsAsLearner].filter(s => s.status === 'completed').length,
          totalReviews: reviews.length,
          followers: user.followers?.length || 0,
          following: user.following?.length || 0,
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, tokens, isActive, isVerified, isTeacher } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (tokens !== undefined) user.tokens = tokens;
    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isTeacher !== undefined) user.isTeacher = isTeacher;

    await user.save();

    await logActivity(req, 'user_update', 'user', user._id, req.body);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// @desc    Ban user
// @route   POST /api/admin/users/:id/ban
export const banUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBanned = true;
    user.banReason = reason;
    user.bannedAt = new Date();
    user.bannedBy = req.admin._id;
    await user.save();

    await logActivity(req, 'user_ban', 'user', user._id, { reason });

    // Send ban notification email
    try {
      await axios.post(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/email/ban`, {
        email: user.email,
        name: user.name,
        reason: reason || 'Violation of terms of service'
      });
      console.log(`✅ Ban email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Error sending ban email:', emailError.message);
      // Don't fail the ban operation if email fails
    }

    res.status(200).json({
      success: true,
      message: 'User banned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error banning user'
    });
  }
};

// @desc    Unban user
// @route   POST /api/admin/users/:id/unban
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBanned = false;
    user.banReason = undefined;
    user.bannedAt = undefined;
    user.bannedBy = undefined;
    await user.save();

    await logActivity(req, 'user_unban', 'user', user._id);

    res.status(200).json({
      success: true,
      message: 'User unbanned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unbanning user'
    });
  }
};

// @desc    Adjust user tokens
// @route   POST /api/admin/users/:id/tokens
export const adjustTokens = async (req, res) => {
  try {
    const { amount, type, reason } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const balanceBefore = user.tokens;

    if (type === 'credit') {
      user.tokens += amount;
    } else if (type === 'debit') {
      if (user.tokens < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient tokens'
        });
      }
      user.tokens -= amount;
    }

    await user.save();

    // Create transaction record
    await Transaction.create({
      user: user._id,
      type,
      amount,
      reason: 'admin_adjustment',
      description: reason || 'Token adjustment by admin',
      balanceBefore,
      balanceAfter: user.tokens
    });

    await logActivity(req, 'transaction_adjust', 'user', user._id, { amount, type, reason });

    res.status(200).json({
      success: true,
      message: 'Tokens adjusted successfully',
      data: { tokens: user.tokens }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adjusting tokens'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    await logActivity(req, 'user_delete', 'user', req.params.id, { email: user.email });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Verify all unverified users
// @route   POST /api/admin/users/verify-all
export const verifyAllUsers = async (req, res) => {
  try {
    const result = await User.updateMany(
      { isVerified: false },
      { $set: { isVerified: true } }
    );
    await logActivity(req, 'user_update', 'user', null, { action: 'verify_all', count: result.modifiedCount });
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} users verified`,
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying users' });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });

    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: lastWeek } });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        bannedUsers,
        verifiedUsers,
        newUsersToday,
        newUsersThisWeek
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
};
