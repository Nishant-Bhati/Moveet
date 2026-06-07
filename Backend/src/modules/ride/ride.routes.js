import express from 'express';
import { z } from 'zod';
import protect from '../../middlewares/authMiddleware.js';
import validateRequest from '../../middlewares/validationMiddleware.js';
import rideController from './ride.controller.js';

const router = express.Router();

// Apply auth protection middleware to all ride endpoints
router.use(protect);

const startRideSchema = z.object({
  scooterId: z.string().min(1, 'Scooter ID is required'),
});

router.post('/start', validateRequest(startRideSchema), rideController.startRide);
router.get('/active', rideController.getActiveRide);
router.post('/end', rideController.endRide);
router.get('/history', rideController.getRideHistory);

export default router;
