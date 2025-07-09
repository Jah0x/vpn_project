/**
 * @jest-environment node
 */
/// <reference types="jest" />

jest.mock('../src/lib/prisma', () => {
  const uidStore: any[] = [];
  const userStore: any[] = [];
  const prismaMock: any = {
    user: {
      findFirst: jest.fn(async ({ where: { OR } }: any) =>
        userStore.find(u => OR.some((c: any) => (c.email && u.email === c.email) || (c.username && u.username === c.username)))
      ),
      create: jest.fn(async ({ data }: any) => { const u = { id: `u${userStore.length+1}`, ...data }; userStore.push(u); return u; }),
    },
    refreshToken: {
      create: jest.fn(),
    },
    preallocatedUid: {
      findFirst: jest.fn(async ({ where: { isFree } }: any) => uidStore.find(u => u.isFree === isFree)),
      update: jest.fn(async ({ where: { id }, data }: any) => { const u = uidStore.find(x => x.id===id); Object.assign(u, data); return u; }),
    },
    $transaction: async (cb: any) => cb(prismaMock),
  };
  return { prisma: prismaMock, __stores: { uidStore, userStore } };
});
jest.mock('../src/middleware/audit', () => ({ logAction: jest.fn() }));

import { register } from '../src/services/userService';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prisma, __stores } = require('../src/lib/prisma');

describe('UID pool registration', () => {
  beforeEach(() => {
    __stores.uidStore.length = 0;
    __stores.userStore.length = 0;
    __stores.uidStore.push({ id: 1, uuid: 'uid-1', isFree: true });
  });

  it('registers with free uid', async () => {
    const tokens = await register('t@example.com', 'testuser', 'pass');
    expect(tokens.access_token).toBeDefined();
    expect(__stores.userStore[0].uuid).toBe('uid-1');
    expect(__stores.uidStore[0].isFree).toBe(false);
  });

  it('returns error when pool empty', async () => {
    __stores.uidStore.length = 0;
    await expect(register('x@example.com', 'testuser', 'pass')).rejects.toThrow('NO_UID_AVAILABLE');
  });
});
