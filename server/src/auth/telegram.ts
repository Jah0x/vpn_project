import { Strategy as TelegramStrategy } from 'passport-telegram-official';
import { prisma } from '../lib/prisma';

export default new TelegramStrategy({
  botToken: process.env.TG_BOT_TOKEN as string,
}, async (profile, done) => {
  try {
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(profile.id) },
      update: { firstName: profile.first_name, lastName: profile.last_name },
      create: { telegramId: BigInt(profile.id), firstName: profile.first_name, lastName: profile.last_name },
    });
    return done(null, user);
  } catch (e) {
    return done(e as Error);
  }
});
