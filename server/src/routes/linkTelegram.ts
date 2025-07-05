import { Router } from 'express';
import { authTelegram } from '../services/authTelegramService';
import { TelegramAuthData } from '../lib/telegram';

const router = Router();

router.post('/', async (req, res) => {
  const data = req.body as TelegramAuthData;
  try {
    const tokens = await authTelegram(data);
    res.json(tokens);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
