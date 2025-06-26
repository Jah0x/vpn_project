/**
 * @jest-environment node
 */
import request from 'supertest';
import { app } from '../src/server';

describe('Auth routes', () => {
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
