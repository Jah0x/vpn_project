import { useTelegramAuth } from '@/features/auth/telegram/useTelegramAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function TgRedirect() {
  const navigate = useNavigate();
  useTelegramAuth(() => navigate('/'));

  useEffect(() => {
    if (!navigator.userAgent.includes('Telegram')) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Авторизация Telegram...
    </div>
  );
}
