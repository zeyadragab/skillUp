/**
 * Reviews in this platform are embedded inside Session documents as
 * teacherRating and learnerRating objects — there is no separate Review
 * collection. This controller reads/writes those embedded fields directly.
 *
 * Each "review" returned to the frontend is shaped as:
 * {
 *   _id,           — session._id (used as the review identifier)
 *   sessionId,
 *   skill,
 *   scheduledAt,
 *   reviewer,      — the user who left the rating
 *   reviewee,      — the user who received the rating
 *   ratingType,    — 'teacher' | 'learner'
 *   rating,
 *   review,
 *   ratedAt,
 *   isHidden,      — controlled by admin via session.teacherRating/learnerRating hidden flag
 * }
 */
import { Session, User } from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';

// Build a flat review list from completed sessions that have ratings
const buildReviewList = (sessions) => {
  const reviews = [];

  for (const session of sessions) {
    if (session.teacherRating?.rating) {
      reviews.push({
        _id: `${session._id}_teacher`,
        sessionId: session._id,
        skill: session.skill,
        skillCategory: session.skillCategory,
        scheduledAt: session.scheduledAt,
        // learner rated the teacher
        reviewer: session.learner,
        reviewee: session.teacher,
        ratingType: 'teacher',
        rating: session.teacherRating.rating,
        review: session.teacherRating.review,
        ratedAt: session.teacherRating.ratedAt,
        isHidden: session.teacherRating.isHidden || false,
        createdAt: session.teacherRating.ratedAt || session.updatedAt
      });
    }

    if (session.learnerRating?.rating) {
      reviews.push({
        _id: `${session._id}_learner`,
        sessionId: session._id,
        skill: session.skill,
        skillCategory: session.skillCategory,
        scheduledAt: session.scheduledAt,
        // teacher rated the learner
        reviewer: session.teacher,
        reviewee: session.learner,
        ratingType: 'learner',
        rating: session.learnerRating.rating,
        review: session.learnerRating.review,
        ratedAt: session.learnerRating.ratedAt,
        isHidden: session.learnerRating.isHidden || false,
        createdAt: session.learnerRating.ratedAt || session.updatedAt
      });
    }
  }

  return reviews;
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
export const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, isHidden, order = 'desc' } = req.query;

    // Fetch sessions that have at least one rating
    const sessionQuery = {
      $or: [
        { 'teacherRating.rating': { $exists: true } },
        { 'learnerRating.rating': { $exists: true } }
      ]
    };

    const sessions = await Session.find(sessionQuery)
      .populate('teacher', 'name email avatar')
      .populate('learner', 'name email avatar')
      .sort({ updatedAt: order === 'asc' ? 1 : -1 });

    let reviews = buildReviewList(sessions);

    // Apply filters
    if (rating) reviews = reviews.filter(r => r.rating === parseInt(rating));
    if (isHidden !== undefined) reviews = reviews.filter(r => r.isHidden === (isHidden === 'true'));

    const total = reviews.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginated = reviews.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
};

// @desc    Get single review
// @route   GET /api/admin/reviews/:id   (id format: "<sessionId>_teacher" or "<sessionId>_learner")
export const getReview = async (req, res) => {
  try {
    const [sessionId, ratingType] = req.params.id.split('_');

    const session = await Session.findById(sessionId)
      .populate('teacher', 'name email avatar')
      .populate('learner', 'name email avatar');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const embedded = ratingType === 'teacher' ? session.teacherRating : session.learnerRating;
    if (!embedded?.rating) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const review = {
      _id: req.params.id,
      sessionId: session._id,
      skill: session.skill,
      scheduledAt: session.scheduledAt,
      reviewer: ratingType === 'teacher' ? session.learner : session.teacher,
      reviewee: ratingType === 'teacher' ? session.teacher : session.learner,
      ratingType,
      rating: embedded.rating,
      review: embedded.review,
      ratedAt: embedded.ratedAt,
      isHidden: embedded.isHidden || false
    };

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ success: false, message: 'Error fetching review' });
  }
};

