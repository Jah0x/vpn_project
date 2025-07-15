import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken } from '../auth';
import { Role, AuditAction } from '../types';
import { logAction } from '../middleware/audit';

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

