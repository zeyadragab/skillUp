import Recording from '../models/Recording.js';
import Session from '../models/Session.js';
import Notification from '../models/Notification.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Start recording for a session
// @route   POST /api/recordings/:sessionId/start
// @access  Private (Teacher or Learner in session)
export const startRecording = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    // Get session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is participant
    const isParticipant =
      session.teacher.toString() === userId.toString() ||
      session.learner.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Only session participants can start recording'
      });
    }

    // Check if session is in progress
    if (session.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Can only record sessions that are in progress'
      });
    }

    // Check if recording already exists
    const existingRecording = await Recording.findOne({ session: sessionId });
    if (existingRecording) {
      return res.status(400).json({
        success: false,
        message: 'Recording already exists for this session'
      });
    }

    // Create recording document
    const recording = await Recording.create({
      session: sessionId,
      teacher: session.teacher,
      learner: session.learner,
      skill: session.skill,
      title: session.title,
      description: session.description,
      agoraChannel: session.agoraChannel,
      scheduledAt: session.scheduledAt,
      status: 'recording',
      recordingStartedAt: new Date(),
      participants: [
        { user: session.teacher, joinedAt: session.teacherJoinedAt },
        { user: session.learner, joinedAt: session.learnerJoinedAt }
      ]
    });

    // In production, start Agora cloud recording here
    // const recordingService = await startAgoraCloudRecording(session.agoraChannel, recording._id);
    // recording.resourceId = recordingService.resourceId;
    // recording.sid = recordingService.sid;
    // await recording.save();

    res.status(201).json({
      success: true,
      message: 'Recording started successfully',
      recording: {
        id: recording._id,
        status: recording.status,
        startedAt: recording.recordingStartedAt
      }
    });
  } catch (error) {
    console.error('Start recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting recording',
      error: error.message
    });
  }
};

// @desc    Stop recording for a session
// @route   POST /api/recordings/:sessionId/stop
// @access  Private (Teacher or Learner in session)
export const stopRecording = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const recording = await Recording.findOne({ session: sessionId });
    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    // Check if user is participant
    const isParticipant =
      recording.teacher.toString() === userId.toString() ||
      recording.learner.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Only session participants can stop recording'
      });
    }

    if (recording.status !== 'recording') {
      return res.status(400).json({
        success: false,
        message: 'Recording is not active'
      });
    }

    // Update recording status
    recording.recordingEndedAt = new Date();
    recording.status = 'processing';
    recording.processingStartedAt = new Date();

    // Calculate duration
    const durationMs = recording.recordingEndedAt - recording.recordingStartedAt;
    recording.duration = Math.floor(durationMs / 1000);

    await recording.save();

    // In production, stop Agora cloud recording and get file URL
    // const recordingFile = await stopAgoraCloudRecording(recording.resourceId, recording.sid);
    // After processing, update recording with video URL

    res.status(200).json({
      success: false,
      message: 'Recording stopped. Processing will complete shortly.',
      recording: {
        id: recording._id,
        status: recording.status,
        duration: recording.duration
      }
    });
  } catch (error) {
    console.error('Stop recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Error stopping recording',
      error: error.message
    });
  }
};

// @desc    Upload recording file (webhook/manual)
// @route   POST /api/recordings/:id/upload
// @access  Private (Admin or system)
export const uploadRecordingFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl, fileSize, resolution, format } = req.body;

    const recording = await Recording.findById(id);
    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    // Upload to Cloudinary (or use URL from Agora)
    let videoUrl = fileUrl;
    let publicId = null;

    if (req.file || req.body.base64Video) {
      // If uploading file directly
      const uploadResult = await cloudinary.uploader.upload(
        req.file ? req.file.path : req.body.base64Video,
        {
          resource_type: 'video',
          folder: 'session_recordings',
          public_id: `recording_${id}`,
          overwrite: true
        }
      );

      videoUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    // Update recording
    recording.videoUrl = videoUrl;
    recording.videoPublicId = publicId;
    recording.fileSize = fileSize;
    recording.resolution = resolution || 'AUTO';
    recording.format = format || 'mp4';
    recording.status = 'ready';
    recording.processedAt = new Date();

    // Generate thumbnail
    if (publicId) {
      recording.thumbnailUrl = cloudinary.url(publicId, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          { width: 640, height: 360, crop: 'fill' }
        ]
      });
    }

    await recording.save();

    // Send notifications to participants
    await Notification.createRecordingReadyNotification(recording, [
      recording.teacher,
      recording.learner
    ]);

    res.status(200).json({
      success: true,
      message: 'Recording uploaded successfully',
      recording
    });
  } catch (error) {
    console.error('Upload recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading recording',
      error: error.message
    });
  }
};

