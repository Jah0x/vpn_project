import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

export const hankoLogin = (token: string) =>
  api.post('/auth/login', { token });

export const refreshToken = (refresh: string) =>
  api.post('/auth/refresh', { refresh });

export const logout = () => api.post('/auth/logout');

export default api;
