import passport from 'passport';
import local from './local';
import telegram from './telegram';
import { prisma } from '../lib/prisma';

passport.use('local', local);
passport.use('telegram', telegram);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (e) {
    done(e as Error);
  }
});

export default passport;
