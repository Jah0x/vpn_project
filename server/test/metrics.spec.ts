/**
 * @jest-environment node
 */
import request from 'supertest';
import createPrismaMock from 'prisma-mock';
import { mockReset } from 'jest-mock-extended';
import { Prisma } from '@prisma/client';
import { app } from '../src/server';
import { register } from '../src/metrics';
import { signAccessToken } from '../src/auth';
import { Role } from '../src/types';

jest.mock('../src/lib/prisma', () => ({ prisma: createPrismaMock({}, (Prisma as any).dmmf.datamodel) }));
import { prisma } from '../src/lib/prisma';

beforeEach(() => {
  mockReset(prisma);
});

describe('Metrics', () => {
  it('http_requests_total increments', async () => {
    const beforeMetrics = await register.getMetricsAsJSON();
    const before = beforeMetrics.find(m => m.name === 'http_requests_total')?.values[0]?.value || 0;
    const token = signAccessToken({ id: 'u2', role: Role.USER });
    await request(app).get('/api/vpn').set('Authorization', `Bearer ${token}`);
    const afterMetrics = await register.getMetricsAsJSON();
    const after = afterMetrics.find(m => m.name === 'http_requests_total')?.values[0]?.value || 0;
    expect(after).toBe(before + 1);
  });

  it('/metrics returns data', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('# HELP');
  });
});

