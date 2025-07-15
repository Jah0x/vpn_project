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
  loginWithHanko(token: string): Promise<AuthResult<User>>;
  refreshWithHanko(): Promise<AuthResult>;
  logout(): Promise<void>;
  clearAuthData(): void;
  checkAuthStatus(): Promise<void>;
}

export function useAuth(): UseAuthReturn;
export default useAuth;
