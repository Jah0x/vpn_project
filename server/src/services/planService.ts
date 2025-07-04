import { PlanCode } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function getPlanByCode(code: PlanCode) {
  return prisma.plan.findFirst({ where: { code, isActive: true } });
}
