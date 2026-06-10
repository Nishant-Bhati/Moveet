import api from './axiosInstance';

export const submitKyc = ({ aadhaarNumber, dlNumber }) =>
  api.post('/kyc/submit', { aadhaarNumber, dlNumber });

export const getKycStatus = () =>
  api.get('/kyc/status');
