import cron from 'node-cron';
import User from '../modules/user/user.model.js';
import Notification from '../modules/notification/notification.model.js';
import { subscribePlan } from '../modules/payment/payment.service.js';
import { createNotification } from '../modules/notification/notification.service.js';
import logger from '../utils/logger.js';

export const runPaymentStatusCheck = async () => {
  try {
    logger.info('[PaymentStatusJob] Running payment status and subscription check...');
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Plan expiring in 24 hours
    const expiringUsers = await User.find({
      activePlanId: { $ne: null },
      planExpiryDate: { $gt: now, $lte: next24Hours },
    });

    for (const user of expiringUsers) {
      const existingWarning = await Notification.findOne({
        userId: user._id,
        type: 'WARNING',
        title: 'Your plan expires in 24 hours.',
        createdAt: { $gte: startOfToday },
      });

      if (!existingWarning) {
        await createNotification(
          user._id,
          'WARNING',
          'Your plan expires in 24 hours.',
          'Your active subscription will expire in 24 hours. Please ensure your wallet has sufficient balance for auto-renewal.'
        );
      }
    }

    // 2. Plan expired
    const expiredUsers = await User.find({
      activePlanId: { $ne: null },
      planExpiryDate: { $lt: now },
    });

    for (const user of expiredUsers) {
      if (user.autoRenew) {
        try {
          await subscribePlan(user._id, user.activePlanId);
          logger.info(`[PaymentStatusJob] Successfully auto-renewed plan ${user.activePlanId} for user ${user._id}`);
        } catch (error) {
          logger.warn(`[PaymentStatusJob] Auto-renewal failed for user ${user._id}: ${error.message}`);
          await User.findByIdAndUpdate(user._id, {
            activePlanId: null,
            planExpiryDate: null,
            autoRenew: false,
          });
          await createNotification(
            user._id,
            'WARNING',
            'Your plan has expired.',
            'We could not auto-renew your plan. Please top up your wallet and subscribe again.'
          );
        }
      } else {
        await User.findByIdAndUpdate(user._id, {
          activePlanId: null,
          planExpiryDate: null,
          autoRenew: false,
        });
        await createNotification(
          user._id,
          'WARNING',
          'Your plan has expired.',
          'Your subscription has expired. Top up and subscribe to continue riding.'
        );
      }
    }
    logger.info('[PaymentStatusJob] Subscription check completed.');
  } catch (error) {
    logger.error(`[PaymentStatusJob] Error during job execution: ${error.message}`);
  }
};

export const startPaymentStatusJob = () => {
  cron.schedule('0 * * * *', async () => {
    await runPaymentStatusCheck();
  });
  logger.info('[PaymentStatusJob] Scheduled to run every hour (0 * * * *).');
};

export default {
  runPaymentStatusCheck,
  startPaymentStatusJob,
};
