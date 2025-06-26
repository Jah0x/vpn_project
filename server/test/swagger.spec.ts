/**
 * @jest-environment node
 */
import request from 'supertest';
import createPrismaMock from 'prisma-mock';
import { mockReset } from 'jest-mock-extended';
import { Prisma } from '@prisma/client';

jest.mock('../src/lib/prisma', () => ({ prisma: createPrismaMock({}, (Prisma as any).dmmf.datamodel) }));
import { prisma } from '../src/lib/prisma';
import { app } from '../src/server';

beforeEach(() => {
  mockReset(prisma);
  process.env.NODE_ENV = 'test';
});

describe('Swagger UI', () => {
  it('returns HTML', async () => {
    const res = await request(app).get('/api/docs');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<html');
  });
});
