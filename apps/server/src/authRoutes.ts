import { Router } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { signAccessToken, verifyRefreshToken } from "./auth";
import * as userService from "./services/userService";
import { TelegramAuthData, getTelegramHashDebug, parseInitData, BOT_TOKEN } from "./lib/telegram";
import { authTelegram } from "./services/authTelegramService";
import { prisma } from "./lib/prisma";

const router = Router();

const telegramCache = new Map<string, { tokens: any; expires: number }>();
const telegramLimiter = rateLimit({
  windowMs: 10_000,
  max: 5,
  standardHeaders: true,
  keyGenerator: (req) => req.ip || (req.headers["x-forwarded-for"] as string) || "",
});

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body as {
    email: string;
    username: string;
    password: string;
  };
  try {
    const tokens = await userService.register(email, username, password);
    res.status(201).json(tokens);
  } catch (err: any) {
    if (err.message === "NO_UID_AVAILABLE") {
      return res.status(503).json({ error: "NO_UID_AVAILABLE" });
    }
    res.status(400).json({ error: err.message });
  }
});

router.post("/telegram", telegramLimiter, async (req, res) => {
  const raw = (req.body as any).initData || req.body;
  const data = typeof raw === 'string' ? parseInitData(raw) : (raw as TelegramAuthData);
  // Логируем входящие данные целиком
  req.log.info({ body: raw }, "Telegram auth attempt");
  if (!data) {
    req.log.warn({ body: raw }, "empty initData");
    return res.status(400).json({ error: "empty initData" });
  }
  const debug = getTelegramHashDebug(data);
  req.log.debug(
    {
      data,
      botToken: BOT_TOKEN ? '***' : '(empty)',
      data_check_string: debug.dataCheckString,
      calculatedHash: debug.calculatedHash,
      providedHash: debug.providedHash,
    },
    "telegram hash details",
  );
  try {
    const key = crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
    const cached = telegramCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return res.status(200).json(cached.tokens);
    }

    const tokens = await authTelegram(data);
    telegramCache.set(key, { tokens, expires: Date.now() + 10 * 60 * 1000 });
    req.log.info({ telegramId: data.id }, "Telegram auth success");
    res.status(200).json(tokens);
  } catch (err: any) {
    if (err.message === "INVALID_SIGNATURE") {
      req.log.warn({ reason: "hash mismatch", debug }, "Invalid Telegram signature");
      return res.status(403).json({ error: "invalid hash" });
    }
    if (err.message === "NO_UID_AVAILABLE") {
      req.log.error({ reason: "uid pool empty", err }, "Telegram auth failed");
      return res.status(503).json({ error: "NO_UID_AVAILABLE" });
    }
    req.log.error({ err }, "Telegram auth failed");
    res.status(403).json({ error: err.message || "unknown error" });
  }
});

router.post("/login", async (req, res) => {
  const { login, password } = req.body as { login: string; password: string };
  try {
    const tokens = await userService.login(login, password);
    return res.json(tokens);
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
});

router.post("/refresh", async (req, res) => {
  const { refresh } = req.body as { refresh?: string };
  if (!refresh)
    return res.status(400).json({ error: "Refresh token required" });
  try {
    const payload = verifyRefreshToken(refresh);
    const stored = await prisma.refreshToken.findFirst({
      where: { token: refresh, userId: payload.id },
    });
    if (!stored) throw new Error("Invalid token");
    return res.json({
      access_token: signAccessToken({ id: payload.id, role: payload.role }),
    });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
