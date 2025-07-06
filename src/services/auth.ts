import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

export const login = (loginField: string, password: string) =>
  api.post('/auth/login', { login: loginField, password });

export const register = (email: string, username: string, password: string) =>
  api.post('/auth/register', { email, username, password });

export const telegramAuth = (data: any) =>
  api.post('/auth/telegram', data);

export const logout = () => api.post('/auth/logout');

export const refreshToken = (refresh: string) =>
  api.post('/auth/refresh', { refresh });

export const changePassword = (
  currentPassword: string,
  newPassword: string,
) => api.post('/auth/change-password', { currentPassword, newPassword });

export const resetPassword = (email: string) =>
  api.post('/auth/reset-password', { email });

export default api;
