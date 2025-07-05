import { setInitParams } from './store';

export function bootstrapFromTelegram() {
  const tg = (window as any)?.Telegram?.WebApp;
  const initData = tg?.initData || '';

  if (initData) {
    // 1. keep it in memory
    setInitParams(initData);

    // 2. persist for other hooks / hard refresh
    window.localStorage.setItem('tg_init_data', initData);

    // 3. let React hooks know we're ready
    window.dispatchEvent(new Event('telegram-initialized'));

    // 4. notify Telegram container
    tg?.ready?.();
  }
}
