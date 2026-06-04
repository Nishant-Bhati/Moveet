import authService from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const login = async (req, res, next) => {
  try {
    const { phone } = req.body;
    await authService.sendOtp(phone);
    return sendSuccess(res, null, 'OTP sent successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const verify = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const result = await authService.verifyOtp(phone, otp);
    return sendSuccess(res, result, 'OTP verified successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export default {
  login,
  verify,
};
