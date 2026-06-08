import axios from 'axios';
import { BASE_URL } from '../utils/constants.js';
import storage from '../utils/storage.js';
import { store } from '../store/store.js';
import { logout } from '../store/authSlice.js';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: read token from AsyncStorage and attach as Bearer header
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: if 401, clear AsyncStorage token and dispatch logout action
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await storage.clearToken();
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
