import Report from '../models/Report.js';
import { User } from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all reports
// @route   GET /api/admin/reports
export const getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      priority,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const reports = await Report.find(query)
      .populate('reporter', 'name email avatar')
      .populate('reportedUser', 'name email avatar')
      .populate('assignedTo', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
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
      message: 'Error fetching reports'
    });
  }
};

// @desc    Get single report
// @route   GET /api/admin/reports/:id
export const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email avatar')
      .populate('reportedUser', 'name email avatar isBanned')
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name')
      .populate('adminNotes.admin', 'name');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await logActivity(req, 'report_view', 'report', report._id);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report'
    });
  }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id/status
export const updateReportStatus = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (status) report.status = status;
    if (priority) report.priority = priority;
    if (assignedTo) report.assignedTo = assignedTo;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating report'
    });
  }
};

// @desc    Resolve report
// @route   POST /api/admin/reports/:id/resolve
export const resolveReport = async (req, res) => {
  try {
    const { action, notes, banUser = false } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = 'resolved';
    report.resolution = {
      action,
      notes,
      resolvedBy: req.admin._id,
      resolvedAt: new Date()
    };

    await report.save();

    // Ban user if requested
    if (banUser && report.reportedUser) {
      const user = await User.findById(report.reportedUser);
      if (user) {
        user.isBanned = true;
        user.banReason = `Banned due to report: ${report.reason}`;
        user.bannedAt = new Date();
        user.bannedBy = req.admin._id;
        await user.save();
      }
    }

    await logActivity(req, 'report_resolve', 'report', report._id, { action, banUser });

    res.status(200).json({
      success: true,
      message: 'Report resolved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving report'
    });
  }
};

// @desc    Dismiss report
// @route   POST /api/admin/reports/:id/dismiss
export const dismissReport = async (req, res) => {
  try {
    const { notes } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = 'dismissed';
    report.resolution = {
      action: 'no_action',
      notes,
      resolvedBy: req.admin._id,
      resolvedAt: new Date()
    };

    await report.save();

    await logActivity(req, 'report_dismiss', 'report', report._id, { notes });

    res.status(200).json({
      success: true,
      message: 'Report dismissed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error dismissing report'
    });
  }
};

// @desc    Add note to report
// @route   POST /api/admin/reports/:id/notes
export const addNote = async (req, res) => {
  try {
    const { note } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.adminNotes.push({
      admin: req.admin._id,
      note
    });

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding note'
    });
  }
};
