import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { telegramAuth } from '@/services/auth';
import { StorageUtils } from '@/utils/helpers';
import { AUTH_CONFIG } from '@/utils/constants';
import { getTelegram, isInTelegram } from '@/shared/lib/telegram';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const TelegramLogin: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [loading, setLoading] = useState(true);

  const attemptAuth = () => {
    setRateLimited(false);
    setLoading(true);

    const tg = isInTelegram() ? getTelegram() : null;
    if (!tg?.initDataUnsafe?.user || !tg?.initDataUnsafe?.hash) {
      setError('Данные Telegram недоступны');
      setLoading(false);
      return;
    }

    const payload = {
      id: tg.initDataUnsafe.user.id,
      username: tg.initDataUnsafe.user.username,
      first_name: tg.initDataUnsafe.user.first_name,
      last_name: tg.initDataUnsafe.user.last_name,
      photo_url: tg.initDataUnsafe.user.photo_url,
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
          setRateLimited(true);
          setError('Слишком много запросов. Попробуйте позже.');
        } else if (status === 401) {
          setError('Неверные данные Telegram.');
        } else {
          setError('Не удалось авторизоваться через Telegram');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = StorageUtils.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      navigate('/dashboard');
      return;
    }

    attemptAuth();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>{error}</p>
        {rateLimited && (
          <button
            onClick={attemptAuth}
            className="mt-4 px-4 py-2 bg-blue-500 rounded"
          >
            Повторить
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      {loading ? <LoadingSpinner size="large" /> : null}
    </div>
  );
};

export default TelegramLogin;
