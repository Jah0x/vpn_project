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

  const login = async (e: string, p: string) => {
    const res = await auth.login(e, p);
    if (res.data?.user) setUser(res.data.user as User);
  };

  const register = async (e: string, p: string) => {
    const res = await auth.register(e, p);
    if (res.data?.user) setUser(res.data.user as User);
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthCtx => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
