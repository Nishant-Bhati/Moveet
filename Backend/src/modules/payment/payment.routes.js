import express from 'express';
import { z } from 'zod';
import protect from '../../middlewares/authMiddleware.js';
import paymentController from './payment.controller.js';
import { sendError } from '../../utils/apiResponse.js';

const router = express.Router();

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

// Zod validation schemas
const purchaseTopupSchema = z.object({
  amount: z.number().positive(),
});

const verifyTopupSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

const subscribePlanSchema = z.object({
  planId: z.enum(['daily', 'weekly', 'monthly']),
});

// Routes configuration
// Public Routes
router.get('/plans', paymentController.getPlans);
router.get('/topup-presets', paymentController.getTopupPresets);

// Protected Routes
router.post('/purchase', protect, validateBody(purchaseTopupSchema), paymentController.purchaseTopup);
router.post('/verify', protect, validateBody(verifyTopupSchema), paymentController.verifyTopup);
router.post('/subscribe', protect, validateBody(subscribePlanSchema), paymentController.subscribePlan);
router.post('/cancel', protect, paymentController.cancelSubscription);
router.get('/transactions', protect, paymentController.getTransactions);

export default router;
