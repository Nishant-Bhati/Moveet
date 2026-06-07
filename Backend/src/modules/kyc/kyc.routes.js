import express from 'express';
import { z } from 'zod';
import protect from '../../middlewares/authMiddleware.js';
import validateRequest from '../../middlewares/validationMiddleware.js';
import kycController from './kyc.controller.js';

const router = express.Router();

// Apply auth protection middleware to all kyc endpoints
router.use(protect);

const submitKycSchema = z.object({
  aadhaarNumber: z.string().min(12, 'Aadhaar number must be 12 digits').max(12, 'Aadhaar number must be 12 digits'),
  dlNumber: z.string().min(5, 'DL number must be at least 5 characters'),
});

router.post('/submit', validateRequest(submitKycSchema), kycController.submitKyc);
router.get('/status', kycController.getKycStatus);

export default router;
