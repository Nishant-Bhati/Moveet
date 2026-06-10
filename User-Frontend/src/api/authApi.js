import api from './axiosInstance';

export const sendOtp = (phone) => api.post('/auth/login', { phone });

export const verifyOtp = (phone, otp) => api.post('/auth/verify', { phone, otp });
