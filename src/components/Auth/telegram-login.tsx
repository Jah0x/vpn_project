import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { telegramAuth } from '@/services/auth';
import { StorageUtils } from '@/utils/helpers';
import { AUTH_CONFIG } from '@/utils/constants';
import { getTelegram } from '@/lib/telegram';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const TelegramLogin: React.FC = () => {
  const navigate = useNavigate();
  const hasRun = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = StorageUtils.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      navigate('/dashboard');
      return;
    }

    if (hasRun.current) return;
    hasRun.current = true;

    const tg = getTelegram();
    if (!tg?.initDataUnsafe?.user || !tg?.initDataUnsafe?.hash) {
      setError('Данные Telegram недоступны');
      return;
    }

    const payload = {
      ...tg.initDataUnsafe.user,
      auth_date: tg.initDataUnsafe.auth_date,
      hash: tg.initDataUnsafe.hash,
    };

    telegramAuth(payload)
      .then((res) => {
        const { access_token, refresh_token } = res.data || {};
        if (access_token) {
          StorageUtils.setItem(AUTH_CONFIG.TOKEN_KEY, access_token);
          if (refresh_token) {
            StorageUtils.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refresh_token);
          }
          navigate('/dashboard');
        } else {
          setError('Ошибка авторизации через Telegram');
        }
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 429) {
          setError('Слишком много запросов. Попробуйте позже.');
        } else if (status === 401) {
          setError('Неверные данные Telegram.');
        } else {
          setError('Не удалось авторизоваться через Telegram');
        }
      });
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <LoadingSpinner size="large" />
    </div>
  );
};

export default TelegramLogin;
