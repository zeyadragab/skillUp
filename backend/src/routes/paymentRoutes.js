import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  webhookHandler,
  getPaymentHistory,
  getTokenPackages,
  processAlternativePayment,
  getPaymentById
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/packages', getTokenPackages);
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// Protected routes
router.post('/intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.post('/process', protect, processAlternativePayment);
router.get('/history', protect, getPaymentHistory);
router.get('/:paymentId', protect, getPaymentById);

export default router;
