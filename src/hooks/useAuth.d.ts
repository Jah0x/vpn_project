import { User } from '../types/auth';

export interface AuthResult<T = void> {
  success: boolean;
  message?: string;
  user?: User;
  error?: string;
  data?: T;
}

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login(email: string, password: string, remember?: boolean): Promise<AuthResult<User>>;
  register(data: { email: string; password: string }): Promise<AuthResult>;
  telegramAuth(user: { id: number }): Promise<AuthResult<User>>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthResult>;
  updateUser(data: Partial<User & { [key: string]: any }>): void;
  changePassword(currentPassword: string, newPassword: string): Promise<AuthResult>;
  resetPassword(email: string): Promise<AuthResult>;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
  isSubscriptionActive(): boolean;
  getSubscriptionDaysLeft(): number;
  clearAuthData(): void;
  checkAuthStatus(): Promise<void>;
}

export function useAuth(): UseAuthReturn;
export default useAuth;
