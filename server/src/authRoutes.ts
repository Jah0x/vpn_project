import { Router } from "express";
import { signAccessToken, verifyRefreshToken } from "./auth";
import * as userService from "./services/userService";
import { verifyTelegramHash, TelegramAuthData } from "./lib/telegram";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  try {
    const tokens = await userService.register(email, password);
    res.status(201).json(tokens);
  } catch (err: any) {
    if (err.message === "NO_UID_AVAILABLE") {
      return res.status(503).json({ error: "NO_UID_AVAILABLE" });
    }
    res.status(400).json({ error: err.message });
  }
});

router.post("/telegram", async (req, res) => {
  const data = req.body as TelegramAuthData;
  req.log.info({ telegramId: data.id }, "Telegram auth attempt");
  if (!verifyTelegramHash(data)) {
    req.log.warn("Invalid Telegram signature");
    return res.status(400).json({ error: "INVALID_SIGNATURE" });
  }
  try {
    const tokens = await userService.loginTelegram(data);
    req.log.info({ telegramId: data.id }, "Telegram auth success");
    res.status(200).json(tokens);
  } catch (err: any) {
    if (err.message === "NO_UID_AVAILABLE") {
      return res.status(503).json({ error: "NO_UID_AVAILABLE" });
    }
    req.log.error({ err }, "Telegram auth failed");
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  try {
    const tokens = await userService.login(email, password);
    return res.json(tokens);
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
});

router.post("/refresh", (req, res) => {
  const { refresh } = req.body as { refresh?: string };
  if (!refresh)
    return res.status(400).json({ error: "Refresh token required" });
  try {
    const payload = verifyRefreshToken(refresh);
    return res.json({
      access_token: signAccessToken({ id: payload.id, role: payload.role }),
    });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
