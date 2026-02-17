import Skill from '../models/Skill.js';
import User from '../models/User.js';

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
export const getAllSkills = async (req, res) => {
  try {
    const { category, search, difficulty, sort = '-popularityScore' } = req.query;

    // Build query
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skills = await Skill.find(query).sort(sort);

    res.status(200).json({
      success: true,
      count: skills.length,
      skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching skills',
      error: error.message
    });
  }
};

// @desc    Get skill by ID
// @route   GET /api/skills/:id
// @access  Public
export const getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      skill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching skill',
      error: error.message
    });
  }
};

// @desc    Get skills by category
// @route   GET /api/skills/category/:category
// @access  Public
export const getSkillsByCategory = async (req, res) => {
  try {
    const skills = await Skill.find({
      category: req.params.category,
      isActive: true
    }).sort('-popularityScore');

    res.status(200).json({
      success: true,
      category: req.params.category,
      count: skills.length,
      skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching skills',
      error: error.message
    });
  }
};

// @desc    Get all categories with skill counts
// @route   GET /api/skills/categories/list
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Skill.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalTeachers: { $sum: '$totalTeachers' },
          totalLearners: { $sum: '$totalLearners' },
          avgRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Add icons for categories
    const categoryIcons = {
      'Programming & Tech': '💻',
      'Design & Creative': '🎨',
      'Languages': '🌐',
      'Business & Finance': '💼',
      'Health & Wellness': '🧘',
      'Music & Arts': '🎵',
      'Cooking & Culinary': '🍳',
      'Sports & Fitness': '⚽',
      'Photography & Video': '📸',
      'Writing & Content': '✍️',
      'Marketing & Sales': '📊',
      'Science & Math': '🔬',
      'Other': '📚'
    };

    const categoriesWithIcons = categories.map(cat => ({
      ...cat,
      icon: categoryIcons[cat._id] || '📚',
      name: cat._id
    }));

    res.status(200).json({
      success: true,
      count: categories.length,
      categories: categoriesWithIcons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private/Admin
export const createSkill = async (req, res) => {
  try {
    const skill = await Skill.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating skill',
      error: error.message
    });
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private/Admin
export const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating skill',
      error: error.message
    });
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private/Admin
export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting skill',
      error: error.message
    });
  }
};

// @desc    Add skill to user's teaching list
// @route   POST /api/skills/teach/:id
// @access  Private
export const addTeachingSkill = async (req, res) => {
  try {
    const { level = 'intermediate', tokensPerHour = 50 } = req.body;
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if skill already in teaching list
    const user = await User.findById(req.user._id);
    const existingSkill = user.skillsToTeach.find(
      s => s.name === skill.name
    );

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already in your teaching list'
      });
    }

    // Add skill to user with tokensPerHour
    user.skillsToTeach.push({
      name: skill.name,
      level,
      category: skill.category,
      tokensPerHour
    });

    // Update skill statistics
    skill.totalTeachers += 1;
    await skill.updatePopularity();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill added to teaching list',
      skillsToTeach: user.skillsToTeach
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding skill',
      error: error.message
    });
  }
};

// @desc    Add skill to user's learning list
// @route   POST /api/skills/learn/:id
// @access  Private
export const addLearningSkill = async (req, res) => {
  try {
    const { level = 'beginner' } = req.body;
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if skill already in learning list
    const user = await User.findById(req.user._id);
    const existingSkill = user.skillsToLearn.find(
      s => s.name === skill.name
    );

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already in your learning list'
      });
    }

    // Add skill to user
    user.skillsToLearn.push({
      name: skill.name,
      level,
      category: skill.category
    });

    // Update skill statistics
    skill.totalLearners += 1;
    await skill.updatePopularity();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill added to learning list',
      skillsToLearn: user.skillsToLearn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding skill',
      error: error.message
    });
  }
};

// @desc    Remove skill from teaching/learning list
// @route   DELETE /api/skills/user/:skillId
// @access  Private
export const removeUserSkill = async (req, res) => {
  try {
    const { type } = req.query; // 'teach' or 'learn'
    const user = await User.findById(req.user._id);

    const skillArray = type === 'teach' ? 'skillsToTeach' : 'skillsToLearn';

    user[skillArray] = user[skillArray].filter(
      s => s._id.toString() !== req.params.skillId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill removed successfully',
      [skillArray]: user[skillArray]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing skill',
      error: error.message
    });
  }
};

// @desc    Get popular skills
// @route   GET /api/skills/popular/top
// @access  Public
export const getPopularSkills = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const skills = await Skill.find({ isActive: true })
      .sort('-popularityScore')
      .limit(limit);

    res.status(200).json({
      success: true,
      count: skills.length,
      skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular skills',
      error: error.message
    });
  }
};
