import { useEffect } from 'react';
import { getTelegram } from '@/shared/lib/telegram';
import { loadTelegramSdk } from '@/shared/lib/loadTelegram';
import api from '@/services/api';

export function useTelegramAuth(onSuccess: () => void) {
  useEffect(() => {
    (async () => {
      await loadTelegramSdk();
      const tg = getTelegram();
      if (!tg) return;
      try {
        const { data } = await api.post('/auth/telegram', { initData: tg.initData });
        if (data?.token) {
          localStorage.setItem('token', data.token);
          onSuccess();
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [onSuccess]);
}
