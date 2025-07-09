import { prisma } from "../lib/prisma";
import { AuditAction } from "../types";
import { auditLogsTotal } from "../metrics";

export async function logAction(
  action: AuditAction,
  userId?: string,
  payload: any = {},
): Promise<void> {
  await prisma.auditLog.create({ data: { action, userId, payload } });
  auditLogsTotal.inc();
}
