import { useState } from 'react';
import { isInTelegram } from '@/shared/lib/telegram';
import { useTelegramAuth } from './telegram/useTelegramAuth';
import { LoginForm } from './LoginForm';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

export function AuthGate({ children }: { children: JSX.Element }) {
  const [ready, setReady] = useState(false);

  useTelegramAuth(() => setReady(true));

  if (!ready && isInTelegram()) return <LoadingSpinner size="large" />;
  if (!localStorage.getItem('token')) return <LoginForm />;

  return children;
}
