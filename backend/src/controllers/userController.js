import User from '../models/User.js';
import { notifyProfileUpdated } from '../services/notificationService.js';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -resetPasswordToken')
      .populate('followers following', 'name avatar bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'bio', 'avatar', 'country', 'timeZone', 'languages'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    // Send profile updated notification
    const io = req.app.get('io');
    await notifyProfileUpdated(user._id, io);

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

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req, res) => {
  try {
    const userIdToFollow = req.params.id;
    const currentUserId = req.user._id;

    if (userIdToFollow === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    if (currentUser.following.includes(userIdToFollow)) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Add to following list
    currentUser.following.push(userIdToFollow);
    await currentUser.save();

    // Add to followers list
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: 'Successfully followed user',
      following: currentUser.following
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error following user',
      error: error.message
    });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/unfollow
// @access  Private
export const unfollowUser = async (req, res) => {
  try {
    const userIdToUnfollow = req.params.id;
    const currentUserId = req.user._id;

    const userToUnfollow = await User.findById(userIdToUnfollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if actually following
    if (!currentUser.following.includes(userIdToUnfollow)) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userIdToUnfollow
    );
    await currentUser.save();

    // Remove from followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUserId.toString()
    );
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user',
      following: currentUser.following
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unfollowing user',
      error: error.message
    });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatar bio skillsToTeach averageRating');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.followers.length,
      followers: user.followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching followers',
      error: error.message
    });
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name avatar bio skillsToTeach averageRating');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.following.length,
      following: user.following
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching following',
      error: error.message
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
export const searchUsers = async (req, res) => {
  try {
    const { q, skills, isTeacher } = req.query;
    let query = { isActive: true };

    // Search by name or email
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    // Filter by teacher status
    if (isTeacher !== undefined) {
      query.isTeacher = isTeacher === 'true';
    }

    // Filter by skills
    if (skills) {
      query['skillsToTeach.name'] = { $in: skills.split(',') };
    }

    const users = await User.find(query)
      .select('name avatar bio skillsToTeach averageRating totalSessionsTaught isTeacher country isVerified')
      .limit(20);

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
};

// @desc    Get teachers by skill
// @route   GET /api/users/skill/:skillName
// @access  Public
export const getTeachersBySkill = async (req, res) => {
  try {
    const { skillName } = req.params;
    const Skill = (await import('../models/Skill.js')).default;

    // Find the skill information
    const skill = await Skill.findOne({ name: skillName });

    // Find all users who teach this skill
    const teachers = await User.find({
      isTeacher: true,
      'skillsToTeach.name': skillName
    }).select('name email bio avatar profilePicture skillsToTeach sessionsCompleted totalStudents rating totalReviews');

    res.status(200).json({
      success: true,
      count: teachers.length,
      skill,
      teachers
    });
  } catch (error) {
    console.error('Get teachers by skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teachers',
      error: error.message
    });
  }
};
