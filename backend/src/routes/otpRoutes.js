import express from 'express';
import { requestOTP, verifyOTP } from '../controllers/otpController.js';
import { otpLimiter } from '../middleware/rateLimiter.js';
import { sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Request OTP
router.post('/request', sanitizeInput, otpLimiter, requestOTP);

// Verify OTP
router.post('/verify', sanitizeInput, verifyOTP);

export default router;
