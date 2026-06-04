import Razorpay from 'razorpay';
import logger from '../utils/logger.js';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  logger.warn('Razorpay credentials are not fully set in environment variables. Using placeholder values.');
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId || 'rzp_test_placeholder',
  key_secret: razorpayKeySecret || 'placeholder_secret',
});

export default razorpay;
