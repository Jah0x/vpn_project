import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken } from '../auth';
import { Role, AuditAction } from '../types';
import { logAction } from '../middleware/audit';

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw new Error('Invalid credentials');
  }
  const payload = { id: user.id, role: user.role as Role };
  const tokens = {
    access: signAccessToken(payload),
    refresh: signRefreshToken(payload),
  };
  await logAction(AuditAction.LOGIN, user.id, {});
  return tokens;
}

export async function register(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email exists');
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      uuid: crypto.randomUUID(),
    },
  });
  const payload = { id: user.id, role: user.role as Role };
  const tokens = {
    access: signAccessToken(payload),
    refresh: signRefreshToken(payload),
  };
  await logAction(AuditAction.LOGIN, user.id, {});
  return tokens;
}
