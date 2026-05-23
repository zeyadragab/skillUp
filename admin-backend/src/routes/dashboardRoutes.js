import express from 'express';
import {
  getDashboardStats,
  getRecentActivity,
  getUserGrowthChart,
  getSessionsChart,
  getTopTeachers,
  getRecentUsers,
  getTokenCirculation,
  getRecentSessions,
  getPendingSkills,
  getSystemHealth,
} from '../controllers/dashboardController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(hasPermission('analytics'));

router.get('/stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);
router.get('/charts/user-growth', getUserGrowthChart);
router.get('/charts/sessions', getSessionsChart);
router.get('/charts/tokens', getTokenCirculation);
router.get('/top-teachers', getTopTeachers);
router.get('/recent-users', getRecentUsers);
router.get('/recent-sessions', getRecentSessions);
router.get('/pending-skills', getPendingSkills);
router.get('/health', getSystemHealth);

export default router;
