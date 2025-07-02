import axios from 'axios';
import { AUTH_CONFIG } from '../utils/constants';
import { StorageUtils } from '../utils/helpers';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = StorageUtils.getItem(AUTH_CONFIG.TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
