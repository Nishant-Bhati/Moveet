import Kyc from './kyc.model.js';
import User from '../user/user.model.js';
import { createNotification } from '../notification/notification.service.js';

export const submitKyc = async (userId, body) => {
  const { aadhaarNumber, dlNumber } = body;

  // 1. Create or update the KYC record
  const kyc = await Kyc.findOneAndUpdate(
    { userId },
    {
      $set: {
        aadhaarNumber,
        dlNumber,
        status: 'PENDING',
        submittedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  );

  // 2. Update the user's KYC status to PENDING
  await User.findByIdAndUpdate(userId, { kycStatus: 'PENDING' });

  // 3. Call notification service
  await createNotification(userId, 'INFO', 'KYC submitted', 'Your documents are under review.');

  return kyc;
};

export const getKycStatus = async (userId) => {
  const kyc = await Kyc.findOne({ userId });
  if (!kyc) {
    return { status: 'NOT_STARTED' };
  }

  return {
    status: kyc.status,
    rejectionReason: kyc.rejectionReason,
    submittedAt: kyc.submittedAt,
    reviewedAt: kyc.reviewedAt,
    aadhaarNumber: kyc.aadhaarNumber,
    dlNumber: kyc.dlNumber,
  };
};

export default {
  submitKyc,
  getKycStatus,
};
