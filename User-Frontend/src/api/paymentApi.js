import api from './axiosInstance';

export const getPlans = () =>
  api.get('/payments/plans');

export const getTopupPresets = () =>
  api.get('/payments/topup-presets');

export const purchaseTopup = (amount) =>
  api.post('/payments/purchase', { amount });

export const verifyTopup = (data) =>
  api.post('/payments/verify', data);

export const subscribePlan = (planId) =>
  api.post('/payments/subscribe', { planId });

export const cancelSubscription = () =>
  api.post('/payments/cancel');

export const getTransactions = () =>
  api.get('/payments/transactions');
