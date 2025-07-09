import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export default new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return done(null, false);
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? done(null, user) : done(null, false);
  } catch (e) {
    return done(e as Error);
  }
});
