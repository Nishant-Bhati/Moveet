import express from 'express';
import { z } from 'zod';
import protect from '../../middlewares/authMiddleware.js';
import kycController from './kyc.controller.js';
import { sendError } from '../../utils/apiResponse.js';

const router = express.Router();

// Apply auth protection middleware to all kyc endpoints
router.use(protect);

// Helper middleware to validate request body using Zod schemas
const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorDetails = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return sendError(res, 'Validation failed', 400, errorDetails);
    }
    next(error);
  }
};

const submitKycSchema = z.object({
  aadhaarNumber: z.string().min(12).max(12),
  dlNumber: z.string().min(5),
});

router.post('/submit', validateBody(submitKycSchema), kycController.submitKyc);
router.get('/status', kycController.getKycStatus);

export default router;
