import express from 'express';
import {
  getReports,
  getReport,
  updateReportStatus,
  resolveReport,
  dismissReport,
  addNote
} from '../controllers/reportsController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(hasPermission('reports'));

router.get('/', getReports);
router.get('/:id', getReport);
router.put('/:id/status', updateReportStatus);
router.post('/:id/resolve', resolveReport);
router.post('/:id/dismiss', dismissReport);
router.post('/:id/notes', addNote);

export default router;
