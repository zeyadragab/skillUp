import express from 'express';
import { sendBanEmail } from '../services/emailService.js';

const router = express.Router();

// @desc    Send ban notification email
// @route   POST /api/email/ban
// @access  Internal (called from admin-backend)
router.post('/ban', async (req, res) => {
  try {
    const { email, name, reason } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const result = await sendBanEmail(email, name, reason);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Ban email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send ban email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in ban email endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending ban email'
    });
  }
});

export default router;
