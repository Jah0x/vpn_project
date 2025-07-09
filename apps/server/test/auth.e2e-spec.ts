/**
 * @jest-environment node
 */
import request from 'supertest';
import { app } from '../src/server';

beforeAll(() => {
  process.env.NODE_ENV = 'e2e';
});

describe('Host filter', () => {
  it('allows telegram auth only on tg subdomain', async () => {
    const res = await request(app)
      .post('/api/auth/telegram')
      .set('Host', 'zerologsvpn.com');
    expect(res.status).toBe(403);
  });

  it('blocks login on tg subdomain', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Host', 'tg.zerologsvpn.com');
    expect(res.status).toBe(403);
  });

  it('login on main domain returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Host', 'zerologsvpn.com');
    expect(res.status).toBe(401);
  });

  it('telegram auth on tg domain returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/telegram')
      .set('Host', 'tg.zerologsvpn.com');
    expect([400, 401]).toContain(res.status);
  });
});
