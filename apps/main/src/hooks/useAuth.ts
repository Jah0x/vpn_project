import { useState, useEffect, useCallback } from 'react';
import { AUTH_CONFIG } from '../utils/constants';
import api from '../services/api';
import { StorageUtils } from '../utils/helpers';

interface AuthResult<T = void> {
  success: boolean;
  message?: string;
  user?: any;
  error?: string;
  data?: T;
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const parseJwt = (token: string) => {
    try {
      const base64 = token.split('.')[1];
      const payload = atob(base64);
      return JSON.parse(payload);
    } catch {
      return null;
    }
  };

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = StorageUtils.getItem(AUTH_CONFIG.TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }
      const payload = parseJwt(token);
      if (!payload || payload.exp * 1000 <= Date.now()) {
        clearAuthData();
        setIsLoading(false);
        return;
      }
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithHanko = useCallback(async (token: string): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      const { data } = await api.post('/auth/login', { token });
      if (data.access_token) {
        StorageUtils.setItem(AUTH_CONFIG.TOKEN_KEY, data.access_token);
        if (data.refresh_token) {
          StorageUtils.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, data.refresh_token);
        }
        if (data.user) {
          StorageUtils.setItem(AUTH_CONFIG.USER_KEY, data.user);
          setUser(data.user);
        }
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshWithHanko = useCallback(async (): Promise<AuthResult> => {
    try {
      const refreshToken = StorageUtils.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      if (!refreshToken) throw new Error('No refresh token');
      const { data } = await api.post('/auth/refresh', { refresh: refreshToken });
      if (data.access_token) {
        StorageUtils.setItem(AUTH_CONFIG.TOKEN_KEY, data.access_token);
        setIsAuthenticated(true);
        return { success: true };
      }
      clearAuthData();
      return { success: false };
    } catch {
      clearAuthData();
      return { success: false };
    }
  }, []);

  const logout = useCallback(async () => {
    clearAuthData();
  }, []);

  const clearAuthData = useCallback(() => {
    StorageUtils.removeItem(AUTH_CONFIG.TOKEN_KEY);
    StorageUtils.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    StorageUtils.removeItem(AUTH_CONFIG.USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithHanko,
    refreshWithHanko,
    logout,
    clearAuthData,
    checkAuthStatus,
  };
};

export default useAuth;
