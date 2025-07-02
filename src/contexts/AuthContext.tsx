import React, { createContext, useContext, useState } from 'react';
import * as auth from '../services/auth';

export interface User {
  id: string;
  email: string;
  nickname?: string;
}

interface AuthCtx {
  user: User | null;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);
    if (res.data?.user) {
      setUser(res.data.user);
    }
  };

  const register = async (email: string, password: string) => {
    const res = await auth.register(email, password);
    if (res.data?.user) {
      setUser(res.data.user);
    }
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  const value: AuthCtx = { user, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export default AuthContext;

