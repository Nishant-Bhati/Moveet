import cron from 'node-cron';
import logger from '../utils/logger.js';
import Scooter from '../modules/scooter/scooter.model.js';

const TELEMETRY_URL = 'https://iot-backend-8ybk.onrender.com/telemetry';

export const syncScooters = async () => {
  try {
    const response = await fetch(TELEMETRY_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch telemetry: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('Telemetry response indicates failure or data is not an array');
    }

    const data = result.data;
    if (data.length === 0) {
      logger.info(`[ScooterSync] No scooters to sync at ${new Date().toISOString()}`);
      return;
    }

    const bulkOps = data.map((item) => {
      const latitude = parseFloat(item.latitude);
      const longitude = parseFloat(item.longitude);

      return {
        updateOne: {
          filter: { iotId: item.id },
          update: {
            $set: {
              battery: item.battery,
              latitude: latitude,
              longitude: longitude,
              location: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              status: item.status,
              speed: item.speed,
              isLocked: item.isLocked,
              signalStrength: item.signalStrength,
              odometer: item.odometer,
              lastHeartbeat: item.lastHeartbeat ? new Date(item.lastHeartbeat) : new Date(),
            },
            $setOnInsert: {
              code: item.code,
              iotId: item.id,
              pricing: { minutely: 0.25, daily: 150 },
              model: 'Moveet Pro X',
              rangeKm: 45,
            },
          },
          upsert: true,
        },
      };
    });

    await Scooter.bulkWrite(bulkOps);
    logger.info(`[ScooterSync] Synced ${data.length} scooters at ${new Date().toISOString()}.`);
  } catch (error) {
    logger.error(`[ScooterSync] Error syncing scooters: ${error.message}`);
  }
};

export const startScooterSyncJob = () => {
  // Every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    await syncScooters();
  });
  logger.info('[ScooterSync] Background scooter sync job scheduled to run every 30 seconds.');
};

export default {
  syncScooters,
  startScooterSyncJob,
};
