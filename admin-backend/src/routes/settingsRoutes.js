import express from 'express';
import {
  getSettings,
  updateGeneralSettings,
  updateTokenSettings,
  updateSessionSettings,
  updateSecuritySettings,
  updateEmailSettings,
  updateGamificationSettings,
  resetSettings,
  getSettingsHistory,
  toggleMaintenanceMode
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin')); // Only super admin can manage settings

router.get('/', getSettings);
router.get('/history', getSettingsHistory);
router.put('/general', updateGeneralSettings);
router.put('/tokens', updateTokenSettings);
router.put('/sessions', updateSessionSettings);
router.put('/security', updateSecuritySettings);
router.put('/email', updateEmailSettings);
router.put('/gamification', updateGamificationSettings);
router.post('/reset', resetSettings);
router.post('/maintenance', toggleMaintenanceMode);

export default router;
