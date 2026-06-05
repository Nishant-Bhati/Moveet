import express from 'express';
import protect from '../../middlewares/authMiddleware.js';
import scooterController from './scooter.controller.js';

const router = express.Router();

router.get('/nearby', protect, scooterController.getNearby);
router.get('/fleet-summary', protect, scooterController.getFleetSummary);
router.get('/qr/:code', protect, scooterController.getByQr);
router.get('/:id', protect, scooterController.getById);

export default router;
