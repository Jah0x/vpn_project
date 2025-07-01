import { Router } from "express";
import { signAccessToken, verifyRefreshToken } from "./auth";
import * as userService from "./services/userService";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  try {
    const tokens = await userService.register(email, password);
    res.send(tokens);
  } catch (err: any) {
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
      access: signAccessToken({ id: payload.id, role: payload.role }),
    });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
