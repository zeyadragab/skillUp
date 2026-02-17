import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  logout,
  activateAccount,
  resendActivation
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { activationLimiter } from '../middleware/rateLimiter.js';
import { sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', sanitizeInput, register);
router.post('/login', sanitizeInput, login);
router.post('/forgot-password', sanitizeInput, forgotPassword);
router.post('/reset-password/:token', sanitizeInput, resetPassword);

// Activation routes
router.get('/activate/:token', activateAccount);
router.post('/resend-activation', sanitizeInput, activationLimiter, resendActivation);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, sanitizeInput, updateProfile);
router.post('/logout', protect, logout);

export default router;
