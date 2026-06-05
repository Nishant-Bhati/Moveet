import express from 'express';
import protect from '../../middlewares/authMiddleware.js';
import { getNearby, getById, getByQr, getFleetSummary } from './scooter.controller.js';

const router = express.Router();

// Apply auth protection middleware to all scooter endpoints
router.use(protect);

router.get('/nearby', getNearby);
router.get('/fleet-summary', getFleetSummary);
router.get('/:id', getById);
router.get('/qr/:code', getByQr);

export default router;
