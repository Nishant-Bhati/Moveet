import logger from '../../utils/logger.js';

export const createNotification = async (userId, type, title, message) => {
  logger.info(`[Notification] Created for user ${userId}: [${type}] ${title} - ${message}`);
  return {
    userId,
    type,
    title,
    message,
    createdAt: new Date(),
  };
};

export default {
  createNotification,
};
