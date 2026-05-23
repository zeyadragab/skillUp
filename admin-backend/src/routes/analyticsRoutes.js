import express from 'express';
import { getAnalytics, getBreakdown } from '../controllers/analyticsController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(hasPermission('analytics'));

router.get('/', getAnalytics);
router.get('/breakdown', getBreakdown);

export default router;
