import axiosInstance from './axiosInstance.js';

export const getNearbyScooters = async (lat, lng) => {
  const response = await axiosInstance.get(`/scooters/nearby?lat=${lat}&lng=${lng}`);
  return response.data;
};

export const getScooterById = async (id) => {
  const response = await axiosInstance.get(`/scooters/${id}`);
  return response.data;
};

export const getScooterByQr = async (qrCode) => {
  const response = await axiosInstance.get(`/scooters/qr/${qrCode}`);
  return response.data;
};

export const getFleetSummary = async () => {
  const response = await axiosInstance.get('/scooters/fleet-summary');
  return response.data;
};

export default {
  getNearbyScooters,
  getScooterById,
  getScooterByQr,
  getFleetSummary,
};
