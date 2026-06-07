import crypto from 'crypto';
import PaymentPlan from './paymentPlan.model.js';
import Payment from './payment.model.js';
import WalletTransaction from './walletTransaction.model.js';
import User from '../user/user.model.js';
import razorpay from '../../config/razorpay.js';
import { createNotification } from '../notification/notification.service.js';

export const getPlans = async () => {
  return await PaymentPlan.find({ isActive: true }).sort({ price: 1 });
};

export const purchaseTopup = async (userId, amount) => {
  const allowedAmounts = [100, 500, 1000];
  if (!allowedAmounts.includes(amount)) {
    throw new Error('Invalid top-up amount');
  }

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: amount * 100, // amount in paise
    currency: 'INR',
    receipt: `tp_${Date.now().toString().slice(-10)}`,
  });

  // Create a Payment document
  await Payment.create({
    userId,
    type: 'TOPUP',
    amount,
    status: 'PENDING',
    razorpayOrderId: order.id,
  });

  return {
    orderId: order.id,
    amount,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

export const verifyTopup = async (userId, body) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpayOrderId + '|' + razorpayPaymentId)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new Error('Payment verification failed');
  }

  // Find pending Payment
  const payment = await Payment.findOne({ razorpayOrderId, status: 'PENDING' });
  if (!payment) {
    throw new Error('Order not found');
  }

  // Update Payment
  payment.status = 'SUCCESS';
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.paidAt = new Date();
  await payment.save();

  // Find user and update wallet
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: payment.amount } },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error('User not found');
  }

  // Create WalletTransaction
  await WalletTransaction.create({
    userId,
    amount: payment.amount,
    direction: 'CREDIT',
    referenceType: 'TOPUP',
    referenceId: payment._id.toString(),
    description: 'Wallet top-up via Razorpay',
    balanceAfter: updatedUser.walletBalance,
  });

  // Create notification
  await createNotification(
    userId,
    'SUCCESS',
    'Wallet topped up',
    `₹${payment.amount} added to your wallet.`
  );

  return {
    walletBalance: updatedUser.walletBalance,
  };
};

export const subscribePlan = async (userId, planId) => {
  // Find plan
  const plan = await PaymentPlan.findById(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  // Find user and check balance
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.walletBalance < plan.price) {
    throw new Error('Insufficient wallet balance');
  }

  // Deduct balance and set plan
  const planExpiryDate = new Date(Date.now() + plan.durationHours * 60 * 60 * 1000);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { walletBalance: -plan.price },
      activePlanId: planId,
      planExpiryDate,
      autoRenew: true,
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error('User not found');
  }

  // Create WalletTransaction
  await WalletTransaction.create({
    userId,
    amount: plan.price,
    direction: 'DEBIT',
    referenceType: 'SUBSCRIPTION',
    description: `${plan.name} activated`,
    balanceAfter: updatedUser.walletBalance,
  });

  // Create notification
  await createNotification(
    userId,
    'INFO',
    'Plan activated',
    `Your ${plan.name} is now active.`
  );

  return {
    walletBalance: updatedUser.walletBalance,
    activePlanId: updatedUser.activePlanId,
    planExpiryDate: updatedUser.planExpiryDate,
    autoRenew: updatedUser.autoRenew,
  };
};

export const cancelSubscription = async (userId) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      activePlanId: null,
      planExpiryDate: null,
      autoRenew: false,
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error('User not found');
  }

  // Create notification
  await createNotification(
    userId,
    'WARNING',
    'Subscription cancelled',
    'Your plan has been cancelled. Top up and subscribe to continue riding.'
  );

  return {
    activePlanId: null,
    planExpiryDate: null,
    autoRenew: false,
  };
};

export const getTransactions = async (userId) => {
  const transactions = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);

  return transactions.map((tx) => ({
    id: tx._id,
    amount: tx.amount,
    direction: tx.direction,
    description: tx.description,
    referenceType: tx.referenceType,
    balanceAfter: tx.balanceAfter,
    date: tx.createdAt,
  }));
};

export const getTopupPresets = () => {
  return [100, 500, 1000];
};

export default {
  getPlans,
  purchaseTopup,
  verifyTopup,
  subscribePlan,
  cancelSubscription,
  getTransactions,
  getTopupPresets,
};
