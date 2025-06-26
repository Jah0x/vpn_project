/**
 * @jest-environment node
 */
import request from 'supertest';
import createPrismaMock from 'prisma-mock';
import { mockReset } from 'jest-mock-extended';
import { Prisma } from '@prisma/client';

process.env.STRIPE_SECRET_KEY = 'sk_test';
jest.mock('../src/lib/prisma', () => ({ prisma: createPrismaMock({}, (Prisma as any).dmmf.datamodel) }));
import { prisma } from '../src/lib/prisma';
import { app } from '../src/server';

beforeEach(() => {
  mockReset(prisma);
});

it.skip('register -> login -> create vpn', async () => {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: 'pass' });
  expect(reg.status).toBe(201);

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'pass' });
  expect(login.status).toBe(200);
  const token = login.body.access as string;

  const res = await request(app)
    .post('/api/vpn')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'MyVPN' });
  expect(res.status).toBe(201);
});
