import { RequestHandler } from "express";
import { prisma } from "./lib/prisma";
import { AuthenticatedRequest } from "./auth";

export const enforceVpnLimit: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user!.id;
  const sub = await prisma.subscription.findFirst({ where: { userId } });
  if (!sub || sub.status !== "active") {
    return res.status(403).json({ error: "Subscription inactive" });
  }
  const count = await prisma.vpn.count({ where: { ownerId: userId } });
  if (count >= sub.maxActiveVpns) {
    return res.status(403).json({ error: "VPN limit reached" });
  }
  next();
};
