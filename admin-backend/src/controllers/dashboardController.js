import { User, Skill, Session, Transaction } from '../models/index.js';
import Report from '../models/Report.js';
import { mainConn, adminConn } from '../config/database.js';
import axios from 'axios';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // User stats
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });

    // Teacher stats
    const totalTeachers = await User.countDocuments({ isTeacher: true });
    const pendingVerifications = await User.countDocuments({
      isTeacher: true,
      $or: [
        { teacherVerification: { $exists: false } },
        { 'teacherVerification.status': 'pending' }
      ]
    });

    // Session stats
    const totalSessions = await Session.countDocuments();
    const sessionsToday = await Session.countDocuments({ createdAt: { $gte: today } });

    // Token stats
    const tokenStats = await User.aggregate([
      { $group: { _id: null, totalTokens: { $sum: '$tokens' } } }
    ]);
    const totalTokens = tokenStats[0]?.totalTokens || 0;

    // Report stats
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTeachers,
        totalSessions,
        totalTokens,
        newUsersToday,
        sessionsToday,
        pendingReports,
        pendingVerifications,
        bannedUsers,
        unverifiedUsers,
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/admin/dashboard/recent-activity
export const getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email avatar createdAt isTeacher');

    // skill is a String — no populate; select the fields we need
    const recentSessions = await Session.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('teacher', 'name')
      .populate('learner', 'name')
      .select('teacher learner skill status scheduledAt tokensCharged createdAt');

    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reporter', 'name')
      .populate('reportedUser', 'name');

    res.status(200).json({
      success: true,
      data: {
        recentUsers,
        recentSessions,
        recentReports
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity'
    });
  }
};

// @desc    Get user growth chart data
// @route   GET /api/admin/dashboard/charts/user-growth
export const getUserGrowthChart = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          users: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $arrayElemAt: [['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], '$_id.month']
          },
          users: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: userGrowth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user growth data'
    });
  }
};

// @desc    Get sessions chart data
// @route   GET /api/admin/dashboard/charts/sessions
export const getSessionsChart = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sessionsData = await Session.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Transform data for chart
    const monthlyData = {};
    sessionsData.forEach(item => {
      const monthKey = `${item._id.year}-${item._id.month}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item._id.month],
          completed: 0,
          cancelled: 0,
          pending: 0
        };
      }
      // status enum: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
      if (item._id.status === 'completed') monthlyData[monthKey].completed = item.count;
      if (item._id.status === 'cancelled') monthlyData[monthKey].cancelled = item.count;
      if (item._id.status === 'scheduled') monthlyData[monthKey].pending = item.count;
    });

    res.status(200).json({
      success: true,
      data: Object.values(monthlyData)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions chart data'
    });
  }
};

// @desc    Get token circulation data
// @route   GET /api/admin/dashboard/charts/tokens
export const getTokenCirculation = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tokensData = await Transaction.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Transform for chart
    const dailyData = {};
    tokensData.forEach(item => {
      if (!dailyData[item._id.date]) {
        dailyData[item._id.date] = { date: item._id.date, credits: 0, debits: 0 };
      }
      if (item._id.type === 'credit') dailyData[item._id.date].credits = item.amount;
      if (item._id.type === 'debit') dailyData[item._id.date].debits = item.amount;
    });

    res.status(200).json({
      success: true,
      data: Object.values(dailyData)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching token circulation data'
    });
  }
};

// @desc    Get top teachers
// @route   GET /api/admin/dashboard/top-teachers
export const getTopTeachers = async (req, res) => {
  try {
    const topTeachers = await User.find({ isTeacher: true })
      .sort({ tokensEarned: -1, averageRating: -1 })
      .limit(10)
      .select('name email avatar tokensEarned averageRating totalReviews');

    res.status(200).json({
      success: true,
      data: topTeachers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top teachers'
    });
  }
};

// @desc    Get recent users
// @route   GET /api/admin/dashboard/recent-users
export const getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email avatar role isTeacher createdAt tokens');

    res.status(200).json({
      success: true,
      data: recentUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent users'
    });
  }
};

// @desc    Get recent sessions for activity feed
// @route   GET /api/admin/dashboard/recent-sessions
export const getRecentSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('teacher', 'name avatar')
      .populate('learner', 'name avatar')
      .select('teacher learner skill status scheduledAt tokensCharged createdAt');

    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching recent sessions' });
  }
};

// @desc    Get unapproved / inactive skills for queue
// @route   GET /api/admin/dashboard/pending-skills
export const getPendingSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ isActive: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name category createdAt teacherCount');

    res.status(200).json({ success: true, data: skills, total: skills.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pending skills' });
  }
};

// @desc    Get real system health
// @route   GET /api/admin/dashboard/health
export const getSystemHealth = async (req, res) => {
  const results = [];

  // 1. Main DB
  try {
    const state = mainConn.readyState; // 1 = connected
    results.push({ name: 'Main Database', status: state === 1 ? 'healthy' : 'down', detail: state === 1 ? 'Connected' : 'Disconnected' });
  } catch {
    results.push({ name: 'Main Database', status: 'down', detail: 'Error' });
  }

  // 2. Admin DB
  try {
    const state = adminConn.readyState;
    results.push({ name: 'Admin Database', status: state === 1 ? 'healthy' : 'down', detail: state === 1 ? 'Connected' : 'Disconnected' });
  } catch {
    results.push({ name: 'Admin Database', status: 'down', detail: 'Error' });
  }

  // 3. Main backend API
  try {
    const start = Date.now();
    await axios.get(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/health`, { timeout: 4000 });
    results.push({ name: 'Main API', status: 'healthy', detail: `${Date.now() - start}ms` });
  } catch {
    results.push({ name: 'Main API', status: 'down', detail: 'Unreachable' });
  }

  // 4. Admin API self (always healthy if we got here)
  results.push({ name: 'Admin API', status: 'healthy', detail: 'Running' });

  // 5. Email — check env vars present
  const emailOk = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  results.push({ name: 'Email Service', status: emailOk ? 'healthy' : 'degraded', detail: emailOk ? 'Configured' : 'Env vars missing' });

  const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy'
    : results.some(r => r.status === 'down') ? 'degraded' : 'degraded';

  res.status(200).json({ success: true, data: { services: results, overall: overallStatus } });
};
