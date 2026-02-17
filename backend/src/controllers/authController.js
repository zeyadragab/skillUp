import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import ActivationToken from '../models/ActivationToken.js';
import { sendActivationEmail, sendWelcomeEmail } from '../services/emailService.js';
import {
  notifyWelcomeUser,
  notifyAccountVerified,
  notifyPasswordChanged
} from '../services/notificationService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Determine isTeacher based on role
    const isTeacher = role === 'teacher' || role === 'both';

    // Map frontend role to backend enum
    // Frontend: 'learner', 'teacher', 'both'
    // Backend: 'user', 'teacher', 'admin'
    let userRole = 'user'; // default for learners
    if (role === 'teacher' || role === 'both') {
      userRole = 'teacher';
    }

    // Create user (not activated yet)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      tokens: 50, // Welcome bonus
      isTeacher,
      role: userRole,
      isActive: false, // Requires email activation
      isVerified: false
    });

    // Create welcome bonus transaction
    await Transaction.create({
      user: user._id,
      type: 'credit',
      amount: 50,
      reason: 'welcome_bonus',
      description: 'Welcome to SkillSwap! Here are 50 free tokens to get started.',
      balanceBefore: 0,
      balanceAfter: 50
    });

    // Generate activation token and send email
    const activationToken = await ActivationToken.createToken(user._id);
    console.log('📧 Generated activation token for user:', user.email);
    console.log('📧 Token value:', activationToken.token);

    try {
      console.log('📧 Attempting to send activation email...');
      await sendActivationEmail(user.email, user.name, activationToken.token);
      console.log('📧 Activation email sent successfully!');
    } catch (emailError) {
      console.error('❌ Failed to send activation email:', emailError.message);
      console.error('❌ Full error:', emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send welcome notification
    const io = req.app.get('io');
    await notifyWelcomeUser(user._id, user.name, io);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to activate your account.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        tokens: user.tokens,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        isTeacher: user.isTeacher
      },
      requiresActivation: true
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Your account has been banned. Reason: ${user.banReason || 'Violation of terms of service'}`,
        isBanned: true,
        banReason: user.banReason,
        bannedAt: user.bannedAt
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active (email verified)
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the activation link.',
        requiresActivation: true,
        email: user.email
      });
    }

    // Update streak
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActivity = user.streak.lastActivity ? new Date(user.streak.lastActivity).setHours(0, 0, 0, 0) : null;

    if (lastActivity) {
      const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        user.streak.current += 1;
        if (user.streak.current > user.streak.longest) {
          user.streak.longest = user.streak.current;
        }
      } else if (daysDiff > 1) {
        user.streak.current = 1;
      }
    } else {
      user.streak.current = 1;
    }

    user.streak.lastActivity = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        country: user.country,
        languages: user.languages,
        tokens: user.tokens,
        tokensEarned: user.tokensEarned,
        tokensSpent: user.tokensSpent,
        role: user.role,
        isVerified: user.isVerified,
        isTeacher: user.isTeacher,
        averageRating: user.averageRating,
        totalSessionsTaught: user.totalSessionsTaught,
        totalSessionsLearned: user.totalSessionsLearned,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        streak: user.streak,
        level: user.level,
        experience: user.experience,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        country: user.country,
        timeZone: user.timeZone,
        languages: user.languages,
        tokens: user.tokens,
        tokensEarned: user.tokensEarned,
        tokensSpent: user.tokensSpent,
        role: user.role,
        isVerified: user.isVerified,
        isTeacher: user.isTeacher,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
        totalSessionsTaught: user.totalSessionsTaught,
        totalSessionsLearned: user.totalSessionsLearned,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        streak: user.streak,
        level: user.level,
        experience: user.experience,
        badges: user.badges,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowedFields = ['name', 'bio', 'country', 'timeZone', 'languages', 'avatar', 'preferences'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Implement email sending
    // await sendPasswordResetEmail(user, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetToken // Remove in production, only for testing
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new JWT token
    const jwtToken = generateToken(user._id);

    // Send password changed notification
    const io = req.app.get('io');
    await notifyPasswordChanged(user._id, io);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: jwtToken
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

// @desc    Activate account with token
// @route   GET /api/auth/activate/:token
// @access  Public
export const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify activation token
    const activationToken = await ActivationToken.verifyToken(token);

    if (!activationToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired activation link. Please request a new one.'
      });
    }

    // Find and activate user
    const user = await User.findById(activationToken.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is already activated'
      });
    }

    // Activate user
    user.isActive = true;
    user.isVerified = true;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Send account verified notification
    const io = req.app.get('io');
    await notifyAccountVerified(user._id, io);

    res.status(200).json({
      success: true,
      message: 'Account activated successfully! You can now log in.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating account',
      error: error.message
    });
  }
};

// @desc    Resend activation email
// @route   POST /api/auth/resend-activation
// @access  Public
export const resendActivation = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is already activated'
      });
    }

    // Delete old tokens
    await ActivationToken.deleteMany({ user: user._id });

    // Create new activation token
    const activationToken = await ActivationToken.createToken(user._id);

    // Send email
    await sendActivationEmail(user.email, user.name, activationToken.token);

    res.status(200).json({
      success: true,
      message: 'Activation email sent! Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending activation email',
      error: error.message
    });
  }
};
