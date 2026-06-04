import express from 'express';
import { getProfile, updateProfile } from './userController.js';
import protect from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to protect user profile routes
router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

export default router;
