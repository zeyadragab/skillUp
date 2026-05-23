import { User } from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get pending teacher verifications
// @route   GET /api/admin/teachers/pending
export const getPendingVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pendingQuery = {
      isTeacher: true,
      $or: [
        { teacherVerification: { $exists: false } },
        { 'teacherVerification.status': 'pending' }
      ]
    };

    const teachers = await User.find(pendingQuery)
      .select('name email avatar createdAt teacherVerification skillsToTeach')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(pendingQuery);

    res.status(200).json({
      success: true,
      data: teachers,
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
      message: 'Error fetching pending verifications'
    });
  }
};

// @desc    Get all teachers
// @route   GET /api/admin/teachers
export const getTeachers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { isTeacher: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query['teacherVerification.status'] = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // skillsToTeach is an embedded array — no populate needed
    const teachers = await User.find(query)
      .select('name email avatar isVerified averageRating totalRatings totalSessionsTaught skillsToTeach teacherVerification createdAt tokens')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: teachers,
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
      message: 'Error fetching teachers'
    });
  }
};

// @desc    Verify teacher
// @route   POST /api/admin/teachers/:id/verify
export const verifyTeacher = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isTeacher) {
      return res.status(400).json({
        success: false,
        message: 'User is not a teacher'
      });
    }

    user.teacherVerification = {
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy: req.admin._id,
      submittedAt: user.teacherVerification?.submittedAt || new Date()
    };
    await user.save();

    await logActivity(req, 'teacher_verify', 'user', user._id);

    res.status(200).json({
      success: true,
      message: 'Teacher verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying teacher'
    });
  }
};

// @desc    Reject teacher verification
// @route   POST /api/admin/teachers/:id/reject
export const rejectTeacher = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.teacherVerification = {
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: req.admin._id,
      rejectionReason: reason,
      submittedAt: user.teacherVerification?.submittedAt || new Date()
    };
    await user.save();

    await logActivity(req, 'teacher_reject', 'user', user._id, { reason });

    res.status(200).json({
      success: true,
      message: 'Teacher verification rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting teacher'
    });
  }
};

// @desc    Get teacher stats
// @route   GET /api/admin/teachers/stats
export const getTeacherStats = async (req, res) => {
  try {
    const totalTeachers = await User.countDocuments({ isTeacher: true });
    const verifiedTeachers = await User.countDocuments({
      isTeacher: true,
      'teacherVerification.status': 'approved'
    });
    const pendingVerifications = await User.countDocuments({
      isTeacher: true,
      $or: [
        { teacherVerification: { $exists: false } },
        { 'teacherVerification.status': 'pending' }
      ]
    });
    const rejected = await User.countDocuments({
      isTeacher: true,
      'teacherVerification.status': 'rejected'
    });

    const ratingAgg = await User.aggregate([
      { $match: { isTeacher: true, totalRatings: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$averageRating' } } }
    ]);
    const averageRating = ratingAgg[0]?.avg || 0;

    const topTeachers = await User.find({ isTeacher: true, totalRatings: { $gte: 1 } })
      .select('name avatar averageRating totalSessionsTaught')
      .sort({ averageRating: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalTeachers,
        verifiedTeachers,
        pendingVerifications,
        rejected,
        averageRating,
        topTeachers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher stats'
    });
  }
};
