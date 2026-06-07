import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import scooterRoutes from './modules/scooter/scooter.routes.js';
import kycRoutes from './modules/kyc/kyc.routes.js';
import rideRoutes from './modules/ride/ride.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import supportRoutes from './modules/support/support.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';

import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { sendSuccess } from './utils/apiResponse.js';
import { startScooterSyncJob } from './jobs/scooterSync.job.js';
import { startPaymentStatusJob } from './jobs/paymentStatus.job.js';
import { startNotificationJob } from './jobs/notification.job.js';

const app = express();

// Rate limiting setup
// General limit: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: {},
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Stricter limit for auth write endpoints: 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: {},
    message: 'Too many attempts, please try again after 15 minutes',
  },
});

// Apply general rate limiting globally
app.use(generalLimiter);

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply strict rate limiting to auth write endpoints before routes
app.use('/auth/login', authLimiter);
app.use('/auth/verify', authLimiter);

// API Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/scooters', scooterRoutes);
app.use('/kyc', kycRoutes);
app.use('/rides', rideRoutes);
app.use('/payments', paymentRoutes);
app.use('/notifications', notificationRoutes);
app.use('/', supportRoutes);
app.use('/chat', chatRoutes);

// Health check route
app.get('/health', (req, res) => {
  return sendSuccess(res, null, 'Server is healthy', 200);
});

// Fallback Middlewares
app.use(notFound);
app.use(errorHandler);

// Start background sync jobs if not in testing environment
if (process.env.NODE_ENV !== 'test') {
  startScooterSyncJob();
  startPaymentStatusJob();
  startNotificationJob();
}

export default app;
