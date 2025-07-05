import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.initDataUnsafe) {
      navigate('/login');
      return;
    }

    axios
      .post('/api/auth/telegram', tg.initDataUnsafe)
      .then(() => {
        navigate('/dashboard');
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Авторизация...
    </div>
  );
};

export default AuthPage;
