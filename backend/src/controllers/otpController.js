import OTP from '../models/OTP.js';
import User from '../models/User.js';
import { sendOTPEmail } from '../services/emailService.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Request OTP for login
// @route   POST /api/otp/request
// @access  Public
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Please activate your account first. Check your email for activation link.',
        requiresActivation: true
      });
    }

    // Generate OTP (returns plain OTP before hashing)
    const otpCode = await OTP.createOTP(email.toLowerCase());
    console.log('🔑 Generated OTP for user:', email);
    console.log('🔑 OTP Code:', otpCode);

    // Send OTP email
    try {
      console.log('🔑 Attempting to send OTP email...');
      await sendOTPEmail(email, otpCode);
      console.log('🔑 OTP email sent successfully!');
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError.message);
      console.error('❌ Full error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. It will expire in 10 minutes.',
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating OTP',
      error: error.message
    });
  }
};

// @desc    Verify OTP and login
// @route   POST /api/otp/verify
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Verify OTP
    await OTP.verifyOTP(email.toLowerCase(), otp);

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        tokens: user.tokens,
        role: user.role,
        isVerified: user.isVerified,
        isTeacher: user.isTeacher
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Invalid OTP'
    });
  }
};
