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
export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export function parseInitData(raw: string): TelegramAuthData | null {
  try {
    const params = new URLSearchParams(raw);
    const obj: any = {};
    params.forEach((v, k) => {
      obj[k] = v;
    });
    if (obj.user) {
      const user = JSON.parse(obj.user);
      obj.id = Number(user.id);
      if (user.first_name) obj.first_name = user.first_name;
      if (user.last_name) obj.last_name = user.last_name;
      if (user.username) obj.username = user.username;
      if (user.photo_url) obj.photo_url = user.photo_url;
    }
    obj.auth_date = Number(obj.auth_date);
    return obj as TelegramAuthData;
  } catch {
    return null;
  }
}

export interface TelegramHashDebug {
  /** Строка, из которой строится подпись */
  dataCheckString: string;
  /** Секретный ключ в hex, полученный как SHA256(botToken) */
  secretKeyHex: string;
  /** Ожидаемый хэш, вычисленный из dataCheckString */
  expectedHash: string;
  /** Хэш, полученный от клиента */
  providedHash: string;
  /** Совпадают ли хэши */
  match: boolean;
}

/**
 * Проверяет подпись данных, полученных из Telegram WebApp.
 * Возвращает true, если подпись верна.
 */
export function getTelegramHashDebug(data: TelegramAuthData): TelegramHashDebug {
  const { hash, ...rest } = data;

  // Согласно официальной документации WebApp данные подписываются ключом,
  // вычисленным как SHA256(bot_token). Ранее использовалась другая формула,
  // что приводило к ошибке 403 при авторизации.
  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();

  const dataCheckString = Object.keys(rest)
    .filter((k) => rest[k] !== undefined)
    .sort()
    .map((key) => {
      const value = rest[key];
      const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return `${key}=${serialized}`;
    })
    .join('\n');

  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return {
    dataCheckString,
    secretKeyHex: secretKey.toString('hex'),
    expectedHash,
    providedHash: hash,
    match: expectedHash === hash,
  };
}

export function verifyTelegramHash(data: TelegramAuthData): boolean {
  if (!BOT_TOKEN || !data.hash) return false;
  const info = getTelegramHashDebug(data);
  return info.match;
}

export function debugTelegramSignature(data: TelegramAuthData) {
  const debug = getTelegramHashDebug(data);
  return {
    dataCheckString: debug.dataCheckString,
    secretKeyHex: debug.secretKeyHex.slice(0, 8) + '…',
    expectedHash: debug.expectedHash,
    receivedHash: debug.providedHash,
    match: debug.match,
  };
}
