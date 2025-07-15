import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { issueTokens } from '../../services/userService';

const router = Router();

router.post('/', async (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ error: 'token required' });
  try {
    const payload = jwt.verify(token, process.env.HANKO_JWT_SECRET as string) as {
      sub: string;
      email?: string;
    };
    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { hankoUserId: payload.sub } });
      if (existing) return existing;
      const uid = await tx.preallocatedUid.findFirst({ where: { isFree: true } });
      if (!uid) throw new Error('NO_UID_AVAILABLE');
      const created = await tx.user.create({
        data: {
          hankoUserId: payload.sub,
          email: payload.email ?? undefined,
          uuid: uid.uuid,
          role: 'USER',
        },
      });
      await tx.preallocatedUid.update({
        where: { id: uid.id },
        data: { isFree: false, assignedAt: new Date(), userId: created.id },
      });
      return created;
    });
    const tokens = await issueTokens(user);
    res.json(tokens);
  } catch (err: any) {
    if (err.message === 'NO_UID_AVAILABLE')
      return res.status(503).json({ error: err.message });
    res.status(401).json({ error: 'invalid hanko token' });
  }
});

export default router;
