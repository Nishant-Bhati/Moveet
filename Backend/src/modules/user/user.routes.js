import express from 'express';
import { z } from 'zod';
import protect from '../../middlewares/authMiddleware.js';
import validateRequest from '../../middlewares/validationMiddleware.js';
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

// Zod validation schema for updating profile
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  email: z.string().email('Invalid email address').optional(),
});

router.get('/me', getMe);
router.post('/profile', validateRequest(profileSchema), updateProfile);
router.post('/update-preferences', updatePreferences);
router.post('/update-contacts', updateContacts);
router.post('/toggle-auto-renew', toggleAutoRenew);

export default router;
