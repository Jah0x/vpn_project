import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { TelegramAuthData, verifyTelegramHash } from '../lib/telegram';
import { issueTokens } from './userService';
import { AuditAction } from '../types';
import { logAction } from '../middleware/audit';

export async function authTelegram(data: TelegramAuthData) {
  if (!verifyTelegramHash(data)) {
    throw new Error('INVALID_SIGNATURE');
  }

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
