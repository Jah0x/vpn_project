import { LoginPage } from '@/pages/LoginPage';

export function AuthGate({ children }: { children: JSX.Element }) {
  if (!localStorage.getItem('auth_token')) return <LoginPage />;
  return children;
}
