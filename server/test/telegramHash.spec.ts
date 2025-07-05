/**
 * @jest-environment node
 */
import crypto from 'crypto';

describe('verifyTelegramHash', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'testtoken';
  });

  it('validates correct signature', () => {
    const { verifyTelegramHash } = require('../src/lib/telegram');
    const data = {
      id: 1,
      username: 'tg',
      auth_date: 100,
    } as any;

    const secret = crypto.createHash('sha256').update('testtoken').digest();
    const checkString = Object.keys(data)
      .sort()
      .map((k) => `${k}=${(data as any)[k]}`)
      .join('\n');
    const hash = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
    const payload = { ...data, hash };
    expect(verifyTelegramHash(payload)).toBe(true);
  });

  it('rejects invalid signature', () => {
    const { verifyTelegramHash } = require('../src/lib/telegram');
    const payload = { id: 1, auth_date: 1, hash: 'bad' } as any;
    expect(verifyTelegramHash(payload)).toBe(false);
  });
});
