/**
 * @jest-environment node
 */
/// <reference types="jest" />
import request from 'supertest';

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
jest.mock('../src/lib/telegram', () => ({ verifyTelegramHash: () => true }));

import { app } from '../src/server';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __stores } = require('../src/lib/prisma');

beforeEach(() => {
  __stores.uidStore.length = 0;
  __stores.userStore.length = 0;
  __stores.uidStore.push({ id: 1, uuid: 'uid1', isFree: true });
});

test('duplicate telegram auth returns 200 twice', async () => {
  const payload = { id: 1, username: 'tg', auth_date: 1, hash: 'h' };
  const first = await request(app).post('/api/auth/telegram').send(payload);
  const second = await request(app).post('/api/auth/telegram').send(payload);
  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
});
