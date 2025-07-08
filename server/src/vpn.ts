import { Router } from "express";
import { execFile } from "child_process";
import path from "path";
import {
  authenticateJWT,
  authorizeRoles,
  ownerOrAdmin,
  AuthenticatedRequest,
} from "./auth";
import { Role, VpnStatus } from "./types";
import { AuditAction } from "./types";
import { prisma } from "./lib/prisma";
import { enforceVpnLimit } from "./enforceVpnLimit";
import { VpnCreate, VpnUpdate } from "./validators";
import { logAction } from "./middleware/audit";

const router = Router();

router.get(
  "/",
  authenticateJWT,
  authorizeRoles(Role.USER, Role.ADMIN),
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    const vpns = await prisma.vpn.findMany({
      where: authReq.user!.role === Role.ADMIN ? {} : { ownerId: userId },
    });
    res.json(vpns);
  },
);

router.post(
  "/",
  authenticateJWT,
  authorizeRoles(Role.USER),
  enforceVpnLimit,
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const parse = VpnCreate.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const { name } = parse.data;
    const vpn = await prisma.vpn.create({
      data: { ownerId: authReq.user!.id, name },
    });
    await logAction(AuditAction.VPN_CREATE, authReq.user!.id, { vpnId: vpn.id });
    res.status(201).json(vpn);
  },
);

router.patch(
  "/:id",
  authenticateJWT,
  ownerOrAdmin,
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const parsed = VpnUpdate.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const { name } = parsed.data;
    const vpn = await prisma.vpn.update({
      where: { id: req.params.id },
      data: { name },
    });
    res.json(vpn);
  },
);

router.delete(
  "/:id",
  authenticateJWT,
  ownerOrAdmin,
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const removed = await prisma.vpn.delete({ where: { id: req.params.id } });
    await logAction(AuditAction.VPN_DELETE, authReq.user!.id, {
      vpnId: req.params.id,
    });
    res.json(removed);
  },
);

router.post(
  "/restart/:id",
  authenticateJWT,
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const vpnId = req.params.id;
    const vpn = await prisma.vpn.findUnique({ where: { id: vpnId } });
    if (!vpn) return res.status(404).json({ error: "Not found" });
    if (authReq.user?.role !== Role.ADMIN && authReq.user?.id !== vpn.ownerId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const job = await prisma.job.create({
      data: { vpnId, type: "restart", status: "PENDING" },
    });
    await prisma.vpn.update({
      where: { id: vpnId },
      data: { status: VpnStatus.PENDING },
    });
    await logAction(AuditAction.VPN_RESTART, authReq.user!.id, { vpnId });
    const script = path.join(__dirname, "../scripts/restart.sh");

    execFile(script, [vpnId], async (err) => {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: err ? "FAILED" : "SUCCESS",
          output: err ? err.message : undefined,
        },
      });
      await prisma.vpn.update({
        where: { id: vpnId },
        data: { status: err ? VpnStatus.OFFLINE : VpnStatus.ONLINE },
      });
    });

    return res.json({ status: "pending", jobId: job.id });
  },
);

export default router;
