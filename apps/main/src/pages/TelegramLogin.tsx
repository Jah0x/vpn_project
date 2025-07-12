import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

export default function TelegramLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    const initData = (window as any)?.Telegram?.WebApp?.initData;
    if (!initData) return;
    api
      .post('/auth/telegram', { initData })
      .then(({ data }) => {
        if (data?.token) {
          localStorage.setItem('token', data.token);
          navigate('/');
        }
      })
      .catch(console.error);
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Авторизация…
    </div>
  );
}
