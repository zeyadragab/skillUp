import express from 'express';
import {
  getTransactions,
  getTransaction,
  getTransactionStats,
  createTransaction
} from '../controllers/transactionController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/', protect, getTransactions);
router.get('/stats', protect, getTransactionStats);
router.get('/:id', protect, getTransaction);

// Admin routes
router.post('/', protect, requireAdmin, createTransaction);

export default router;
