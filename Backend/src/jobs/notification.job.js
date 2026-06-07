import cron from 'node-cron';
import Notification from '../modules/notification/notification.model.js';
import logger from '../utils/logger.js';

export const archiveOldNotifications = async () => {
  try {
    logger.info('[NotificationJob] Archiving read notifications older than 30 days...');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await Notification.deleteMany({
      isRead: true,
      createdAt: { $lt: thirtyDaysAgo },
    });

    logger.info(`[NotificationJob] Successfully archived/deleted ${result.deletedCount} old notifications.`);
  } catch (error) {
    logger.error(`[NotificationJob] Error running archiving job: ${error.message}`);
  }
};

export const startNotificationJob = () => {
  cron.schedule('0 0 * * *', async () => {
    await archiveOldNotifications();
  });
  logger.info('[NotificationJob] Scheduled to run daily at midnight (0 0 * * *).');
};

export default {
  archiveOldNotifications,
  startNotificationJob,
};
