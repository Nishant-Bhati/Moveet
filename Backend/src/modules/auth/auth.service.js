import jwt from 'jsonwebtoken';
import User from '../user/user.model.js';
import logger from '../../utils/logger.js';

// Map cache for storing OTPs
// Key: phone, Value: { otp, expiresAt }
const otpCache = new Map();

const OTP_TTL = 5 * 60 * 1000; // 5 minutes TTL

export const sendOtp = async (phone) => {
  const isDev = process.env.NODE_ENV === 'development';
  let otp;

  if (isDev) {
    otp = process.env.OTP_FIXED_DEV || '123456';
    logger.info(`[Dev Mode] Stored fixed OTP for ${phone}: ${otp}`);
    
    otpCache.set(phone, {
      otp,
      expiresAt: Date.now() + OTP_TTL,
    });
  } else {
    logger.warn(`[Prod Mode] TODO: Integrate real SMS gateway provider to send OTP to ${phone}`);
    
    // Generate a random 6-digit OTP in production so verify is still testable
    otp = Math.floor(100000 + Math.random() * 900000).toString();
    logger.info(`[Prod Mode] Generated OTP for testing: ${otp}`);
    
    otpCache.set(phone, {
      otp,
      expiresAt: Date.now() + OTP_TTL,
    });
  }

  return { success: true };
};

export const verifyOtp = async (phone, otp) => {
  const cachedData = otpCache.get(phone);

  if (!cachedData) {
    throw new Error('OTP not requested or expired');
  }

  if (Date.now() > cachedData.expiresAt) {
    otpCache.delete(phone);
    throw new Error('OTP expired');
  }

  if (cachedData.otp !== otp) {
    throw new Error('Invalid OTP');
  }

  // OTP is valid, remove from cache
  otpCache.delete(phone);

  // Find or create the user by phone number
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone });
    logger.info(`New user registered automatically with phone: ${phone}`);
  }

  // Sign JWT with userId and phone
  const token = jwt.sign(
    { userId: user._id, phone: user.phone },
    process.env.JWT_SECRET || 'jwt_secret_placeholder',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );

  return { token, user };
};

export default {
  sendOtp,
  verifyOtp,
};
