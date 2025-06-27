/**
 * @jest-environment node
 */
process.env.DB_PATH = ':memory:';
process.env.SUB_PUSH_SECRET = 'testsecret';
import request from 'supertest';
import { createApp } from '../src/index';
import dbPromise from '../src/db';

describe('subscription routes', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    app = createApp();
    const db = await dbPromise;
    await db.exec('DELETE FROM SubscriptionRecord');
    await db.run('INSERT INTO SubscriptionRecord (uuid, subString) VALUES (?, ?)', '123', 'vless://one');
  });

  it('GET /:uuid returns subString', async () => {
    const res = await request(app).get('/123');
    expect(res.status).toBe(200);
    expect(res.text).toBe('vless://one');
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });

  it('GET /:uuid unknown -> 404', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });

  it('POST /add adds and updates', async () => {
    await request(app)
      .post('/add')
      .send({ uuid: 'abc', subString: 'vless://abc' })
      .set('Content-Type', 'application/json')
      .set('X-Signature', 'wrong')
      .expect(401);
    await request(app)
      .post('/add')
      .send({ uuid: 'abc', subString: 'vless://abc' })
      .set('Content-Type', 'application/json')
      .set('X-Signature', require('crypto').createHmac('sha256', 'testsecret').update(JSON.stringify({ uuid: 'abc', subString: 'vless://abc' })).digest('hex'))
      .expect(200);
    const res = await request(app).get('/abc');
    expect(res.text).toBe('vless://abc');

    await request(app)
      .post('/add')
      .send({ uuid: 'abc', subString: 'vless://new' })
      .set('Content-Type', 'application/json')
      .set('X-Signature', require('crypto').createHmac('sha256', 'testsecret').update(JSON.stringify({ uuid: 'abc', subString: 'vless://new' })).digest('hex'))
      .expect(200);
    const res2 = await request(app).get('/abc');
    expect(res2.text).toBe('vless://new');
  });
});
