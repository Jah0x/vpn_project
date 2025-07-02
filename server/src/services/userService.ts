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
    access_token: signAccessToken(payload),
    refresh_token: signRefreshToken(payload),
  };
  await logAction(AuditAction.LOGIN, user.id, {});
  return tokens;
}

export async function register(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email exists');
  const uid = await prisma.preallocatedUid.findFirst({ where: { isFree: true } });
  if (!uid) throw new Error('NO_UID_AVAILABLE');

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash: bcrypt.hashSync(password, 10),
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

  const payload = { id: user.id, role: user.role as Role };
  const tokens = {
    access_token: signAccessToken(payload),
    refresh_token: signRefreshToken(payload),
  };
  await logAction(AuditAction.LOGIN, user.id, {});
  return tokens;
}

export async function loginTelegram(telegramId: string) {
  let user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    const uid = await prisma.preallocatedUid.findFirst({ where: { isFree: true } });
    if (!uid) throw new Error('NO_UID_AVAILABLE');
    user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: `tg${telegramId}@telegram.local`,
          telegramId,
          passwordHash: bcrypt.hashSync(crypto.randomUUID(), 10),
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
  }

  const payload = { id: user.id, role: user.role as Role };
  const tokens = {
    access_token: signAccessToken(payload),
    refresh_token: signRefreshToken(payload),
  };
  await logAction(AuditAction.LOGIN, user.id, { method: 'telegram' });
  return tokens;
}
