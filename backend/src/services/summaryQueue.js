import Queue from 'bull';
import { generateSessionSummary } from './aiSummaryService.js';
import SessionSummary from '../models/SessionSummary.js';
import Session from '../models/Session.js';
import dotenv from 'dotenv';

dotenv.config();

// Check if Redis is configured
const isRedisEnabled = process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost' || process.env.REDIS_PASSWORD;

let summaryQueue;

if (isRedisEnabled) {
  // Create Bull queue for summary generation
  summaryQueue = new Queue('session-summaries', {
    redis: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 200 // Keep last 200 failed jobs
    }
  });
} else {
  console.log('⚠️  Redis not configured - Bull queue disabled. Summary generation will run synchronously.');
  summaryQueue = null;
}

// Process jobs in the queue
if (summaryQueue) {
summaryQueue.process(async (job) => {
  const { sessionId, transcript } = job.data;

  console.log(`[Summary Queue] Processing summary for session ${sessionId}`);

  try {
    // Get session details
    const session = await Session.findById(sessionId)
      .populate('teacher learner', 'name email');

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Check or create SessionSummary record
    let sessionSummary = await SessionSummary.findOne({ session: sessionId });

    if (!sessionSummary) {
      sessionSummary = await SessionSummary.create({
        session: sessionId,
        processingStatus: 'processing'
      });
    } else {
      sessionSummary.processingStatus = 'processing';
      await sessionSummary.save();
    }

    // Update job progress
    job.progress(20);

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

    job.progress(80);

    // Update session summary with AI results
    sessionSummary.transcript = transcript || [];
    sessionSummary.summary = aiResult.summary;
    sessionSummary.analysis = aiResult.analysis;
    sessionSummary.statistics = aiResult.statistics;
    sessionSummary.processingStatus = 'completed';
    sessionSummary.generatedAt = new Date();

    await sessionSummary.save();

    job.progress(100);

    console.log(`[Summary Queue] ✅ Successfully generated summary for session ${sessionId}`);

    return {
      success: true,
      sessionId,
      summaryId: sessionSummary._id
    };
  } catch (error) {
    console.error(`[Summary Queue] ❌ Error generating summary for session ${sessionId}:`, error);

    // Mark summary as failed
    const sessionSummary = await SessionSummary.findOne({ session: sessionId });
    if (sessionSummary) {
      sessionSummary.processingStatus = 'failed';
      sessionSummary.processingError = error.message;
      await sessionSummary.save();
    }

    throw error;
  }
});

// Queue event handlers
summaryQueue.on('completed', (job, result) => {
  console.log(`[Summary Queue] Job ${job.id} completed:`, result);
});

summaryQueue.on('failed', (job, err) => {
  console.error(`[Summary Queue] Job ${job.id} failed:`, err.message);
});

summaryQueue.on('stalled', (job) => {
  console.warn(`[Summary Queue] Job ${job.id} stalled`);
});
}

/**
 * Add a summary generation job to the queue
 * @param {string} sessionId - Session ID
 * @param {Array} transcript - Optional transcript data
 * @param {Object} options - Queue options (delay, priority, etc.)
 */
export const queueSummaryGeneration = async (sessionId, transcript = null, options = {}) => {
  if (!summaryQueue) {
    console.warn('[Summary Queue] Redis not configured - cannot queue job');
    return null;
  }

  try {
    const job = await summaryQueue.add(
      {
        sessionId,
        transcript
      },
      {
        ...options,
        jobId: `summary-${sessionId}`, // Unique job ID prevents duplicates
      }
    );

    console.log(`[Summary Queue] Queued summary generation for session ${sessionId} (Job ID: ${job.id})`);

    return job;
  } catch (error) {
    console.error('[Summary Queue] Error adding job to queue:', error);
    throw error;
  }
};

/**
 * Get job status
 */
export const getJobStatus = async (sessionId) => {
  if (!summaryQueue) {
    return { status: 'queue_disabled' };
  }

  const job = await summaryQueue.getJob(`summary-${sessionId}`);

  if (!job) {
    return { status: 'not_found' };
  }

  const state = await job.getState();
  const progress = job.progress();

  return {
    status: state,
    progress,
    data: job.data
  };
};

/**
 * Cancel a queued job
 */
export const cancelJob = async (sessionId) => {
  if (!summaryQueue) {
    return false;
  }

  const job = await summaryQueue.getJob(`summary-${sessionId}`);

  if (job) {
    await job.remove();
    return true;
  }

  return false;
};

/**
 * Get queue statistics
 */
export const getQueueStats = async () => {
  if (!summaryQueue) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      total: 0,
      disabled: true
    };
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    summaryQueue.getWaitingCount(),
    summaryQueue.getActiveCount(),
    summaryQueue.getCompletedCount(),
    summaryQueue.getFailedCount(),
    summaryQueue.getDelayedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed
  };
};

export default summaryQueue;
