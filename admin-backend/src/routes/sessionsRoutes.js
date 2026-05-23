import express from 'express';
import {
  getSessions,
  getSession,
  cancelSession,
  getSessionStats
} from '../controllers/sessionsController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(hasPermission('sessions'));

router.get('/', getSessions);
router.get('/stats', getSessionStats);
router.get('/:id', getSession);
router.post('/:id/cancel', cancelSession);

export default router;
