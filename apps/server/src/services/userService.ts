import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken } from '../auth';
import { Role, AuditAction } from '../types';
import { logAction } from '../middleware/audit';
import { TelegramAuthData } from '../lib/telegram';

export async function issueTokens(user: { id: string; role: Role | string }) {
  const payload = { id: user.id, role: user.role as Role };
  const tokens = {
    access_token: signAccessToken(payload),
    refresh_token: signRefreshToken(payload),
  };
  await prisma.refreshToken.create({
    data: { id: crypto.randomUUID(), token: tokens.refresh_token, userId: user.id },
  });
  return tokens;
}

export async function login(login: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: login }, { username: login }],
    },
  });
  if (!user || !user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
    throw new Error('Invalid credentials');
  }
  const tokens = await issueTokens(user);
  await logAction(AuditAction.LOGIN, user.id, {});
  return tokens;
}

export async function register(email: string, username: string, password: string) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });
  if (existing) throw new Error('Email exists');
  const uid = await prisma.preallocatedUid.findFirst({ where: { isFree: true } });
  if (!uid) throw new Error('NO_UID_AVAILABLE');

  const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.user.create({
      data: {
        email,
        username,
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

  const tokens = await issueTokens(user);
  await logAction(AuditAction.LOGIN, user.id, {});
  return tokens;
}


export async function loginTelegram(data: TelegramAuthData) {
  const telegramId = String(data.id);
  let user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    const uid = await prisma.preallocatedUid.findFirst({ where: { isFree: true } });
    if (!uid) throw new Error('NO_UID_AVAILABLE');
    user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.user.create({
        data: {
          email: `tg${telegramId}@telegram.local`,
          telegramId,
          username: data.username,
          firstName: data.first_name,
          lastName: data.last_name,
          photoUrl: data.photo_url,
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

  const tokens = await issueTokens(user);
  await logAction(AuditAction.LOGIN, user.id, { method: 'telegram' });
  return tokens;
}
