/**
 * @jest-environment node
 */
import request from 'supertest';
import bcrypt from 'bcryptjs';
import createPrismaMock from 'prisma-mock';
import { mockReset } from 'jest-mock-extended';
import { Prisma } from '@prisma/client';

process.env.STRIPE_SECRET_KEY = 'sk_test';
jest.mock('../src/lib/prisma', () => ({ prisma: createPrismaMock({}, (Prisma as any).dmmf.datamodel) }));
import { prisma } from '../src/lib/prisma';
import { app } from '../src/server';
import { signAccessToken } from '../src/auth';
import { Role } from '../src/types';

const token = signAccessToken({ id: 'u1', role: Role.USER });

beforeEach(async () => {
  mockReset(prisma);
  await prisma.user.create({
    data: {
      id: 'u1',
      email: 'user@test.com',
      passwordHash: bcrypt.hashSync('user', 10),
      uuid: 'uuid-u1',
      role: 'USER',
    },
  });
  await prisma.subscription.create({
    data: {
      id: 's1',
      userId: 'u1',
      stripeSubId: 'sub_1',
      planId: 'basic',
      maxActiveVpns: 1,
      status: 'active',
    },
  });
  await prisma.vpn.create({ data: { id: 'v1', ownerId: 'u1', name: 'VPN1' } });
});

describe('VPN limit', () => {
  it('returns 403 when limit exceeded', async () => {
    const res = await request(app)
      .post('/api/vpn')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New VPN' });
    expect(res.status).toBe(403);
  });
});
