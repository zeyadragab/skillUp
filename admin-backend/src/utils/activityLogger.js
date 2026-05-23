import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (req, action, targetType = null, targetId = null, details = null, status = 'success') => {
  try {
    await ActivityLog.create({
      admin: req.admin._id,
      action,
      targetType,
      targetId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      status
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export default logActivity;
