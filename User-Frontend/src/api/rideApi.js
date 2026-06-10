import api from './axiosInstance';

export const startRide = (scooterId) =>
  api.post('/rides/start', { scooterId });

export const getActiveRide = () =>
  api.get('/rides/active');

export const endRide = () =>
  api.post('/rides/end');

export const getRideHistory = () =>
  api.get('/rides/history');
