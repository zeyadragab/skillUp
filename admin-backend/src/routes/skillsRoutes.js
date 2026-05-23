import express from 'express';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/skillsController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(hasPermission('skills'));

// Categories routes (must be before :id to avoid conflict)
router.get('/categories/all', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Skills routes
router.get('/', getSkills);
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

export default router;
