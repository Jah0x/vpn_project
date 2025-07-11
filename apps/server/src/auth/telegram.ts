import { TelegramStrategy } from 'passport-telegram-official';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

const verify = async (profile: any, done: (err: any, user?: any) => void) => {
    try {
      let user = await prisma.user.findUnique({ where: { telegramId: String(profile.id) } });
      if (!user) {
        const uid = await prisma.preallocatedUid.findFirst({ where: { isFree: true } });
        if (!uid) return done(new Error('NO_UID_AVAILABLE'));
        user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const created = await tx.user.create({
            data: {
              telegramId: String(profile.id),
              firstName: profile.first_name,
              lastName: profile.last_name,
              username: profile.username,
              uuid: uid.uuid,
            },
          });
          await tx.preallocatedUid.update({
            where: { id: uid.id },
            data: { isFree: false, assignedAt: new Date(), userId: created.id },
          });
          return created;
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firstName: profile.first_name, lastName: profile.last_name },
        });
      }
      return done(null, user);
    } catch (e) {
      return done(e as Error);
    }
};

// Используем только переменную TELEGRAM_BOT_TOKEN из .env.
export default new TelegramStrategy(
  {
    botToken: (process.env.TELEGRAM_BOT_TOKEN || 'test_token') as string,
  },
  verify as any,
);
