import express from 'express';
import {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  getTeachersBySkill
} from '../controllers/userController.js';
import { getTransactions } from '../controllers/transactionController.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ── Fixed routes MUST come before /:id wildcard ──────────────────────────────

// GET /api/users/tokens — return authenticated user's token balance
router.get('/tokens', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('tokens tokensEarned tokensSpent');
    res.status(200).json({
      success: true,
      tokens: user.tokens,
      tokensEarned: user.tokensEarned,
      tokensSpent: user.tokensSpent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching token balance', error: error.message });
  }
});

// GET /api/users/transactions — return authenticated user's transactions
router.get('/transactions', protect, getTransactions);

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/search', searchUsers);
router.get('/skill/:skillName', getTeachersBySkill);
router.get('/:id', getUserProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// ── Protected routes ──────────────────────────────────────────────────────────
router.put('/profile', protect, updateProfile);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/unfollow', protect, unfollowUser);

export default router;
