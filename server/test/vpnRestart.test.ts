/**
 * @jest-environment node
 */
import request from 'supertest';
import { app } from '../src/server';
import { signAccessToken } from '../src/auth';
import { Role } from '../src/types';
import { jobs } from '../src/store';

describe('POST /api/vpn/restart/:id', () => {
  it('returns pending status when vpn exists', async () => {
    const token = signAccessToken({ id: 'u1', role: Role.USER });
    const res = await request(app)
      .post('/api/vpn/restart/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending');
    expect(res.body.jobId).toBeDefined();
  });

  it('returns 404 for missing vpn', async () => {
    const token = signAccessToken({ id: 'u1', role: Role.USER });
    const res = await request(app)
      .post('/api/vpn/restart/999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
