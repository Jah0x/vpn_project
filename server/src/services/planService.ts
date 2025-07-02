import { prisma } from '../lib/prisma';

export async function getPlanByCode(code: string) {
  return prisma.plan.findFirst({ where: { code, isActive: true } });
}
