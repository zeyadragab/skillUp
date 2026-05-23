import { Skill, SKILL_CATEGORY_LIST } from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all skills
// @route   GET /api/admin/skills
export const getSkills = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category, isActive } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // category is a String — no populate needed
    const skills = await Skill.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Skill.countDocuments(query);

    res.status(200).json({
      success: true,
      data: skills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ success: false, message: 'Error fetching skills' });
  }
};

// @desc    Create skill
// @route   POST /api/admin/skills
export const createSkill = async (req, res) => {
  try {
    const { name, description, category, icon, difficulty, tags } = req.body;

    if (!SKILL_CATEGORY_LIST.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${SKILL_CATEGORY_LIST.join(', ')}`
      });
    }

    const existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingSkill) {
      return res.status(400).json({ success: false, message: 'Skill already exists' });
    }

    const skill = await Skill.create({
      name: name.trim(),
      description,
      category,
      icon: icon || '🎯',
      difficulty: difficulty || 'beginner',
      tags: tags || []
    });

    await logActivity(req, 'skill_create', 'skill', skill._id, { name });

    res.status(201).json({ success: true, message: 'Skill created successfully', data: skill });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ success: false, message: 'Error creating skill' });
  }
};

// @desc    Update skill
// @route   PUT /api/admin/skills/:id
export const updateSkill = async (req, res) => {
  try {
    const { name, description, category, icon, isActive, difficulty, tags } = req.body;

    if (category && !SKILL_CATEGORY_LIST.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${SKILL_CATEGORY_LIST.join(', ')}`
      });
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    if (name) skill.name = name.trim();
    if (description !== undefined) skill.description = description;
    if (category) skill.category = category;
    if (icon) skill.icon = icon;
    if (isActive !== undefined) skill.isActive = isActive;
    if (difficulty) skill.difficulty = difficulty;
    if (tags) skill.tags = tags;

    await skill.save();

    await logActivity(req, 'skill_update', 'skill', skill._id, req.body);

    res.status(200).json({ success: true, message: 'Skill updated successfully', data: skill });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ success: false, message: 'Error updating skill' });
  }
};

// @desc    Delete skill
// @route   DELETE /api/admin/skills/:id
export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    await Skill.findByIdAndDelete(req.params.id);
    await logActivity(req, 'skill_delete', 'skill', req.params.id, { name: skill.name });

    res.status(200).json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ success: false, message: 'Error deleting skill' });
  }
};

// @desc    Get categories (derived from the enum — no DB collection)
// @route   GET /api/admin/categories
export const getCategories = async (req, res) => {
  try {
    // Augment each category with a live skill count from the DB
    const categoriesWithCount = await Promise.all(
      SKILL_CATEGORY_LIST.map(async (name) => {
        const skillCount = await Skill.countDocuments({ category: name, isActive: true });
        const totalSkills = await Skill.countDocuments({ category: name });
        return { name, skillCount, totalSkills };
      })
    );

    res.status(200).json({ success: true, data: categoriesWithCount });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
};

// @desc    Create category — not supported (categories are a fixed enum in the schema)
// @route   POST /api/admin/categories
export const createCategory = async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Categories are predefined in the system. To add a new category, update the schema enum.'
  });
};

// @desc    Update category — not supported
// @route   PUT /api/admin/categories/:id
export const updateCategory = async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Categories are predefined in the system and cannot be renamed via the admin panel.'
  });
};

// @desc    Delete category — not supported
// @route   DELETE /api/admin/categories/:id
export const deleteCategory = async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Categories are predefined in the system and cannot be deleted via the admin panel.'
  });
};
