import { Router } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { signAccessToken, verifyRefreshToken } from "./auth";
import * as userService from "./services/userService";
import { TelegramAuthData, parseInitData } from "./lib/telegram";
import { prisma } from "./lib/prisma";

const router = Router();

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
  const { initData } = req.body as { initData?: string };
  if (!initData) return res.status(400).json({ error: "empty initData" });

  const params = new URLSearchParams(initData);
  const data: any = {};
  params.forEach((v, k) => (data[k] = v));
  const hash = data.hash;
  delete data.hash;

  const checkString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join("\n");
  const secret = crypto.createHash("sha256").update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  const hmac = crypto.createHmac("sha256", secret).update(checkString).digest("hex");

  if (hmac !== hash) return res.status(403).json({ error: "invalid hash" });
  const authDate = Number(data.auth_date);
  if (Date.now() / 1000 - authDate > 86400) return res.status(403).json({ error: "expired" });

  const userData: TelegramAuthData = parseInitData(initData)!;
  try {
    const user = await userService.upsertTelegramUser(userData);
    const token = signAccessToken({ id: user.id, role: user.role as any });
    (req as any).log.info({ telegramId: userData.id }, "Telegram auth success");
    res.json({ token });
  } catch (err: any) {
    if (err.message === "NO_UID_AVAILABLE") return res.status(503).json({ error: "NO_UID_AVAILABLE" });
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
