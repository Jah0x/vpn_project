const http = require('http');
const assert = require('assert');
const server = require('../index');

const PORT = 9000;

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: payload
        ? {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        : {}
    };
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: body ? JSON.parse(body) : {} });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  server.listen(PORT);

  // Register
  const reg = await request('POST', '/api/register', {
    nickname: 'test',
    email: 'test@example.com',
    password: 'secret'
  });
  assert.strictEqual(reg.status, 200);
  assert.ok(reg.body.token);

  const token = reg.body.token;

  // Profile
  const profile = await request('GET', '/api/profile', null, token);
  assert.strictEqual(profile.status, 401); // no auth

  const profileAuth = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    };
    const req = http.request(options, res => {
      let body = '';
      res.on('data', c => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });
  assert.strictEqual(profileAuth.status, 200);
  assert.strictEqual(profileAuth.body.nickname, 'test');

  // Login
  const login = await request('POST', '/api/login', { login: 'test', password: 'secret' });
  assert.strictEqual(login.status, 200);
  assert.ok(login.body.token);

  server.close();
  console.log('All tests passed');
}

run().catch(err => {
  console.error(err);
  server.close();
  process.exit(1);
});
