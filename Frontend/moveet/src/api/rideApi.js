import axiosInstance from './axiosInstance.js';

export const startRide = async (scooterId) => {
  const response = await axiosInstance.post('/rides/start', { scooterId });
  return response.data;
};

export const getActiveRide = async () => {
  const response = await axiosInstance.get('/rides/active');
  return response.data;
};

export const endRide = async () => {
  const response = await axiosInstance.post('/rides/end');
  return response.data;
};

export const getRideHistory = async () => {
  const response = await axiosInstance.get('/rides/history');
  return response.data;
};

export default {
  startRide,
  getActiveRide,
  endRide,
  getRideHistory,
};
