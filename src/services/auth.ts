import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (email: string, password: string) =>
  api.post('/auth/register', { email, password });

export const telegramAuth = (data: any) =>
  api.post('/auth/telegram', data);

export const logout = () => api.post('/auth/logout');

export default api;
