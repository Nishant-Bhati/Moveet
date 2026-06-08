import axiosInstance from './axiosInstance.js';

export const getMe = async () => {
  const response = await axiosInstance.get('/user/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axiosInstance.post('/user/profile', data);
  return response.data;
};

export default {
  getMe,
  updateProfile,
};
