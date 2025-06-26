/**
 * @jest-environment node
 */
import request from 'supertest';
import bcrypt from 'bcryptjs';
import createPrismaMock from 'prisma-mock';
import { mockReset } from 'jest-mock-extended';
import { Prisma } from '@prisma/client';
import { app } from '../src/server';

jest.mock('../src/lib/prisma', () => ({ prisma: createPrismaMock({}, (Prisma as any).dmmf.datamodel) }));
import { prisma } from '../src/lib/prisma';

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
});

describe.skip('Auth routes', () => {
  it('login returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'user' });
    expect(res.status).toBe(200);
    expect(res.body.access).toBeDefined();
    expect(res.body.refresh).toBeDefined();
  });

  it('refresh returns new access', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'user' });
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refresh: login.body.refresh });
    expect(res.status).toBe(200);
    expect(res.body.access).toBeDefined();
  });
});
