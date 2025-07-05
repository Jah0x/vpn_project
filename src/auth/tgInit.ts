import { setInitParams } from './store';

export function bootstrapFromTelegram() {
  const tg = (window as any)?.Telegram?.WebApp;
  const initData = tg?.initData || '';

  // Если приложение открыто не внутри Telegram, выходим
  if (!initData) return;

  // 1️⃣ кладём initData в память
  setInitParams(initData);

  // 2️⃣ сохраняем в localStorage — на это смотрят React‑хуки
  window.localStorage.setItem('tg_init_data', initData);

  // 3️⃣ сообщаем React-хукам, что данные готовы
  window.dispatchEvent(new Event('telegram-initialized'));

  // 4️⃣ уведомляем контейнер Telegram
  tg?.ready?.();
}
