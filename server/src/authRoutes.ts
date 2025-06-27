import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authenticateJWT, signAccessToken, signRefreshToken, verifyRefreshToken } from './auth';
import { prisma } from './lib/prisma';
import { Role } from './types';
import { logAction } from './middleware/audit';
import { AuditAction } from './types';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email exists' });
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      uuid: crypto.randomUUID(),
    },
  });
  res.status(201).json({ id: user.id });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const payload = { id: user.id, role: user.role as Role };
  const tokens = {
    access: signAccessToken(payload),
    refresh: signRefreshToken(payload),
  };
  await logAction(AuditAction.LOGIN, user.id, {});
  return res.json(tokens);
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
