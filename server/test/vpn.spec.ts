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

const userToken = signAccessToken({ id: 'u2', role: Role.USER });

beforeEach(async () => {
  mockReset(prisma);
  await prisma.user.create({
    data: {
      id: 'u2',
      email: 'user@test.com',
      passwordHash: bcrypt.hashSync('user', 10),
      uuid: 'uuid-u2',
      role: 'USER',
    },
  });
  await prisma.user.create({
    data: {
      id: 'u3',
      email: 'viewer@test.com',
      passwordHash: bcrypt.hashSync('viewer', 10),
      uuid: 'uuid-u3',
      role: 'USER',
    },
  });
});

describe.skip('VPN CRUD', () => {
  let vpnId: string;

  it('create vpn', async () => {
    const res = await request(app)
      .post('/api/vpn')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Test VPN' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    vpnId = res.body.id;
  });

  it('list own vpn', async () => {
    const res = await request(app)
      .get('/api/vpn')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });


  it('update vpn', async () => {
    const res = await request(app)
      .patch(`/api/vpn/${vpnId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Updated VPN' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated VPN');
  });

  it('delete vpn', async () => {
    const res = await request(app)
      .delete(`/api/vpn/${vpnId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });
});
