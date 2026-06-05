import express from 'express';
import protect from '../../middlewares/authMiddleware.js';
import {
  getMe,
  updateProfile,
  updatePreferences,
  updateContacts,
  toggleAutoRenew,
} from './user.controller.js';

const router = express.Router();

// Apply auth protection middleware to all user endpoints
router.use(protect);

router.get('/me', getMe);
router.post('/profile', updateProfile);
router.post('/update-preferences', updatePreferences);
router.post('/update-contacts', updateContacts);
router.post('/toggle-auto-renew', toggleAutoRenew);

export default router;
