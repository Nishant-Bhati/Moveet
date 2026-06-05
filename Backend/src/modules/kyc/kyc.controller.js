import kycService from './kyc.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const submitKyc = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await kycService.submitKyc(userId, req.body);
    return sendSuccess(res, result, 'KYC submitted successfully');
  } catch (err) {
    next(err);
  }
};

export const getKycStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await kycService.getKycStatus(userId);
    return sendSuccess(res, result, 'KYC status fetched');
  } catch (err) {
    next(err);
  }
};

export default {
  submitKyc,
  getKycStatus,
};
