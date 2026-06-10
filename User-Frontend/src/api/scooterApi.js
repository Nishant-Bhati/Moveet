import api from './axiosInstance';

export const getNearbyScooters = (lat, lng) =>
  api.get(`/scooters/nearby?lat=${lat}&lng=${lng}`);

export const getScooterById = (id) =>
  api.get(`/scooters/${id}`);

export const getScooterByQr = (code) =>
  api.get(`/scooters/qr/${code}`);

export const getFleetSummary = () =>
  api.get('/scooters/fleet-summary');
