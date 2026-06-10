import api from './axiosInstance';

export const getMe = () =>
  api.get('/user/me');

export const updateProfile = ({ firstName, lastName, email }) =>
  api.post('/user/profile', { firstName, lastName, email });

export const updatePreferences = (data) =>
  api.post('/user/update-preferences', data);

export const toggleAutoRenew = () =>
  api.post('/user/toggle-auto-renew');

export const updateContacts = (data) =>
  api.post('/user/update-contacts', data);
