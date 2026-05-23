import express from 'express';
import {
  getTransactions,
  getTransactionStats,
  getUserTransactions
} from '../controllers/transactionsController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(hasPermission('transactions'));

router.get('/', getTransactions);
router.get('/stats', getTransactionStats);
router.get('/user/:userId', getUserTransactions);

export default router;
