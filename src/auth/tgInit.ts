import { setInitParams } from './store';

export function bootstrapFromTelegram() {
  const initData = (window as any)?.Telegram?.WebApp?.initData || '';
  if (initData) {
    setInitParams(initData);
  }
}
