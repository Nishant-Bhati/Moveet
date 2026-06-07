import notificationService from './notification.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await notificationService.getNotifications(userId);
    return sendSuccess(res, result, 'Notifications fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;
    const result = await notificationService.markAsRead(notificationId, userId);
    return sendSuccess(res, result, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await notificationService.markAllAsRead(userId);
    return sendSuccess(res, result, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
