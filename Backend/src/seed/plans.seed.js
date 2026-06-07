import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import PaymentPlan from '../modules/payment/paymentPlan.model.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

const plans = [
  {
    "_id": "daily",
    "name": "Daily Plan",
    "subtitle": "24 HOURS • UNLIMITED",
    "price": 150,
    "priceLabel": "/d",
    "type": "fixed",
    "duration": "24 Hours",
    "durationHours": 24,
    "features": ["Unlimited rides", "Valid for 24 hours", "No per-minute charges"]
  },
  {
    "_id": "weekly",
    "name": "Weekly Plan",
    "subtitle": "7 DAYS • UNLIMITED",
    "price": 700,
    "priceLabel": "/wk",
    "type": "fixed",
    "duration": "7 Days",
    "durationHours": 168,
    "features": ["Unlimited rides", "Valid for 7 days", "Save ₹350 vs daily"]
  },
  {
    "_id": "monthly",
    "name": "Monthly Plan",
    "subtitle": "30 DAYS • UNLIMITED",
    "price": 2000,
    "priceLabel": "/mo",
    "type": "fixed",
    "duration": "30 Days",
    "durationHours": 720,
    "features": ["Unlimited rides", "Valid for 30 days", "Best value plan"]
  }
];

const seedPlans = async () => {
  try {
    logger.info('Connecting to MongoDB for seeding...');
    await connectDB();

    logger.info('Seeding plans into database...');

    const operations = plans.map(plan => ({
      updateOne: {
        filter: { _id: plan._id },
        update: { $set: plan },
        upsert: true
      }
    }));

    const result = await PaymentPlan.bulkWrite(operations);
    logger.info(`Seeding success! Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);

    logger.info('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding plans: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      logger.error(`Error disconnecting: ${disconnectError.message}`);
    }
    process.exit(1);
  }
};

seedPlans();
