import { Router } from "express";
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from "./auth";
import { prisma } from "./lib/prisma";
import { Role, AuditAction } from "./types";

const router = Router();

router.get(
  "/admin/audit",
  authenticateJWT,
  authorizeRoles(Role.ADMIN),
  async (req, res) => {
    const {
      action,
      userId,
      from,
      to,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;
    const where: any = {};
    if (action) where.action = action as AuditAction;
    if (userId) where.userId = userId;
    if (from)
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(from) };
    if (to) where.createdAt = { ...(where.createdAt || {}), lte: new Date(to) };
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
    res.json(logs);
  },
);

router.delete(
  "/admin/audit/:id",
  authenticateJWT,
  authorizeRoles(Role.ADMIN),
  async (req, res) => {
    await prisma.auditLog.delete({ where: { id: req.params.id } });
    res.status(204).end();
  },
);

export default router;
