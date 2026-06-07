import express from 'express';
import protect from '../../middlewares/authMiddleware.js';
import notificationController from './notification.controller.js';

const router = express.Router();

// Apply auth protection middleware to all notification endpoints
router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
