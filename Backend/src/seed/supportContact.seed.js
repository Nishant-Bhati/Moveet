import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import SupportContact from '../modules/support/supportContact.model.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

const seedSupportContact = async () => {
  try {
    logger.info('Connecting to MongoDB for seeding support contact...');
    await connectDB();

    logger.info('Upserting support contact into database...');
    const result = await SupportContact.findOneAndUpdate(
      {},
      {
        phone: '+91 98765 43210',
        email: 'support@moveet.in',
        label: 'Moveet Support',
        supportHours: 'Mon–Sat, 9am–6pm',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    logger.info(`Seeding success! Updated/Created support contact: ${result._id}`);

    logger.info('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding support contact: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      logger.error(`Error disconnecting: ${disconnectError.message}`);
    }
    process.exit(1);
  }
};

seedSupportContact();
