/**
 * @jest-environment node
 */
/// <reference types="jest" />
import request from 'supertest';
import crypto from 'crypto';

jest.mock('../src/lib/prisma', () => {
  const uidStore: any[] = [];
  const userStore: any[] = [];
  const prismaMock: any = {
    user: {
      findUnique: jest.fn(async ({ where: { telegramId } }: any) =>
        userStore.find((u) => u.telegramId === telegramId)
      ),
      create: jest.fn(async ({ data }: any) => {
        const u = { id: `u${userStore.length + 1}`, ...data };
        userStore.push(u);
        return u;
      }),
    },
    refreshToken: { create: jest.fn() },
    preallocatedUid: {
      findFirst: jest.fn(async ({ where: { isFree } }: any) =>
        uidStore.find((u) => u.isFree === isFree)
      ),
      update: jest.fn(async ({ where: { id }, data }: any) => {
        const u = uidStore.find((x) => x.id === id);
        Object.assign(u, data);
        return u;
      }),
    },
    $transaction: async (cb: any) => cb(prismaMock),
  };
  return { prisma: prismaMock, __stores: { uidStore, userStore } };
});
jest.mock('../src/middleware/audit', () => ({ logAction: jest.fn() }));
let app: any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __stores } = require('../src/lib/prisma');

describe('POST /api/auth/telegram', () => {
  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    __stores.uidStore.length = 0;
    __stores.userStore.length = 0;
    __stores.uidStore.push({ id: 1, uuid: 'uid1', isFree: true });
    app = require('../src/server').app;
  });

  function makePayload() {
    const data = {
      id: 1,
      username: 'tg',
      auth_date: 100,
    } as any;
    const secret = crypto.createHash('sha256').update('token').digest();
    const checkString = Object.keys(data)
      .sort()
      .map((k) => `${k}=${(data as any)[k]}`)
      .join('\n');
    const hash = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
    return { ...data, hash };
  }

  it('creates new user and returns tokens', async () => {
    const payload = makePayload();
    const res = await request(app).post('/api/auth/telegram').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(__stores.userStore.length).toBe(1);
  });

  it('rejects invalid signature', async () => {
    const payload = { id: 1, username: 'tg', auth_date: 100, hash: 'bad' };
    const res = await request(app).post('/api/auth/telegram').send(payload);
    expect(res.status).toBe(403);
  });
});
