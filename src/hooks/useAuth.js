import { useState, useEffect, useCallback } from "react";
import * as authApi from "../services/auth";
import { AUTH_CONFIG } from "../utils/constants";
import { StorageUtils } from "../utils/helpers";

const parseJwt = (token) => {
  try {
    const base64 = token.split(".")[1];
    const payload = atob(base64);
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверка токена при инициализации
  useEffect(() => {
    checkAuthStatus();
  }, []);

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
    } catch (error) {
      console.error("Ошибка проверки авторизации:", error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(email, password);
      const {
        access_token,
        refresh_token,
        access,
        refresh,
        user: userData,
      } = response.data || {};

      const accessToken = access_token || access;
      const refreshTokenValue = refresh_token || refresh;

      if (accessToken) {
        StorageUtils.setItem(AUTH_CONFIG.TOKEN_KEY, accessToken);
        if (refreshTokenValue) {
          StorageUtils.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshTokenValue);
        }
        if (userData) {
          StorageUtils.setItem(AUTH_CONFIG.USER_KEY, userData);
          setUser(userData);
        }
        setIsAuthenticated(true);

        const payload = parseJwt(accessToken);
        if (payload?.exp) {
          if (payload.exp * 1000 <= Date.now()) {
            clearAuthData();
            return { success: false, error: "Token expired" };
          }
        }

        return { success: true, user: userData };
      }

      setError("Неверные учетные данные");
      return { success: false, error: "Неверные учетные данные" };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Ошибка авторизации";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.register(userData.email, userData.password);

      if (response.success) {
        return { success: true, message: "Регистрация успешна" };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.message || "Ошибка регистрации";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const telegramAuth = useCallback(async (tgData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.telegramAuth(tgData);
      const { access_token, refresh_token, user: userData } = response.data || {};

      if (access_token) {
        StorageUtils.setItem(AUTH_CONFIG.TOKEN_KEY, access_token);
        if (refresh_token) {
          StorageUtils.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refresh_token);
        }
        if (userData) {
          StorageUtils.setItem(AUTH_CONFIG.USER_KEY, userData);
          setUser(userData);
        }
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }

      return { success: false };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка авторизации';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = StorageUtils.getItem(AUTH_CONFIG.TOKEN_KEY);

      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    } finally {
      clearAuthData();
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = StorageUtils.getItem(
        AUTH_CONFIG.REFRESH_TOKEN_KEY,
      );

      if (!refreshTokenValue) {
        throw new Error("Refresh token не найден");
      }

      const response = await authApi.refreshToken(refreshTokenValue);

      if (response.success) {
        const { token, user: userData } = response.data;

        StorageUtils.setItem(AUTH_CONFIG.TOKEN_KEY, token);
        StorageUtils.setItem(AUTH_CONFIG.USER_KEY, userData);

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        clearAuthData();
        return { success: false };
      }
    } catch (error) {
      console.error("Ошибка обновления токена:", error);
      clearAuthData();
      return { success: false };
    }
  }, []);

  const updateUser = useCallback(
    (userData) => {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      StorageUtils.setItem(AUTH_CONFIG.USER_KEY, updatedUser);
    },
    [user],
  );

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setError(null);

      const response = await authApi.changePassword(
        currentPassword,
        newPassword,
      );

      if (response.success) {
        return { success: true, message: "Пароль успешно изменен" };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.message || "Ошибка смены пароля";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      setError(null);

      const response = await authApi.resetPassword(email);

      if (response.success) {
        return { success: true, message: "Инструкции отправлены на email" };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.message || "Ошибка сброса пароля";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearAuthData = useCallback(() => {
    StorageUtils.removeItem(AUTH_CONFIG.TOKEN_KEY);
    StorageUtils.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    StorageUtils.removeItem(AUTH_CONFIG.USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const hasRole = useCallback(
    (role) => {
      return user?.role === role;
    },
    [user],
  );

  const hasPermission = useCallback(
    (permission) => {
      return user?.permissions?.includes(permission) || false;
    },
    [user],
  );

  const isSubscriptionActive = useCallback(() => {
    if (!user?.subscription) return false;

    const subscription = user.subscription;
    return (
      subscription.status === "active" &&
      new Date(subscription.expiresAt) > new Date()
    );
  }, [user]);

  const getSubscriptionDaysLeft = useCallback(() => {
    if (!user?.subscription?.expiresAt) return 0;

    const now = new Date();
    const expiry = new Date(user.subscription.expiresAt);
    const diffTime = expiry - now;

    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = StorageUtils.getItem(AUTH_CONFIG.TOKEN_KEY);
    const payload = parseJwt(token);
    if (!payload?.exp) return;
    const timeout = payload.exp * 1000 - Date.now();
    if (timeout <= 0) {
      logout();
      return;
    }
    const id = setTimeout(() => logout(), timeout);
    return () => clearTimeout(id);
  }, [isAuthenticated, logout]);

  return {
    // Состояние
    user,
    isAuthenticated,
    isLoading,
    error,

    // Методы авторизации
    login,
    register,
    telegramAuth,
    logout,
    refreshToken,

    // Методы управления пользователем
    updateUser,
    changePassword,
    resetPassword,

    // Проверки
    hasRole,
    hasPermission,
    isSubscriptionActive,
    getSubscriptionDaysLeft,

    // Утилиты
    clearAuthData,
    checkAuthStatus,
  };
};

export default useAuth;
