import express from 'express';
import { z } from 'zod';
import protect from '../../middlewares/authMiddleware.js';
import rideController from './ride.controller.js';
import { sendError } from '../../utils/apiResponse.js';

const router = express.Router();

// Apply auth protection middleware to all ride endpoints
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

const startRideSchema = z.object({
  scooterId: z.string().min(1, 'Scooter ID is required'),
});

router.post('/start', validateBody(startRideSchema), rideController.startRide);
router.get('/active', rideController.getActiveRide);
router.post('/end', rideController.endRide);
router.get('/history', rideController.getRideHistory);

export default router;
