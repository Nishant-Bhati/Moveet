import Notification from './notification.model.js';
import logger from '../../utils/logger.js';

export const createNotification = async (userId, type, title, message) => {
  try {
    const notification = await Notification.create({ userId, type, title, message });
    logger.info(`[Notification] Created for user ${userId}: [${type}] ${title} - ${message}`);
    return notification;
  } catch (error) {
    logger.error(`[Notification] Failed to create notification for user ${userId}: ${error.message}`);
    // Wrap in try/catch — never throw, just log errors so a notification failure never crashes other flows
    return null;
  }
};

export const getNotifications = async (userId) => {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);

  return notifications.map((n) => ({
    id: n._id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    date: n.createdAt,
  }));
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification;
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );

  return {
    updated: result.modifiedCount,
  };
};

export default {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
};
