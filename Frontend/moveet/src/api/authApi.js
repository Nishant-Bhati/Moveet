import axiosInstance from './axiosInstance.js';

export const sendOtp = async (phone) => {
  const response = await axiosInstance.post('/auth/login', { phone });
  return response.data;
};

export const verifyOtp = async (phone, otp) => {
  const response = await axiosInstance.post('/auth/verify', { phone, otp });
  return response.data;
};

export default {
  sendOtp,
  verifyOtp,
};
