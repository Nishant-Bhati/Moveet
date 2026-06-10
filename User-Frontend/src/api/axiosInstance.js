import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/authSlice';
import { getToken } from '../utils/storage';
import { BASE_URL } from '../utils/constants';
import { showError } from '../utils/toast';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      showError('No internet connection.');
    } else {
      const status = error.response.status;
      if (status === 401) {
        store.dispatch(logout());
      } else if (status === 429) {
        showError('Too many requests. Please wait.');
      } else if (status >= 500) {
        showError('Server error. Please try again.');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
