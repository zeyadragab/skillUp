import SessionSummary from '../models/SessionSummary.js';
import Session from '../models/Session.js';
import { generateSessionSummary, isOpenAIConfigured } from '../services/aiSummaryService.js';
import { queueSummaryGeneration, getJobStatus } from '../services/summaryQueue.js';
import { transcribeAgoraRecording, isWhisperAvailable } from '../services/whisperService.js';

// @desc    Generate AI summary for a completed session
// @route   POST /api/summaries/generate/:sessionId
// @access  Private (participants only)
export const generateSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { transcript } = req.body; // Array of transcript entries

    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'AI summary service is not configured. Please contact administrator.'
      });
    }

    // Get session
    const session = await Session.findById(sessionId)
      .populate('teacher learner', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is participant
    const userId = req.user._id.toString();
    const isParticipant =
      session.teacher._id.toString() === userId ||
      session.learner._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this session'
      });
    }

    // Check if session is completed
    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only generate summaries for completed sessions'
      });
    }

    // Check if summary already exists
    let sessionSummary = await SessionSummary.findOne({ session: sessionId });

    if (sessionSummary && sessionSummary.processingStatus === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Summary already exists',
        summary: sessionSummary
      });
    }

    // Create or update session summary record
    if (!sessionSummary) {
      sessionSummary = await SessionSummary.create({
        session: sessionId,
        processingStatus: 'processing'
      });
    } else {
      sessionSummary.processingStatus = 'processing';
      await sessionSummary.save();
    }

    try {
      // Generate AI summary
      const aiResult = await generateSessionSummary({
        transcript: transcript || [],
        sessionInfo: {
          skill: session.skill,
          duration: session.duration,
          teacherName: session.teacher.name,
          learnerName: session.learner.name
        }
      });

      // Update session summary with AI results
      sessionSummary.transcript = transcript || [];
      sessionSummary.summary = aiResult.summary;
      sessionSummary.analysis = aiResult.analysis;
      sessionSummary.statistics = aiResult.statistics;
      sessionSummary.processingStatus = 'completed';
      sessionSummary.generatedAt = new Date();

      await sessionSummary.save();

      res.status(200).json({
        success: true,
        message: 'AI summary generated successfully',
        summary: sessionSummary
      });
    } catch (error) {
      // Update processing status to failed
      sessionSummary.processingStatus = 'failed';
      sessionSummary.processingError = error.message;
      await sessionSummary.save();

      throw error;
    }
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating AI summary',
      error: error.message
    });
  }
};

// @desc    Get session summary
// @route   GET /api/summaries/:sessionId
// @access  Private (participants only)
export const getSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session to verify access
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is participant
    const userId = req.user._id.toString();
    const isParticipant =
      session.teacher.toString() === userId ||
      session.learner.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this session'
      });
    }

    // Get summary
    const summary = await SessionSummary.findOne({ session: sessionId })
      .populate('session', 'title skill duration scheduledAt teacher learner');

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found for this session'
      });
    }

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching summary',
      error: error.message
    });
  }
};

// @desc    Generate mock summary for testing (with sample transcript)
// @route   POST /api/summaries/mock/:sessionId
// @access  Private (participants only)
export const generateMockSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session
    const session = await Session.findById(sessionId)
      .populate('teacher learner', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is participant
    const userId = req.user._id.toString();
    const isParticipant =
      session.teacher._id.toString() === userId ||
      session.learner._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this session'
      });
    }

    // Generate mock transcript based on skill
    const mockTranscript = generateMockTranscript(session);

    // Call the regular generate summary with mock data
    req.body.transcript = mockTranscript;
    return generateSummary(req, res);
  } catch (error) {
    console.error('Generate mock summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating mock summary',
      error: error.message
    });
  }
};

// Helper function to generate mock transcript
function generateMockTranscript(session) {
  const skill = session.skill || 'Programming';
  const teacherName = session.teacher?.name || 'Teacher';
  const learnerName = session.learner?.name || 'Learner';

  return [
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Hello! Welcome to our ${skill} session today. How are you doing?`,
      timestamp: 0
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Hi! I'm doing great, thank you. I'm excited to learn more about ${skill}.`,
      timestamp: 5
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Excellent! Today we'll cover the fundamentals and work through some practical examples. Do you have any specific questions or topics you'd like to focus on?`,
      timestamp: 12
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Yes, I'd like to understand the best practices and maybe see some real-world applications.`,
      timestamp: 22
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Perfect! Let's start with the basics and build up from there. The key concept to understand is...`,
      timestamp: 30
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Now, let me show you a practical example. This is how you would implement this in a real project...`,
      timestamp: 180
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `That makes sense! So if I wanted to apply this to my project, would I...?`,
      timestamp: 240
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Exactly! You're getting it. Let me show you another technique that can help...`,
      timestamp: 270
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Wow, that's really helpful. I have a question about the implementation...`,
      timestamp: 320
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Great question! The answer is... and here's why it works this way...`,
      timestamp: 330
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `For homework, I'd like you to practice what we learned today. Try implementing this on your own and let me know if you have any questions.`,
      timestamp: 500
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Will do! Thank you so much for the clear explanations. This was really valuable.`,
      timestamp: 520
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `You're welcome! You did a great job today. Keep practicing and feel free to reach out if you need help.`,
      timestamp: 530
    }
  ];
}