// @desc    Hide or unhide a review
// @route   PUT /api/admin/reviews/:id/status
export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'visible' | 'hidden'
    const [sessionId, ratingType] = req.params.id.split('_');

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isHidden = status === 'hidden';
    const field = ratingType === 'teacher' ? 'teacherRating' : 'learnerRating';

    if (!session[field]?.rating) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    session[field].isHidden = isHidden;
    await session.save();

    // Recalculate the reviewee's averageRating excluding hidden reviews
    const revieweeId = ratingType === 'teacher' ? session.teacher : session.learner;
    await recalcUserRating(revieweeId);

    await logActivity(req, 'review_hide', 'review', session._id, { ratingType, status });

    res.status(200).json({ success: true, message: `Review ${isHidden ? 'hidden' : 'made visible'} successfully` });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ success: false, message: 'Error updating review status' });
  }
};

// @desc    Delete a review (clears the embedded rating from the session)
// @route   DELETE /api/admin/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const [sessionId, ratingType] = req.params.id.split('_');

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const field = ratingType === 'teacher' ? 'teacherRating' : 'learnerRating';
    const revieweeId = ratingType === 'teacher' ? session.teacher : session.learner;

    session[field] = undefined;
    await session.save();

    await recalcUserRating(revieweeId);

    await logActivity(req, 'review_delete', 'review', session._id, { ratingType });

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Error deleting review' });
  }
};

// @desc    Get reviews for a specific user
// @route   GET /api/admin/reviews/user/:userId
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'received' } = req.query;

    // 'received' = sessions where user is teacher (teacherRating) or learner (learnerRating)
    const sessions = await Session.find({
      $or: [{ teacher: userId }, { learner: userId }],
      $or: [
        { 'teacherRating.rating': { $exists: true } },
        { 'learnerRating.rating': { $exists: true } }
      ]
    })
      .populate('teacher', 'name email avatar')
      .populate('learner', 'name email avatar')
      .sort({ updatedAt: -1 });

    let reviews = buildReviewList(sessions);

    if (type === 'received') {
      reviews = reviews.filter(r => r.reviewee?._id?.toString() === userId);
    } else {
      reviews = reviews.filter(r => r.reviewer?._id?.toString() === userId);
    }

    res.status(200).json({ success: true, data: reviews, total: reviews.length });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user reviews' });
  }
};

// @desc    Get review statistics
// @route   GET /api/admin/reviews/stats
export const getReviewStats = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { 'teacherRating.rating': { $exists: true } },
        { 'learnerRating.rating': { $exists: true } }
      ]
    });

    const reviews = buildReviewList(sessions);
    const totalReviews = reviews.length;
    const hiddenReviews = reviews.filter(r => r.isHidden).length;

    // Rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    reviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      ratingSum += r.rating;
    });
    const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

    const ratingDistribution = Object.entries(distribution).map(([rating, count]) => ({
      _id: parseInt(rating),
      count
    }));

    // Reviews per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recent = reviews.filter(r => r.createdAt && new Date(r.createdAt) >= sixMonthsAgo);
    const byMonth = {};
    recent.forEach(r => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!byMonth[key]) byMonth[key] = { year: d.getFullYear(), month: d.getMonth() + 1, count: 0, avgRating: 0, _sum: 0 };
      byMonth[key].count += 1;
      byMonth[key]._sum += r.rating;
    });
    const reviewsPerMonth = Object.values(byMonth).map(m => ({
      _id: { year: m.year, month: m.month },
      count: m.count,
      avgRating: m._sum / m.count
    }));

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        hiddenReviews,
        averageRating,
        ratingDistribution,
        reviewsPerMonth
      }
    });
  } catch (error) {
    console.error('Review stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching review statistics' });
  }
};

// Recalculate a user's averageRating and totalRatings from non-hidden session ratings
const recalcUserRating = async (userId) => {
  try {
    const sessions = await Session.find({
      $or: [
        { teacher: userId, 'teacherRating.rating': { $exists: true }, 'teacherRating.isHidden': { $ne: true } },
        { learner: userId, 'learnerRating.rating': { $exists: true }, 'learnerRating.isHidden': { $ne: true } }
      ]
    });

    const ratings = [];
    sessions.forEach(s => {
      if (s.teacher?.toString() === userId?.toString() && s.teacherRating?.rating && !s.teacherRating?.isHidden) {
        ratings.push(s.teacherRating.rating);
      }
      if (s.learner?.toString() === userId?.toString() && s.learnerRating?.rating && !s.learnerRating?.isHidden) {
        ratings.push(s.learnerRating.rating);
      }
    });

    const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    await User.findByIdAndUpdate(userId, {
      averageRating: Math.round(avg * 10) / 10,
      totalRatings: ratings.length
    });
  } catch (err) {
    console.error('recalcUserRating error:', err);
  }
};
