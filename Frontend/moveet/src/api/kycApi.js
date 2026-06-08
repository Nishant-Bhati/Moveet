import axiosInstance from './axiosInstance.js';

export const submitKyc = async (data) => {
  const response = await axiosInstance.post('/kyc/submit', data);
  return response.data;
};

export const getKycStatus = async () => {
  const response = await axiosInstance.get('/kyc/status');
  return response.data;
};

export default {
  submitKyc,
  getKycStatus,
};