// @desc    Export summary as PDF
// @route   GET /api/summaries/:sessionId/pdf
// @access  Private (participants only)
export const exportSummaryPDF = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session to verify access
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is participant
    const userId = req.user._id.toString();
    const isParticipant =
      session.teacher.toString() === userId ||
      session.learner.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this session'
      });
    }

    // Get summary
    const summary = await SessionSummary.findOne({ session: sessionId })
      .populate({
        path: 'session',
        populate: [
          { path: 'teacher', select: 'name email' },
          { path: 'learner', select: 'name email' }
        ]
      });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(summary);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=session-summary-${sessionId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting PDF',
      error: error.message
    });
  }
};

// @desc    Email summary to participants
// @route   POST /api/summaries/:sessionId/email
// @access  Private (participants only)
export const emailSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session to verify access
    const session = await Session.findById(sessionId)
      .populate('teacher learner', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is participant
    const userId = req.user._id.toString();
    const isParticipant =
      session.teacher._id.toString() === userId ||
      session.learner._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this session'
      });
    }

    // Get summary
    const summary = await SessionSummary.findOne({ session: sessionId });
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    // Send emails
    await sendSummaryEmails(summary, session);

    res.status(200).json({
      success: true,
      message: 'Summary emailed to both participants'
    });
  } catch (error) {
    console.error('Email summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
};

// Helper: Generate PDF from summary
async function generatePDF(summary) {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 50 });

  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24).fillColor('#6366f1').text('AI Session Summary', { align: 'center' });
    doc.moveDown();

    // Session info
    const session = summary.session;
    doc.fontSize(12).fillColor('#000000');
    doc.text(`Skill: ${session.skill}`, { continued: false });
    doc.text(`Teacher: ${session.teacher?.name}`, { continued: false });
    doc.text(`Learner: ${session.learner?.name}`, { continued: false });
    doc.text(`Date: ${new Date(session.scheduledAt).toLocaleDateString()}`, { continued: false });
    doc.moveDown(2);

    // Overall Rating
    doc.fontSize(16).fillColor('#6366f1').text('Overall Rating', { underline: true });
    doc.fontSize(32).fillColor('#000000').text(`${summary.analysis.overallRating.toFixed(1)}/10`, { align: 'center' });
    doc.moveDown(2);

    // Overview
    doc.fontSize(16).fillColor('#6366f1').text('Overview', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#000000').text(summary.summary.overview);
    doc.moveDown(2);

    // Scores
    doc.fontSize(16).fillColor('#6366f1').text('Scores', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#000000');
    doc.text(`• Engagement: ${summary.analysis.engagement.score.toFixed(1)}/10`);
    doc.text(`• Teaching Quality: ${summary.analysis.teachingQuality.score.toFixed(1)}/10`);
    doc.text(`• Learning Progress: ${summary.analysis.learningProgress.score.toFixed(1)}/10`);
    doc.moveDown(2);

    // Key Learning Points
    if (summary.summary.keyLearningPoints && summary.summary.keyLearningPoints.length > 0) {
      doc.fontSize(16).fillColor('#6366f1').text('Key Learning Points', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#000000');
      summary.summary.keyLearningPoints.forEach((point, i) => {
        doc.text(`${i + 1}. ${point}`);
      });
      doc.moveDown(2);
    }

    // Recommendations
    if (summary.analysis.recommendations && summary.analysis.recommendations.length > 0) {
      doc.fontSize(16).fillColor('#6366f1').text('Recommendations', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#000000');
      summary.analysis.recommendations.forEach((rec, i) => {
        doc.text(`${i + 1}. ${rec}`);
      });
    }

    // Footer
    doc.moveDown(3);
    doc.fontSize(9).fillColor('#666666').text('Generated by SkillSwap AI', { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();
  });
}

// Helper: Send summary emails
async function sendSummaryEmails(summary, session) {
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .score-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .score { font-size: 48px; font-weight: bold; color: #6366f1; text-align: center; }
        .section { margin: 20px 0; }
        .section h3 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 5px; }
        .metric { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .recommendation { background: #fef3c7; padding: 15px; margin: 10px 0; border-left: 4px solid #f59e0b; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Session Summary Ready!</h1>
          <p>AI-Powered Analysis of Your Learning Session</p>
        </div>
        <div class="content">
          <div class="score-box">
            <p style="text-align: center; margin: 0; font-size: 14px; color: #6b7280;">Overall Rating</p>
            <div class="score">${summary.analysis.overallRating.toFixed(1)}/10</div>
          </div>

          <div class="section">
            <h3>📊 Session Details</h3>
            <div class="metric"><span>Skill:</span><strong>${session.skill}</strong></div>
            <div class="metric"><span>Teacher:</span><strong>${session.teacher.name}</strong></div>
            <div class="metric"><span>Learner:</span><strong>${session.learner.name}</strong></div>
            <div class="metric"><span>Date:</span><strong>${new Date(session.scheduledAt).toLocaleDateString()}</strong></div>
          </div>

          <div class="section">
            <h3>📈 Performance Scores</h3>
            <div class="metric"><span>Engagement:</span><strong>${summary.analysis.engagement.score.toFixed(1)}/10</strong></div>
            <div class="metric"><span>Teaching Quality:</span><strong>${summary.analysis.teachingQuality.score.toFixed(1)}/10</strong></div>
            <div class="metric"><span>Learning Progress:</span><strong>${summary.analysis.learningProgress.score.toFixed(1)}/10</strong></div>
          </div>

          <div class="section">
            <h3>💡 Key Learning Points</h3>
            <ul>
              ${summary.summary.keyLearningPoints?.map(point => `<li>${point}</li>`).join('') || '<li>No learning points recorded</li>'}
            </ul>
          </div>

          <div class="section">
            <h3>✨ AI Recommendations</h3>
            ${summary.analysis.recommendations?.map(rec => `<div class="recommendation">${rec}</div>`).join('') || '<p>No recommendations available</p>'}
          </div>

          <div class="footer">
            <p>Generated by SkillSwap AI • ${new Date().toLocaleString()}</p>
            <p>Visit <a href="${process.env.FRONTEND_URL}/sessions/${session._id}/summary" style="color: #6366f1;">SkillSwap</a> to view the full summary</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send to both participants
  const emails = [
    { to: session.teacher.email, name: session.teacher.name },
    { to: session.learner.email, name: session.learner.name }
  ];

  for (const recipient of emails) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipient.to,
      subject: `✨ AI Summary: ${session.skill} Session`,
      html: emailHTML
    });
  }
}

// @desc    Queue summary generation (background job)
// @route   POST /api/summaries/queue/:sessionId
// @access  Private (participants only)
export const queueSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { transcript, recordingUrl } = req.body;

    // Get session
    const session = await Session.findById(sessionId)
      .populate('teacher learner', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check participant access
    const userId = req.user._id.toString();
    const isParticipant =
      session.teacher._id.toString() === userId ||
      session.learner._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this session'
      });
    }

    // Check if session is completed
    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only generate summaries for completed sessions'
      });
    }

    let transcriptData = transcript;

    // If recording URL provided and Whisper is available, transcribe first
    if (recordingUrl && isWhisperAvailable()) {
      console.log('[Summary Controller] Transcribing recording with Whisper API...');
      try {
        transcriptData = await transcribeAgoraRecording(recordingUrl, {
          teacherName: session.teacher.name,
          learnerName: session.learner.name
        });
        console.log('[Summary Controller] ✅ Transcription completed');
      } catch (error) {
        console.error('[Summary Controller] Transcription failed:', error);
        // Fall back to mock transcript if transcription fails
        transcriptData = null;
      }
    }

    // Queue the summary generation job
    const job = await queueSummaryGeneration(sessionId, transcriptData);

    res.status(202).json({
      success: true,
      message: 'Summary generation queued',
      jobId: job.id,
      status: 'processing'
    });
  } catch (error) {
    console.error('Queue summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error queueing summary generation',
      error: error.message
    });
  }
};

// @desc    Get job status
// @route   GET /api/summaries/job-status/:sessionId
// @access  Private (participants only)
export const getJobStatusEndpoint = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const status = await getJobStatus(sessionId);

    res.status(200).json({
      success: true,
      jobStatus: status
    });
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting job status',
      error: error.message
    });
  }
};

export default {
  generateSummary,
  getSummary,
  generateMockSummary,
  exportSummaryPDF,
  emailSummary,
  queueSummary,
  getJobStatusEndpoint
};
