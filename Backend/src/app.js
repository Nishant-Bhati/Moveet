import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import scooterRoutes from './modules/scooter/scooter.routes.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { sendSuccess } from './utils/apiResponse.js';
import { startScooterSyncJob } from './jobs/scooterSync.job.js';

// Load environment variables
dotenv.config();

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/scooters', scooterRoutes);

// Health check route
app.get('/health', (req, res) => {
  return sendSuccess(res, null, 'Server is healthy', 200);
});

// Fallback Middlewares
app.use(notFound);
app.use(errorHandler);

// Start background sync job if not in testing environment
if (process.env.NODE_ENV !== 'test') {
  startScooterSyncJob();
}

export default app;
