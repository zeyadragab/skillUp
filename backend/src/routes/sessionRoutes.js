import express from 'express';
import {
  createSession,
  getSessions,
  getSession,
  updateSession,
  cancelSession,
  rateSession,
  joinSession
} from '../controllers/sessionController.js';
import { protect, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Session routes
router.post('/', createSession); // Both students and teachers can create sessions
router.get('/', getSessions);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.delete('/:id/cancel', cancelSession);
router.post('/:id/rate', rateSession);
router.post('/:id/join', joinSession);

export default router;
