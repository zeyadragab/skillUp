import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  adjustTokens,
  getUserStats,
  verifyAllUsers
} from '../controllers/usersController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(hasPermission('users'));

router.get('/', getUsers);
router.get('/stats', getUserStats);
router.post('/verify-all', verifyAllUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/ban', banUser);
router.post('/:id/unban', unbanUser);
router.post('/:id/tokens', adjustTokens);

export default router;
