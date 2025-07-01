import { useState, useEffect, useCallback } from "react";
import * as authApi from "../services/auth";
import { AUTH_CONFIG } from "../utils/constants";
import { StorageUtils } from "../utils/helpers";

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

      // Проверяем валидность токена
      const userData = await authApi.verifyToken(token);

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Токен недействителен, очищаем данные
        clearAuthData();
      }
    } catch (error) {
      console.error("Ошибка проверки авторизации:", error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, remember = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(email, password);

      if (response.success) {
        const { user: userData, token, refreshToken } = response.data;

        // Сохраняем данные
        StorageUtils.setItem(AUTH_CONFIG.TOKEN_KEY, token);
        StorageUtils.setItem(AUTH_CONFIG.USER_KEY, userData);

        if (remember && refreshToken) {
          StorageUtils.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
        }

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.message || "Ошибка авторизации";
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

  return {
    // Состояние
    user,
    isAuthenticated,
    isLoading,
    error,

    // Методы авторизации
    login,
    register,
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
