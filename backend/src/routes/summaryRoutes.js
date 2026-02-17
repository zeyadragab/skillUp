import express from 'express';
import {
  generateSummary,
  getSummary,
  generateMockSummary,
  exportSummaryPDF,
  emailSummary,
  queueSummary,
  getJobStatusEndpoint
} from '../controllers/summaryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Summary routes
router.post('/generate/:sessionId', generateSummary);
router.get('/:sessionId', getSummary);
router.post('/mock/:sessionId', generateMockSummary); // For testing with mock data

// Background job routes
router.post('/queue/:sessionId', queueSummary); // Queue summary generation
router.get('/job-status/:sessionId', getJobStatusEndpoint); // Get job status

// Export and email routes
router.get('/:sessionId/pdf', exportSummaryPDF);
router.post('/:sessionId/email', emailSummary);

export default router;
