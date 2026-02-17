import express from 'express';
import {
  startRecording,
  stopRecording,
  uploadRecordingFile,
  getRecordings,
  getRecording,
  getPlaybackUrl,
  deleteRecording,
  getRecordingStats
} from '../controllers/recordingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/:sessionId/start', startRecording);
router.post('/:sessionId/stop', stopRecording);
router.post('/:id/upload', uploadRecordingFile);
router.get('/', getRecordings);
router.get('/stats', getRecordingStats);
router.get('/:id', getRecording);
router.get('/:id/playback', getPlaybackUrl);
router.delete('/:id', deleteRecording);

export default router;
