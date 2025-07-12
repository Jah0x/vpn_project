/**
 * @jest-environment node
 */
/// <reference types="jest" />
import request from 'supertest';

import crypto from "crypto";
jest.mock('../src/lib/prisma', () => {
  const uidStore: any[] = [];
  const userStore: any[] = [];
  const prismaMock: any = {
    user: {
      findUnique: jest.fn(async ({ where: { telegramId } }: any) =>
        userStore.find(u => u.telegramId === telegramId)
      ),
      create: jest.fn(async ({ data }: any) => {
        const u = { id: `u${userStore.length+1}`, ...data };
        userStore.push(u);
        return u;
      }),
    },
    refreshToken: { create: jest.fn() },
    preallocatedUid: {
      findFirst: jest.fn(async ({ where: { isFree } }: any) => uidStore.find(u => u.isFree === isFree)),
      update: jest.fn(async ({ where: { id }, data }: any) => { const u = uidStore.find(x => x.id===id); Object.assign(u, data); return u; }),
      create: jest.fn(async ({ data }: any) => { uidStore.push(data); return data; }),
    },
    $transaction: async (cb: any) => cb(prismaMock),
  };
  return { prisma: prismaMock, __stores: { uidStore, userStore } };
});
jest.mock('../src/middleware/audit', () => ({ logAction: jest.fn() }));

import { app } from '../src/server';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __stores } = require('../src/lib/prisma');

beforeEach(() => {
  __stores.uidStore.length = 0;
  process.env.TELEGRAM_BOT_TOKEN = 'token';
  __stores.userStore.length = 0;
  __stores.uidStore.push({ id: 1, uuid: 'uid1', isFree: true });
});

test('duplicate telegram auth returns 200 twice', async () => {
  const params = new URLSearchParams();
  const user = { id: 1, username: 'tg' };
  params.set('user', JSON.stringify(user));
  const authDate = Math.floor(Date.now() / 1000).toString();
  params.set('auth_date', authDate);
  const data = { user: JSON.stringify(user), auth_date: authDate };
  const secret = crypto.createHash('sha256').update('token').digest();
  const checkString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${(data as any)[k]}`)
    .join('\n');
  const hash = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
  params.set('hash', hash);
  const payload = { initData: params.toString() };
  const first = await request(app).post('/api/auth/telegram').send(payload);
  const second = await request(app).post('/api/auth/telegram').send(payload);
  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
});
