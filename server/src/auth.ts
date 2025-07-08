import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "./types";
import { prisma } from "./lib/prisma";

const JWT_SECRET =
  process.env.JWT_SECRET || "default_secret_default_secret_1234";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "default_refresh_secret_default_refresh";

export interface JwtPayload {
  id: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

import { RequestHandler } from "express";

export const authenticateJWT: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token)
    return res.status(401).json({ error: "Unauthorized" });
  try {
    (req as AuthenticatedRequest).user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export function authorizeRoles(...roles: Role[]) {
  return ((req, res, next) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  }) as RequestHandler;
}

export const ownerOrAdmin: RequestHandler = async (req, res, next) => {
  const vpn = await prisma.vpn.findUnique({ where: { id: req.params.id } });
  if (!vpn) return res.status(404).json({ error: "Not found" });
  const user = (req as AuthenticatedRequest).user;
  if (user?.role === Role.ADMIN || user?.id === vpn.ownerId) {
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
};
