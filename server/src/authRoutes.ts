import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticateJWT, signAccessToken, signRefreshToken, verifyRefreshToken } from './auth';
import { findUserByEmail } from './store';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const payload = { id: user.id, role: user.role };
  return res.json({ access: signAccessToken(payload), refresh: signRefreshToken(payload) });
});

router.post('/refresh', (req, res) => {
  const { refresh } = req.body as { refresh?: string };
  if (!refresh) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const payload = verifyRefreshToken(refresh);
    return res.json({ access: signAccessToken({ id: payload.id, role: payload.role }) });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
