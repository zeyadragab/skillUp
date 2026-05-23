import Queue from 'bull';
import { generateSessionSummary } from './aiSummaryService.js';
import SessionSummary from '../models/SessionSummary.js';
import Session from '../models/Session.js';
import dotenv from 'dotenv';

dotenv.config();

// Redis is available if REDIS_URL is set, or if REDIS_HOST is a non-localhost address with a password
const isRedisEnabled =
  !!process.env.REDIS_URL ||
  (process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost') ||
  !!process.env.REDIS_PASSWORD;

let summaryQueue = null;

// ─── Core work (shared by Bull processor and in-process fallback) ─────────────
const runSummaryGeneration = async (sessionId, transcript) => {
  const session = await Session.findById(sessionId)
    .populate('teacher learner', 'name email');

  if (!session) throw new Error(`Session ${sessionId} not found`);

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

  const aiResult = await generateSessionSummary({
    transcript: transcript || [],
    sessionInfo: {
      skill: session.skill,
      duration: session.duration,
      teacherName: session.teacher.name,
      learnerName: session.learner.name
    }
  });

  sessionSummary.transcript = transcript || [];
  sessionSummary.summary = aiResult.summary;
  sessionSummary.analysis = aiResult.analysis;
  sessionSummary.statistics = aiResult.statistics;
  sessionSummary.processingStatus = 'completed';
  sessionSummary.generatedAt = new Date();
  await sessionSummary.save();

  console.log(`[Summary] Generated summary for session ${sessionId}`);
  return { success: true, sessionId, summaryId: sessionSummary._id };
};

// ─── In-process fallback (when Redis is unavailable) ─────────────────────────
const runSummaryInProcess = (sessionId, transcript) => {
  setTimeout(async () => {
    try {
      await runSummaryGeneration(sessionId, transcript);
    } catch (err) {
      console.error(`[Summary Fallback] Failed for session ${sessionId}:`, err.message);
      try {
        const summary = await SessionSummary.findOne({ session: sessionId });
        if (summary) {
          summary.processingStatus = 'failed';
          summary.processingError = err.message;
          await summary.save();
        }
      } catch (_) {}
    }
  }, 2000);
};

// ─── Bull queue (when Redis is available) ────────────────────────────────────
if (isRedisEnabled) {
  try {
    const redisConfig = process.env.REDIS_URL
      ? process.env.REDIS_URL
      : {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined
        };

    summaryQueue = new Queue('session-summaries', redisConfig, {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200
      }
    });

    summaryQueue.on('error', (err) => {
      console.error('[Summary Queue] Redis error — falling back to in-process:', err.message);
      summaryQueue = null;
    });

    summaryQueue.process(async (job) => {
      const { sessionId, transcript } = job.data;
      job.progress(10);
      const result = await runSummaryGeneration(sessionId, transcript);
      job.progress(100);
      return result;
    });

    summaryQueue.on('completed', (job, result) =>
      console.log(`[Summary Queue] Job ${job.id} completed`, result));
    summaryQueue.on('failed', (job, err) =>
      console.error(`[Summary Queue] Job ${job.id} failed:`, err.message));
    summaryQueue.on('stalled', (job) =>
      console.warn(`[Summary Queue] Job ${job.id} stalled`));

    console.log('[Summary Queue] Bull queue initialized with Redis');
  } catch (err) {
    console.error('[Summary Queue] Failed to initialize Bull — using in-process fallback:', err.message);
    summaryQueue = null;
  }
} else {
  console.log('[Summary Queue] Redis not configured — using in-process fallback');
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const queueSummaryGeneration = async (sessionId, transcript = null, options = {}) => {
  if (summaryQueue) {
    try {
      const job = await summaryQueue.add(
        { sessionId, transcript },
        { ...options, jobId: `summary-${sessionId}` }
      );
      console.log(`[Summary Queue] Queued session ${sessionId} (Job ${job.id})`);
      return job;
    } catch (err) {
      console.error('[Summary Queue] Failed to add job — falling back:', err.message);
    }
  }

  // Fallback: run in-process
  runSummaryInProcess(sessionId, transcript);
  return { id: `fallback-${sessionId}`, mode: 'fallback' };
};

// Back-compat alias
export const addSummaryJob = queueSummaryGeneration;

export const getJobStatus = async (sessionId) => {
  if (!summaryQueue) return { status: 'queue_disabled' };
  const job = await summaryQueue.getJob(`summary-${sessionId}`);
  if (!job) return { status: 'not_found' };
  return { status: await job.getState(), progress: job.progress(), data: job.data };
};

export const cancelJob = async (sessionId) => {
  if (!summaryQueue) return false;
  const job = await summaryQueue.getJob(`summary-${sessionId}`);
  if (job) { await job.remove(); return true; }
  return false;
};

export const getQueueStats = async () => {
  if (!summaryQueue) {
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, total: 0, disabled: true };
  }
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    summaryQueue.getWaitingCount(),
    summaryQueue.getActiveCount(),
    summaryQueue.getCompletedCount(),
    summaryQueue.getFailedCount(),
    summaryQueue.getDelayedCount()
  ]);
  return { waiting, active, completed, failed, delayed, total: waiting + active + completed + failed + delayed };
};

export default summaryQueue;
