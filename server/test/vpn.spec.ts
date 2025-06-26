/**
 * @jest-environment node
 */
import request from 'supertest';
import { app } from '../src/server';
import { signAccessToken } from '../src/auth';
import { Role } from '../src/types';

const userToken = signAccessToken({ id: 'u2', role: Role.USER });
const viewerToken = signAccessToken({ id: 'u3', role: Role.VIEWER });

describe('VPN CRUD', () => {
  let vpnId: string;

  it('create vpn', async () => {
    const res = await request(app)
      .post('/api/vpn')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Test VPN', tariffId: 't1' });
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

  it('viewer forbidden', async () => {
    const res = await request(app)
      .get('/api/vpn')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(403);
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
