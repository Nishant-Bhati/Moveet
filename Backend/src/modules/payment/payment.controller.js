import paymentService from './payment.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const getPlans = async (req, res, next) => {
  try {
    const result = await paymentService.getPlans();
    return sendSuccess(res, result, 'Plans fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const purchaseTopup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;
    const result = await paymentService.purchaseTopup(userId, amount);
    return sendSuccess(res, result, 'Top-up purchase initiated successfully');
  } catch (err) {
    next(err);
  }
};

export const verifyTopup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await paymentService.verifyTopup(userId, req.body);
    return sendSuccess(res, result, 'Top-up verified and wallet updated successfully');
  } catch (err) {
    next(err);
  }
};

export const subscribePlan = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { planId } = req.body;
    const result = await paymentService.subscribePlan(userId, planId);
    return sendSuccess(res, result, 'Subscribed to plan successfully');
  } catch (err) {
    next(err);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await paymentService.cancelSubscription(userId);
    return sendSuccess(res, result, 'Subscription cancelled successfully');
  } catch (err) {
    next(err);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await paymentService.getTransactions(userId);
    return sendSuccess(res, result, 'Transactions fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const getTopupPresets = async (req, res, next) => {
  try {
    const result = paymentService.getTopupPresets();
    return sendSuccess(res, result, 'Top-up presets fetched successfully');
  } catch (err) {
    next(err);
  }
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
