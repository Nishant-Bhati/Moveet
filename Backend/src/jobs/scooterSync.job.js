import cron from 'node-cron';
import logger from '../utils/logger.js';

export const startScooterSyncJob = () => {
  // Runs every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    try {
      logger.info('Scooter sync job running — IoT integration pending.');
    } catch (error) {
      logger.error(`[ScooterSync] Error running sync job: ${error.message}`);
    }
  });
  logger.info('[ScooterSync] Background scooter sync job scheduled to run every 5 minutes (stub).');
};

export default {
  startScooterSyncJob,
};
