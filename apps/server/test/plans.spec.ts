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

beforeEach(() => {
  mockReset(prisma);
});

describe.skip('Public plans', () => {
  it('lists active plans', async () => {
    await prisma.plan.create({
      data: { code: 'BASIC_1M', name: '1m', priceRub: 400, durationMo: 1, isActive: true },
    });
    await prisma.plan.create({
      data: { code: 'BASIC_3M', name: '3m', priceRub: 1000, durationMo: 3, isActive: false },
    });
    const res = await request(app).get('/api/plans');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