// @desc    Get user's recordings
// @route   GET /api/recordings
// @access  Private
export const getRecordings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = 'ready', limit = 20, skip = 0 } = req.query;

    const recordings = await Recording.findUserRecordings(userId, {
      status,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    const total = await Recording.countDocuments({
      $or: [{ teacher: userId }, { learner: userId }],
      status
    });

    res.status(200).json({
      success: true,
      count: recordings.length,
      total,
      recordings
    });
  } catch (error) {
    console.error('Get recordings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recordings',
      error: error.message
    });
  }
};

// @desc    Get single recording
// @route   GET /api/recordings/:id
// @access  Private
export const getRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const recording = await Recording.findById(id)
      .populate('teacher learner', 'name avatar email')
      .populate('session', 'title skill scheduledAt duration');

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    // Check access
    if (!recording.canAccess(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this recording'
      });
    }

    // Check if expired
    if (recording.isExpired()) {
      return res.status(410).json({
        success: false,
        message: 'This recording has expired and is no longer available'
      });
    }

    // Generate playback token if not exists or expired
    if (!recording.accessToken || new Date() > recording.tokenExpiresAt) {
      recording.generatePlaybackToken();
      await recording.save();
    }

    // Track view
    await recording.addView(userId);

    res.status(200).json({
      success: true,
      recording
    });
  } catch (error) {
    console.error('Get recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recording',
      error: error.message
    });
  }
};

// @desc    Get recording playback URL
// @route   GET /api/recordings/:id/playback
// @access  Private
export const getPlaybackUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    const userId = req.user._id;

    const recording = await Recording.findById(id);

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    // Verify access
    if (!recording.canAccess(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify token if provided
    if (token && token !== recording.accessToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    // Check expiration
    if (recording.isExpired()) {
      return res.status(410).json({
        success: false,
        message: 'Recording has expired'
      });
    }

    if (recording.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: `Recording is ${recording.status}`,
        status: recording.status
      });
    }

    res.status(200).json({
      success: true,
      playbackUrl: recording.videoUrl,
      thumbnailUrl: recording.thumbnailUrl,
      duration: recording.duration,
      expiresAt: recording.expiresAt
    });
  } catch (error) {
    console.error('Get playback URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting playback URL',
      error: error.message
    });
  }
};

// @desc    Delete recording
// @route   DELETE /api/recordings/:id
// @access  Private (Teacher/Learner/Admin)
export const deleteRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const recording = await Recording.findById(id);

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    // Check permission
    const canDelete =
      recording.teacher.toString() === userId.toString() ||
      recording.learner.toString() === userId.toString() ||
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this recording'
      });
    }

    // Delete from Cloudinary if exists
    if (recording.videoPublicId) {
      try {
        await cloudinary.uploader.destroy(recording.videoPublicId, {
          resource_type: 'video'
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
      }
    }

    // Update status instead of hard delete (for audit trail)
    recording.status = 'deleted';
    await recording.save();

    res.status(200).json({
      success: true,
      message: 'Recording deleted successfully'
    });
  } catch (error) {
    console.error('Delete recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting recording',
      error: error.message
    });
  }
};

// @desc    Get recording statistics
// @route   GET /api/recordings/stats
// @access  Private
export const getRecordingStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Recording.aggregate([
      {
        $match: {
          $or: [{ teacher: userId }, { learner: userId }],
          status: 'ready'
        }
      },
      {
        $group: {
          _id: null,
          totalRecordings: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalViews: { $sum: '$views' },
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);

    const result = stats[0] || {
      totalRecordings: 0,
      totalDuration: 0,
      totalViews: 0,
      totalSize: 0
    };

    res.status(200).json({
      success: true,
      stats: {
        ...result,
        totalDurationHours: (result.totalDuration / 3600).toFixed(2),
        totalSizeGB: (result.totalSize / (1024 * 1024 * 1024)).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get recording stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recording statistics',
      error: error.message
    });
  }
};
