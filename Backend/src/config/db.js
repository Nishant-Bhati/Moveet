import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Connection event listeners
mongoose.connection.on('connected', () => {
  logger.info('Mongoose default connection open to database');
});

mongoose.connection.on('error', (err) => {
  logger.error(`Mongoose default connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose default connection disconnected');
});

// Close database connection if application process terminates
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('Mongoose default connection closed through application termination');
    process.exit(0);
  } catch (err) {
    logger.error(`Error during Mongoose connection closure: ${err.message}`);
    process.exit(1);
  }
});

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moveet';
    await mongoose.connect(mongoURI);
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    logger.warn('Continuing server execution without database connection. Operations that query the database will buffer or time out.');
  }
};

export default connectDB;
