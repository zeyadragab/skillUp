import express from 'express';
import {
  getTeacherAvailability,
  setAvailability,
  getMyAvailability,
  updateAvailabilityStatus,
  deleteAvailability,
  createDefaultAvailability,
  getAvailableSlots
} from '../controllers/availabilityController.js';
import { protect, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/:teacherId', getTeacherAvailability);
router.get('/:teacherId/slots', getAvailableSlots);

// Protected routes
router.use(protect);
router.get('/my/schedule', requireTeacher, getMyAvailability);
router.post('/', requireTeacher, setAvailability);
router.post('/default', requireTeacher, createDefaultAvailability);
router.put('/:id/status', requireTeacher, updateAvailabilityStatus);
router.delete('/:id', requireTeacher, deleteAvailability);

export default router;
