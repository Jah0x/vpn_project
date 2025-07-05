import { setInitParams } from './store';
import { getTelegram, ready } from '../lib/telegram';

export function bootstrapFromTelegram() {
  const tg = getTelegram();
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
  ready();
}
