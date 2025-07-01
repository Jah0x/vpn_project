import api from './api';

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (email: string, password: string) => {
  const res = await api.post('/auth/register', { email, password });
  return res.data;
};

export const verifyToken = async (token: string) => {
  const res = await api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const logout = async (token: string) => {
  await api.post(
    '/auth/logout',
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
};

export const refreshToken = async (refresh: string) => {
  const res = await api.post('/auth/refresh', { refresh });
  return res.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  const res = await api.post('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return res.data;
};

export const resetPassword = async (email: string) => {
  const res = await api.post('/auth/reset-password', { email });
  return res.data;
};
