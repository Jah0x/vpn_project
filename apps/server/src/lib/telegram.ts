import crypto from 'crypto';

/** Telegram auth data structure received from Telegram WebApp */
export interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  [key: string]: any;
}

// Token берётся из переменной окружения
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

/**
 * Проверяет подпись данных, полученных из Telegram WebApp.
 * Возвращает true, если подпись верна.
 */
export function verifyTelegramHash(data: TelegramAuthData): boolean {
  if (!BOT_TOKEN || !data.hash) return false;

  const { hash, ...rest } = data;

  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();

  const checkString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join('\n');

  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

  return hmac === hash;
}
