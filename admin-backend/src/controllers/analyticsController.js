import { User, Session, Transaction, Skill } from '../models/index.js';

// @desc    Get comprehensive analytics
// @route   GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = Math.min(Math.max(parseInt(period) || 30, 1), 365);
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // ── User counts ────────────────────────────────────────────────────────────
    const [
      totalUsers, bannedUsers, newUsers, verifiedUsers, teachers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isTeacher: true }),
    ]);

    // ── Session counts ─────────────────────────────────────────────────────────
    const [
      totalSessions, completedSessions, cancelledSessions, upcomingSessions, sessionsInPeriod
    ] = await Promise.all([
      Session.countDocuments(),
      Session.countDocuments({ status: 'completed' }),
      Session.countDocuments({ status: 'cancelled' }),
      Session.countDocuments({ status: 'scheduled', scheduledAt: { $gte: new Date() } }),
      Session.countDocuments({ createdAt: { $gte: startDate } }),
    ]);

    // ── Token/Revenue analytics ────────────────────────────────────────────────
    // Transaction has no `status` field — filter only by type + reason
    const [totalRevenueAgg, revenueInPeriodAgg, tokensInCirculationAgg, tokenTransactions] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'credit', reason: 'purchase' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'credit', reason: 'purchase', createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$tokens' } } }
      ]),
      Transaction.countDocuments({ createdAt: { $gte: startDate } }),
    ]);

    // ── Time-series trends (bucketed by day over the selected period) ──────────
    const [userGrowthRaw, sessionTrendRaw, tokenFlowRaw] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Session.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),
      Transaction.aggregate([
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
      ]),
    ]);

    // Merge session trend by date
    const sessionByDate = {};
    sessionTrendRaw.forEach(({ _id, count }) => {
      if (!sessionByDate[_id.date]) {
        sessionByDate[_id.date] = { date: _id.date, completed: 0, cancelled: 0, scheduled: 0 };
      }
      if (_id.status === 'completed') sessionByDate[_id.date].completed = count;
      else if (_id.status === 'cancelled') sessionByDate[_id.date].cancelled = count;
      else if (_id.status === 'scheduled') sessionByDate[_id.date].scheduled = count;
    });

    // Merge token flow by date
    const tokenByDate = {};
    tokenFlowRaw.forEach(({ _id, amount, count }) => {
      if (!tokenByDate[_id.date]) {
        tokenByDate[_id.date] = { date: _id.date, credits: 0, debits: 0, creditCount: 0, debitCount: 0 };
      }
      if (_id.type === 'credit') { tokenByDate[_id.date].credits = amount; tokenByDate[_id.date].creditCount = count; }
      else if (_id.type === 'debit') { tokenByDate[_id.date].debits = amount; tokenByDate[_id.date].debitCount = count; }
    });

    res.status(200).json({
      success: true,
      period: daysAgo,
      data: {
        users: {
          total: totalUsers,
          banned: bannedUsers,
          new: newUsers,
          verified: verifiedUsers,
          teachers,
        },
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          cancelled: cancelledSessions,
          upcoming: upcomingSessions,
          inPeriod: sessionsInPeriod,
          completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        },
        revenue: {
          total: totalRevenueAgg[0]?.total || 0,
          inPeriod: revenueInPeriodAgg[0]?.total || 0,
        },
        tokens: {
          inCirculation: tokensInCirculationAgg[0]?.total || 0,
          transactions: tokenTransactions,
        },
        trends: {
          userGrowth: userGrowthRaw.map(d => ({ date: d._id, count: d.count })),
          sessions: Object.values(sessionByDate),
          tokenFlow: Object.values(tokenByDate),
        },
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
};

// @desc    Get top skills and top teachers for breakdown section
// @route   GET /api/admin/analytics/breakdown
export const getBreakdown = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = Math.min(Math.max(parseInt(period) || 30, 1), 365);
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const [topSkillsRaw, topTeachers, sessionsBySkill] = await Promise.all([
      // Top skills by session count in period
      Session.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$skill', sessions: { $sum: 1 }, tokens: { $sum: '$tokensCharged' } } },
        { $sort: { sessions: -1 } },
        { $limit: 10 },
      ]),
      // Top teachers by tokens earned
      User.find({ isTeacher: true })
        .sort({ tokensEarned: -1, totalSessionsTaught: -1 })
        .limit(8)
        .select('name email avatar tokensEarned totalSessionsTaught averageRating isVerified'),
      // Sessions by status in period
      Session.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    // Enrich skill names: skill field is a string name on Session
    const topSkills = topSkillsRaw.map(s => ({
      name: s._id || 'Unknown',
      sessions: s.sessions,
      tokens: s.tokens,
    }));

    const statusBreakdown = {};
    sessionsBySkill.forEach(({ _id, count }) => { statusBreakdown[_id] = count; });

    res.status(200).json({
      success: true,
      data: {
        topSkills,
        topTeachers,
        sessionStatusBreakdown: statusBreakdown,
      },
    });
  } catch (error) {
    console.error('Breakdown error:', error);
    res.status(500).json({ success: false, message: 'Error fetching breakdown data' });
  }
};
