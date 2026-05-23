import express from 'express';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import usersRoutes from './usersRoutes.js';
import teachersRoutes from './teachersRoutes.js';
import skillsRoutes from './skillsRoutes.js';
import sessionsRoutes from './sessionsRoutes.js';
import transactionsRoutes from './transactionsRoutes.js';
import reportsRoutes from './reportsRoutes.js';
import reviewsRoutes from './reviewsRoutes.js';
import notificationsRoutes from './notificationsRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/teachers', teachersRoutes);
router.use('/skills', skillsRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/reports', reportsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/settings', settingsRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
