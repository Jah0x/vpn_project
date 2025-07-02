/**
 * @jest-environment node
 */
import request from 'supertest';
import createPrismaMock from 'prisma-mock';
import { mockReset } from 'jest-mock-extended';
import { Prisma } from '@prisma/client';

jest.mock('../src/lib/prisma', () => ({
  prisma: createPrismaMock({}, (Prisma as any).dmmf.datamodel),
}));
import { prisma } from '../src/lib/prisma';
import { app } from '../src/server';
import { signAccessToken } from '../src/auth';
import { Role } from '../src/types';

const adminToken = signAccessToken({ id: 'u1', role: Role.ADMIN });
const userToken = signAccessToken({ id: 'u2', role: Role.USER });

beforeEach(() => {
  mockReset(prisma);
});

describe('Admin plans CRUD', () => {
  it('forbids non admin', async () => {
    const res = await request(app)
      .get('/api/admin/plans')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('allows admin to create, update and delete plan', async () => {
    const createRes = await request(app)
      .post('/api/admin/plans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ id: 'p1', code: 'pro', name: 'Pro', priceId: 'price_1', maxVpns: 5 });
    expect(createRes.status).toBe(201);
    const listRes = await request(app)
      .get('/api/admin/plans')
      .set('Authorization', `Bearer ${adminToken}`);
    const planId = 'p1';

    const updateRes = await request(app)
      .put(`/api/admin/plans/${planId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Professional' });
    expect(updateRes.status).toBe(200);

    const deleteRes = await request(app)
      .delete(`/api/admin/plans/${planId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
  });
});
