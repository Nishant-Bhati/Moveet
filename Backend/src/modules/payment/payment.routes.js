import express from 'express';
import { z } from 'zod';
import protect from '../../middlewares/authMiddleware.js';
import validateRequest from '../../middlewares/validationMiddleware.js';
import paymentController from './payment.controller.js';

const router = express.Router();

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
router.post('/purchase', protect, validateRequest(purchaseTopupSchema), paymentController.purchaseTopup);
router.post('/verify', protect, validateRequest(verifyTopupSchema), paymentController.verifyTopup);
router.post('/subscribe', protect, validateRequest(subscribePlanSchema), paymentController.subscribePlan);
router.post('/cancel', protect, paymentController.cancelSubscription);
router.get('/transactions', protect, paymentController.getTransactions);

export default router;
