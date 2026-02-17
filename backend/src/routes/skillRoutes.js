import express from 'express';
import {
  getAllSkills,
  getSkillById,
  getSkillsByCategory,
  getCategories,
  createSkill,
  updateSkill,
  deleteSkill,
  addTeachingSkill,
  addLearningSkill,
  removeUserSkill,
  getPopularSkills
} from '../controllers/skillController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllSkills);
router.get('/popular/top', getPopularSkills);
router.get('/categories/list', getCategories);
router.get('/category/:category', getSkillsByCategory);
router.get('/:id', getSkillById);

// Protected routes - User actions
router.post('/teach/:id', protect, addTeachingSkill);
router.post('/learn/:id', protect, addLearningSkill);
router.delete('/user/:skillId', protect, removeUserSkill);

// Admin routes
router.post('/', protect, requireAdmin, createSkill);
router.put('/:id', protect, requireAdmin, updateSkill);
router.delete('/:id', protect, requireAdmin, deleteSkill);

export default router;
