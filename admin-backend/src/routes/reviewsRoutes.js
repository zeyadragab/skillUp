import express from 'express';
import {
  getReviews,
  getReview,
  updateReviewStatus,
  deleteReview,
  getUserReviews,
  getReviewStats
} from '../controllers/reviewsController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(hasPermission('reviews'));

router.get('/', getReviews);
router.get('/stats', getReviewStats);
router.get('/user/:userId', getUserReviews);
router.get('/:id', getReview);
router.put('/:id/status', updateReviewStatus);
router.delete('/:id', deleteReview);

export default router;
