import express from 'express';
import {
  getTeachers,
  getPendingVerifications,
  verifyTeacher,
  rejectTeacher,
  getTeacherStats
} from '../controllers/teachersController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(hasPermission('teachers'));

router.get('/', getTeachers);
router.get('/stats', getTeacherStats);
router.get('/pending', getPendingVerifications);
router.post('/:id/verify', verifyTeacher);
router.post('/:id/reject', rejectTeacher);

export default router;
